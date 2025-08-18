/**
 * Vibe Awards - Form Validation & Error Handling
 * Professional-grade validation with Apple-style UX
 */

class VibeValidation {
    constructor() {
        this.validators = new Map();
        this.errors = new Map();
        this.isSubmitting = false;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupValidation());
        } else {
            this.setupValidation();
        }
    }

    setupValidation() {
        this.initializeValidators();
        this.setupFormHandlers();
        this.setupRealTimeValidation();
    }

    // VALIDATION RULES
    initializeValidators() {
        // Email validation
        this.validators.set('email', {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address',
            test: (value) => this.validators.get('email').pattern.test(value)
        });

        // Required field validation
        this.validators.set('required', {
            test: (value) => value && value.trim().length > 0,
            message: 'This field is required'
        });

        // URL validation
        this.validators.set('url', {
            pattern: /^https?:\/\/.+\..+/,
            message: 'Please enter a valid URL (starting with http:// or https://)',
            test: (value) => this.validators.get('url').pattern.test(value)
        });

        // Password validation
        this.validators.set('password', {
            test: (value) => value && value.length >= 8,
            message: 'Password must be at least 8 characters long'
        });

        // Strong password validation
        this.validators.set('strong-password', {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            message: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
            test: (value) => this.validators.get('strong-password').pattern.test(value)
        });

        // Name validation
        this.validators.set('name', {
            pattern: /^[a-zA-Z\s]{2,50}$/,
            message: 'Name must be 2-50 characters and contain only letters and spaces',
            test: (value) => this.validators.get('name').pattern.test(value)
        });

        // Username validation
        this.validators.set('username', {
            pattern: /^[a-zA-Z0-9_]{3,20}$/,
            message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
            test: (value) => this.validators.get('username').pattern.test(value)
        });

        // Phone validation
        this.validators.set('phone', {
            pattern: /^\+?[\d\s\-\(\)]{10,}$/,
            message: 'Please enter a valid phone number',
            test: (value) => this.validators.get('phone').pattern.test(value)
        });

        // GitHub URL validation
        this.validators.set('github', {
            pattern: /^https?:\/\/(www\.)?github\.com\/[\w\-\.]+$/,
            message: 'Please enter a valid GitHub profile URL',
            test: (value) => this.validators.get('github').pattern.test(value)
        });

        // App link validation
        this.validators.set('app-link', {
            pattern: /^https?:\/\/.+/,
            message: 'Please enter a valid app URL',
            test: (value) => this.validators.get('app-link').pattern.test(value)
        });
    }

    // FORM SETUP
    setupFormHandlers() {
        const forms = document.querySelectorAll('form[data-validate]');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            
            // Prevent double submission
            form.addEventListener('submit', (e) => {
                if (this.isSubmitting) {
                    e.preventDefault();
                    return false;
                }
            });
        });
    }

    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('[data-validate]');
        inputs.forEach(input => {
            // Validate on blur
            input.addEventListener('blur', () => this.validateField(input));
            
            // Clear errors on input
            input.addEventListener('input', () => this.clearFieldError(input));
            
            // Special handling for password confirmation
            if (input.dataset.validate === 'password-confirm') {
                const passwordField = document.querySelector('[data-validate="password"]');
                if (passwordField) {
                    passwordField.addEventListener('input', () => this.validateField(input));
                }
            }
        });
    }

    // VALIDATION LOGIC
    validateField(field) {
        const rules = field.dataset.validate.split(' ');
        const value = field.value;
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        for (const rule of rules) {
            if (rule === 'password-confirm') {
                const passwordField = document.querySelector('[data-validate*="password"]:not([data-validate*="confirm"])');
                if (passwordField && value !== passwordField.value) {
                    isValid = false;
                    errorMessage = 'Passwords do not match';
                    break;
                }
            } else if (this.validators.has(rule)) {
                const validator = this.validators.get(rule);
                if (!validator.test(value)) {
                    isValid = false;
                    errorMessage = validator.message;
                    break;
                }
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
            this.errors.set(field.name || field.id, errorMessage);
        } else {
            this.errors.delete(field.name || field.id);
        }

        return isValid;
    }

    validateForm(form) {
        const fields = form.querySelectorAll('[data-validate]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // ERROR DISPLAY
    showFieldError(field, message) {
        field.classList.add('error');
        
        // Create or update error message
        let errorElement = field.parentNode.querySelector('.form-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.opacity = '0';
        errorElement.style.transform = 'translateY(-5px)';
        
        // Animate in
        setTimeout(() => {
            errorElement.style.transition = 'all 0.3s ease';
            errorElement.style.opacity = '1';
            errorElement.style.transform = 'translateY(0)';
        }, 10);

        // Shake animation with error handling
        try {
            if (window.vibeAnimations && typeof window.vibeAnimations.shakeElement === 'function') {
                window.vibeAnimations.shakeElement(field);
            }
        } catch (error) {
            console.warn('Animation failed:', error);
        }
    }

    clearFieldError(field) {
        field.classList.remove('error');
        field.classList.add('valid');
        
        const errorElement = field.parentNode.querySelector('.form-error');
        if (errorElement) {
            errorElement.style.opacity = '0';
            errorElement.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                if (errorElement.parentNode) {
                    errorElement.parentNode.removeChild(errorElement);
                }
            }, 300);
        }
    }

    clearAllErrors(form) {
        const fields = form.querySelectorAll('[data-validate]');
        fields.forEach(field => this.clearFieldError(field));
        this.errors.clear();
    }

    // FORM SUBMISSION
    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) return;
        
        const form = event.target;
        const submitButton = form.querySelector('[type="submit"]');
        
        // Clear previous errors
        this.clearFormErrors(form);
        
        // Validate form
        if (!this.validateForm(form)) {
            this.showFormSummaryError(form, 'Please fix the errors above and try again.');
            this.focusFirstError(form);
            return;
        }

        // Show loading state with error handling
        this.isSubmitting = true;
        try {
            if (window.vibeAnimations && typeof window.vibeAnimations.showLoading === 'function') {
                window.vibeAnimations.showLoading(submitButton);
            }
        } catch (error) {
            console.warn('Loading animation failed:', error);
        }

        try {
            // Simulate form submission
            await this.submitForm(form);
            
            // Show success
            this.showFormSuccess(form, 'Form submitted successfully!');
            
            // Reset form if needed
            if (form.dataset.resetOnSuccess !== 'false') {
                setTimeout(() => {
                    form.reset();
                    this.clearAllErrors(form);
                }, 1000);
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showFormError(form, error.message || 'An error occurred. Please try again.');
        } finally {
            this.isSubmitting = false;
            try {
                if (window.vibeAnimations && typeof window.vibeAnimations.hideLoading === 'function') {
                    window.vibeAnimations.hideLoading(submitButton);
                }
            } catch (error) {
                console.warn('Hide loading animation failed:', error);
            }
        }
    }

    async submitForm(form) {
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate occasional errors for testing
                if (Math.random() < 0.1) {
                    reject(new Error('Network error. Please try again.'));
                } else {
                    console.log('Form submitted:', data);
                    resolve(data);
                }
            }, 1500);
        });
    }

    // ERROR NOTIFICATIONS
    showFormError(form, message) {
        if (window.vibeAnimations) {
            window.vibeAnimations.showNotification(message, 'error');
        }
    }

    showFormSuccess(form, message) {
        if (window.vibeAnimations) {
            window.vibeAnimations.showNotification(message, 'success');
        }
    }

    showFormSummaryError(form, message) {
        let errorSummary = form.querySelector('.form-error-summary');
        if (!errorSummary) {
            errorSummary = document.createElement('div');
            errorSummary.className = 'form-error-summary';
            errorSummary.style.cssText = `
                background: rgba(255, 55, 95, 0.1);
                border: 1px solid rgba(255, 55, 95, 0.3);
                color: var(--apple-red);
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 16px;
                font-size: 14px;
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.3s ease;
            `;
            form.insertBefore(errorSummary, form.firstChild);
        }
        
        errorSummary.textContent = message;
        setTimeout(() => {
            errorSummary.style.opacity = '1';
            errorSummary.style.transform = 'translateY(0)';
        }, 10);
    }

    clearFormErrors(form) {
        const errorSummary = form.querySelector('.form-error-summary');
        if (errorSummary) {
            errorSummary.style.opacity = '0';
            setTimeout(() => {
                if (errorSummary.parentNode) {
                    errorSummary.parentNode.removeChild(errorSummary);
                }
            }, 300);
        }
    }

    focusFirstError(form) {
        const firstErrorField = form.querySelector('.error');
        if (firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }

    // UTILITY METHODS
    addCustomValidator(name, validator) {
        this.validators.set(name, validator);
    }

    validateEmail(email) {
        return this.validators.get('email').test(email);
    }

    validateURL(url) {
        return this.validators.get('url').test(url);
    }

    getFormData(form) {
        const formData = new FormData(form);
        return Object.fromEntries(formData.entries());
    }

    // ERROR RECOVERY
    setupErrorRecovery() {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            if (window.vibeAnimations) {
                window.vibeAnimations.showNotification(
                    'An unexpected error occurred. Please refresh the page.',
                    'error'
                );
            }
        });

        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            if (window.vibeAnimations && event.error.message.includes('network')) {
                window.vibeAnimations.showNotification(
                    'Network connection issue. Please check your internet.',
                    'error'
                );
            }
        });
    }
}

// Enhanced form styling
const formStyles = `
    .form-group {
        margin-bottom: 24px;
        position: relative;
    }

    .form-input, .form-textarea, .form-select {
        width: 100%;
        padding: 16px 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        color: #F5F5F7;
        font-size: 16px;
        transition: all 0.3s ease;
        outline: none;
    }

    .form-input:focus, .form-textarea:focus, .form-select:focus {
        border-color: var(--apple-blue);
        box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
        background: rgba(255, 255, 255, 0.08);
    }

    .form-input.error, .form-textarea.error, .form-select.error {
        border-color: var(--apple-red);
        background: rgba(255, 55, 95, 0.05);
    }

    .form-input.valid, .form-textarea.valid, .form-select.valid {
        border-color: var(--apple-green);
    }

    .form-input::placeholder, .form-textarea::placeholder {
        color: rgba(245, 245, 247, 0.5);
    }

    .form-error {
        color: var(--apple-red);
        font-size: 12px;
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .form-error::before {
        content: '⚠️';
        font-size: 12px;
    }

    .form-help {
        color: rgba(245, 245, 247, 0.6);
        font-size: 12px;
        margin-top: 6px;
    }

    .form-checkbox, .form-radio {
        margin-right: 8px;
        accent-color: var(--apple-blue);
    }

    .form-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: rgba(245, 245, 247, 0.9);
    }

    .form-label.required::after {
        content: ' *';
        color: var(--apple-red);
    }

    .form-submit {
        width: 100%;
        padding: 16px 32px;
        background: linear-gradient(135deg, var(--apple-blue), var(--apple-teal));
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .form-submit:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 113, 227, 0.3);
    }

    .form-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 768px) {
        .form-input, .form-textarea, .form-select, .form-submit {
            font-size: 16px; /* Prevents zoom on iOS */
        }
    }
`;

// Initialize validation system
document.addEventListener('DOMContentLoaded', () => {
    // Add form styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = formStyles;
    document.head.appendChild(styleSheet);
    
    // Initialize validation
    window.vibeValidation = new VibeValidation();
    window.vibeValidation.setupErrorRecovery();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibeValidation;
}