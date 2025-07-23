/**
 * =======================================================================
 * CONTACT FORM INTEGRATION - COMPLETE IMPLEMENTATION
 * =======================================================================
 * Complete JavaScript integration for PHP backend contact form processing
 * with AJAX, validation, rate limiting, and user feedback
 */

/**
 * =======================================================================
 * CONFIGURATION VARIABLES
 * =======================================================================
 */

const CONTACT_CONFIG = {
    // API endpoints
    apiUrl: './assets/backend/contact.php',
    fallbackEmail: 'info@bfluegel.de',
    
    // Rate limiting
    maxSubmissions: 3,
    rateLimitWindow: 3600000, // 1 hour in milliseconds
    
    // Validation settings
    maxFieldLengths: {
        name: 100,
        email: 255,
        company: 200,
        phone: 50,
        message: 5000
    },
    
    // Timing
    submitDelay: 1000,
    retryAttempts: 3,
    retryDelay: 2000,
    
    // Storage keys
    storageKeys: {
        submissions: 'contact_submissions',
        lastSubmission: 'last_contact_submission',
        formData: 'contact_form_draft'
    },
    
    // CSS classes
    classes: {
        loading: 'btn--loading',
        error: 'form-field--error',
        success: 'form-field--success',
        disabled: 'form--disabled'
    }
};

/**
 * =======================================================================
 * CONTACT FORM MANAGER CLASS
 * =======================================================================
 */

class ContactFormManager {
    constructor() {
        this.currentLanguage = 'de';
        this.isSubmitting = false;
        this.formData = {};
        this.validationRules = {};
        this.translations = {};
        
        this.init();
    }
    
    /**
     * Initialize the contact form manager
     */
    init() {
        this.loadTranslations();
        this.loadValidationRules();
        this.bindEvents();
        this.setupAutoSave();
        
        // Listen for language changes
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.on('language:changed', (e) => {
                this.currentLanguage = e.detail.language;
                this.updateFormLanguage();
            });
        }
        
        console.log('📧 Contact Form Manager initialized');
    }
    
    /**
     * Load translations
     */
    loadTranslations() {
        this.translations = {
            de: {
                // Form labels
                nameLabel: 'Name*',
                emailLabel: 'E-Mail-Adresse*',
                companyLabel: 'Unternehmen',
                phoneLabel: 'Telefon',
                subjectLabel: 'Betreff*',
                messageLabel: 'Nachricht*',
                privacyLabel: 'Ich stimme der Verarbeitung meiner Daten gemäß der Datenschutzerklärung zu.*',
                
                // Placeholders
                namePlaceholder: 'Ihr vollständiger Name',
                emailPlaceholder: 'ihre@email.de',
                companyPlaceholder: 'Ihr Unternehmen (optional)',
                phonePlaceholder: '+49 123 456 7890',
                messagePlaceholder: 'Beschreiben Sie Ihr Anliegen detailliert...',
                
                // Subject options
                subjectOptions: {
                    '': 'Bitte wählen...',
                    'beratung': 'Beratungsanfrage',
                    'projekt': 'Projektanfrage',
                    'schulung': 'Schulung/Workshop',
                    'partnership': 'Partnerschaft',
                    'media': 'Medienanfrage',
                    'support': 'Support',
                    'sonstiges': 'Sonstiges'
                },
                
                // Buttons
                submitButton: 'Nachricht senden',
                submittingButton: 'Sende...',
                
                // Messages
                success: 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Ich melde mich zeitnah bei Ihnen.',
                generalError: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
                networkError: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
                rateLimitError: 'Sie haben zu viele Nachrichten gesendet. Bitte warten Sie eine Stunde.',
                validationError: 'Bitte überprüfen Sie Ihre Eingaben.',
                
                // Validation messages
                validation: {
                    required: 'Dieses Feld ist erforderlich',
                    email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
                    minLength: 'Mindestens {min} Zeichen erforderlich',
                    maxLength: 'Maximal {max} Zeichen erlaubt',
                    phone: 'Bitte geben Sie eine gültige Telefonnummer ein',
                    privacy: 'Sie müssen der Datenschutzerklärung zustimmen'
                },
                
                // Auto-save
                draftSaved: 'Entwurf automatisch gespeichert',
                draftLoaded: 'Vorheriger Entwurf geladen'
            },
            en: {
                // Form labels
                nameLabel: 'Name*',
                emailLabel: 'Email Address*',
                companyLabel: 'Company',
                phoneLabel: 'Phone',
                subjectLabel: 'Subject*',
                messageLabel: 'Message*',
                privacyLabel: 'I agree to the processing of my data according to the privacy policy.*',
                
                // Placeholders
                namePlaceholder: 'Your full name',
                emailPlaceholder: 'your@email.com',
                companyPlaceholder: 'Your company (optional)',
                phonePlaceholder: '+49 123 456 7890',
                messagePlaceholder: 'Describe your request in detail...',
                
                // Subject options
                subjectOptions: {
                    '': 'Please select...',
                    'consulting': 'Consulting Inquiry',
                    'project': 'Project Inquiry',
                    'training': 'Training/Workshop',
                    'partnership': 'Partnership',
                    'media': 'Media Inquiry',
                    'support': 'Support',
                    'other': 'Other'
                },
                
                // Buttons
                submitButton: 'Send Message',
                submittingButton: 'Sending...',
                
                // Messages
                success: 'Thank you! Your message has been sent successfully. I will get back to you soon.',
                generalError: 'An error occurred. Please try again later.',
                networkError: 'Network error. Please check your internet connection.',
                rateLimitError: 'You have sent too many messages. Please wait an hour.',
                validationError: 'Please check your input.',
                
                // Validation messages
                validation: {
                    required: 'This field is required',
                    email: 'Please enter a valid email address',
                    minLength: 'At least {min} characters required',
                    maxLength: 'Maximum {max} characters allowed',
                    phone: 'Please enter a valid phone number',
                    privacy: 'You must agree to the privacy policy'
                },
                
                // Auto-save
                draftSaved: 'Draft automatically saved',
                draftLoaded: 'Previous draft loaded'
            }
        };
    }
    
    /**
     * Load validation rules
     */
    loadValidationRules() {
        this.validationRules = {
            name: {
                required: true,
                minLength: 2,
                maxLength: CONTACT_CONFIG.maxFieldLengths.name,
                pattern: /^[a-zA-ZäöüÄÖÜß\s\-\.]+$/
            },
            email: {
                required: true,
                maxLength: CONTACT_CONFIG.maxFieldLengths.email,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            company: {
                required: false,
                maxLength: CONTACT_CONFIG.maxFieldLengths.company
            },
            phone: {
                required: false,
                maxLength: CONTACT_CONFIG.maxFieldLengths.phone,
                pattern: /^[\+]?[0-9\s\-\(\)]+$/
            },
            subject: {
                required: true
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: CONTACT_CONFIG.maxFieldLengths.message
            },
            privacy: {
                required: true,
                mustBeChecked: true
            }
        };
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Listen for contact form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('modal__form') || e.target.id === 'contact-form') {
                const isContactForm = e.target.querySelector('[name="email"]') && 
                                     e.target.querySelector('[name="message"]');
                if (isContactForm) {
                    e.preventDefault();
                    this.handleFormSubmit(e);
                }
            }
        });
        
        // Real-time validation
        document.addEventListener('blur', (e) => {
            if (this.isContactFormField(e.target)) {
                this.validateField(e.target);
            }
        }, true);
        
        // Auto-save on input
        document.addEventListener('input', (e) => {
            if (this.isContactFormField(e.target)) {
                this.debounce(() => this.autoSaveForm(e.target.form), 1000)();
            }
        });
        
        // Prevent multiple submissions
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                const form = e.target.closest('form');
                if (form && this.isContactForm(form)) {
                    e.preventDefault();
                    this.handleFormSubmit({ target: form });
                }
            }
        });
    }
    
    /**
     * Handle form submission
     */
    async handleFormSubmit(e) {
        const form = e.target;
        
        // Prevent multiple submissions
        if (this.isSubmitting) {
            return false;
        }
        
        try {
            // Check rate limiting
            if (!this.checkRateLimit()) {
                throw new Error('RATE_LIMIT_EXCEEDED');
            }
            
            // Validate form
            const formData = this.getFormData(form);
            const validation = this.validateForm(formData);
            
            if (!validation.isValid) {
                this.displayValidationErrors(form, validation.errors);
                throw new Error('VALIDATION_FAILED');
            }
            
            // Set submitting state
            this.setSubmittingState(form, true);
            
            // Send form data
            const response = await this.submitForm(formData);
            
            // Handle success
            await this.handleSubmissionSuccess(form, response);
            
        } catch (error) {
            // Handle errors
            this.handleSubmissionError(form, error);
        } finally {
            // Reset submitting state
            this.setSubmittingState(form, false);
        }
        
        return false;
    }
    
    /**
     * Get form data
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = typeof value === 'string' ? value.trim() : value;
        }
        
        // Add metadata
        data.language = this.currentLanguage;
        data.timestamp = new Date().toISOString();
        data.user_agent = navigator.userAgent;
        data.page_url = window.location.href;
        
        return data;
    }
    
    /**
     * Validate form data
     */
    validateForm(data) {
        const errors = {};
        let isValid = true;
        
        for (const [field, rules] of Object.entries(this.validationRules)) {
            const fieldErrors = this.validateField(field, data[field], rules);
            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
                isValid = false;
            }
        }
        
        return { isValid, errors };
    }
    
    /**
     * Validate single field
     */
    validateField(field, value, rules = null) {
        const fieldRules = rules || this.validationRules[field];
        if (!fieldRules) return [];
        
        const errors = [];
        const t = this.getTranslations().validation;
        
        // Required validation
        if (fieldRules.required && (!value || value.toString().trim() === '')) {
            errors.push(t.required);
        }
        
        // Skip other validations if field is empty and not required
        if (!value || value.toString().trim() === '') {
            return errors;
        }
        
        // Length validations
        if (fieldRules.minLength && value.length < fieldRules.minLength) {
            errors.push(t.minLength.replace('{min}', fieldRules.minLength));
        }
        
        if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
            errors.push(t.maxLength.replace('{max}', fieldRules.maxLength));
        }
        
        // Pattern validation
        if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
            switch (field) {
                case 'email':
                    errors.push(t.email);
                    break;
                case 'phone':
                    errors.push(t.phone);
                    break;
                default:
                    errors.push('Invalid format');
            }
        }
        
        // Checkbox validation
        if (fieldRules.mustBeChecked && !value) {
            errors.push(t.privacy);
        }
        
        return errors;
    }
    
    /**
     * Submit form to PHP backend
     */
    async submitForm(data) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= CONTACT_CONFIG.retryAttempts; attempt++) {
            try {
                const response = await fetch(CONTACT_CONFIG.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(data)
                });
                
                const responseData = await response.json();
                
                if (!response.ok) {
                    throw new Error(responseData.error || `HTTP ${response.status}`);
                }
                
                if (!responseData.success) {
                    throw new Error(responseData.error || 'Unknown server error');
                }
                
                return responseData;
                
            } catch (error) {
                lastError = error;
                
                // Don't retry on validation errors or rate limits
                if (error.message.includes('validation') || error.message.includes('rate limit')) {
                    throw error;
                }
                
                // Wait before retry
                if (attempt < CONTACT_CONFIG.retryAttempts) {
                    await this.delay(CONTACT_CONFIG.retryDelay * attempt);
                }
            }
        }
        
        throw lastError;
    }
    
    /**
     * Handle successful submission
     */
    async handleSubmissionSuccess(form, response) {
        // Record successful submission
        this.recordSubmission();
        
        // Clear form and auto-save
        this.clearForm(form);
        this.clearAutoSave();
        
        // Close modal if in modal
        if (window.modalManager && window.modalManager.activeModal) {
            window.modalManager.closeModal();
        }
        
        // Show success message
        this.showMessage(
            response.message || this.getTranslations().success,
            'success'
        );
        
        // Track successful submission
        this.trackEvent('contact_form_success', {
            subject: form.querySelector('[name="subject"]')?.value,
            timestamp: new Date().toISOString()
        });
        
        console.log('📧 Contact form submitted successfully');
    }
    
    /**
     * Handle submission error
     */
    handleSubmissionError(form, error) {
        console.error('Contact form error:', error);
        
        let message = this.getTranslations().generalError;
        
        // Handle specific error types
        switch (error.message) {
            case 'RATE_LIMIT_EXCEEDED':
                message = this.getTranslations().rateLimitError;
                break;
            case 'VALIDATION_FAILED':
                message = this.getTranslations().validationError;
                return; // Don't show toast for validation errors
            case 'NetworkError':
            case 'Failed to fetch':
                message = this.getTranslations().networkError;
                break;
        }
        
        this.showMessage(message, 'error');
        
        // Track failed submission
        this.trackEvent('contact_form_error', {
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Set submitting state
     */
    setSubmittingState(form, isSubmitting) {
        this.isSubmitting = isSubmitting;
        const submitButton = form.querySelector('button[type="submit"]');
        
        if (isSubmitting) {
            form.classList.add(CONTACT_CONFIG.classes.disabled);
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.classList.add(CONTACT_CONFIG.classes.loading);
                this.originalButtonContent = submitButton.innerHTML;
                submitButton.innerHTML = `
                    <i class="ph ph-spinner" aria-hidden="true"></i>
                    <span>${this.getTranslations().submittingButton}</span>
                `;
            }
        } else {
            form.classList.remove(CONTACT_CONFIG.classes.disabled);
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.remove(CONTACT_CONFIG.classes.loading);
                if (this.originalButtonContent) {
                    submitButton.innerHTML = this.originalButtonContent;
                }
            }
        }
    }
    
    /**
     * Display validation errors
     */
    displayValidationErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll(`.${CONTACT_CONFIG.classes.error}`).forEach(el => {
            el.classList.remove(CONTACT_CONFIG.classes.error);
        });
        
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Display new errors
        for (const [field, fieldErrors] of Object.entries(errors)) {
            const fieldElement = form.querySelector(`[name="${field}"]`);
            if (fieldElement) {
                fieldElement.classList.add(CONTACT_CONFIG.classes.error);
                
                // Add error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.style.cssText = `
                    color: var(--color-error);
                    font-size: var(--font-size-sm);
                    margin-top: var(--space-xs);
                `;
                errorDiv.textContent = fieldErrors[0];
                
                fieldElement.parentNode.appendChild(errorDiv);
            }
        }
        
        // Focus first error field
        const firstErrorField = form.querySelector(`.${CONTACT_CONFIG.classes.error}`);
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }
    
    /**
     * Check rate limiting
     */
    checkRateLimit() {
        const now = Date.now();
        const submissions = this.getStoredSubmissions();
        
        // Filter submissions within rate limit window
        const recentSubmissions = submissions.filter(
            timestamp => (now - timestamp) < CONTACT_CONFIG.rateLimitWindow
        );
        
        // Check if limit exceeded
        if (recentSubmissions.length >= CONTACT_CONFIG.maxSubmissions) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Record successful submission
     */
    recordSubmission() {
        const now = Date.now();
        const submissions = this.getStoredSubmissions();
        
        submissions.push(now);
        
        // Keep only recent submissions
        const filtered = submissions.filter(
            timestamp => (now - timestamp) < CONTACT_CONFIG.rateLimitWindow
        );
        
        this.storeSubmissions(filtered);
        
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.storage(CONTACT_CONFIG.storageKeys.lastSubmission, now);
        }
    }
    
    /**
     * Get stored submissions
     */
    getStoredSubmissions() {
        if (window.BastianFluegelApp) {
            return window.BastianFluegelApp.utils.storage(CONTACT_CONFIG.storageKeys.submissions) || [];
        }
        return [];
    }
    
    /**
     * Store submissions
     */
    storeSubmissions(submissions) {
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.storage(CONTACT_CONFIG.storageKeys.submissions, submissions);
        }
    }
    
    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        // Load saved draft on page load
        this.loadAutoSavedForm();
    }
    
    /**
     * Auto-save form data
     */
    autoSaveForm(form) {
        if (!form || this.isSubmitting) return;
        
        const data = this.getFormData(form);
        
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.storage(CONTACT_CONFIG.storageKeys.formData, data);
        }
        
        // Show auto-save indicator
        this.showAutoSaveIndicator();
    }
    
    /**
     * Load auto-saved form data
     */
    loadAutoSavedForm() {
        if (!window.BastianFluegelApp) return;
        
        const savedData = window.BastianFluegelApp.utils.storage(CONTACT_CONFIG.storageKeys.formData);
        if (!savedData) return;
        
        // Wait for modal to be created
        setTimeout(() => {
            const form = document.querySelector('.modal__form, #contact-form');
            if (form && this.isContactForm(form)) {
                this.populateForm(form, savedData);
                this.showMessage(this.getTranslations().draftLoaded, 'info');
            }
        }, 500);
    }
    
    /**
     * Populate form with data
     */
    populateForm(form, data) {
        for (const [key, value] of Object.entries(data)) {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = !!value;
                } else {
                    field.value = value;
                }
            }
        }
    }
    
    /**
     * Clear form
     */
    clearForm(form) {
        form.reset();
        
        // Clear validation states
        form.querySelectorAll(`.${CONTACT_CONFIG.classes.error}, .${CONTACT_CONFIG.classes.success}`)
            .forEach(el => {
                el.classList.remove(CONTACT_CONFIG.classes.error, CONTACT_CONFIG.classes.success);
            });
        
        form.querySelectorAll('.error-message').forEach(el => el.remove());
    }
    
    /**
     * Clear auto-save data
     */
    clearAutoSave() {
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.storage(CONTACT_CONFIG.storageKeys.formData, null);
        }
    }
    
    /**
     * Show auto-save indicator
     */
    showAutoSaveIndicator() {
        // Create or update auto-save indicator
        let indicator = document.querySelector('.autosave-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'autosave-indicator';
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: var(--color-info);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: var(--radius-md);
                font-size: var(--font-size-sm);
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = this.getTranslations().draftSaved;
        indicator.style.opacity = '1';
        
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }
    
    /**
     * Show message toast
     */
    showMessage(message, type = 'info') {
        const colors = {
            success: 'var(--color-success)',
            error: 'var(--color-error)',
            warning: 'var(--color-warning)',
            info: 'var(--color-info)'
        };
        
        const icons = {
            success: 'ph ph-check-circle',
            error: 'ph ph-x-circle',
            warning: 'ph ph-warning-circle',
            info: 'ph ph-info'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 1080;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: var(--space-xs);
            max-width: 400px;
            font-size: var(--font-size-sm);
        `;
        
        toast.innerHTML = `
            <i class="${icons[type]}" aria-hidden="true"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, type === 'success' ? 5000 : 4000);
    }
    
    /**
     * Track events (for analytics)
     */
    trackEvent(eventName, data) {
        // Integration with analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
        
        // Custom tracking
        console.log(`📊 Event tracked: ${eventName}`, data);
    }
    
    /**
     * Utility functions
     */
    isContactFormField(element) {
        const form = element.closest('form');
        return form && this.isContactForm(form);
    }
    
    isContactForm(form) {
        return form.classList.contains('modal__form') || 
               form.id === 'contact-form' ||
               (form.querySelector('[name="email"]') && form.querySelector('[name="message"]'));
    }
    
    getTranslations() {
        return this.translations[this.currentLanguage] || this.translations.de;
    }
    
    updateFormLanguage() {
        // Update form labels and placeholders when language changes
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (this.isContactForm(form)) {
                this.updateFormTexts(form);
            }
        });
    }
    
    updateFormTexts(form) {
        const t = this.getTranslations();
        
        // Update labels
        const labelMap = {
            name: t.nameLabel,
            email: t.emailLabel,
            company: t.companyLabel,
            phone: t.phoneLabel,
            subject: t.subjectLabel,
            message: t.messageLabel,
            privacy: t.privacyLabel
        };
        
        for (const [field, label] of Object.entries(labelMap)) {
            const labelEl = form.querySelector(`label[for*="${field}"], label[for="field-${field}"]`);
            if (labelEl) {
                labelEl.textContent = label;
            }
        }
        
        // Update placeholders
        const placeholderMap = {
            name: t.namePlaceholder,
            email: t.emailPlaceholder,
            company: t.companyPlaceholder,
            phone: t.phonePlaceholder,
            message: t.messagePlaceholder
        };
        
        for (const [field, placeholder] of Object.entries(placeholderMap)) {
            const fieldEl = form.querySelector(`[name="${field}"]`);
            if (fieldEl) {
                fieldEl.placeholder = placeholder;
            }
        }
        
        // Update submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.querySelector('span').textContent = t.submitButton;
        }
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * =======================================================================
 * MODAL MANAGER INTEGRATION
 * =======================================================================
 * Integrate with existing modal system
 */

// Override modal manager form submission if available
if (typeof ModalManager !== 'undefined') {
    const originalHandleFormSubmit = ModalManager.prototype.handleFormSubmit;
    
    ModalManager.prototype.handleFormSubmit = function(e) {
        const form = e.target;
        const isContactForm = form.querySelector('[name="email"]') && form.querySelector('[name="message"]');
        
        if (isContactForm && window.contactFormManager) {
            // Let contact form manager handle it
            return window.contactFormManager.handleFormSubmit(e);
        } else {
            // Use original method
            return originalHandleFormSubmit.call(this, e);
        }
    };
}

/**
 * =======================================================================
 * CHARACTER COUNTER & FORM PROGRESS
 * =======================================================================
 */
function initCharacterCounter() {
    document.addEventListener('input', function (e) {
        if (e.target.name === 'message') {
            let counter = e.target.parentNode.querySelector('.char-counter');
            if (!counter) {
                counter = document.createElement('div');
                counter.className = 'char-counter';
                counter.style.cssText = 'text-align:right;font-size:0.85em;color:var(--color-muted, #888);margin-top:2px;';
                e.target.parentNode.appendChild(counter);
            }
            const max = CONTACT_CONFIG.maxFieldLengths.message;
            const length = e.target.value.length;
            counter.textContent = `${length}/${max}`;
            if (length > max * 0.9) counter.style.color = 'var(--color-warning, orange)';
            else counter.style.color = 'var(--color-muted, #888)';
        }
    });
}
initCharacterCounter();

/**
 * Phone number formatting (only DE)
 */
function formatPhoneNumber(value) {
    // Simple DE formatting: +49 123 4567890
    return value
        .replace(/[^\d+]/g, '')
        .replace(/^(\+49|0049)?0?/, '+49 ')
        .replace(/(\+49 )(\d{3,5})(\d{3,})/, '$1$2 $3')
        .trim();
}

document.addEventListener('input', function (e) {
    if (e.target.name === 'phone') {
        e.target.value = formatPhoneNumber(e.target.value);
    }
});

/**
 * Progress indicator
 */
function updateFormProgress(form) {
    const fields = ['name', 'email', 'subject', 'message', 'privacy'];
    let filled = 0;
    fields.forEach(field => {
        const el = form.querySelector(`[name="${field}"]`);
        if (el) {
            if ((el.type === 'checkbox' && el.checked) || (el.type !== 'checkbox' && el.value.trim() !== '')) {
                filled++;
            }
        }
    });
    let progress = Math.round((filled / fields.length) * 100);
    let bar = form.querySelector('.form-progress');
    if (!bar) {
        bar = document.createElement('div');
        bar.className = 'form-progress';
        bar.style.cssText = `
            width: 100%; height: 4px; background: #eee; margin-bottom: 10px; border-radius: 2px;
            overflow: hidden; position: relative;
        `;
        const fill = document.createElement('div');
        fill.className = 'form-progress-fill';
        fill.style.cssText = 'background: var(--color-primary, #0af); height: 100%; width: 0%; transition: width 0.2s;';
        bar.appendChild(fill);
        form.insertBefore(bar, form.firstChild);
    }
    const fill = bar.querySelector('.form-progress-fill');
    if (fill) fill.style.width = `${progress}%`;
}

document.addEventListener('input', function (e) {
    const form = e.target.closest('form');
    if (form && (form.classList.contains('modal__form') || form.id === 'contact-form')) {
        updateFormProgress(form);
    }
});

/**
 * Keyboard shortcuts (Ctrl+Enter)
 */
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'Enter') {
        const form = e.target.closest('form');
        if (form && (form.classList.contains('modal__form') || form.id === 'contact-form')) {
            e.preventDefault();
            if (window.contactFormManager) {
                window.contactFormManager.handleFormSubmit({ target: form });
            }
        }
    }
});

/**
 * =======================================================================
 * RATE LIMIT DEV TOOLS (for development/testing)
 * =======================================================================
 */
window.contactFormDev = {
    clearRateLimit() {
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.storage(CONTACT_CONFIG.storageKeys.submissions, []);
        }
        console.info('Rate limit cleared');
    },
    testSubmission(data = {}) {
        const defaults = {
            name: 'Test User',
            email: 'test@example.com',
            subject: 'test',
            message: 'Test message',
            privacy: true
        };
        const form = document.querySelector('.modal__form, #contact-form');
        if (form) {
            Object.entries({ ...defaults, ...data }).forEach(([key, val]) => {
                const el = form.querySelector(`[name="${key}"]`);
                if (el) {
                    if (el.type === 'checkbox') el.checked = !!val;
                    else el.value = val;
                }
            });
            if (window.contactFormManager) {
                window.contactFormManager.handleFormSubmit({ target: form });
            }
        }
    },
    simulateError(type = 'network') {
        // Simulate error by disabling network or similar
        // For real simulation, mock fetch, but here just show error
        if (window.contactFormManager) {
            if (type === 'network') {
                window.contactFormManager.handleSubmissionError(document.querySelector('#contact-form'), new Error('NetworkError'));
            }
        }
    }
};

/**
 * =======================================================================
 * INITIALIZATION
 * =======================================================================
 */
window.contactFormManager = new ContactFormManager();
