/**
 * Deepfake Detector - Content Script
 * Injects UI overlays for analysis results on web pages
 */

(function() {
  'use strict';
  
  // Store for analysis results
  const analysisResults = new Map();
  
  // Create overlay container
  function createOverlayContainer() {
    let container = document.getElementById('deepfake-detector-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'deepfake-detector-container';
      document.body.appendChild(container);
    }
    return container;
  }
  
  // Show loading indicator near an element
  function showLoading(element) {
    const rect = element.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'deepfake-detector-overlay deepfake-detector-loading';
    overlay.style.top = `${window.scrollY + rect.top}px`;
    overlay.style.left = `${window.scrollX + rect.left}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    
    overlay.innerHTML = `
      <div class="deepfake-detector-loader">
        <div class="deepfake-detector-spinner"></div>
        <span>Analyzing...</span>
      </div>
    `;
    
    const container = createOverlayContainer();
    container.appendChild(overlay);
    
    return overlay;
  }
  
  // Show result badge on an element
  function showResult(element, result) {
    // Remove existing overlay
    removeOverlay(element);
    
    const rect = element.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'deepfake-detector-overlay';
    overlay.style.top = `${window.scrollY + rect.top}px`;
    overlay.style.left = `${window.scrollX + rect.left}px`;
    
    const isDeepfake = result.is_deepfake;
    const confidence = (result.confidence * 100).toFixed(0);
    
    overlay.innerHTML = `
      <div class="deepfake-detector-badge ${isDeepfake ? 'fake' : 'real'}">
        <span class="deepfake-detector-icon">${isDeepfake ? '⚠️' : '✓'}</span>
        <span class="deepfake-detector-label">${isDeepfake ? 'FAKE' : 'REAL'}</span>
        <span class="deepfake-detector-confidence">${confidence}%</span>
      </div>
    `;
    
    // Add click handler for more details
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      showDetailPopup(result, rect);
    });
    
    const container = createOverlayContainer();
    container.appendChild(overlay);
    
    // Store reference
    element.dataset.deepfakeAnalyzed = 'true';
    analysisResults.set(element.src || element.currentSrc, result);
    
    return overlay;
  }
  
  // Show error badge
  function showError(element, error) {
    removeOverlay(element);
    
    const rect = element.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'deepfake-detector-overlay';
    overlay.style.top = `${window.scrollY + rect.top}px`;
    overlay.style.left = `${window.scrollX + rect.left}px`;
    
    overlay.innerHTML = `
      <div class="deepfake-detector-badge error">
        <span class="deepfake-detector-icon">❌</span>
        <span class="deepfake-detector-label">Error</span>
      </div>
    `;
    
    overlay.title = error;
    
    const container = createOverlayContainer();
    container.appendChild(overlay);
    
    return overlay;
  }
  
  // Remove overlay for an element
  function removeOverlay(element) {
    const overlays = document.querySelectorAll('.deepfake-detector-overlay');
    // Simple removal of all overlays for now
    // In production, match by element position
  }
  
  // Show detailed popup
  function showDetailPopup(result, elementRect) {
    // Remove existing popup
    const existingPopup = document.querySelector('.deepfake-detector-popup');
    if (existingPopup) {
      existingPopup.remove();
    }
    
    const popup = document.createElement('div');
    popup.className = 'deepfake-detector-popup';
    
    popup.innerHTML = `
      <div class="deepfake-detector-popup-header">
        <h3>Deepfake Analysis</h3>
        <button class="deepfake-detector-close">&times;</button>
      </div>
      <div class="deepfake-detector-popup-body">
        <div class="deepfake-detector-result ${result.is_deepfake ? 'fake' : 'real'}">
          <div class="result-label">${result.is_deepfake ? 'Potential Deepfake Detected' : 'Content Appears Authentic'}</div>
          <div class="result-confidence">Confidence: ${(result.confidence * 100).toFixed(1)}%</div>
        </div>
        
        <div class="deepfake-detector-models">
          <h4>Model Results</h4>
          ${Object.entries(result.models || {}).map(([model, data]) => `
            <div class="model-row">
              <span class="model-name">${model}</span>
              <span class="model-score ${data.prediction}">${(data.score * 100).toFixed(0)}%</span>
            </div>
          `).join('')}
        </div>
        
        <div class="deepfake-detector-actions">
          <button class="btn-primary" id="deepfake-view-full">View Full Report</button>
          <button class="btn-secondary" id="deepfake-report">Report Issue</button>
        </div>
      </div>
    `;
    
    // Position popup
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = '2147483647';
    
    document.body.appendChild(popup);
    
    // Close button handler
    popup.querySelector('.deepfake-detector-close').addEventListener('click', () => {
      popup.remove();
    });
    
    // View full report
    popup.querySelector('#deepfake-view-full').addEventListener('click', () => {
      window.open(`http://localhost:3000/results/${result.id}`, '_blank');
    });
    
    // Click outside to close
    document.addEventListener('click', function closePopup(e) {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closePopup);
      }
    });
  }
  
  // Find element by URL
  function findElementByUrl(url) {
    // Check images
    const images = document.querySelectorAll('img');
    for (const img of images) {
      if (img.src === url || img.currentSrc === url) {
        return img;
      }
    }
    
    // Check videos
    const videos = document.querySelectorAll('video');
    for (const video of videos) {
      if (video.src === url || video.currentSrc === url) {
        return video;
      }
      // Check video sources
      const sources = video.querySelectorAll('source');
      for (const source of sources) {
        if (source.src === url) {
          return video;
        }
      }
    }
    
    return null;
  }
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const element = findElementByUrl(message.url);
    
    switch (message.action) {
      case 'showLoading':
        if (element) {
          showLoading(element);
        }
        break;
        
      case 'showResult':
        if (element) {
          showResult(element, message.result);
        }
        break;
        
      case 'showError':
        if (element) {
          showError(element, message.error);
        }
        break;
    }
    
    sendResponse({ received: true });
  });
  
  // Initialize
  console.log('Deepfake Detector content script loaded');
})();
