// content.js - WITH ERROR HANDLING
console.log('🔧 CONTENT: Content script loaded on:', window.location.href);

let isSessionActive = false;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('🔧 CONTENT: Received message from background:', request.type);
  
  if (request.type === 'START_SESSION') {
    isSessionActive = true;
    console.log('🔧 CONTENT: Session started on:', window.location.href);
  }
  
  if (request.type === 'STOP_SESSION') {
    isSessionActive = false;
    console.log('🔧 CONTENT: Session stopped on:', window.location.href);
  }
  
  if (request.type === 'CURRENT_TAB_INFO') {
    console.log('🔧 CONTENT: Sending URL to frontend:', request.url);
    
    // Forward to frontend
    window.postMessage({
      type: 'CURRENT_TAB_INFO',
      url: request.url,
      title: request.title
    }, '*');
  }
});

// Listen for START/STOP from frontend and forward to background
window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  
  if (event.data.type === 'START_SESSION' || event.data.type === 'STOP_SESSION') {
    console.log('🔧 CONTENT: Forwarding to background:', event.data.type);
    chrome.runtime.sendMessage({ type: event.data.type }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('🔧 CONTENT: Error sending to background:', chrome.runtime.lastError);
      }
    });
  }
});