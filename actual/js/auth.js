/**
 * =======================================================================
 * AUTHENTICATION SYSTEM - COMPLETE IMPLEMENTATION
 * =======================================================================
 * Complete login/logout system with modal integration and user management
 */

/**
 * =======================================================================
 * CONFIGURATION VARIABLES
 * =======================================================================
 */

const AUTH_CONFIG = {
    // Session settings
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    storageKeys: {
        user: 'user_session',
        expiry: 'session_expiry'
    },
    
    // Demo credentials for testing
    demoCredentials: [
        { email: 'admin@bastianfluegel.de', password: 'admin123', name: 'Admin' },
        { email: 'demo@example.com', password: 'demo123', name: 'Demo User' },
        { email: 'test@test.com', password: 'test123', name: 'Test User' }
    ],
    
    // Animation settings
    loadingDuration: 1500,
    toastDuration: 4000,
    
    // CSS classes
    classes: {
        loggedIn: 'logged-in',
        loading: 'btn--loading'
    }
};

/**
 * =======================================================================
 * AUTHENTICATION MANAGER CLASS
 * =======================================================================
 */

class AuthManager {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.authButton = null;
        this.userMenuContainer = null;
        this.sessionTimer = null;
        this.currentLanguage = 'de';
        this.translations = {};
        
        this.init();
    }
    
    /**
     * Initialize the authentication manager
     */
    init() {
        this.authButton = document.getElementById('auth-toggle');
        this.userMenuContainer = document.getElementById('user-menu-container');
        
        if (!this.authButton) {
            console.warn('Auth button not found');
            return;
        }
        
        this.loadTranslations();
        this.bindEvents();
        this.checkStoredSession();
        
        // Listen for language changes
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.on('language:changed', (e) => {
                this.currentLanguage = e.detail.language;
                this.updateUI();
            });
        }
        
        console.log('🔐 Auth Manager initialized');
    }
    
    /**
     * Load translations
     */
    loadTranslations() {
        this.translations = {
            de: {
                loginTitle: 'Anmelden',
                loginSubtitle: 'Willkommen zurück',
                loginButton: 'Anmelden',
                logoutButton: 'Abmelden',
                emailLabel: 'E-Mail-Adresse',
                emailPlaceholder: 'ihre@email.de',
                passwordLabel: 'Passwort',
                passwordPlaceholder: 'Ihr Passwort',
                rememberLabel: 'Angemeldet bleiben',
                forgotPasswordLink: 'Passwort vergessen?',
                registerLink: 'Konto erstellen',
                loginSuccess: 'Erfolgreich angemeldet!',
                loginError: 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.',
                logoutSuccess: 'Erfolgreich abgemeldet!',
                logoutConfirm: 'Möchten Sie sich wirklich abmelden?',
                sessionExpired: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
                forgotPasswordMessage: 'Passwort-Reset Funktion ist in Entwicklung.',
                registerMessage: 'Registrierung ist derzeit nicht verfügbar.'
            },
            en: {
                loginTitle: 'Sign In',
                loginSubtitle: 'Welcome back',
                loginButton: 'Sign In',
                logoutButton: 'Sign Out',
                emailLabel: 'Email Address',
                emailPlaceholder: 'your@email.com',
                passwordLabel: 'Password',
                passwordPlaceholder: 'Your password',
                rememberLabel: 'Stay signed in',
                forgotPasswordLink: 'Forgot password?',
                registerLink: 'Create account',
                loginSuccess: 'Successfully signed in!',
                loginError: 'Sign in failed. Please check your credentials.',
                logoutSuccess: 'Successfully signed out!',
                logoutConfirm: 'Do you really want to sign out?',
                sessionExpired: 'Your session has expired. Please sign in again.',
                forgotPasswordMessage: 'Password reset feature is in development.',
                registerMessage: 'Registration is currently not available.'
            }
        };
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        this.authButton.addEventListener('click', () => {
            if (this.isLoggedIn) {
                this.logout();
            } else {
                this.showLoginModal();
            }
        });
    }
    
    /**
     * Check for stored session on page load
     */
    checkStoredSession() {
        const storedUser = this.getStoredUser();
        const sessionExpiry = this.getSessionExpiry();
        
        if (storedUser && sessionExpiry && Date.now() < sessionExpiry) {
            this.loginUser(storedUser, false);
            this.startSessionTimer();
        } else {
            this.clearStoredSession();
        }
    }
    
    /**
     * Show login modal
     */
    showLoginModal() {
        const overlay = this.createModalOverlay();
        const modal = this.createLoginModal();
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Show modal with animation
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
        
        // Focus first input
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        // Handle close events
        this.bindModalCloseEvents(overlay);
    }
    
    /**
     * Create modal overlay
     */
    createModalOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.setAttribute('data-auth-modal', 'true');
        return overlay;
    }
    
    /**
     * Create login modal
     */
    createLoginModal() {
        const t = this.getTranslations();
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'auth-modal-title');
        
        modal.innerHTML = `
            <div class="modal__header">
                <h2 id="auth-modal-title" class="modal__title">
                    <i class="ph ph-sign-in" aria-hidden="true"></i>
                    ${t.loginTitle}
                </h2>
                <button class="modal__close" aria-label="Modal schließen">
                    <i class="ph ph-x" aria-hidden="true"></i>
                </button>
            </div>
            <div class="modal__body">
                <div class="modal__section">
                    <h3 class="modal__section-title">${t.loginSubtitle}</h3>
                    <div class="modal__section-content">
                        <form class="login-form" id="login-form">
                            <div class="login-form__group">
                                <label for="auth-email">${t.emailLabel}</label>
                                <input 
                                    type="email" 
                                    id="auth-email" 
                                    name="email" 
                                    class="login-form__input" 
                                    placeholder="${t.emailPlaceholder}" 
                                    required
                                >
                            </div>
                            <div class="login-form__group">
                                <label for="auth-password">${t.passwordLabel}</label>
                                <input 
                                    type="password" 
                                    id="auth-password" 
                                    name="password" 
                                    class="login-form__input" 
                                    placeholder="${t.passwordPlaceholder}" 
                                    required
                                >
                            </div>
                            <div class="login-form__group login-form__checkbox-group">
                                <input type="checkbox" id="auth-remember" name="remember">
                                <label for="auth-remember">${t.rememberLabel}</label>
                            </div>
                            <button type="submit" class="btn btn--primary">
                                <i class="ph ph-sign-in" aria-hidden="true"></i>
                                <span>${t.loginButton}</span>
                            </button>
                            <div class="login-form__links">
                                <a href="#" class="login-form__link" data-action="forgot-password">${t.forgotPasswordLink}</a>
                                <span> | </span>
                                <a href="#" class="login-form__link" data-action="register">${t.registerLink}</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Bind form events
        this.bindFormEvents(modal);
        
        return modal;
    }
    
    /**
     * Bind form events
     */
    bindFormEvents(modal) {
        const form = modal.querySelector('#login-form');
        const links = modal.querySelectorAll('[data-action]');
        
        form.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLinkAction(link.dataset.action);
            });
        });
    }
    
    /**
     * Bind modal close events
     */
    bindModalCloseEvents(overlay) {
        const closeBtn = overlay.querySelector('.modal__close');
        
        // Close button
        closeBtn.addEventListener('click', () => {
            this.closeAuthModal(overlay);
        });
        
        // Click outside
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeAuthModal(overlay);
            }
        });
        
        // Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeAuthModal(overlay);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    /**
     * Handle login form submission
     */
    async handleLoginSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            remember: formData.has('remember')
        };
        
        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalContent = submitButton.innerHTML;
        submitButton.classList.add(AUTH_CONFIG.classes.loading);
        submitButton.disabled = true;
        
        try {
            const user = await this.authenticateUser(credentials);
            
            if (user) {
                this.loginUser(user, credentials.remember);
                this.closeAuthModal();
                this.showMessage(this.getTranslations().loginSuccess, 'success');
            } else {
                this.showMessage(this.getTranslations().loginError, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(this.getTranslations().loginError, 'error');
        } finally {
            // Reset button state
            submitButton.innerHTML = originalContent;
            submitButton.classList.remove(AUTH_CONFIG.classes.loading);
            submitButton.disabled = false;
        }
    }
    
    /**
     * Simulate user authentication
     */
    async authenticateUser(credentials) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, AUTH_CONFIG.loadingDuration));
        
        const validUser = AUTH_CONFIG.demoCredentials.find(
            cred => cred.email === credentials.email && cred.password === credentials.password
        );
        
        if (validUser) {
            return {
                id: Date.now(),
                email: validUser.email,
                name: validUser.name,
                avatar: null,
                loginTime: Date.now()
            };
        }
        
        return null;
    }
    
    /**
     * Login user
     */
    loginUser(user, storeSession = true) {
        this.isLoggedIn = true;
        this.currentUser = user;
        
        if (storeSession) {
            this.storeUserSession(user);
        }
        
        this.updateUI();
        this.startSessionTimer();
        
        // Emit login event
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.emit('user:login', { user });
        }
        
        console.log('✅ User logged in:', user.email);
    }
    
    /**
     * Logout user
     */
    logout() {
        const t = this.getTranslations();
        
        if (confirm(t.logoutConfirm)) {
            this.isLoggedIn = false;
            this.currentUser = null;
            
            this.clearStoredSession();
            this.clearSessionTimer();
            this.updateUI();
            
            // Emit logout event
            if (window.BastianFluegelApp) {
                window.BastianFluegelApp.utils.emit('user:logout');
            }
            
            this.showMessage(t.logoutSuccess, 'success');
            console.log('👋 User logged out');
        }
    }
    
    /**
     * Update UI based on login state
     */
    updateUI() {
        const t = this.getTranslations();
        const icon = this.authButton.querySelector('i');
        const text = this.authButton.querySelector('span');
        
        if (this.isLoggedIn) {
            // Update auth button to logout
            icon.className = 'ph ph-sign-out';
            text.textContent = t.logoutButton;
            this.authButton.setAttribute('aria-label', t.logoutButton);
            this.authButton.classList.add(AUTH_CONFIG.classes.loggedIn);
            
            // Show user menu
            if (this.userMenuContainer) {
                this.userMenuContainer.style.display = 'block';
                this.updateUserMenu();
            }
        } else {
            // Update auth button to login
            icon.className = 'ph ph-sign-in';
            text.textContent = t.loginButton;
            this.authButton.setAttribute('aria-label', t.loginButton);
            this.authButton.classList.remove(AUTH_CONFIG.classes.loggedIn);
            
            // Hide user menu
            if (this.userMenuContainer) {
                this.userMenuContainer.style.display = 'none';
            }
        }
    }
    
    /**
     * Update user menu with current user info
     */
    updateUserMenu() {
        if (!this.currentUser || !this.userMenuContainer) return;
        
        const menuBtn = this.userMenuContainer.querySelector('#user-menu-btn span');
        if (menuBtn) {
            menuBtn.textContent = this.currentUser.name || 'User';
        }
    }
    
    /**
     * Handle additional link actions
     */
    handleLinkAction(action) {
        const t = this.getTranslations();
        
        switch (action) {
            case 'forgot-password':
                this.showMessage(t.forgotPasswordMessage, 'info');
                break;
            case 'register':
                this.showMessage(t.registerMessage, 'info');
                break;
        }
    }
    
    /**
     * Close auth modal
     */
    closeAuthModal(overlay = null) {
        const authModal = overlay || document.querySelector('[data-auth-modal="true"]');
        if (authModal) {
            authModal.classList.remove('active');
            setTimeout(() => authModal.remove(), 250);
        }
    }
    
    /**
     * Store user session
     */
    storeUserSession(user) {
        const expiryTime = Date.now() + AUTH_CONFIG.sessionTimeout;
        
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.storage(AUTH_CONFIG.storageKeys.user, user);
            window.BastianFluegelApp.utils.storage(AUTH_CONFIG.storageKeys.expiry, expiryTime);
        }
    }
    
    /**
     * Get stored user
     */
    getStoredUser() {
        if (window.BastianFluegelApp) {
            return window.BastianFluegelApp.utils.storage(AUTH_CONFIG.storageKeys.user);
        }
        return null;
    }
    
    /**
     * Get session expiry
     */
    getSessionExpiry() {
        if (window.BastianFluegelApp) {
            return window.BastianFluegelApp.utils.storage(AUTH_CONFIG.storageKeys.expiry);
        }
        return null;
    }
    
    /**
     * Clear stored session
     */
    clearStoredSession() {
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.storage(AUTH_CONFIG.storageKeys.user, null);
            window.BastianFluegelApp.utils.storage(AUTH_CONFIG.storageKeys.expiry, null);
        }
    }
    
    /**
     * Start session timer
     */
    startSessionTimer() {
        this.clearSessionTimer();
        
        this.sessionTimer = setTimeout(() => {
            this.logout();
            this.showMessage(this.getTranslations().sessionExpired, 'warning');
        }, AUTH_CONFIG.sessionTimeout);
    }
    
    /**
     * Clear session timer
     */
    clearSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }
    
    /**
     * Show toast message
     */
    showMessage(message, type = 'info') {
        const colors = {
            success: 'var(--color-primary-green)',
            error: '#dc2626',
            warning: '#f59e0b',
            info: 'var(--color-secondary-green)'
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
            max-width: 300px;
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
        }, AUTH_CONFIG.toastDuration);
    }
    
    /**
     * Get current translations
     */
    getTranslations() {
        return this.translations[this.currentLanguage] || this.translations.de;
    }
    
    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Check if user is logged in
     */
    isUserLoggedIn() {
        return this.isLoggedIn;
    }
}

/**
 * =======================================================================
 * INITIALIZATION
 * =======================================================================
 */

// Initialize Auth Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const authManager = new AuthManager();
    
    // Register with app if available
    if (window.BastianFluegelApp) {
        window.BastianFluegelApp.registerModule('auth-manager', authManager);
    }
    
    // Make globally available for debugging
    window.authManager = authManager;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}