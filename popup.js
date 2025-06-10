document.addEventListener('DOMContentLoaded', () => {
    const enableToggle = document.getElementById('enable-toggle');
    const statusMessage = document.getElementById('status-message');

    // Load the initial state of the toggle from storage
    chrome.storage.sync.get(['isEnabled'], (result) => {
        enableToggle.checked = result.isEnabled !== false;
    });

    // Listen for changes on the toggle switch
    enableToggle.addEventListener('change', () => {
        const isEnabled = enableToggle.checked;
        chrome.storage.sync.set({ isEnabled: isEnabled }, () => {
            const statusText = isEnabled ? 'Assistant Enabled' : 'Assistant Disabled';
            statusMessage.textContent = statusText;
            statusMessage.style.color = '#1c1e21';
            setTimeout(() => { statusMessage.textContent = ''; }, 2000);

            // Notify the active content script of the state change
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                   chrome.tabs.sendMessage(tabs[0].id, {
                       action: 'updateState',
                       isEnabled: isEnabled
                   });
                }
            });
        });
    });
});
