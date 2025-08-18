/**
 * Vibe Awards - Smooth Apple-like Animations
 * Premium animation utilities for polished user experience
 */

class VibeAnimations {
    constructor() {
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isMobile = window.matchMedia('(max-width: 768px)').matches;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.observers = new Map();
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAnimations());
        } else {
            this.setupAnimations();
        }
    }

    setupAnimations() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupFormAnimations();
        this.setupLoadingStates();
        this.setupMicroAnimations();
        this.setupAppleMagic(); // Apple's signature magic
        this.setupMobileOptimizations();
    }

    // SCROLL-TRIGGERED ANIMATIONS
    setupScrollAnimations() {
        if (this.isReducedMotion) return;

        // Configure intersection observer for fade-in animations
        const fadeInObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateElementIn(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Add fade-in animation to elements
        const animateElements = document.querySelectorAll(
            '.feature-card, .section-card, .project-card, .achievement-item, .stat-card, .app-card, .form-section, .gallery-card, .messaging-panel, .results-section'
        );
        
        animateElements.forEach((el, index) => {
            // Only apply if element doesn't already have animation classes
            if (!el.style.animationName && !el.classList.contains('no-scroll-animation')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                el.style.transitionDelay = `${Math.min(index * 0.1, 1)}s`;
                fadeInObserver.observe(el);
            }
        });

        this.observers.set('fadeIn', fadeInObserver);
    }

    animateElementIn(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        // Add a subtle bounce effect for certain elements
        if (element.classList.contains('feature-card') || element.classList.contains('project-card')) {
            element.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                element.style.transform = 'translateY(0)';
            }, 200);
        }
    }

    // ENHANCED HOVER EFFECTS
    setupHoverEffects() {
        if (this.isReducedMotion) return;

        // Card hover effects with magnetic attraction
        const cards = document.querySelectorAll('.feature-card, .section-card, .project-card, .app-card');
        cards.forEach(card => {
            this.addMagneticHover(card);
            this.addFloatEffect(card);
        });

        // Button hover effects
        const buttons = document.querySelectorAll('.btn, .vote-button, .nav-cta, .cta-button');
        buttons.forEach(btn => {
            this.addButtonEffects(btn);
        });

        // Nav dropdown enhanced animations
        const dropdowns = document.querySelectorAll('.nav-dropdown-menu');
        dropdowns.forEach(dropdown => {
            this.enhanceDropdown(dropdown);
        });
    }

    addMagneticHover(element) {
        // Skip magnetic hover on touch devices to improve performance
        if (this.isTouchDevice) return;
        
        element.addEventListener('mousemove', (e) => {
            if (this.isReducedMotion) return;
            
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const intensity = this.isMobile ? 0.05 : 0.1;
            element.style.transform = `perspective(1000px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateZ(${this.isMobile ? 10 : 20}px)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    }

    addFloatEffect(element) {
        if (this.isReducedMotion) return;
        
        let isHovered = false;
        
        element.addEventListener('mouseenter', () => {
            isHovered = true;
            this.startFloating(element);
        });
        
        element.addEventListener('mouseleave', () => {
            isHovered = false;
        });
    }

    startFloating(element) {
        if (this.isReducedMotion) return;
        
        const animation = element.animate([
            { transform: element.style.transform + ' translateY(0px)' },
            { transform: element.style.transform + ' translateY(-5px)' },
            { transform: element.style.transform + ' translateY(0px)' }
        ], {
            duration: 2000,
            iterations: Infinity,
            easing: 'ease-in-out'
        });
        
        element._floatAnimation = animation;
        
        element.addEventListener('mouseleave', () => {
            if (animation) {
                animation.cancel();
            }
        }, { once: true });
    }

    addButtonEffects(button) {
        // Ripple effect on click
        button.addEventListener('click', (e) => {
            if (this.isReducedMotion) return;
            this.createRipple(e, button);
        });

        // Smooth scale transform
        button.addEventListener('mouseenter', () => {
            if (!this.isReducedMotion && !button.disabled) {
                button.style.transform = 'scale(1.05) translateZ(10px)';
            }
        });

        button.addEventListener('mouseleave', () => {
            if (!this.isReducedMotion) {
                button.style.transform = 'scale(1) translateZ(0)';
            }
        });
    }

    createRipple(event, element) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            z-index: 1;
        `;

        // Ensure parent is positioned
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        element.style.overflow = 'hidden';

        element.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    enhanceDropdown(dropdown) {
        if (this.isReducedMotion) return;
        
        const items = dropdown.querySelectorAll('.nav-dropdown-item, .dropdown-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-10px)';
            item.style.transition = `all 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${index * 50}ms`;
        });

        const parent = dropdown.closest('.nav-dropdown, .nav-item');
        if (parent) {
            parent.addEventListener('mouseenter', () => {
                items.forEach(item => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                });
            });

            parent.addEventListener('mouseleave', () => {
                items.forEach(item => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(-10px)';
                });
            });
        }
    }

    // FORM ANIMATIONS
    setupFormAnimations() {
        const inputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
        inputs.forEach(input => {
            this.enhanceFormInput(input);
        });

        // Upload animations
        const uploadBoxes = document.querySelectorAll('.upload-box');
        uploadBoxes.forEach(box => {
            this.enhanceUploadBox(box);
        });
    }

    enhanceFormInput(input) {
        const container = input.closest('.form-group');
        
        // Focus animations
        input.addEventListener('focus', () => {
            if (!this.isReducedMotion) {
                input.style.transform = 'scale(1.02)';
                input.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.1), 0 8px 32px rgba(0, 113, 227, 0.1)';
            }
            
            if (container) {
                container.classList.add('focused');
            }
        });

        input.addEventListener('blur', () => {
            if (!this.isReducedMotion) {
                input.style.transform = 'scale(1)';
                input.style.boxShadow = '';
            }
            
            if (container) {
                container.classList.remove('focused');
            }
        });

        // Validation animations
        input.addEventListener('invalid', () => {
            this.shakeElement(input);
        });

        input.addEventListener('input', () => {
            if (input.checkValidity()) {
                input.classList.remove('error');
                input.classList.add('valid');
            } else {
                input.classList.remove('valid');
            }
        });
    }

    enhanceUploadBox(box) {
        box.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!this.isReducedMotion) {
                box.style.transform = 'scale(1.05)';
                box.style.background = 'rgba(0, 113, 227, 0.1)';
            }
        });

        box.addEventListener('dragleave', () => {
            if (!this.isReducedMotion) {
                box.style.transform = 'scale(1)';
                box.style.background = '';
            }
        });

        box.addEventListener('drop', () => {
            if (!this.isReducedMotion) {
                box.style.transform = 'scale(1)';
                box.style.background = '';
                this.pulseElement(box);
            }
        });
    }

    shakeElement(element) {
        if (this.isReducedMotion) return;
        
        element.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 500,
            easing: 'ease-in-out'
        });

        element.style.borderColor = 'var(--apple-red)';
        setTimeout(() => {
            element.style.borderColor = '';
        }, 2000);
    }

    pulseElement(element) {
        if (this.isReducedMotion) return;
        
        element.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.1)' },
            { transform: 'scale(1)' }
        ], {
            duration: 400,
            easing: 'ease-out'
        });
    }

    // LOADING STATES
    setupLoadingStates() {
        this.createSkeletonStyles();
    }

    createSkeletonStyles() {
        if (document.querySelector('#skeleton-styles')) return;

        const style = document.createElement('style');
        style.id = 'skeleton-styles';
        style.textContent = `
            @keyframes shimmer {
                0% { background-position: -200px 0; }
                100% { background-position: calc(200px + 100%) 0; }
            }
            
            .skeleton {
                background: linear-gradient(90deg, 
                    rgba(255, 255, 255, 0.05) 25%, 
                    rgba(255, 255, 255, 0.1) 50%, 
                    rgba(255, 255, 255, 0.05) 75%);
                background-size: 200px 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 8px;
            }
            
            .skeleton-text {
                height: 20px;
                margin-bottom: 8px;
            }
            
            .skeleton-title {
                height: 24px;
                width: 70%;
                margin-bottom: 16px;
            }
            
            .skeleton-card {
                padding: 24px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .ripple {
                transform: scale(4);
                opacity: 0;
            }
        `;
        
        document.head.appendChild(style);
    }

    showSkeleton(container, type = 'card') {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        
        if (type === 'card') {
            skeleton.innerHTML = `
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text" style="width: 80%;"></div>
                <div class="skeleton skeleton-text" style="width: 60%;"></div>
            `;
        } else if (type === 'stats') {
            skeleton.innerHTML = `
                <div class="skeleton" style="height: 60px; width: 80px; margin: 0 auto 16px; border-radius: 12px;"></div>
                <div class="skeleton skeleton-text" style="width: 100%; height: 16px;"></div>
            `;
        } else if (type === 'list') {
            skeleton.innerHTML = `
                <div class="skeleton skeleton-text" style="width: 100%; margin-bottom: 12px;"></div>
                <div class="skeleton skeleton-text" style="width: 85%; margin-bottom: 12px;"></div>
                <div class="skeleton skeleton-text" style="width: 70%;"></div>
            `;
        }
        
        container.appendChild(skeleton);
        return skeleton;
    }

    hideSkeleton(skeleton) {
        if (skeleton && skeleton.parentNode) {
            skeleton.style.opacity = '0';
            setTimeout(() => {
                if (skeleton.parentNode) {
                    skeleton.parentNode.removeChild(skeleton);
                }
            }, 300);
        }
    }

    // MICRO-ANIMATIONS
    setupMicroAnimations() {
        // Smooth number counters
        this.setupCounters();
        
        // Icon animations
        this.setupIconAnimations();
        
        // Progress bar animations
        this.setupProgressBars();
    }

    setupCounters() {
        const counters = document.querySelectorAll('.stat-number, .countdown-number');
        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
        if (isNaN(target)) return;

        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            const suffix = element.textContent.replace(/[\d,]/g, '');
            element.textContent = Math.floor(current).toLocaleString() + suffix;
        }, 16);
    }

    setupIconAnimations() {
        const icons = document.querySelectorAll('.feature-icon, .section-icon, .project-icon');
        icons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    icon.style.transform = 'rotate(10deg) scale(1.1)';
                }
            });
            
            icon.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    icon.style.transform = 'rotate(0deg) scale(1)';
                }
            });
        });
    }

    setupProgressBars() {
        const progressBars = document.querySelectorAll('.progress-segment');
        const progressObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateProgressBar(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        progressBars.forEach(bar => {
            progressObserver.observe(bar);
        });
    }

    animateProgressBar(element) {
        const finalWidth = element.style.width;
        element.style.width = '0%';
        element.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            element.style.width = finalWidth;
        }, 100);
    }

    // UTILITY METHODS
    showLoading(element) {
        if (element.disabled) return;
        
        const originalText = element.textContent;
        element.disabled = true;
        element.style.pointerEvents = 'none';
        element.classList.add('loading');
        
        if (!this.isReducedMotion) {
            element.style.opacity = '0.7';
            element.style.transform = 'scale(0.98)';
        }
        
        element.textContent = 'Loading...';
        element.dataset.originalText = originalText;
    }

    hideLoading(element) {
        element.disabled = false;
        element.style.pointerEvents = '';
        element.style.opacity = '';
        element.style.transform = '';
        element.classList.remove('loading');
        element.textContent = element.dataset.originalText || 'Submit';
        delete element.dataset.originalText;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'rgba(48, 209, 88, 0.9)' : 
                       type === 'error' ? 'rgba(255, 55, 95, 0.9)' : 
                       'rgba(0, 113, 227, 0.9)';
        
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 24px;
            background: ${bgColor};
            color: white;
            padding: 16px 24px;
            border-radius: 16px;
            font-weight: 600;
            z-index: 10001;
            backdrop-filter: blur(20px);
            transform: translateX(100%) scale(0.9);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 320px;
            word-wrap: break-word;
        `;
        
        notification.innerHTML = `<span style="font-size: 18px;">${icon}</span><span>${message}</span>`;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0) scale(1)';
        }, 100);
        
        // Subtle pulse effect
        setTimeout(() => {
            if (!this.isReducedMotion) {
                notification.style.transform = 'translateX(0) scale(1.02)';
                setTimeout(() => {
                    notification.style.transform = 'translateX(0) scale(1)';
                }, 200);
            }
        }, 600);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%) scale(0.9)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 3500);
    }

    // APPLE MAGIC ENHANCEMENTS
    setupAppleMagic() {
        this.setupMagicalHovers();
        this.setupMagicalClicks();
        this.setupMagicalScrolling();
        this.setupMagicalFocus();
        this.setupParallaxEffects();
        this.setupElasticAnimations();
        this.setupContextualAnimations();
    }

    setupMagicalHovers() {
        // Apple's signature magnetic attraction effect
        const magneticElements = document.querySelectorAll('.magic-card, .magic-btn, .section-card, .feature-card');
        
        magneticElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                if (this.isReducedMotion || this.isTouchDevice) return;
                
                element.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                element.style.transform = 'translateY(-8px) scale(1.02)';
                element.style.filter = 'brightness(1.1)';
                
                // Add subtle glow
                element.style.boxShadow = '0 20px 60px rgba(0, 113, 227, 0.3), 0 8px 32px rgba(0, 0, 0, 0.2)';
                
                // Magnetic cursor effect
                this.addMagneticCursor(element);
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translateY(0) scale(1)';
                element.style.filter = 'brightness(1)';
                element.style.boxShadow = '';
                this.removeMagneticCursor(element);
            });
        });
    }

    addMagneticCursor(element) {
        element.addEventListener('mousemove', this.magneticMove);
        element._magneticHandler = this.magneticMove.bind(this);
    }

    removeMagneticCursor(element) {
        if (element._magneticHandler) {
            element.removeEventListener('mousemove', element._magneticHandler);
            delete element._magneticHandler;
        }
    }

    magneticMove(e) {
        if (this.isReducedMotion) return;
        
        const element = e.currentTarget;
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const intensity = 0.3;
        const rotation = (x * intensity) * 0.1;
        
        element.style.transform = `translateY(-8px) scale(1.02) rotateX(${-y * intensity * 0.1}deg) rotateY(${x * intensity * 0.1}deg) rotateZ(${rotation}deg)`;
    }

    setupMagicalClicks() {
        // Apple's signature click feedback
        const clickableElements = document.querySelectorAll('button, .btn, .magic-btn, .nav-link, .magic-card');
        
        clickableElements.forEach(element => {
            element.addEventListener('mousedown', () => {
                if (this.isReducedMotion) return;
                
                element.style.transition = 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.transform = 'scale(0.95)';
                
                // Add haptic-like visual feedback
                this.createClickRipple(element);
            });
            
            element.addEventListener('mouseup', () => {
                element.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
                element.style.transform = 'scale(1)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1)';
            });
        });
    }

    createClickRipple(element) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
            width: 100px;
            height: 100px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: magicRipple 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            z-index: 10;
        `;
        
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        element.style.overflow = 'hidden';
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    setupMagicalScrolling() {
        // Apple's signature scroll-triggered animations
        let lastScrollY = window.scrollY;
        
        const scrollHandler = () => {
            const currentScrollY = window.scrollY;
            const direction = currentScrollY > lastScrollY ? 'down' : 'up';
            
            // Parallax effect for hero elements
            const heroElements = document.querySelectorAll('.hero-section, .magic-hero');
            heroElements.forEach(hero => {
                const speed = 0.5;
                const yPos = -(currentScrollY * speed);
                hero.style.transform = `translateY(${yPos}px)`;
            });
            
            // Floating navigation
            const nav = document.querySelector('nav');
            if (nav) {
                if (currentScrollY > 100) {
                    nav.style.backdropFilter = 'saturate(180%) blur(20px)';
                    nav.style.background = 'rgba(0, 0, 0, 0.9)';
                } else {
                    nav.style.backdropFilter = 'saturate(180%) blur(20px)';
                    nav.style.background = 'rgba(0, 0, 0, 0.72)';
                }
            }
            
            lastScrollY = currentScrollY;
        };
        
        // Throttle scroll events for performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    scrollHandler();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    setupMagicalFocus() {
        // Apple's signature focus states
        const focusableElements = document.querySelectorAll('input, textarea, button, select, a[href]');
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                if (!this.isReducedMotion) {
                    element.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
                    element.style.transform = 'scale(1.02)';
                    element.style.boxShadow = '0 0 0 3px rgba(0, 122, 255, 0.3), 0 0 0 6px rgba(0, 122, 255, 0.1)';
                }
            });
            
            element.addEventListener('blur', () => {
                element.style.transform = 'scale(1)';
                element.style.boxShadow = '';
            });
        });
    }

    setupParallaxEffects() {
        // Subtle parallax for depth
        const parallaxElements = document.querySelectorAll('.magic-parallax, .gradient-orb');
        
        window.addEventListener('mousemove', (e) => {
            if (this.isReducedMotion) return;
            
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            parallaxElements.forEach((element, index) => {
                const speed = (index + 1) * 0.5;
                const x = (mouseX - 0.5) * speed * 10;
                const y = (mouseY - 0.5) * speed * 10;
                
                element.style.transform = `translate(${x}px, ${y}px)`;
                element.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            });
        });
    }

    setupElasticAnimations() {
        // Apple's elastic animations for state changes
        const observeChanges = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            this.applyElasticEntrance(node);
                        }
                    });
                }
            });
        });
        
        observeChanges.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    applyElasticEntrance(element) {
        if (this.isReducedMotion) return;
        
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8) translateY(20px)';
        element.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1) translateY(0)';
        }, 50);
    }

    setupContextualAnimations() {
        // Context-aware animations based on user interaction
        let isIdle = false;
        let idleTimer;
        
        const resetIdleTimer = () => {
            clearTimeout(idleTimer);
            isIdle = false;
            document.documentElement.classList.remove('idle');
            
            idleTimer = setTimeout(() => {
                isIdle = true;
                document.documentElement.classList.add('idle');
                this.triggerIdleAnimations();
            }, 30000); // 30 seconds of inactivity
        };
        
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetIdleTimer, true);
        });
        
        resetIdleTimer();
    }

    triggerIdleAnimations() {
        if (this.isReducedMotion) return;
        
        // Gentle breathing animation for idle state
        const breathingElements = document.querySelectorAll('.magic-card, .feature-card');
        breathingElements.forEach((element, index) => {
            setTimeout(() => {
                element.style.animation = 'magicBreathe 4s ease-in-out infinite';
            }, index * 200);
        });
    }

    // MOBILE OPTIMIZATIONS
    setupMobileOptimizations() {
        if (!this.isMobile) return;
        
        // Optimize scroll animations for mobile
        this.optimizeScrollAnimations();
        
        // Add touch-friendly improvements
        this.setupTouchImprovements();
        
        // Reduce animation complexity on mobile
        this.reduceMobileAnimations();
    }
    
    optimizeScrollAnimations() {
        // Use less aggressive intersection observer settings for mobile
        const mobileObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            },
            {
                threshold: 0.2, // Higher threshold for mobile
                rootMargin: '0px 0px -20px 0px' // Less aggressive margin
            }
        );
        
        this.observers.set('mobileOptimized', mobileObserver);
    }
    
    setupTouchImprovements() {
        // Add touch feedback to interactive elements
        const touchElements = document.querySelectorAll('.btn, .nav-link, .section-card, .feature-card');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.98)';
                element.style.transition = 'transform 0.1s ease';
            }, { passive: true });
            
            element.addEventListener('touchend', () => {
                element.style.transform = 'scale(1)';
            }, { passive: true });
        });
    }
    
    reduceMobileAnimations() {
        // Disable complex animations on mobile for better performance
        if (this.isMobile) {
            const style = document.createElement('style');
            style.textContent = `
                @media (max-width: 768px) {
                    * {
                        animation-duration: 0.3s !important;
                        transition-duration: 0.3s !important;
                    }
                    
                    .floating, .magnetic-hover {
                        animation: none !important;
                        transform: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // PERFORMANCE OPTIMIZATION
    destroy() {
            // Clean up observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        
        // Cancel animations
        document.querySelectorAll('*').forEach(el => {
            if (el._floatAnimation) {
                el._floatAnimation.cancel();
            }
            // Remove any custom animation classes
            el.classList.remove('loading', 'error', 'valid', 'dragover', 'uploading', 'has-image');
        });
    }
}

// Global utility functions
window.showLoading = function(element) {
    window.vibeAnimations.showLoading(element);
};

window.hideLoading = function(element) {
    window.vibeAnimations.hideLoading(element);
};

window.showNotification = function(message, type) {
    window.vibeAnimations.showNotification(message, type);
};

// Initialize animations when script loads
window.vibeAnimations = new VibeAnimations();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibeAnimations;
}