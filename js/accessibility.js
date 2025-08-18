/**
 * Vibe Awards - Accessibility Enhancements
 * WCAG 2.1 AA compliant accessibility features
 */

class VibeAccessibility {
    constructor() {
        this.focusTrapping = new Map();
        this.announcements = [];
        this.keyboardNav = true;
        this.highContrast = false;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAccessibility());
        } else {
            this.setupAccessibility();
        }
    }

    setupAccessibility() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupContrastControls();
        this.setupMotionControls();
        this.setupFormAccessibility();
        this.setupModalAccessibility();
        this.setupSkipLinks();
        this.auditAccessibility();
    }

    // KEYBOARD NAVIGATION
    setupKeyboardNavigation() {
        // Global keyboard handlers
        document.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
        
        // Make custom elements keyboard accessible
        this.makeCustomElementsAccessible();
        
        // Setup roving tab index for complex components
        this.setupRovingTabIndex();
        
        // Visual focus indicators
        this.enhanceFocusIndicators();
    }

    handleGlobalKeyDown(event) {
        const { key, ctrlKey, metaKey, shiftKey } = event;
        
        // Skip to main content (Alt+S)
        if ((ctrlKey || metaKey) && key === 's' && !shiftKey) {
            event.preventDefault();
            this.skipToMain();
            return;
        }
        
        // Toggle high contrast (Alt+C)
        if ((ctrlKey || metaKey) && key === 'c' && shiftKey) {
            event.preventDefault();
            this.toggleHighContrast();
            return;
        }
        
        // Escape key handling
        if (key === 'Escape') {
            this.handleEscape();
            return;
        }
        
        // Arrow key navigation for dropdowns
        if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            this.handleArrowNavigation(event);
        }
    }

    makeCustomElementsAccessible() {
        // Make dropdown toggles accessible
        const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            toggle.setAttribute('role', 'button');
            toggle.setAttribute('aria-haspopup', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('tabindex', '0');
            
            // Keyboard activation
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle.click();
                }
            });
        });

        // Make cards keyboard accessible
        const cards = document.querySelectorAll('.section-card, .feature-card, .app-card');
        cards.forEach(card => {
            if (!card.getAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'button');
            }
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    setupRovingTabIndex() {
        // Setup roving tab index for navigation menus
        const navMenus = document.querySelectorAll('.nav-menu, .nav-dropdown-menu');
        navMenus.forEach(menu => {
            const items = menu.querySelectorAll('a, button, [tabindex]');
            if (items.length === 0) return;
            
            // Initialize first item
            items[0].setAttribute('tabindex', '0');
            items.forEach((item, index) => {
                if (index > 0) item.setAttribute('tabindex', '-1');
                
                item.addEventListener('keydown', (e) => {
                    this.handleRovingTabNavigation(e, items, index);
                });
            });
        });
    }

    handleRovingTabNavigation(event, items, currentIndex) {
        const { key } = event;
        let newIndex = currentIndex;
        
        switch (key) {
            case 'ArrowDown':
            case 'ArrowRight':
                event.preventDefault();
                newIndex = (currentIndex + 1) % items.length;
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                event.preventDefault();
                newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
                break;
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                event.preventDefault();
                newIndex = items.length - 1;
                break;
            default:
                return;
        }
        
        // Update tab indexes and focus
        items[currentIndex].setAttribute('tabindex', '-1');
        items[newIndex].setAttribute('tabindex', '0');
        items[newIndex].focus();
    }

    enhanceFocusIndicators() {
        // Add visible focus indicators
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced focus indicators */
            *:focus {
                outline: 2px solid var(--apple-blue) !important;
                outline-offset: 2px !important;
                border-radius: 4px;
            }
            
            /* High contrast focus for better visibility */
            .high-contrast *:focus {
                outline: 3px solid #ffff00 !important;
                outline-offset: 3px !important;
                background: rgba(255, 255, 0, 0.1) !important;
            }
            
            /* Skip focus for mouse users */
            .mouse-user *:focus {
                outline: none;
            }
        `;
        document.head.appendChild(style);
        
        // Detect mouse vs keyboard users
        this.setupMouseKeyboardDetection();
    }

    setupMouseKeyboardDetection() {
        let usingMouse = false;
        
        document.addEventListener('mousedown', () => {
            usingMouse = true;
            document.documentElement.classList.add('mouse-user');
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                usingMouse = false;
                document.documentElement.classList.remove('mouse-user');
            }
        });
    }

    // SCREEN READER SUPPORT
    setupScreenReaderSupport() {
        // Create live region for announcements
        this.createLiveRegion();
        
        // Add ARIA labels and descriptions
        this.addAriaLabels();
        
        // Setup landmark regions
        this.setupLandmarks();
        
        // Announce page changes
        this.announcePageChanges();
    }

    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.setAttribute('id', 'live-region');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
    }

    announce(message, priority = 'polite') {
        const liveRegion = document.getElementById('live-region');
        if (!liveRegion) return;
        
        liveRegion.setAttribute('aria-live', priority);
        liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
        
        console.log(`Screen reader announcement: ${message}`);
    }

    addAriaLabels() {
        // Navigation items
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (!link.getAttribute('aria-label')) {
                link.setAttribute('aria-label', link.textContent.trim());
            }
        });
        
        // Form inputs
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            const label = input.previousElementSibling;
            if (label && label.tagName === 'LABEL' && !input.getAttribute('aria-labelledby')) {
                const labelId = `label-${Math.random().toString(36).substr(2, 9)}`;
                label.id = labelId;
                input.setAttribute('aria-labelledby', labelId);
            }
        });
        
        // Buttons without text
        const iconButtons = document.querySelectorAll('button:not([aria-label]):empty, button:not([aria-label]) svg');
        iconButtons.forEach(button => {
            const parent = button.tagName === 'SVG' ? button.closest('button') : button;
            if (parent && !parent.getAttribute('aria-label')) {
                parent.setAttribute('aria-label', 'Button');
            }
        });
    }

    setupLandmarks() {
        // Add landmark roles where missing
        const nav = document.querySelector('nav:not([role])');
        if (nav) nav.setAttribute('role', 'navigation');
        
        const main = document.querySelector('main:not([role])');
        if (main) main.setAttribute('role', 'main');
        
        const footer = document.querySelector('footer:not([role])');
        if (footer) footer.setAttribute('role', 'contentinfo');
        
        // Add search landmark if search exists
        const searchForm = document.querySelector('form[role="search"], .search-form');
        if (searchForm && !searchForm.getAttribute('role')) {
            searchForm.setAttribute('role', 'search');
        }
    }

    announcePageChanges() {
        // Announce page load
        window.addEventListener('load', () => {
            const pageTitle = document.title;
            this.announce(`Page loaded: ${pageTitle}`);
        });
        
        // Announce form submissions
        document.addEventListener('submit', (e) => {
            this.announce('Form submitted');
        });
        
        // Announce error states
        document.addEventListener('invalid', (e) => {
            const field = e.target;
            this.announce(`Error in ${field.name || 'form field'}: ${field.validationMessage}`);
        });
    }

    // FOCUS MANAGEMENT
    setupFocusManagement() {
        // Save and restore focus for modals
        this.setupModalFocusManagement();
        
        // Focus management for dynamic content
        this.setupDynamicContentFocus();
    }

    setupModalFocusManagement() {
        const modals = document.querySelectorAll('.modal, [role="dialog"]');
        modals.forEach(modal => {
            modal.addEventListener('show', () => {
                this.trapFocus(modal);
            });
            
            modal.addEventListener('hide', () => {
                this.releaseFocus(modal);
            });
        });
    }

    trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Save current focus
        const previousFocus = document.activeElement;
        this.focusTrapping.set(container, previousFocus);
        
        // Focus first element
        firstElement.focus();
        
        // Trap focus
        const trapHandler = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        
        container.addEventListener('keydown', trapHandler);
        container._trapHandler = trapHandler;
    }

    releaseFocus(container) {
        if (container._trapHandler) {
            container.removeEventListener('keydown', container._trapHandler);
            delete container._trapHandler;
        }
        
        const previousFocus = this.focusTrapping.get(container);
        if (previousFocus) {
            previousFocus.focus();
            this.focusTrapping.delete(container);
        }
    }

    // CONTRAST CONTROLS
    setupContrastControls() {
        // Add contrast toggle button
        this.addContrastToggle();
        
        // Check for system preference
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        if (prefersHighContrast) {
            this.enableHighContrast();
        }
    }

    addContrastToggle() {
        const toggle = document.createElement('button');
        toggle.textContent = 'Toggle High Contrast';
        toggle.className = 'contrast-toggle';
        toggle.setAttribute('aria-label', 'Toggle high contrast mode');
        toggle.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            background: var(--apple-blue);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
        `;
        
        toggle.addEventListener('click', () => this.toggleHighContrast());
        document.body.appendChild(toggle);
    }

    toggleHighContrast() {
        this.highContrast = !this.highContrast;
        
        if (this.highContrast) {
            this.enableHighContrast();
        } else {
            this.disableHighContrast();
        }
    }

    enableHighContrast() {
        document.documentElement.classList.add('high-contrast');
        this.announce('High contrast mode enabled');
        localStorage.setItem('high-contrast', 'true');
    }

    disableHighContrast() {
        document.documentElement.classList.remove('high-contrast');
        this.announce('High contrast mode disabled');
        localStorage.setItem('high-contrast', 'false');
    }

    // MOTION CONTROLS
    setupMotionControls() {
        // Respect user's motion preferences
        if (this.reducedMotion) {
            this.enableReducedMotion();
        }
        
        // Add motion toggle
        this.addMotionToggle();
    }

    addMotionToggle() {
        const toggle = document.createElement('button');
        toggle.textContent = 'Reduce Motion';
        toggle.className = 'motion-toggle';
        toggle.setAttribute('aria-label', 'Toggle reduced motion');
        toggle.style.cssText = `
            position: fixed;
            top: 50px;
            right: 10px;
            z-index: 10000;
            background: var(--apple-purple);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
        `;
        
        toggle.addEventListener('click', () => this.toggleReducedMotion());
        document.body.appendChild(toggle);
    }

    toggleReducedMotion() {
        this.reducedMotion = !this.reducedMotion;
        
        if (this.reducedMotion) {
            this.enableReducedMotion();
        } else {
            this.disableReducedMotion();
        }
    }

    enableReducedMotion() {
        document.documentElement.classList.add('reduce-motion');
        this.announce('Reduced motion enabled');
        localStorage.setItem('reduce-motion', 'true');
    }

    disableReducedMotion() {
        document.documentElement.classList.remove('reduce-motion');
        this.announce('Reduced motion disabled');
        localStorage.setItem('reduce-motion', 'false');
    }

    // FORM ACCESSIBILITY
    setupFormAccessibility() {
        // Enhanced form labels and descriptions
        this.enhanceFormLabels();
        
        // Error announcement
        this.setupErrorAnnouncement();
        
        // Required field indicators
        this.markRequiredFields();
    }

    enhanceFormLabels() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                // Add required indicator to label
                if (input.required) {
                    const label = form.querySelector(`label[for="${input.id}"]`) ||
                                 input.previousElementSibling;
                    if (label && label.tagName === 'LABEL') {
                        label.setAttribute('aria-required', 'true');
                    }
                }
                
                // Add descriptions
                const helpText = input.nextElementSibling;
                if (helpText && helpText.classList.contains('form-help')) {
                    const descId = `desc-${Math.random().toString(36).substr(2, 9)}`;
                    helpText.id = descId;
                    input.setAttribute('aria-describedby', descId);
                }
            });
        });
    }

    setupErrorAnnouncement() {
        document.addEventListener('invalid', (e) => {
            const field = e.target;
            const message = field.validationMessage || 'Invalid input';
            this.announce(`Error: ${message}`, 'assertive');
        });
    }

    markRequiredFields() {
        const requiredInputs = document.querySelectorAll('input[required], textarea[required], select[required]');
        requiredInputs.forEach(input => {
            input.setAttribute('aria-required', 'true');
        });
    }

    // SKIP LINKS
    setupSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--apple-blue);
            color: white;
            padding: 8px;
            border-radius: 4px;
            text-decoration: none;
            z-index: 10001;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Ensure main content area exists
        let mainContent = document.getElementById('main-content');
        if (!mainContent) {
            mainContent = document.querySelector('main') || 
                         document.querySelector('.content') ||
                         document.querySelector('.container');
            if (mainContent) {
                mainContent.id = 'main-content';
                mainContent.setAttribute('tabindex', '-1');
            }
        }
    }

    skipToMain() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
            this.announce('Skipped to main content');
        }
    }

    // ACCESSIBILITY AUDIT
    auditAccessibility() {
        const issues = [];
        
        // Check for missing alt text
        const images = document.querySelectorAll('img:not([alt])');
        if (images.length > 0) {
            issues.push(`${images.length} images missing alt text`);
        }
        
        // Check for missing form labels
        const unlabeledInputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        if (unlabeledInputs.length > 0) {
            issues.push(`${unlabeledInputs.length} form inputs missing labels`);
        }
        
        // Check color contrast (simplified)
        this.checkColorContrast();
        
        if (issues.length > 0) {
            console.warn('Accessibility issues found:', issues);
        } else {
            console.log('No major accessibility issues found');
        }
    }

    checkColorContrast() {
        // Simplified contrast check
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a');
        textElements.forEach(element => {
            const styles = getComputedStyle(element);
            const bgColor = styles.backgroundColor;
            const textColor = styles.color;
            
            // This is a simplified check - in production, you'd use a proper contrast ratio calculator
            if (bgColor === 'rgb(0, 0, 0)' && textColor === 'rgb(0, 0, 0)') {
                console.warn('Potential contrast issue:', element);
            }
        });
    }

    // UTILITY METHODS
    handleEscape() {
        // Close any open dropdowns
        const openDropdowns = document.querySelectorAll('.nav-dropdown-menu[style*="visible"]');
        openDropdowns.forEach(dropdown => {
            dropdown.style.visibility = 'hidden';
            dropdown.style.opacity = '0';
        });
        
        // Close modals
        const openModals = document.querySelectorAll('.modal.active, [role="dialog"][aria-hidden="false"]');
        openModals.forEach(modal => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            this.releaseFocus(modal);
        });
    }

    handleArrowNavigation(event) {
        const activeElement = document.activeElement;
        const dropdown = activeElement.closest('.nav-dropdown-menu');
        
        if (dropdown) {
            const items = dropdown.querySelectorAll('a, button');
            const currentIndex = Array.from(items).indexOf(activeElement);
            
            if (currentIndex !== -1) {
                this.handleRovingTabNavigation(event, items, currentIndex);
            }
        }
    }

    // Load saved preferences
    loadPreferences() {
        const highContrast = localStorage.getItem('high-contrast') === 'true';
        const reduceMotion = localStorage.getItem('reduce-motion') === 'true';
        
        if (highContrast) this.enableHighContrast();
        if (reduceMotion) this.enableReducedMotion();
    }
}

// Accessibility styles
const accessibilityStyles = `
    /* High contrast mode */
    .high-contrast {
        --apple-blue: #0000ff;
        --apple-gray: #808080;
        --apple-red: #ff0000;
        --apple-green: #008000;
    }
    
    .high-contrast * {
        background: white !important;
        color: black !important;
        border-color: black !important;
    }
    
    .high-contrast a {
        color: #0000ff !important;
        text-decoration: underline !important;
    }
    
    .high-contrast button {
        background: #f0f0f0 !important;
        color: black !important;
        border: 2px solid black !important;
    }
    
    /* Reduced motion */
    .reduce-motion *,
    .reduce-motion *::before,
    .reduce-motion *::after {
        animation-delay: -1ms !important;
        animation-duration: 1ms !important;
        animation-iteration-count: 1 !important;
        background-attachment: initial !important;
        scroll-behavior: auto !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
    }
    
    /* Screen reader only content */
    .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
    }
    
    /* Focus indicators */
    .focus-visible {
        outline: 2px solid var(--apple-blue);
        outline-offset: 2px;
    }
`;

// Initialize accessibility
document.addEventListener('DOMContentLoaded', () => {
    // Add accessibility styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = accessibilityStyles;
    document.head.appendChild(styleSheet);
    
    // Initialize accessibility enhancements
    window.vibeAccessibility = new VibeAccessibility();
    window.vibeAccessibility.loadPreferences();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibeAccessibility;
}