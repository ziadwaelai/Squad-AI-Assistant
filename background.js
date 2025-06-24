/**
 * @file background.js
 * @description Forwards requests from the content script to the Flask backend.
 */

// The URL of your local Flask server
const FLASK_API_URL = "http://128.140.37.194:5005/process";

// Listen for installation or update events
chrome.runtime.onInstalled.addListener((details) => {
  // Set default state when installed
  if (details.reason === 'install') {
    chrome.storage.sync.set({ 
      isEnabled: true,
      isFastModeEnabled: false,
      isDmsModeEnabled: false
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "processTextWithAI") {
    // Check if the extension is enabled before processing
    chrome.storage.sync.get(['isEnabled'], (result) => {
      if (result.isEnabled !== true) {
        console.log("Extension is disabled. Ignoring request.");
        sendResponse({ success: false, error: "Extension is currently disabled" });
        return;
      }
      
      console.log("Forwarding text to Flask backend:", request.text);
      
      fetch(FLASK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: request.text,
          mode: request.mode || "mentions" // Default to mentions if not specified
        }),
      })
      .then(response => {
        if (!response.ok) {
          // Handle server errors (e.g., 500, 400)
          return response.json().then(errorData => {
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        // Send the processed text back to the content script
        sendResponse({ success: true, data: data.processed_text });
      })
      .catch(error => {
        // Handle network errors (e.g., Flask server is not running)
        console.error('Error communicating with backend:', error);
        sendResponse({ success: false, error: "Could not connect to the backend server. Is it running?" });
      });
    });
    
    // Return true to indicate we will respond asynchronously
    return true;
  }
});
