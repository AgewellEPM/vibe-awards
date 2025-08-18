/**
 * Vibe Awards - Performance Optimization
 * Lazy loading, image optimization, and performance monitoring
 */

class VibePerformance {
    constructor() {
        this.imageObserver = null;
        this.loadingImages = new Set();
        this.performanceData = {
            pageLoadTime: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0
        };
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupOptimizations());
        } else {
            this.setupOptimizations();
        }
    }

    setupOptimizations() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupResourceHints();
        this.setupPerformanceMonitoring();
        this.optimizeAnimations();
        this.setupCriticalResourceLoading();
    }

    // LAZY LOADING
    setupLazyLoading() {
        // Native lazy loading fallback for older browsers
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            this.imageObserver.unobserve(entry.target);
                        }
                    });
                },
                {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                }
            );

            // Find images to lazy load
            const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
            lazyImages.forEach(img => {
                this.imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }

        // Lazy load background images
        this.setupBackgroundImageLazyLoading();
    }

    loadImage(img) {
        if (this.loadingImages.has(img)) return;
        this.loadingImages.add(img);

        // Show loading state
        img.style.opacity = '0.5';
        img.style.filter = 'blur(5px)';

        const actualSrc = img.dataset.src || img.src;
        
        // Create a new image to preload
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Set the actual source
            img.src = actualSrc;
            img.removeAttribute('data-src');
            
            // Animate in
            img.style.transition = 'all 0.3s ease';
            img.style.opacity = '1';
            img.style.filter = 'blur(0px)';
            
            this.loadingImages.delete(img);
        };

        imageLoader.onerror = () => {
            console.warn('Failed to load image:', actualSrc);
            img.style.opacity = '0.3';
            img.alt = 'Failed to load image';
            this.loadingImages.delete(img);
        };

        imageLoader.src = actualSrc;
    }

    setupBackgroundImageLazyLoading() {
        const bgImageElements = document.querySelectorAll('[data-bg-src]');
        
        const bgObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const bgSrc = element.dataset.bgSrc;
                        
                        const img = new Image();
                        img.onload = () => {
                            element.style.backgroundImage = `url(${bgSrc})`;
                            element.classList.add('bg-loaded');
                        };
                        img.src = bgSrc;
                        
                        bgObserver.unobserve(element);
                    }
                });
            },
            { rootMargin: '50px 0px' }
        );

        bgImageElements.forEach(el => bgObserver.observe(el));
    }

    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.loadImage(img));
    }

    // IMAGE OPTIMIZATION
    setupImageOptimization() {
        // Add WebP support detection
        this.detectWebPSupport().then(supportsWebP => {
            if (supportsWebP) {
                document.documentElement.classList.add('webp-support');
                this.convertToWebP();
            }
        });

        // Setup responsive images
        this.setupResponsiveImages();
    }

    async detectWebPSupport() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    convertToWebP() {
        const images = document.querySelectorAll('img[data-webp]');
        images.forEach(img => {
            const webpSrc = img.dataset.webp;
            if (webpSrc) {
                img.src = webpSrc;
            }
        });
    }

    setupResponsiveImages() {
        // Add responsive image handling
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.srcset && img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
        });
    }

    // RESOURCE HINTS
    setupResourceHints() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Setup prefetch for likely navigation
        this.setupPrefetch();
    }

    preloadCriticalResources() {
        const criticalResources = [
            { href: 'css/typography.css', as: 'style' },
            { href: 'css/mobile-responsive.css', as: 'style' },
            { href: 'js/animations.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'style') {
                link.onload = () => {
                    link.rel = 'stylesheet';
                };
            }
            document.head.appendChild(link);
        });
    }

    setupPrefetch() {
        // Prefetch likely next pages on hover
        const navLinks = document.querySelectorAll('a[href*=".html"]');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.prefetchPage(link.href);
            }, { once: true });
        });
    }

    prefetchPage(href) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
    }

    // PERFORMANCE MONITORING
    setupPerformanceMonitoring() {
        // Web Vitals monitoring
        this.measureWebVitals();
        
        // Performance observer
        this.setupPerformanceObserver();
        
        // Resource timing
        this.monitorResourceTiming();
    }

    measureWebVitals() {
        // First Contentful Paint
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    this.performanceData.firstContentfulPaint = entry.startTime;
                }
            }
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.performanceData.largestContentfulPaint = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    this.performanceData.cumulativeLayoutShift += entry.value;
                }
            }
        }).observe({ entryTypes: ['layout-shift'] });

        // Page Load Time
        window.addEventListener('load', () => {
            this.performanceData.pageLoadTime = performance.now();
            this.reportPerformance();
        });
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('Long task detected:', entry.duration, 'ms');
                    }
                }
            });
            observer.observe({ entryTypes: ['longtask'] });
        }
    }

    monitorResourceTiming() {
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            const slowResources = resources.filter(resource => resource.duration > 1000);
            
            if (slowResources.length > 0) {
                console.warn('Slow loading resources:', slowResources);
            }
        });
    }

    reportPerformance() {
        const metrics = {
            ...this.performanceData,
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null
        };

        console.log('Performance Metrics:', metrics);
        
        // Send to analytics (if implemented)
        if (window.analytics) {
            window.analytics.track('performance_metrics', metrics);
        }
    }

    // ANIMATION OPTIMIZATION
    optimizeAnimations() {
        // Reduce animations on low-end devices
        if (this.isLowEndDevice()) {
            document.documentElement.classList.add('reduce-motion');
        }

        // Pause animations when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    isLowEndDevice() {
        // Check for low-end device indicators
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        const connection = navigator.connection;
        
        return (
            memory < 2 || 
            cores < 4 || 
            (connection && connection.effectiveType === 'slow-2g') ||
            (connection && connection.effectiveType === '2g')
        );
    }

    pauseAnimations() {
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }

    // CRITICAL RESOURCE LOADING
    setupCriticalResourceLoading() {
        // Load critical CSS inline
        this.inlineCriticalCSS();
        
        // Defer non-critical resources
        this.deferNonCriticalResources();
    }

    inlineCriticalCSS() {
        // This would typically be done at build time
        // For now, we'll ensure critical styles are loaded first
        const criticalStyles = `
            body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; }
            .hero-title { font-size: 64px; font-weight: 700; }
            .nav-container { padding: 16px 24px; }
        `;
        
        const style = document.createElement('style');
        style.textContent = criticalStyles;
        document.head.insertBefore(style, document.head.firstChild);
    }

    deferNonCriticalResources() {
        // Defer non-critical scripts
        const scripts = document.querySelectorAll('script[defer-load]');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.src = script.dataset.src;
            newScript.async = true;
            document.body.appendChild(newScript);
        });
    }

    // UTILITY METHODS
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    getPerformanceMetrics() {
        return this.performanceData;
    }

    optimizeForMobile() {
        if (window.innerWidth <= 768) {
            // Reduce animation complexity
            document.documentElement.classList.add('mobile-optimized');
            
            // Reduce image quality on slow connections
            if (navigator.connection && navigator.connection.effectiveType === '2g') {
                this.reducedImageQuality();
            }
        }
    }

    reducedImageQuality() {
        const images = document.querySelectorAll('img[data-low-quality]');
        images.forEach(img => {
            img.src = img.dataset.lowQuality;
        });
    }

    // CLEANUP
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
    }
}

// Performance-optimized styles
const performanceStyles = `
    /* Reduce motion for low-end devices */
    .reduce-motion * {
        animation-duration: 0.3s !important;
        transition-duration: 0.3s !important;
    }
    
    /* Mobile optimizations */
    .mobile-optimized .gradient-orb {
        display: none;
    }
    
    .mobile-optimized .complex-animation {
        animation: none !important;
    }
    
    /* Lazy loading states */
    img[data-src] {
        background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.05) 25%, 
            rgba(255, 255, 255, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    
    .bg-loaded {
        transition: opacity 0.3s ease;
    }
    
    /* Performance-optimized animations */
    .optimized-animation {
        will-change: transform;
        transform: translateZ(0);
    }
    
    /* Critical loading states */
    .loading-critical {
        opacity: 0;
        animation: fadeInCritical 0.3s ease forwards;
    }
    
    @keyframes fadeInCritical {
        to { opacity: 1; }
    }
`;

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Add performance styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = performanceStyles;
    document.head.appendChild(styleSheet);
    
    // Initialize performance monitoring
    window.vibePerformance = new VibePerformance();
    
    // Optimize for current device
    window.vibePerformance.optimizeForMobile();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibePerformance;
}