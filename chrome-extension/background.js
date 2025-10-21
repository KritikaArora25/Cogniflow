// background.js - FIXED VERSION
console.log('🔧 BACKGROUND: Background script loaded!');

let isSessionActive = false;
let frontendTabId = null; // Track the frontend tab

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('🔧 BACKGROUND: Received message:', request.type, 'from tab:', sender.tab?.url);
  
  if (request.type === 'START_SESSION') {
    isSessionActive = true;
    frontendTabId = sender.tab.id; // Store the frontend tab ID
    console.log('🔧 BACKGROUND: Session started, frontend tab:', frontendTabId);
    
    // Broadcast START_SESSION to ALL tabs
    chrome.tabs.query({}, (tabs) => {
      console.log('🔧 BACKGROUND: Found', tabs.length, 'tabs to broadcast to');
      tabs.forEach(tab => {
        if (tab.id !== frontendTabId) { // Don't send to frontend itself
          console.log('🔧 BACKGROUND: Sending START_SESSION to tab:', tab.url);
          chrome.tabs.sendMessage(tab.id, { type: 'START_SESSION' }, (response) => {
            if (chrome.runtime.lastError) {
              console.log('🔧 BACKGROUND: Error sending to tab', tab.id, chrome.runtime.lastError);
            }
          });
        }
      });
    });
  }
  
  if (request.type === 'STOP_SESSION') {
    isSessionActive = false;
    frontendTabId = null;
    console.log('🔧 BACKGROUND: Session stopped');
    
    // Broadcast to ALL tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'STOP_SESSION' });
      });
    });
  }
});

// Listen for tab changes - SEND TO FRONTEND when ANY tab activates
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('🔧 BACKGROUND: Tab activated:', activeInfo.tabId);
  if (isSessionActive && frontendTabId) {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      console.log('🔧 BACKGROUND: Tab switched to:', tab.url);
      
      // Send tab info to the FRONTEND (localhost) tab
      chrome.tabs.sendMessage(frontendTabId, {
        type: 'CURRENT_TAB_INFO',
        url: tab.url,
        title: tab.title
      });
    });
  }
});

// Listen for page updates - SEND TO FRONTEND when ANY page loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isSessionActive && frontendTabId) {
    console.log('🔧 BACKGROUND: Page loaded:', tab.url);
    
    // Send tab info to the FRONTEND (localhost) tab
    chrome.tabs.sendMessage(frontendTabId, {
      type: 'CURRENT_TAB_INFO',
      url: tab.url,
      title: tab.title
    });
  }
});