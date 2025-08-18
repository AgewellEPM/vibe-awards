// API Configuration
const API_BASE = 'http://localhost:3001/api';

// API Helper Class
class VibeAPI {
    constructor() {
        this.token = localStorage.getItem('vibe_token');
        this.user = this.token ? JSON.parse(localStorage.getItem('vibe_user') || '{}') : null;
    }

    // Auth helpers
    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('vibe_token', token);
        localStorage.setItem('vibe_user', JSON.stringify(user));
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('vibe_token');
        localStorage.removeItem('vibe_user');
    }

    // HTTP request helper
    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication
    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (data.token) {
            this.setAuth(data.token, data.user);
        }
        
        return data;
    }

    async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (data.token) {
            this.setAuth(data.token, data.user);
        }
        
        return data;
    }

    logout() {
        this.clearAuth();
        window.location.href = '/index-magic.html';
    }

    // Apps
    async getApps(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/apps?${params}`);
    }

    async getApp(id) {
        return await this.request(`/apps/${id}`);
    }

    async submitApp(formData) {
        return await this.request('/apps', {
            method: 'POST',
            headers: {}, // Remove Content-Type to let browser set it for FormData
            body: formData
        });
    }

    async likeApp(appId) {
        return await this.request(`/apps/${appId}/like`, {
            method: 'POST'
        });
    }

    async nominateApp(appId) {
        return await this.request(`/apps/${appId}/nominate`, {
            method: 'POST'
        });
    }

    // Battles
    async getBattles(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/battles?${params}`);
    }

    async getCurrentBattle() {
        return await this.request('/battles/current');
    }

    async voteInBattle(battleId, appId) {
        return await this.request(`/battles/${battleId}/vote`, {
            method: 'POST',
            body: JSON.stringify({ app_id: appId })
        });
    }

    // Stats and Leaderboard
    async getStats() {
        // For now, return sample stats - can be implemented as needed
        return {
            totalApps: 347,
            totalVotes: 2400000,
            activeUsers: 89000,
            totalPrizes: 1000000
        };
    }

    // Collaboration
    async getCollaborationPosts(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/collaboration/posts?${params}`);
    }

    async getCollaborationPost(id) {
        return await this.request(`/collaboration/posts/${id}`);
    }

    async createCollaborationPost(postData) {
        return await this.request('/collaboration/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    }

    async expressInterest(postId, interestData) {
        return await this.request(`/collaboration/posts/${postId}/interest`, {
            method: 'POST',
            body: JSON.stringify(interestData)
        });
    }
}

// Create global API instance
const vibeAPI = new VibeAPI();

// Utility functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return formatDate(dateString);
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#FF375F' : type === 'success' ? '#30D158' : '#0071E3'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);

    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Authentication check for protected pages
function requireAuth() {
    if (!vibeAPI.user) {
        window.location.href = '/signup.html';
        return false;
    }
    return true;
}

// Update user display elements
function updateUserDisplay() {
    const userElements = document.querySelectorAll('[data-user-name]');
    const avatarElements = document.querySelectorAll('[data-user-avatar]');
    
    if (vibeAPI.user) {
        userElements.forEach(el => {
            el.textContent = vibeAPI.user.username;
        });
        avatarElements.forEach(el => {
            el.textContent = vibeAPI.user.username.charAt(0).toUpperCase();
        });
    }
}

// Loading states
function showLoading(element) {
    const originalContent = element.innerHTML;
    element.dataset.originalContent = originalContent;
    element.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; gap: 8px;"><div style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>Loading...</div>';
    
    // Add spin animation if not exists
    if (!document.querySelector('#spin-animation')) {
        const style = document.createElement('style');
        style.id = 'spin-animation';
        style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }
}

function hideLoading(element) {
    if (element.dataset.originalContent) {
        element.innerHTML = element.dataset.originalContent;
        delete element.dataset.originalContent;
    }
}

// Export for use in other scripts
window.vibeAPI = vibeAPI;
window.showNotification = showNotification;
window.requireAuth = requireAuth;
window.updateUserDisplay = updateUserDisplay;
window.formatNumber = formatNumber;
window.formatDate = formatDate;
window.formatTimeAgo = formatTimeAgo;
window.showLoading = showLoading;
window.hideLoading = hideLoading;