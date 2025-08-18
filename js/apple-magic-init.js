/**
 * Apple Magic Initialization
 * Automatically applies Apple's signature interactions to any page
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }
    
    function applyAppleMagic() {
        // Add magic classes to navigation elements
        const navs = document.querySelectorAll('nav');
        navs.forEach(nav => {
            if (!nav.classList.contains('magic-nav')) {
                nav.classList.add('magic-nav');
            }
        });
        
        // Add magic classes to dropdowns
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        dropdowns.forEach(dropdown => {
            if (!dropdown.classList.contains('magic-dropdown')) {
                dropdown.classList.add('magic-dropdown');
            }
            
            const menu = dropdown.querySelector('.nav-dropdown-menu');
            if (menu && !menu.classList.contains('magic-dropdown-menu')) {
                menu.classList.add('magic-dropdown-menu');
            }
            
            const items = dropdown.querySelectorAll('.nav-dropdown-item');
            items.forEach(item => {
                if (!item.classList.contains('magic-dropdown-item')) {
                    item.classList.add('magic-dropdown-item');
                }
            });
        });
        
        // Add magic classes to cards
        const cards = document.querySelectorAll('.section-card, .feature-card, .app-card, .stat-card');
        cards.forEach((card, index) => {
            if (!card.classList.contains('magic-card')) {
                card.classList.add('magic-card');
                
                // Add staggered animation delays
                const staggerClass = `magic-stagger-${Math.min(index % 5 + 1, 5)}`;
                if (!card.classList.contains(staggerClass)) {
                    card.classList.add(staggerClass);
                }
            }
        });
        
        // Add magic classes to buttons
        const buttons = document.querySelectorAll('button, .btn, .nav-cta, .cta-button');
        buttons.forEach(button => {
            if (!button.classList.contains('magic-btn')) {
                button.classList.add('magic-btn');
                
                // Determine button type based on existing classes
                if (button.classList.contains('btn-primary') || button.classList.contains('nav-cta')) {
                    button.classList.add('magic-btn-primary');
                } else if (button.classList.contains('btn-secondary')) {
                    button.classList.add('magic-btn-ghost');
                } else {
                    button.classList.add('magic-btn-ghost');
                }
            }
        });
        
        // Add magic classes to inputs
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (!input.classList.contains('magic-input') && !input.classList.contains('form-input')) {
                input.classList.add('magic-input');
            }
        });
        
        // Add magic classes to icons
        const icons = document.querySelectorAll('.section-icon, .feature-icon');
        icons.forEach(icon => {
            if (!icon.classList.contains('magic-icon')) {
                icon.classList.add('magic-icon');
            }
        });
        
        // Add magic classes to hero sections
        const heroes = document.querySelectorAll('.hero, .hero-section');
        heroes.forEach(hero => {
            if (!hero.classList.contains('magic-hero')) {
                hero.classList.add('magic-hero');
            }
            
            const content = hero.querySelector('.hero-content');
            if (content && !content.classList.contains('magic-fade-in')) {
                content.classList.add('magic-fade-in');
            }
        });
        
        // Add magic glass to appropriate elements
        const glassElements = document.querySelectorAll('.hero-badge, .upload-box');
        glassElements.forEach(element => {
            if (!element.classList.contains('magic-glass')) {
                element.classList.add('magic-glass');
            }
        });
        
        // Add parallax to background elements
        const backgroundElements = document.querySelectorAll('.gradient-orb, .orb1, .orb2, .orb3');
        backgroundElements.forEach(element => {
            if (!element.classList.contains('magic-parallax')) {
                element.classList.add('magic-parallax');
            }
        });
        
        // Add magic scroll to scrollable areas
        const scrollAreas = document.querySelectorAll('.messages-list, .conversations-sidebar');
        scrollAreas.forEach(area => {
            if (!area.classList.contains('magic-scroll')) {
                area.classList.add('magic-scroll');
            }
        });
        
        // Add focus ring to focusable elements
        const focusableElements = document.querySelectorAll('input, textarea, button, select, a[href]');
        focusableElements.forEach(element => {
            if (!element.classList.contains('magic-focus-ring')) {
                element.classList.add('magic-focus-ring');
            }
        });
        
        // Add transform GPU acceleration to animated elements
        const animatedElements = document.querySelectorAll('.magic-card, .magic-btn, .magic-icon');
        animatedElements.forEach(element => {
            if (!element.classList.contains('magic-transform-gpu')) {
                element.classList.add('magic-transform-gpu');
            }
        });
        
        // Apply smooth scrolling to the page
        if (!document.documentElement.classList.contains('magic-smooth-scroll')) {
            document.documentElement.classList.add('magic-smooth-scroll');
        }
        
        // Add no-select to non-text elements
        const nonTextElements = document.querySelectorAll('button, .nav-logo, .icon');
        nonTextElements.forEach(element => {
            if (!element.classList.contains('magic-no-select')) {
                element.classList.add('magic-no-select');
            }
        });
        
        console.log('✨ Apple Magic applied to all elements');
    }
    
    // Apply magic when page loads
    ready(applyAppleMagic);
    
    // Re-apply magic when new content is added dynamically
    const observer = new MutationObserver((mutations) => {
        let shouldReapply = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && !node.classList.contains('magic-applied')) {
                        shouldReapply = true;
                    }
                });
            }
        });
        
        if (shouldReapply) {
            setTimeout(applyAppleMagic, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Add special touch handling for iOS devices
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.addEventListener('touchstart', function() {}, { passive: true });
        document.documentElement.classList.add('ios-device');
    }
    
    // Add reduced motion handling
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('reduce-motion');
    }
    
    // Add high contrast handling
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.documentElement.classList.add('high-contrast');
    }
    
    // Add dark mode handling
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark-mode');
    }
    
    // Export for global access
    window.applyAppleMagic = applyAppleMagic;
})();