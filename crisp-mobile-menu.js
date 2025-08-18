// Crisp Mobile Menu - Simple & Reliable

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    const body = document.body;
    
    if (!menu || !toggle) return;
    
    const isActive = menu.classList.contains('active');
    
    if (isActive) {
        // Close menu
        menu.classList.remove('active');
        toggle.textContent = '☰';
        body.style.overflow = '';
    } else {
        // Open menu
        menu.classList.add('active');
        toggle.textContent = '✕';
        body.style.overflow = 'hidden';
    }
}

// Initialize mobile menu when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (!menu || !toggle) return;
    
    // Close menu when clicking a link
    const menuLinks = menu.querySelectorAll('.mobile-menu-link, .mobile-menu-cta, .mobile-menu-icon-btn');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(() => {
                menu.classList.remove('active');
                toggle.textContent = '☰';
                document.body.style.overflow = '';
            }, 100);
        });
    });
    
    // Close menu when clicking outside
    menu.addEventListener('click', function(e) {
        if (e.target === menu) {
            menu.classList.remove('active');
            toggle.textContent = '☰';
            document.body.style.overflow = '';
        }
    });
    
    // Close menu with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            menu.classList.remove('active');
            toggle.textContent = '☰';
            document.body.style.overflow = '';
        }
    });
});

// Fallback for any errors
window.addEventListener('error', function() {
    const menu = document.getElementById('mobileMenu');
    const body = document.body;
    if (menu && menu.classList.contains('active')) {
        menu.classList.remove('active');
        body.style.overflow = '';
    }
});