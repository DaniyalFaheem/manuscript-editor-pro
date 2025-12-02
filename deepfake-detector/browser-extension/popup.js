/**
 * Deepfake Detector - Popup Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('url-input');
  const analyzeBtn = document.getElementById('analyze-btn');
  const totalAnalyzed = document.getElementById('total-analyzed');
  const deepfakesFound = document.getElementById('deepfakes-found');
  const recentList = document.getElementById('recent-list');
  const autoScanToggle = document.getElementById('auto-scan');
  const showBadgesToggle = document.getElementById('show-badges');

  // Load stats and settings
  loadStats();
  loadSettings();
  loadRecentAnalyses();

  // Analyze button click
  analyzeBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyze',
        url: url
      });

      if (response.success) {
        // Update stats
        incrementStat('totalAnalyzed');
        if (response.result.is_deepfake) {
          incrementStat('deepfakesFound');
        }

        // Add to recent
        addToRecent({
          url: url,
          result: response.result,
          timestamp: Date.now()
        });

        // Show result
        alert(response.result.is_deepfake
          ? `⚠️ Potential deepfake detected! (${(response.result.confidence * 100).toFixed(0)}% confidence)`
          : `✓ Content appears authentic (${(response.result.confidence * 100).toFixed(0)}% confidence)`
        );
      } else {
        alert('Analysis failed: ' + response.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Analyze';
      urlInput.value = '';
    }
  });

  // Settings toggles
  autoScanToggle.addEventListener('change', () => {
    saveSetting('autoScan', autoScanToggle.checked);
  });

  showBadgesToggle.addEventListener('change', () => {
    saveSetting('showBadges', showBadgesToggle.checked);
  });

  // Load stats
  function loadStats() {
    chrome.storage.local.get(['totalAnalyzed', 'deepfakesFound'], (data) => {
      totalAnalyzed.textContent = data.totalAnalyzed || 0;
      deepfakesFound.textContent = data.deepfakesFound || 0;
    });
  }

  // Increment stat
  function incrementStat(key) {
    chrome.storage.local.get([key], (data) => {
      const newValue = (data[key] || 0) + 1;
      chrome.storage.local.set({ [key]: newValue });
      
      if (key === 'totalAnalyzed') {
        totalAnalyzed.textContent = newValue;
      } else if (key === 'deepfakesFound') {
        deepfakesFound.textContent = newValue;
      }
    });
  }

  // Load settings
  function loadSettings() {
    chrome.storage.sync.get(['autoScan', 'showBadges'], (data) => {
      autoScanToggle.checked = data.autoScan || false;
      showBadgesToggle.checked = data.showBadges !== false;
    });
  }

  // Save setting
  function saveSetting(key, value) {
    chrome.storage.sync.set({ [key]: value });
  }

  // Load recent analyses
  function loadRecentAnalyses() {
    chrome.storage.local.get(['recentAnalyses'], (data) => {
      const recent = data.recentAnalyses || [];
      
      if (recent.length === 0) {
        recentList.innerHTML = '<div class="empty">No recent analyses</div>';
        return;
      }

      recentList.innerHTML = recent.slice(0, 5).map((item) => {
        const filename = item.url.split('/').pop() || 'Unknown';
        const isDeepfake = item.result.is_deepfake;
        
        return `
          <div class="recent-item">
            <div class="recent-icon">${isDeepfake ? '⚠️' : '✓'}</div>
            <div class="recent-info">
              <div class="recent-name" title="${item.url}">${filename}</div>
              <div class="recent-result">${new Date(item.timestamp).toLocaleDateString()}</div>
            </div>
            <span class="result-badge ${isDeepfake ? 'fake' : 'real'}">
              ${isDeepfake ? 'FAKE' : 'REAL'}
            </span>
          </div>
        `;
      }).join('');
    });
  }

  // Add to recent analyses
  function addToRecent(item) {
    chrome.storage.local.get(['recentAnalyses'], (data) => {
      const recent = data.recentAnalyses || [];
      recent.unshift(item);
      
      // Keep only last 20
      if (recent.length > 20) {
        recent.pop();
      }
      
      chrome.storage.local.set({ recentAnalyses: recent });
      loadRecentAnalyses();
    });
  }
});
