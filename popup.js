document.addEventListener('DOMContentLoaded', () => {
    const enableToggle = document.getElementById('enable-toggle');
    const fastModeToggle = document.getElementById('fast-mode-toggle');
    const dmsModeToggle = document.getElementById('dms-mode-toggle');
    const statusMessage = document.getElementById('status-message');

    // Load initial states from storage
    chrome.storage.sync.get(['isEnabled', 'isFastModeEnabled', 'isDmsModeEnabled'], (result) => {
        enableToggle.checked = result.isEnabled !== false;
        fastModeToggle.checked = result.isFastModeEnabled === true;
        dmsModeToggle.checked = result.isDmsModeEnabled === true;
    });

    // Listener for the main enable/disable toggle
    enableToggle.addEventListener('change', () => {
        const isEnabled = enableToggle.checked;
        chrome.storage.sync.set({ isEnabled: isEnabled }, () => {
            showStatus(isEnabled ? 'Assistant Enabled' : 'Assistant Disabled');
            notifyContentScript('updateState', { isEnabled });
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
    }

    function notifyContentScript(action, data) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
               chrome.tabs.sendMessage(tabs[0].id, { action, ...data });
            }
        });
    }
});