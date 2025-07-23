/**
 * =======================================================================
 * MODAL SYSTEM - COMPACT IMPLEMENTATION
 * =======================================================================
 * Lazy-loading modal system with multilingual support and accessibility
 */



/**
 * =======================================================================
 * CONFIGURATION VARIABLES
 * =======================================================================
 */



const MODAL_CONFIG = {
    types: ['impressum', 'datenschutz', 'agb', 'cookies', 'kontakt', 'profil', 'einstellungen',  'comingsoon'],
    animationDuration: 250,
    classes: {
        overlay: 'modal-overlay',
        modal: 'modal',
        active: 'active',
        loading: 'modal__loading',
        error: 'modal__error'
    }
};

/**
 * =======================================================================
 * MODAL MANAGER CLASS
 * =======================================================================
 */

class ModalManager {
    constructor() {
        this.activeModal = null;
        this.cache = new Map();
        this.lang = 'de';
        this.previousFocus = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadTranslations();
        
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.on('language:changed', (e) => {
                this.lang = e.detail.language;
                this.cache.clear();
            });
        }
        
        console.log('🪟 Modal Manager initialized');
    }
    
    bindEvents() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal]');
            if (trigger) {
                e.preventDefault();
                this.openModal(trigger.dataset.modal);
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal();
            }
        });
    }
    
    async openModal(type) {
        try {
            if (!MODAL_CONFIG.types.includes(type)) throw new Error(`Unknown modal type: ${type}`);
            
            const loading = this.createLoading();
            document.body.appendChild(loading);
            
            const content = await this.getContent(type);
            loading.remove();
            
            const modal = this.createModal(content);
            document.body.appendChild(modal);
            
            this.activeModal = modal;
            requestAnimationFrame(() => modal.classList.add(MODAL_CONFIG.classes.active));
            
            this.lockScroll();
            this.trapFocus(modal);
            
        } catch (error) {
            console.error('Modal error:', error);
            this.showError();
        }
    }
    
    closeModal() {
        if (!this.activeModal) return;
        
        this.activeModal.classList.remove(MODAL_CONFIG.classes.active);
        setTimeout(() => {
            if (this.activeModal) {
                this.activeModal.remove();
                this.activeModal = null;
            }
            this.unlockScroll();
            this.restoreFocus();
        }, MODAL_CONFIG.animationDuration);
    }
    
    async getContent(type) {
        const key = `${type}_${this.lang}`;
        if (this.cache.has(key)) return this.cache.get(key);
        
        const content = this.generateContent(type);
        this.cache.set(key, content);
        return content;
    }
    
    generateContent(type) {
        const generators = {
            comingsoon: () => this.getComingSoon(),
            impressum: () => this.getImpressum(),
            datenschutz: () => this.getDatenschutz(),
            agb: () => this.getAGB(),
            cookies: () => this.getCookies(),
            kontakt: () => this.getKontakt(),
            profil: () => this.getProfil(),
            einstellungen: () => this.getEinstellungen()
        };
        
        return generators[type]();
    }

    getComingSoon() {
    const content = {
        de: {
            title: 'Coming Soon',
            sections: [{
                title: '',
                content: `
                    <div style="text-align:center; padding:2em 1em;">
                        <i class="ph ph-rocket-launch" style="font-size:3rem;color:var(--color-primary-green);margin-bottom:1em;"></i>
                        <h3 style="margin-bottom:0.5em;">Bald verfügbar!</h3>
                        <p>Dieses Feature befindet sich noch im Aufbau.<br>
                        Bleib gespannt – hier entsteht in Kürze etwas Neues.</p>
                    </div>
                `
            }]
        },
        en: {
            title: 'Coming Soon',
            sections: [{
                title: '',
                content: `
                    <div style="text-align:center; padding:2em 1em;">
                        <i class="ph ph-rocket-launch" style="font-size:3rem;color:var(--color-primary-green);margin-bottom:1em;"></i>
                        <h3 style="margin-bottom:0.5em;">Coming Soon!</h3>
                        <p>This feature is under construction.<br>
                        Stay tuned – something new is coming soon.</p>
                    </div>
                `
            }]
        }
    };
    return content[this.lang];
}

    
    getImpressum() {
    const content = {
        de: {
            title: 'Impressum',
            sections: [{
                title: 'Angaben gemäß § 5 TMG',
                content: `<p><strong>Bastian Flügel</strong><br>
                Schubertstraße 2<br>
                84144 Geisenhausen<br>
                Deutschland</p>`
            }, {
                title: 'Kontakt',
                content: `<p>Telefon: <a href="tel:+4917637530596">+49&nbsp;176&nbsp;37530596</a><br>
                E-Mail: <a href="mailto:info@bfluegel.de">info@bfluegel.de</a></p>`
            }]
        },
        en: {
            title: 'Legal Notice',
            sections: [{
                title: 'Information pursuant to § 5 TMG',
                content: `<p><strong>Bastian Flügel</strong><br>
                Schubertstraße 2<br>
                84144 Geisenhausen<br>
                Germany</p>`
            }, {
                title: 'Contact',
                content: `<p>Phone: <a href="tel:+4917637530596">+49&nbsp;176&nbsp;37530596</a><br>
                Email: <a href="mailto:info@bfluegel.de">info@bfluegel.de</a></p>`
            }]
        }
    };
    return content[this.lang];
}

    
    getDatenschutz() {
        const content = {
            de: {
                title: 'Datenschutzerklärung',
                sections: [{
                    title: 'Datenschutz auf einen Blick',
                    content: '<p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>'
                }, {
                    title: 'Datenerfassung',
                    content: '<p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum entnehmen.</p>'
                }]
            },
            en: {
                title: 'Privacy Policy',
                sections: [{
                    title: 'Privacy at a glance',
                    content: '<p>The following information provides a simple overview of what happens to your personal data when you visit this website.</p>'
                }, {
                    title: 'Data collection',
                    content: '<p>Data processing on this website is carried out by the website operator. You can find their contact details in the legal notice.</p>'
                }]
            }
        };
        return content[this.lang];
    }
    
    getAGB() {
    const content = {
        de: {
            title: 'Allgemeine Geschäftsbedingungen',
            sections: [{
                title: 'Hinweis zum aktuellen Status',
                content: `<p>
                    Die Firma <strong>Bastian Flügel</strong> sowie die unter <a href="https://bfluegel.de">bfluegel.de</a> erreichbare Website befinden sich derzeit noch im Aufbau. <br>
                    Die bereitgestellten Inhalte, Funktionen und Darstellungen dienen ausschließlich zu Demonstrations- und Informationszwecken. <br>
                    Diese Website stellt <strong>kein verbindliches Angebot</strong> dar und ist nicht als vollumfängliche geschäftliche Internetpräsenz zu verstehen. Es können derzeit weder verbindliche Verträge abgeschlossen noch Beratungs- oder sonstige Leistungen rechtsverbindlich in Anspruch genommen werden. 
                    Bitte betrachten Sie die Seite als Vorschau auf zukünftige Leistungen.
                </p>`
            }/* , {
                title: '§ 1 Geltungsbereich',
                content: '<p>Diese AGB gelten für alle Verträge zwischen Bastian Flügel und seinen Kunden über Beratungsleistungen.</p>'
            }, {
                title: '§ 2 Leistungen',
                content: '<ul><li>Digitale Transformation</li><li>Innovationsmanagement</li><li>Technologieberatung</li></ul>'
            } */]
        },
        en: {
            title: 'Terms and Conditions',
            sections: [{
                title: 'Note on current status',
                content: `<p>
                    The company <strong>Bastian Flügel</strong> and the website accessible at <a href="https://bfluegel.de">bfluegel.de</a> are currently under development.<br>
                    All content, features, and presentations provided are for demonstration and informational purposes only.<br>
                    This website does <strong>not constitute a binding offer</strong> and is not to be understood as a fully established business website. It is currently not possible to enter into binding contracts or to claim consulting or other services in a legally binding manner.<br>
                    Please consider this website as a preview of future services.
                </p>`
            }/* , {
                title: '§ 1 Scope',
                content: '<p>These terms apply to all contracts between Bastian Flügel and his clients for consulting services.</p>'
            }, {
                title: '§ 2 Services',
                content: '<ul><li>Digital transformation</li><li>Innovation management</li><li>Technology consulting</li></ul>'
            } */]
        }
    };
    return content[this.lang];
}

    
    getCookies() {
        const content = {
            de: {
                title: 'Cookie-Einstellungen',
                sections: [{
                    title: 'Cookie-Präferenzen',
                    content: '<p>Verwalten Sie Ihre Cookie-Einstellungen:</p>',
                    categories: [
                        { id: 'essential', title: 'Notwendige Cookies', desc: 'Erforderlich für Grundfunktionen', required: true, enabled: true },
                        { id: 'functional', title: 'Funktionale Cookies', desc: 'Erweiterte Funktionen', required: false, enabled: false },
                        { id: 'analytics', title: 'Analyse Cookies', desc: 'Website-Analyse', required: false, enabled: false }
                    ]
                }]
            },
            en: {
                title: 'Cookie Settings',
                sections: [{
                    title: 'Cookie Preferences',
                    content: '<p>Manage your cookie settings:</p>',
                    categories: [
                        { id: 'essential', title: 'Necessary Cookies', desc: 'Required for basic functions', required: true, enabled: true },
                        { id: 'functional', title: 'Functional Cookies', desc: 'Enhanced features', required: false, enabled: false },
                        { id: 'analytics', title: 'Analytics Cookies', desc: 'Website analysis', required: false, enabled: false }
                    ]
                }]
            }
        };
        return content[this.lang];
    }
    
    getKontakt() {
        const content = {
            de: {
                title: 'Kontakt',
                sections: [{
                    title: 'Kontaktformular',
                    content: 'form',
                    fields: [
                        { type: 'text', name: 'name', label: 'Name*', required: true },
                        { type: 'email', name: 'email', label: 'E-Mail*', required: true },
                        { type: 'text', name: 'company', label: 'Unternehmen' },
                        { type: 'select', name: 'subject', label: 'Betreff*', required: true, options: [
                            { value: '', text: 'Bitte wählen...' },
                            { value: 'beratung', text: 'Beratungsanfrage' },
                            { value: 'projekt', text: 'Projektanfrage' }
                        ]},
                        { type: 'textarea', name: 'message', label: 'Nachricht*', required: true },
                        { type: 'checkbox', name: 'privacy', label: 'Datenschutz akzeptiert*', required: true }
                    ]
                }]
            },
            en: {
                title: 'Contact',
                sections: [{
                    title: 'Contact Form',
                    content: 'form',
                    fields: [
                        { type: 'text', name: 'name', label: 'Name*', required: true },
                        { type: 'email', name: 'email', label: 'Email*', required: true },
                        { type: 'text', name: 'company', label: 'Company' },
                        { type: 'select', name: 'subject', label: 'Subject*', required: true, options: [
                            { value: '', text: 'Please select...' },
                            { value: 'consulting', text: 'Consulting inquiry' },
                            { value: 'project', text: 'Project inquiry' }
                        ]},
                        { type: 'textarea', name: 'message', label: 'Message*', required: true },
                        { type: 'checkbox', name: 'privacy', label: 'Privacy policy accepted*', required: true }
                    ]
                }]
            }
        };
        return content[this.lang];
    }
    
    getProfil() {
        const content = {
            de: {
                title: 'Profil',
                sections: [{
                    title: 'Persönliche Informationen',
                    content: '<div class="modal__settings-grid"><div class="modal__setting-item"><div class="modal__setting-info"><h4>Name</h4><p>Bastian Flügel</p></div></div><div class="modal__setting-item"><div class="modal__setting-info"><h4>Position</h4><p>Digital Innovation Manager</p></div></div></div>'
                }, {
                    title: 'Expertise',
                    content: '<ul class="modal__legal-list"><li><i class="ph ph-check-circle" style="color: var(--color-primary-green); margin-right: 8px;"></i>Digital Transformation</li><li><i class="ph ph-check-circle" style="color: var(--color-primary-green); margin-right: 8px;"></i>Innovation Management</li></ul>'
                }]
            },
            en: {
                title: 'Profile',
                sections: [{
                    title: 'Personal Information',
                    content: '<div class="modal__settings-grid"><div class="modal__setting-item"><div class="modal__setting-info"><h4>Name</h4><p>Bastian Flügel</p></div></div><div class="modal__setting-item"><div class="modal__setting-info"><h4>Position</h4><p>Digital Innovation Manager</p></div></div></div>'
                }, {
                    title: 'Expertise',
                    content: '<ul class="modal__legal-list"><li><i class="ph ph-check-circle" style="color: var(--color-primary-green); margin-right: 8px;"></i>Digital Transformation</li><li><i class="ph ph-check-circle" style="color: var(--color-primary-green); margin-right: 8px;"></i>Innovation Management</li></ul>'
                }]
            }
        };
        return content[this.lang];
    }
    
    getEinstellungen() {
        const content = {
            de: {
                title: 'Einstellungen',
                sections: [{
                    title: 'Anzeigeeinstellungen',
                    content: '<div class="modal__settings-grid"><div class="modal__setting-item"><div class="modal__setting-info"><h4>Sprache</h4><p>Aktuell: Deutsch</p></div><button class="btn btn--secondary btn--sm" data-setting="language"><i class="ph ph-globe"></i> Wechseln</button></div></div>'
                }, {
                    title: 'Daten',
                    content: '<div class="modal__settings-grid"><div class="modal__setting-item"><div class="modal__setting-info"><h4>Lokale Daten löschen</h4><p>Alle Einstellungen zurücksetzen</p></div><button class="btn btn--secondary btn--sm" data-setting="clear"><i class="ph ph-trash"></i> Löschen</button></div></div>'
                }]
            },
            en: {
                title: 'Settings',
                sections: [{
                    title: 'Display Settings',
                    content: '<div class="modal__settings-grid"><div class="modal__setting-item"><div class="modal__setting-info"><h4>Language</h4><p>Current: English</p></div><button class="btn btn--secondary btn--sm" data-setting="language"><i class="ph ph-globe"></i> Switch</button></div></div>'
                }, {
                    title: 'Data',
                    content: '<div class="modal__settings-grid"><div class="modal__setting-item"><div class="modal__setting-info"><h4>Clear Local Data</h4><p>Reset all settings</p></div><button class="btn btn--secondary btn--sm" data-setting="clear"><i class="ph ph-trash"></i> Clear</button></div></div>'
                }]
            }
        };
        return content[this.lang];
    }
    
    createModal(content) {
        const overlay = document.createElement('div');
        overlay.className = MODAL_CONFIG.classes.overlay;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal();
        });
        
        const modal = document.createElement('div');
        modal.className = MODAL_CONFIG.classes.modal;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        modal.innerHTML = `
            <div class="modal__header">
                <h2 class="modal__title">${content.title}</h2>
                <button class="modal__close" aria-label="Schließen">
                    <i class="ph ph-x"></i>
                </button>
            </div>
            <div class="modal__body">
                ${this.renderSections(content.sections)}
            </div>
            ${this.renderFooter(content)}
        `;
        
        // Bind events
        modal.querySelector('.modal__close').addEventListener('click', () => this.closeModal());
        this.bindModalEvents(modal);
        
        overlay.appendChild(modal);
        return overlay;
    }
    
    renderSections(sections) {
        return sections.map(section => `
            <div class="modal__section">
                ${section.title ? `<h3 class="modal__section-title">${section.title}</h3>` : ''}
                <div class="modal__section-content">
                    ${section.content === 'form' ? this.renderForm(section.fields) : 
                      section.categories ? this.renderCategories(section.categories) : 
                      section.content}
                </div>
            </div>
        `).join('');
    }
    
    renderForm(fields) {
        const formFields = fields.map(field => {
            if (field.type === 'checkbox') {
                return `
                    <div class="modal__form-group modal__form-checkbox-group">
                        <input type="checkbox" name="${field.name}" id="${field.name}" ${field.required ? 'required' : ''}>
                        <label for="${field.name}" class="modal__form-checkbox-label">${field.label}</label>
                    </div>
                `;
            } else if (field.type === 'select') {
                const options = field.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('');
                return `
                    <div class="modal__form-group">
                        <label class="modal__form-label">${field.label}</label>
                        <select name="${field.name}" class="modal__form-select" ${field.required ? 'required' : ''}>${options}</select>
                    </div>
                `;
            } else if (field.type === 'textarea') {
                return `
                    <div class="modal__form-group">
                        <label class="modal__form-label">${field.label}</label>
                        <textarea name="${field.name}" class="modal__form-textarea" ${field.required ? 'required' : ''}></textarea>
                    </div>
                `;
            } else {
                return `
                    <div class="modal__form-group">
                        <label class="modal__form-label">${field.label}</label>
                        <input type="${field.type}" name="${field.name}" class="modal__form-input" ${field.required ? 'required' : ''}>
                    </div>
                `;
            }
        }).join('');
        
        return `
            <form class="modal__form" onsubmit="return window.modalManager.handleFormSubmit(event)">
                ${formFields}
                <button type="submit" class="btn btn--primary">
                    <i class="ph ph-paper-plane-tilt"></i>
                    ${this.lang === 'de' ? 'Senden' : 'Send'}
                </button>
            </form>
        `;
    }
    
    renderCategories(categories) {
        return categories.map(cat => `
            <div class="modal__cookie-category">
                <div class="modal__cookie-header" onclick="this.nextElementSibling.classList.toggle('active')">
                    <h4>${cat.title}</h4>
                    <div class="modal__toggle ${cat.enabled ? 'active' : ''}" 
                         data-category="${cat.id}" 
                         ${cat.required ? 'data-required="true"' : ''}>
                    </div>
                </div>
                <div class="modal__cookie-content">
                    <p>${cat.desc}</p>
                </div>
            </div>
        `).join('');
    }
    
    renderFooter(content) {
        if (content.title.toLowerCase().includes('cookie')) {
            return `
                <div class="modal__footer">
                    <button class="btn btn--secondary" onclick="window.modalManager.acceptAllCookies()">
                        <i class="ph ph-check"></i> ${this.lang === 'de' ? 'Alle akzeptieren' : 'Accept all'}
                    </button>
                    <button class="btn btn--primary" onclick="window.modalManager.saveCookieSettings()">
                        <i class="ph ph-floppy-disk"></i> ${this.lang === 'de' ? 'Speichern' : 'Save'}
                    </button>
                </div>
            `;
        }
        return '';
    }
    
    bindModalEvents(modal) {
        modal.addEventListener('click', (e) => {
            const setting = e.target.dataset.setting;
            if (setting) this.handleSetting(setting);
            
            const toggle = e.target.closest('.modal__toggle:not([data-required])');
            if (toggle) toggle.classList.toggle('active');
        });
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        const data = new FormData(e.target);
        console.log('📝 Form data:', Object.fromEntries(data.entries()));
        this.closeModal();
        this.showToast(this.lang === 'de' ? 'Nachricht gesendet!' : 'Message sent!', 'success');
        return false;
    }
    
    handleSetting(setting) {
        switch (setting) {
            case 'language':
                const langBtn = document.getElementById('lang-toggle');
                if (langBtn) langBtn.click();
                break;
            case 'clear':
                if (confirm(this.lang === 'de' ? 'Daten löschen?' : 'Clear data?')) {
                    localStorage.clear();
                    location.reload();
                }
                break;
        }
    }
    
    saveCookieSettings() {
        const settings = {};
        this.activeModal.querySelectorAll('[data-category]').forEach(toggle => {
            settings[toggle.dataset.category] = toggle.classList.contains('active');
        });
        
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.storage('cookie_settings', settings);
        }
        
        this.closeModal();
        this.showToast(this.lang === 'de' ? 'Einstellungen gespeichert' : 'Settings saved', 'success');
    }
    
    acceptAllCookies() {
        const settings = { essential: true, functional: true, analytics: true };
        
        if (window.BastianFluegelApp) {
            window.BastianFluegelApp.utils.storage('cookie_settings', settings);
        }
        
        this.closeModal();
        this.showToast(this.lang === 'de' ? 'Cookies akzeptiert' : 'Cookies accepted', 'success');
    }
    
    createLoading() {
        const overlay = document.createElement('div');
        overlay.className = `${MODAL_CONFIG.classes.overlay} ${MODAL_CONFIG.classes.active}`;
        overlay.innerHTML = `
            <div class="${MODAL_CONFIG.classes.modal}">
                <div class="${MODAL_CONFIG.classes.loading}">
                    <div class="modal__loading-spinner"></div>
                    <span>${this.lang === 'de' ? 'Lädt...' : 'Loading...'}</span>
                </div>
            </div>
        `;
        return overlay;
    }
    
    showError() {
        const overlay = document.createElement('div');
        overlay.className = `${MODAL_CONFIG.classes.overlay} ${MODAL_CONFIG.classes.active}`;
        overlay.innerHTML = `
            <div class="${MODAL_CONFIG.classes.modal}">
                <div class="modal__header">
                    <h2 class="modal__title">Fehler</h2>
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="ph ph-x"></i>
                    </button>
                </div>
                <div class="modal__body">
                    <div class="${MODAL_CONFIG.classes.error}">
                        <p>${this.lang === 'de' ? 'Ein Fehler ist aufgetreten.' : 'An error occurred.'}</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    showToast(message, type = 'info') {
        const colors = { success: '#10B981', error: '#EF4444', info: '#3B82F6' };
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 1080;
            background: ${colors[type]}; color: white; padding: 1rem 1.5rem;
            border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%); transition: transform 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => toast.style.transform = 'translateX(0)');
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    lockScroll() {
        document.body.style.overflow = 'hidden';
        this.previousFocus = document.activeElement;
    }
    
    unlockScroll() {
        document.body.style.overflow = '';
    }
    
    trapFocus(modal) {
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        
        if (first) first.focus();
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }
    
    restoreFocus() {
        if (this.previousFocus) {
            this.previousFocus.focus();
            this.previousFocus = null;
        }
    }
    
    loadTranslations() {
        // Translations loaded in content generation methods
    }
}

/**
 * =======================================================================
 * INITIALIZATION
 * =======================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const modalManager = new ModalManager();
    
    if (window.BastianFluegelApp) {
        window.BastianFluegelApp.registerModule('modal-manager', modalManager);
    }
    
    window.modalManager = modalManager;
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalManager;
}