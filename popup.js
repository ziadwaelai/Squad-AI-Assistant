document.addEventListener('DOMContentLoaded', () => {
    const enableToggle = document.getElementById('enable-toggle');
    const fastModeToggle = document.getElementById('fast-mode-toggle');
    const dmsModeToggle = document.getElementById('dms-mode-toggle');
    const statusMessage = document.getElementById('status-message');    // Load initial states from storage
    chrome.storage.sync.get(['isEnabled', 'isFastModeEnabled', 'isDmsModeEnabled'], (result) => {
        // Explicitly check against true for more consistent behavior
        enableToggle.checked = result.isEnabled === true;
        fastModeToggle.checked = result.isFastModeEnabled === true;
        dmsModeToggle.checked = result.isDmsModeEnabled === true;
        
        // Make sure to initialize the state if it's not set
        if (result.isEnabled === undefined) {
            chrome.storage.sync.set({ isEnabled: true });
        }
    });    // Listener for the main enable/disable toggle
    enableToggle.addEventListener('change', () => {
        const isEnabled = enableToggle.checked;
        // Log the change for debugging purposes
        console.log(`Setting isEnabled to: ${isEnabled}`);
        
        // Get previous state to compare
        chrome.storage.sync.get(['isEnabled'], (prevState) => {
            const wasDisabled = prevState.isEnabled !== true;
            
            chrome.storage.sync.set({ isEnabled: isEnabled }, () => {
                if (wasDisabled && isEnabled) {
                    // If turning on after being off, show reload message
                    showStatus('Assistant Enabled - Reloading page...');
                } else {
                    // Normal status message
                    showStatus(isEnabled ? 'Assistant Enabled' : 'Assistant Disabled');
                }
                
                notifyContentScript('updateState', { isEnabled });
                
                // Verify the state was saved correctly
                chrome.storage.sync.get(['isEnabled'], (result) => {
                    console.log(`Verified: isEnabled is now ${result.isEnabled}`);
                });
            });
        });
    });

    // Listener for the new Fast Mode toggle
    fastModeToggle.addEventListener('change', () => {
        const isFastModeEnabled = fastModeToggle.checked;
        chrome.storage.sync.set({ isFastModeEnabled: isFastModeEnabled }, () => {
            showStatus(isFastModeEnabled ? 'Fast Mode Enabled' : 'Fast Mode Disabled');
            notifyContentScript('updateFastMode', { isFastModeEnabled });
        });
    });

    // Listener for the new DMS Mode toggle
    dmsModeToggle.addEventListener('change', () => {
        const isDmsModeEnabled = dmsModeToggle.checked;
        chrome.storage.sync.set({ isDmsModeEnabled: isDmsModeEnabled }, () => {
            showStatus(isDmsModeEnabled ? 'DMS Mode Enabled' : 'DMS Mode Disabled');
            notifyContentScript('updateDmsMode', { isDmsModeEnabled });
        });
    });

    function showStatus(message) {
        statusMessage.textContent = message;
        statusMessage.style.color = '#1c1e21';
        setTimeout(() => { statusMessage.textContent = ''; }, 2000);
    }    function notifyContentScript(action, data) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                try {
                    chrome.tabs.sendMessage(tabs[0].id, { action, ...data }, (response) => {
                        // Handle any error in message sending
                        if (chrome.runtime.lastError) {
                            console.log('Message sending failed:', chrome.runtime.lastError.message);
                            
                            // If we're enabling and can't send a message, try reloading the page directly
                            if (action === 'updateState' && data.isEnabled === true) {
                                console.log('Attempting to reload tab...');
                                chrome.tabs.reload(tabs[0].id);
                            }
                        }
                    });
                } catch (e) {
                    console.error('Error sending message:', e);
                    
                    // If we're enabling and encounter an error, try reloading the page directly
                    if (action === 'updateState' && data.isEnabled === true) {
                        console.log('Exception caught. Attempting to reload tab...');
                        chrome.tabs.reload(tabs[0].id);
                    }
                }
            }
        });
    }
});