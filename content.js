/**
 * @file content.js
 * @description Injects the AI Assistant UI onto the page. This version includes
 * robust error handling and a "Fast Mode" for instant generation.
 */
class SocialAIAssistant {
    constructor() {
        this.selectedText = '';
        this.selectionRange = null;
        this.triggerButton = null;
        this.isButtonShowing = false;
        this.assistantEnabled = true; // Default state
        this.isFastModeEnabled = false; // NEW: Fast Mode state
        this.isDmsModeEnabled = false; // NEW: DMS Mode state
        this.isActive = false; // Tracks if listeners are active

        // Bind 'this' for all handlers
        this.handleTextSelection = this.handleTextSelection.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.hideAIButton = this.hideAIButton.bind(this);
        this.handleAIButtonClick = this.handleAIButtonClick.bind(this);
        
        this.init();
    }

    async init() {
        const result = await chrome.storage.sync.get(['isEnabled', 'isFastModeEnabled', 'isDmsModeEnabled']);
        this.assistantEnabled = result.isEnabled !== false;
        this.isFastModeEnabled = result.isFastModeEnabled === true; // Load fast mode state
        this.isDmsModeEnabled = result.isDmsModeEnabled === true; // Load DMS mode state

        if (this.assistantEnabled) {
            this.activate();
        }
        this.listenForStateChanges();
    }

    activate() {
        if (this.isActive) return;
        console.log("🤖 Social AI Assistant Activated");
        this.isActive = true;
        this.injectUI();
        this.addEventListeners();
    }

    deactivate() {
        if (!this.isActive) return;
        console.log("💤 Social AI Assistant Deactivated");
        this.isActive = false;
        this.hideAIButton();
        this.removeEventListeners();
    }
    
    listenForStateChanges() {
        chrome.runtime.onMessage.addListener((request) => {
            if (request.action === 'updateState') {
                this.assistantEnabled = request.isEnabled;
                this.assistantEnabled ? this.activate() : this.deactivate();
            }
            // Listen for Fast Mode state changes
            if (request.action === 'updateFastMode') {
                this.isFastModeEnabled = request.isFastModeEnabled;
            }
            // Listen for DMS Mode state changes
            if (request.action === 'updateDmsMode') {
                this.isDmsModeEnabled = request.isDmsModeEnabled;
            }
        });
    }

    addEventListeners() {
        document.addEventListener('mouseup', this.handleTextSelection);
        document.addEventListener('keyup', this.handleTextSelection);
        document.addEventListener('mousedown', this.handleOutsideClick);
        document.addEventListener('scroll', this.hideAIButton);
    }
    
    removeEventListeners() {
        document.removeEventListener('mouseup', this.handleTextSelection);
        document.removeEventListener('keyup', this.handleTextSelection);
        document.removeEventListener('mousedown', this.handleOutsideClick);
        document.removeEventListener('scroll', this.hideAIButton);
    }

    handleTextSelection() {
        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString().trim();
            if (text.length > 5) {
                this.selectedText = text;
                this.selectionRange = selection.getRangeAt(0).cloneRange();

                // MODIFIED: Check for Fast Mode
                if (this.isFastModeEnabled) {
                    this.handleAIButtonClick(); // Trigger AI directly
                } else {
                    this.showAIButton(); // Or just show the button
                }
            } else if (!text) {
                this.hideAIButton();
            }
        }, 10);
    }

    showAIButton() {
        if (!this.triggerButton) return;
        if (this.isButtonShowing) return;

        const rect = this.selectionRange.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;        this.triggerButton.style.display = 'flex';
        const modeText = this.isDmsModeEnabled ? "DMS" : "Mentions";
        this.triggerButton.innerHTML = `<span class="ai-icon">🤖</span><span class="ai-text">AI ${modeText}</span>`;
        this.triggerButton.style.left = `${window.scrollX + rect.left}px`;
        this.triggerButton.style.top = `${window.scrollY + rect.bottom + 5}px`;
        this.isButtonShowing = true;
    }

    hideAIButton() {
        if (this.triggerButton) {
            this.triggerButton.style.display = 'none';
        }
        this.isButtonShowing = false;
    }

    handleOutsideClick(e) {
      if (this.isButtonShowing && e.target.closest('#ai-trigger-btn') === null) {
          this.hideAIButton();
      }
    }

    handleAIButtonClick() {
        if (typeof chrome?.runtime?.sendMessage !== 'function') {
            console.error("Social AI Assistant: Cannot connect to the extension's background script.");
            this.showToast("❌ Error: Connection to extension failed.");
            this.hideAIButton();
            return;
        }

        // MODIFIED: Give feedback based on the mode
        if (this.isButtonShowing) {
            // Normal mode: update the button
            this.triggerButton.innerHTML = `<span class="ai-icon">⏳</span><span class="ai-text">Generating...</span>`;
            this.triggerButton.style.pointerEvents = 'none';
        } else {
            // Fast Mode: show a toast
            this.showToast('⏳ Generating AI suggestion...');
        }        chrome.runtime.sendMessage({
            action: "processTextWithAI",
            text: this.selectedText,
            mode: this.isDmsModeEnabled ? "dms" : "mentions"
        }, (response) => {
            // Hide the button if it was showing
            if (this.isButtonShowing) {
                this.triggerButton.style.pointerEvents = 'auto';
                this.hideAIButton();
            }

            if (response && response.success) {
                this.copyToClipboard(response.data);
                this.showToast('✅ Copied to clipboard!');
            } else {
                this.showToast(`❌ Error: ${response?.error || 'Unknown error'}`);
            }
        });
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy:', err));
    }

    showToast(message) {
        let toast = document.getElementById('ai-assistant-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2800);
    }

    injectUI() {
        if (document.getElementById('ai-assistant-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ai-assistant-styles';
        styles.textContent = `
          .ai-assistant-trigger {
            display: none; align-items: center; gap: 8px;
            position: absolute !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important; border-radius: 25px !important;
            padding: 8px 14px !important; cursor: pointer !important;
            z-index: 2147483647 !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            font-size: 13px !important; font-weight: 600 !important;
            user-select: none !important;
            animation: aiButtonSlideIn 0.2s ease-out !important;
          }
          .ai-assistant-trigger:hover { transform: translateY(-2px); }
          .ai-icon { font-size: 16px !important; }
          @keyframes aiButtonSlideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          #ai-assistant-toast {
            position: fixed; top: 20px; left: 50%;
            transform: translate(-50%, -100px);
            background-color: #333; color: #fff;
            padding: 12px 20px; border-radius: 8px;
            z-index: 2147483647; font-family: sans-serif; font-size: 14px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1);
            visibility: hidden;
          }
          #ai-assistant-toast.show {
            visibility: visible;
            transform: translate(-50%, 0);
          }
        `;
        document.head.appendChild(styles);

        const button = document.createElement('div');
        button.id = 'ai-trigger-btn';
        button.className = 'ai-assistant-trigger';
        button.addEventListener('click', this.handleAIButtonClick);
        document.body.appendChild(button);

        const toast = document.createElement('div');
        toast.id = 'ai-assistant-toast';
        document.body.appendChild(toast);

        this.triggerButton = button;
    }
}

// Initialize the assistant
if (typeof window.socialAIAssistant === 'undefined') {
    window.socialAIAssistant = new SocialAIAssistant();
}