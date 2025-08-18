// Enhanced Mobile Menu JavaScript - Apple-Level Polish

// Mobile menu functionality with Apple-level polish
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    const body = document.body;
    
    // Toggle menu state
    const isActive = menu.classList.toggle('active');
    
    // Update toggle button with smooth animation
    toggle.style.transform = 'scale(0.8)';
    setTimeout(() => {
        toggle.textContent = isActive ? '✕' : '☰';
        toggle.style.transform = 'scale(1)';
    }, 150);
    
    // Prevent body scroll when menu is open
    if (isActive) {
        body.style.overflow = 'hidden';
        // Focus trap for accessibility
        setTimeout(() => {
            const firstLink = menu.querySelector('.mobile-menu-link');
            if (firstLink) firstLink.focus();
        }, 400);
    } else {
        body.style.overflow = '';
    }
}

// Enhanced mobile menu interactions
document.addEventListener('DOMContentLoaded', function() {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (!menu || !toggle) return; // Exit if elements don't exist
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.mobile-menu-link, .mobile-menu-cta, .mobile-menu-icon-btn').forEach(link => {
        link.addEventListener('click', (e) => {
            // Add haptic feedback effect
            e.target.style.transform = 'scale(0.95)';
            setTimeout(() => {
                e.target.style.transform = '';
            }, 150);
            
            // Close menu after short delay for feedback
            setTimeout(() => {
                menu.classList.remove('active');
                toggle.textContent = '☰';
                document.body.style.overflow = '';
            }, 200);
        });
    });
    
    // Close menu when clicking backdrop
    menu.addEventListener('click', (e) => {
        if (e.target === menu) {
            menu.classList.remove('active');
            toggle.textContent = '☰';
            document.body.style.overflow = '';
        }
    });
    
    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            menu.classList.remove('active');
            toggle.textContent = '☰';
            document.body.style.overflow = '';
            toggle.focus(); // Return focus to toggle button
        }
    });
    
    // Add touch gesture support for iOS
    let touchStartY = 0;
    menu.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });
    
    menu.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartY;
        
        // If scrolling up while at top, close menu
        if (deltaY < -50 && menu.scrollTop === 0) {
            menu.classList.remove('active');
            toggle.textContent = '☰';
            document.body.style.overflow = '';
        }
    });
});