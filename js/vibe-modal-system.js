/**
 * Vibe Awards - Universal Modal System
 * Replaces alert() calls with beautiful, functional modals
 */

class VibeModal {
    constructor() {
        this.createModalContainer();
        this.setupEventListeners();
    }

    createModalContainer() {
        if (document.getElementById('vibe-modal-container')) return;
        
        const modalHTML = `
            <div id="vibe-modal-container" class="vibe-modal-overlay" style="display: none;">
                <div class="vibe-modal-content">
                    <div class="vibe-modal-header">
                        <h3 class="vibe-modal-title" id="vibe-modal-title">Title</h3>
                        <button class="vibe-modal-close" id="vibe-modal-close">×</button>
                    </div>
                    <div class="vibe-modal-body" id="vibe-modal-body">
                        Content goes here
                    </div>
                    <div class="vibe-modal-footer" id="vibe-modal-footer">
                        <button class="btn btn-secondary" id="vibe-modal-cancel">Cancel</button>
                        <button class="btn btn-primary" id="vibe-modal-confirm">OK</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.addModalStyles();
    }

    addModalStyles() {
        if (document.getElementById('vibe-modal-styles')) return;
        
        const styles = `
            <style id="vibe-modal-styles">
                .vibe-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .vibe-modal-overlay.active {
                    opacity: 1;
                }
                
                .vibe-modal-content {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    max-width: 500px;
                    width: 100%;
                    max-height: 80vh;
                    overflow-y: auto;
                    transform: scale(0.9) translateY(20px);
                    transition: transform 0.3s ease;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }
                
                .vibe-modal-overlay.active .vibe-modal-content {
                    transform: scale(1) translateY(0);
                }
                
                .vibe-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 24px 0;
                    margin-bottom: 20px;
                }
                
                .vibe-modal-title {
                    color: #ffffff;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0;
                }
                
                .vibe-modal-close {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 32px;
                    cursor: pointer;
                    padding: 0;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }
                
                .vibe-modal-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                }
                
                .vibe-modal-body {
                    padding: 0 24px 20px;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.6;
                    font-size: 16px;
                }
                
                .vibe-modal-footer {
                    display: flex;
                    gap: 12px;
                    padding: 0 24px 24px;
                    justify-content: flex-end;
                }
                
                .vibe-modal-footer .btn {
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                    font-size: 14px;
                }
                
                .vibe-modal-footer .btn-secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .vibe-modal-footer .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.2);
                    color: #ffffff;
                }
                
                .vibe-modal-footer .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #ffffff;
                }
                
                .vibe-modal-footer .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
                }
                
                @media (max-width: 640px) {
                    .vibe-modal-content {
                        margin: 20px;
                        max-width: none;
                    }
                    
                    .vibe-modal-footer {
                        flex-direction: column;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'vibe-modal-close' || e.target.id === 'vibe-modal-cancel') {
                this.hide();
            }
            if (e.target.id === 'vibe-modal-container') {
                this.hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
    }

    show(title, content, options = {}) {
        const container = document.getElementById('vibe-modal-container');
        const titleEl = document.getElementById('vibe-modal-title');
        const bodyEl = document.getElementById('vibe-modal-body');
        const footerEl = document.getElementById('vibe-modal-footer');
        const confirmBtn = document.getElementById('vibe-modal-confirm');

        titleEl.textContent = title;
        bodyEl.innerHTML = content;

        // Handle different types of modals
        if (options.type === 'confirm') {
            confirmBtn.textContent = options.confirmText || 'Confirm';
            confirmBtn.onclick = () => {
                if (options.onConfirm) options.onConfirm();
                this.hide();
            };
            footerEl.style.display = 'flex';
        } else if (options.type === 'alert') {
            footerEl.innerHTML = '<button class="btn btn-primary" onclick="vibeModal.hide()">OK</button>';
        } else {
            // Custom footer
            if (options.footer) {
                footerEl.innerHTML = options.footer;
            }
        }

        container.style.display = 'flex';
        setTimeout(() => {
            container.classList.add('active');
        }, 10);

        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    hide() {
        const container = document.getElementById('vibe-modal-container');
        container.classList.remove('active');
        setTimeout(() => {
            container.style.display = 'none';
            if (this.resolvePromise) {
                this.resolvePromise();
                this.resolvePromise = null;
            }
        }, 300);
    }

    alert(title, message) {
        return this.show(title, message, { type: 'alert' });
    }

    confirm(title, message, onConfirm) {
        return this.show(title, message, { 
            type: 'confirm', 
            onConfirm: onConfirm 
        });
    }

    success(title, message) {
        return this.show(
            `✅ ${title}`, 
            message, 
            { type: 'alert' }
        );
    }

    error(title, message) {
        return this.show(
            `❌ ${title}`, 
            message, 
            { type: 'alert' }
        );
    }

    info(title, message) {
        return this.show(
            `ℹ️ ${title}`, 
            message, 
            { type: 'alert' }
        );
    }

    feature(title, description, comingSoon = true) {
        const content = `
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                <p style="margin-bottom: 20px;">${description}</p>
                ${comingSoon ? '<p style="color: #667eea; font-weight: 600;">Coming Soon!</p>' : ''}
            </div>
        `;
        return this.show(title, content, { type: 'alert' });
    }
}

// Initialize global modal system
const vibeModal = new VibeModal();

// Override window.alert to use our modal system
window.alert = function(message) {
    vibeModal.alert('Notification', message);
};

// Add global utility functions
window.vibeAlert = (title, message) => vibeModal.alert(title, message);
window.vibeConfirm = (title, message, callback) => vibeModal.confirm(title, message, callback);
window.vibeSuccess = (title, message) => vibeModal.success(title, message);
window.vibeError = (title, message) => vibeModal.error(title, message);
window.vibeInfo = (title, message) => vibeModal.info(title, message);
window.vibeFeature = (title, description, comingSoon = true) => vibeModal.feature(title, description, comingSoon);

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibeModal;
}