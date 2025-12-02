/**
 * Deepfake Detector - Background Service Worker
 * Handles context menu actions and API communication
 */

const API_URL = 'http://localhost:8000/api/v1';

// Create context menu items on extension install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Deepfake Detector extension installed');
  
  // Create context menu for images
  chrome.contextMenus.create({
    id: 'analyzeImage',
    title: 'Analyze image for deepfake',
    contexts: ['image']
  });
  
  // Create context menu for videos
  chrome.contextMenus.create({
    id: 'analyzeVideo',
    title: 'Analyze video for deepfake',
    contexts: ['video']
  });
  
  // Create context menu for links
  chrome.contextMenus.create({
    id: 'analyzeLink',
    title: 'Analyze linked media for deepfake',
    contexts: ['link']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  
  let mediaUrl = null;
  
  switch (info.menuItemId) {
    case 'analyzeImage':
      mediaUrl = info.srcUrl;
      break;
    case 'analyzeVideo':
      mediaUrl = info.srcUrl;
      break;
    case 'analyzeLink':
      mediaUrl = info.linkUrl;
      break;
  }
  
  if (mediaUrl) {
    // Send message to content script to show loading indicator
    chrome.tabs.sendMessage(tab.id, {
      action: 'showLoading',
      url: mediaUrl
    });
    
    // Analyze the media
    try {
      const result = await analyzeMedia(mediaUrl);
      
      // Send result to content script
      chrome.tabs.sendMessage(tab.id, {
        action: 'showResult',
        url: mediaUrl,
        result: result
      });
    } catch (error) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'showError',
        url: mediaUrl,
        error: error.message
      });
    }
  }
});

// Analyze media via API
async function analyzeMedia(url) {
  try {
    const response = await fetch(`${API_URL}/analyze/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        include_heatmap: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyze') {
    analyzeMedia(message.url)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'getSettings') {
    chrome.storage.sync.get(['apiKey', 'autoScan', 'confidenceThreshold'], (settings) => {
      sendResponse(settings);
    });
    return true;
  }
  
  if (message.action === 'saveSettings') {
    chrome.storage.sync.set(message.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Badge management
function updateBadge(tabId, result) {
  if (result.is_deepfake) {
    chrome.action.setBadgeText({ text: '!', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#f44336', tabId });
  } else {
    chrome.action.setBadgeText({ text: '✓', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#4caf50', tabId });
  }
}

// Clear badge when navigating away
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});

console.log('Deepfake Detector background script loaded');
