/**
 * =======================================================================
 * BASTIAN FLÜGEL WEBSITE - MAIN APPLICATION
 * =======================================================================
 * Complete JavaScript application without theme switching
 * Modular architecture with language management and user interactions
 */

/**
 * =======================================================================
 * CONFIGURATION VARIABLES
 * =======================================================================
 */

const APP_CONFIG = {
  // Application metadata
  name: "Bastian Flügel Website",
  version: "2.0.0",

  // Configuration settings
  storagePrefix: "bf_",
  defaultLanguage: "de",
  animationDuration: 250,
  debounceDelay: 300,

  // API endpoints (for future use)
  apiBaseUrl: "/api",
  contactEndpoint: "/contact",

  // Feature flags
  features: {
    cookieBanner: true,
    analytics: false,
    serviceWorker: false,
  },

  // Breakpoints
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    large: 1200,
  },
};

/**
 * =======================================================================
 * GLOBAL APPLICATION OBJECT
 * =======================================================================
 */

window.BastianFluegelApp = {
  // Application metadata
  name: APP_CONFIG.name,
  version: APP_CONFIG.version,

  // Configuration
  config: APP_CONFIG,

  // Module registry
  modules: new Map(),

  // Event system
  events: new EventTarget(),

  // Utility functions
  utils: {},

  // Translation data
  translations: {},

  // Initialize application
  init() {
    console.log(`🚀 Initializing ${this.name} v${this.version}`);
    this.loadTranslations();
    this.initializeModules();
    this.announcePageLoad();
  },

  /**
   * Register a module with the application
   */
  registerModule(name, module) {
    this.modules.set(name, module);
    console.log(`📦 Module registered: ${name}`);
  },

  /**
   * Get a registered module
   */
  getModule(name) {
    return this.modules.get(name) || null;
  },

  /**
   * Initialize all modules
   */
  initializeModules() {
    // Auto-initialize modules based on data attributes
    document.querySelectorAll("[data-module]").forEach((element) => {
      const moduleName = element.dataset.module;
      if (this.modules.has(moduleName)) {
        const Module = this.modules.get(moduleName);
        if (typeof Module === "function") {
          new Module(element);
        }
      }
    });
  },

  /**
   * Load translation data
   */
  loadTranslations() {
    this.translations = {
      de: {
        // Hero Section
        "hero-title": "Digital Enthusiast",
        "hero-subtitle": "Schwerpunkt IT-Sicherheit & Prozessoptimierung",
        "hero-text": `Mein Antrieb: <br>
        Die digitale Welt menschlicher, sicherer und sinnvoller zu machen – nicht nur effizienter.
        <br><br>
        Ich verbinde <strong>futuristisch-innovatives Denken</strong> mit <strong>klassischer Philosophie</strong>
        und glaube daran, dass echte Optimierung nur funktioniert, wenn Technik und Mensch in Einklang stehen.`,
        "btn-primary": " Über mich",
        "btn-secondary": "Kontakt aufnehmen",

        // Cards
        "card-mindset-title": "Mein Mindset",
        "card-mindset-desc": `Für mich ist Technik kein Selbstzweck. <br>
        Ich glaube an Lösungen, die Leben und Arbeit wirklich besser machen –
        <strong>ehrlich, nachhaltig und mit Blick auf das Menschliche</strong>.<br>
        <em>Philosophie trifft Zukunft – und daraus entsteht echte Veränderung.</em>`,
        "card-attitude-title": "Optimieren mit Haltung",
        "card-attitude-desc": `Ich will nicht um jeden Preis beschleunigen – <strong>mein Ziel ist echte Vereinfachung</strong>.<br>
        Das heißt für mich: <br>
        Prozesse entschlacken, Sicherheit mitdenken und dabei <strong>den Menschen nie aus dem Fokus verlieren</strong>.<br>
        <em>Optimierung beginnt mit Zuhören und Nachdenken, nicht mit Aktionismus.</em>`,
        "card-vision-title": "Symbiose aus Innovation & Philosophie",
        "card-vision-desc": `Ich bringe <strong>futuristische Ideen</strong> und <strong>analytische Tiefe</strong> zusammen.<br>
        Mein Ziel: Brücken bauen zwischen klassischer Denkkunst und modernster Technologie.<br>
        <em>Ich suche Austausch mit Menschen, die ebenso ganzheitlich denken – und gemeinsam Zukunft gestalten wollen.</em>`,

        /*    // Services Section
                'services-title': 'Meine Leistungsbereiche',
                'card-solutions-title': 'Solutions',
                'card-academy-title': 'Academy',
                'card-news-title': 'News',
                'card-solutions-desc': 'Maßgeschneiderte digitale Lösungen für Ihr Unternehmen. Von Strategieberatung bis zur technischen Umsetzung – alles aus einer Hand für maximalen Erfolg.',
                'card-academy-desc': 'Umfassendes Wissensportal und Lernplattform für digitale Innovation. Tutorials, Best Practices und Expertenwissen für Ihren Lernfortschritt.',
                'card-news-desc': 'Aktuelle Insights und Trends aus der Welt der digitalen Innovation. Bleiben Sie informiert über die neuesten Entwicklungen und Technologien.',
                 */

        // Navigation & Menu
        "menu-profile": "Profil",
        "menu-settings": "Einstellungen",
        "menu-contact": "Kontakt",

        // Footer
        "footer-contact-title": "Kontakt",
        "footer-contact-position": "Digital Enthusiast",
        "footer-legal-title": "Rechtliches",
        "footer-legal-impressum": "Impressum",
        "footer-legal-privacy": "Datenschutz",
        "footer-legal-terms": "AGB",
        "footer-legal-cookies": "Cookie-Einstellungen",
        "footer-legal-contact": "Kontakt",
        "footer-social-title": "Social Media",
        "footer-copyright": "© 2025 Bastian Flügel. Alle Rechte vorbehalten.",

        // Cookie Banner
        "cookie-banner-title": "Cookies",
        "cookie-banner-text":
          "Wir verwenden Cookies, um Ihnen die bestmögliche Nutzererfahrung zu bieten. Sie können Ihre Präferenzen anpassen oder alle Cookies akzeptieren.",
        "cookie-banner-settings": "Einstellungen",
        "cookie-banner-accept": "Alle akzeptieren",
      },
      en: {
        // Hero Section
        "hero-title": "Digital Enthusiast",
        "hero-subtitle": "Focus on IT Security & Process Optimization",
        "hero-text": `My drive: <br>
        Making the digital world more human, safer and more meaningful – not just more efficient.
        <br><br>
        I combine <strong>futuristic, innovative thinking</strong> with <strong>classical philosophy</strong> and believe that true optimization only works when technology and people are in harmony.`,
        "btn-primary": "About me",
        "btn-secondary": "Contact me",

        // Cards
        "card-mindset-title": "My Mindset",
        "card-mindset-desc": `For me, technology is not an end in itself. <br>
        I believe in solutions that truly improve life and work –
        <strong>honest, sustainable, and with a human perspective</strong>.<br>
        <em>Philosophy meets the future – and that’s where real change begins.</em>`,
        "card-attitude-title": "Optimization with Attitude",
        "card-attitude-desc": `I don’t want to accelerate at any price – <strong>my goal is true simplification</strong>.<br>
        For me, that means: <br>
        Streamlining processes, keeping security in mind, and <strong>never losing focus on people</strong>.<br>
        <em>Optimization starts with listening and reflection, not with actionism.</em>`,
        "card-vision-title": "Symbiosis of Innovation & Philosophy",
        "card-vision-desc": `I bring together <strong>futuristic ideas</strong> and <strong>analytical depth</strong>.<br>
        My aim: to build bridges between classical thinking and cutting-edge technology.<br>
        <em>I’m looking for exchange with people who think just as holistically – to shape the future together.</em>`,

        /*      // Services Section
                'services-title': 'My Service Areas',
                'card-solutions-title': 'Solutions',
                'card-academy-title': 'Academy',
                'card-news-title': 'News',
                'card-solutions-desc': 'Customized digital solutions for your business. From strategy consulting to technical implementation – everything from one source for maximum success.',
                'card-academy-desc': 'Comprehensive knowledge portal and learning platform for digital innovation. Tutorials, best practices and expert knowledge for your learning progress.',
                'card-news-desc': 'Current insights and trends from the world of digital innovation. Stay informed about the latest developments and technologies.',
                 */
        // Navigation & Menu
        "menu-profile": "Profile",
        "menu-settings": "Settings",
        "menu-contact": "Contact",

        // Footer
        "footer-contact-title": "Contact",
        "footer-contact-position": "Digital Enthusiast",
        "footer-legal-title": "Legal",
        "footer-legal-impressum": "Legal Notice",
        "footer-legal-privacy": "Privacy Policy",
        "footer-legal-terms": "Terms & Conditions",
        "footer-legal-cookies": "Cookie Settings",
        "footer-social-title": "Social Media",
        "footer-legal-contact": "Contact",
        "footer-copyright": "© 2025 Bastian Flügel. All rights reserved.",

        // Cookie Banner
        "cookie-banner-title": "Cookies",
        "cookie-banner-text":
          "We use cookies to provide you with the best possible user experience. You can adjust your preferences or accept all cookies.",
        "cookie-banner-settings": "Settings",
        "cookie-banner-accept": "Accept All",
      },
    };
  },

  /**
   * Announce page load to screen readers
   */
  announcePageLoad() {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = "Seite wurde erfolgreich geladen";
    document.body.appendChild(announcement);

    setTimeout(() => announcement.remove(), 2000);
  },
};

/**
 * =======================================================================
 * UTILITY FUNCTIONS MODULE
 * =======================================================================
 */

window.BastianFluegelApp.utils = {
  /**
   * Debounce function calls
   */
  debounce(func, wait = APP_CONFIG.debounceDelay) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle(func, limit = 100) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Get/Set localStorage with app prefix
   */
  storage(key, value) {
    const prefixedKey = APP_CONFIG.storagePrefix + key;

    if (value !== undefined) {
      try {
        localStorage.setItem(prefixedKey, JSON.stringify(value));
        return value;
      } catch (e) {
        console.warn("LocalStorage not available:", e);
        return null;
      }
    } else {
      try {
        const item = localStorage.getItem(prefixedKey);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.warn("Error reading from localStorage:", e);
        return null;
      }
    }
  },

  /**
   * Smooth scroll to element
   */
  scrollTo(target, options = {}) {
    const element =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!element) return;

    const defaultOptions = {
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    };

    element.scrollIntoView({ ...defaultOptions, ...options });

    // Update focus for accessibility
    element.focus();
    if (!element.hasAttribute("tabindex")) {
      element.setAttribute("tabindex", "-1");
    }
  },

  /**
   * Create and dispatch custom event
   */
  emit(eventName, detail = null, target = window.BastianFluegelApp.events) {
    const event = new CustomEvent(eventName, { detail });
    target.dispatchEvent(event);
  },

  /**
   * Listen for custom events
   */
  on(eventName, callback, target = window.BastianFluegelApp.events) {
    target.addEventListener(eventName, callback);
  },

  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  /**
   * Get current viewport size
   */
  getViewportSize() {
    return {
      width: Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
      ),
      height: Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
      ),
    };
  },

  /**
   * Check if element is in viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },
};

/**
 * =======================================================================
 * LANGUAGE MANAGER MODULE
 * =======================================================================
 */

class LanguageManager {
  constructor(triggerElement) {
    this.trigger = triggerElement;
    this.currentLang = this.getStoredLanguage() || APP_CONFIG.defaultLanguage;
    this.translations = window.BastianFluegelApp.translations;

    this.init();
  }

  init() {
    this.setLanguage(this.currentLang);
    this.bindEvents();

    console.log("🌍 Language Manager initialized");
  }

  bindEvents() {
    this.trigger.addEventListener("click", () => this.toggle());
  }

  toggle() {
    const newLang = this.currentLang === "de" ? "en" : "de";
    this.setLanguage(newLang);
    this.storeLanguage(newLang);

    // Emit language change event
    window.BastianFluegelApp.utils.emit("language:changed", {
      language: newLang,
      previous: this.currentLang,
    });
  }

  setLanguage(lang) {
    this.currentLang = lang;

    // Update DOM lang attribute
    document.documentElement.setAttribute("lang", lang);

    // Update button text
    this.trigger.innerHTML = `
            <i class="ph ph-globe" aria-hidden="true"></i>
            <span>${lang.toUpperCase()}</span>
        `;

    // Update all translatable content
    this.updateContent();

    console.log(`🌍 Language changed to: ${lang}`);
  }

  updateContent() {
    const translatableElements = document.querySelectorAll("[data-translate]");
    const translations = this.translations[this.currentLang] || {};

    translatableElements.forEach((element) => {
      const key = element.dataset.translate;
      if (translations[key]) {
        // Handle different element types
        if (element.tagName === "INPUT" && element.type === "button") {
          element.value = translations[key];
        } else if (
          element.tagName === "INPUT" &&
          element.placeholder !== undefined
        ) {
          element.placeholder = translations[key];
        } else if (element.hasAttribute("aria-label")) {
          element.setAttribute("aria-label", translations[key]);
        } else {
          // For buttons with icons, preserve the HTML structure
          if (element.querySelector("i")) {
            const icon = element.querySelector("i").outerHTML;
            const span = element.querySelector("span");
            if (span) {
              // Nur Text einfügen, falls es kein HTML sein kann!
              span.textContent = translations[key];
            } else {
              element.innerHTML =
                icon + " <span>" + translations[key] + "</span>";
            }
          } else {
            // >>> NEU: Prüfe, ob HTML-Tags in der Übersetzung sind
            if (/<[a-z][\s\S]*>/i.test(translations[key])) {
              element.innerHTML = translations[key];
            } else {
              element.textContent = translations[key];
            }
          }
        }
      }
    });
  }

  translate(key, fallback = key) {
    const translations = this.translations[this.currentLang] || {};
    return translations[key] || fallback;
  }

  getStoredLanguage() {
    return window.BastianFluegelApp.utils.storage("language");
  }

  storeLanguage(lang) {
    window.BastianFluegelApp.utils.storage("language", lang);
  }

  getCurrentLanguage() {
    return this.currentLang;
  }
}

/**
 * =======================================================================
 * USER MENU MODULE
 * =======================================================================
 */

class UserMenu {
  constructor(containerElement) {
    this.container = containerElement;
    this.trigger = containerElement.querySelector("#user-menu-btn");
    this.menu = containerElement.querySelector("#user-menu-content");
    this.menuItems = this.menu.querySelectorAll(".user-menu__item");
    this.isOpen = false;
    this.currentFocus = -1;

    this.init();
  }

  init() {
    this.bindEvents();
    console.log("👤 User Menu initialized");
  }

  bindEvents() {
    this.trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    document.addEventListener("click", (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        this.close();
      }
    });

    document.addEventListener("keydown", (e) => this.handleKeyDown(e));

    this.menuItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        this.close();
        console.log(`Menu item clicked: ${item.textContent}`);
      });
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.menu.classList.add("active");
    this.trigger.setAttribute("aria-expanded", "true");

    this.currentFocus = 0;
    this.focusMenuItem(0);

    window.BastianFluegelApp.utils.emit("userMenu:opened");
  }

  close() {
    this.isOpen = false;
    this.menu.classList.remove("active");
    this.trigger.setAttribute("aria-expanded", "false");
    this.currentFocus = -1;

    this.trigger.focus();

    window.BastianFluegelApp.utils.emit("userMenu:closed");
  }

  handleKeyDown(e) {
    if (!this.isOpen) {
      if (
        (e.key === "Enter" || e.key === " ") &&
        document.activeElement === this.trigger
      ) {
        e.preventDefault();
        this.open();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        this.close();
        break;

      case "ArrowDown":
        e.preventDefault();
        this.currentFocus = (this.currentFocus + 1) % this.menuItems.length;
        this.focusMenuItem(this.currentFocus);
        break;

      case "ArrowUp":
        e.preventDefault();
        this.currentFocus =
          this.currentFocus <= 0
            ? this.menuItems.length - 1
            : this.currentFocus - 1;
        this.focusMenuItem(this.currentFocus);
        break;

      case "Tab":
        if (e.shiftKey && this.currentFocus === 0) {
          e.preventDefault();
          this.focusMenuItem(this.menuItems.length - 1);
        } else if (
          !e.shiftKey &&
          this.currentFocus === this.menuItems.length - 1
        ) {
          e.preventDefault();
          this.focusMenuItem(0);
        }
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        if (this.currentFocus >= 0) {
          this.menuItems[this.currentFocus].click();
        }
        break;
    }
  }

  focusMenuItem(index) {
    if (index >= 0 && index < this.menuItems.length) {
      this.currentFocus = index;
      this.menuItems[index].focus();
    }
  }
}

/**
 * =======================================================================
 * SMOOTH SCROLL MODULE
 * =======================================================================
 */

class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    console.log("📜 Smooth Scroll initialized");
  }

  bindEvents() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        this.handleAnchorClick(e, link);
      }
    });
  }

  handleAnchorClick(e, link) {
    const href = link.getAttribute("href");
    if (href.length <= 1) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    window.BastianFluegelApp.utils.scrollTo(target);

    window.BastianFluegelApp.utils.emit("scroll:navigated", {
      target: href,
      element: target,
    });
  }
}

/**
 * =======================================================================
 * CARD INTERACTION MODULE
 * =======================================================================
 */

class CardInteraction {
  constructor(cardElement) {
    this.card = cardElement;
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.handleActivation();
      }
    });

    this.card.addEventListener("click", () => {
      this.handleActivation();
    });
  }

  handleActivation() {
    const title =
      this.card.querySelector(".card__title")?.textContent || "Card";

    const href = this.card.getAttribute("href");

    window.BastianFluegelApp.utils.emit("card:activated", {
      card: this.card,
      href: href,
    });

    if (href && href.startsWith("#")) {
      window.BastianFluegelApp.utils.scrollTo(href);
    } else if (href) {
      window.location.href = href;
    }

    console.log(`🃏 Card activated: ${title}`);

    //alert(`Du hast "${title}" ausgewählt! (Hier kannst du eine Aktion implementieren.)`);
  }
}

/**
 * =======================================================================
 * PERFORMANCE MONITOR MODULE
 * =======================================================================
 */

class PerformanceMonitor {
  constructor() {
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.setupIntersectionObserver();
    this.monitorWebVitals();

    console.log("⚡ Performance Monitor initialized");
  }

  setupLazyLoading() {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove("lazy");
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll("img[data-src]").forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }

  setupIntersectionObserver() {
    if (
      "IntersectionObserver" in window &&
      !window.BastianFluegelApp.utils.prefersReducedMotion()
    ) {
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            animationObserver.unobserve(entry.target);
          }
        });
      });

      document.querySelectorAll(".card").forEach((card) => {
        animationObserver.observe(card);
      });
    }
  }

  monitorWebVitals() {
    window.addEventListener("load", () => {
      const perfData = performance.getEntriesByType("navigation")[0];

      console.log("📊 Performance Metrics:", {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded:
          perfData.domContentLoadedEventEnd -
          perfData.domContentLoadedEventStart,
        firstByte: perfData.responseStart - perfData.requestStart,
      });
    });
  }
}

/**
 * =======================================================================
 * MODULE REGISTRATION AND INITIALIZATION
 * =======================================================================
 */

// Register modules with the application
window.BastianFluegelApp.registerModule("language-manager", LanguageManager);
window.BastianFluegelApp.registerModule("user-menu", UserMenu);
window.BastianFluegelApp.registerModule("smooth-scroll", SmoothScroll);
window.BastianFluegelApp.registerModule("card-interaction", CardInteraction);
window.BastianFluegelApp.registerModule(
  "performance-monitor",
  PerformanceMonitor
);

/**
 * =======================================================================
 * APPLICATION INITIALIZATION
 * =======================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the main application
  window.BastianFluegelApp.init();

  // Initialize standalone modules
  new SmoothScroll();
  new PerformanceMonitor();

  // Initialize modules tied to specific elements
  const langToggle = document.getElementById("lang-toggle");
  if (langToggle) new LanguageManager(langToggle);

  const userMenus = document.querySelectorAll('[data-module="user-menu"]');
  userMenus.forEach((menu) => new UserMenu(menu));

  const cards = document.querySelectorAll('[data-module="card-interaction"]');
  cards.forEach((card) => new CardInteraction(card));

  console.log("✅ All modules initialized successfully");
});

/**
 * =======================================================================
 * ERROR HANDLING AND DEBUGGING
 * =======================================================================
 */

// Global error handler
window.addEventListener("error", (e) => {
  console.error("💥 Global Error:", e.error);

  if (APP_CONFIG.features.analytics) {
    // Send to error tracking service
  }
});

// Unhandled promise rejection handler
window.addEventListener("unhandledrejection", (e) => {
  console.error("💥 Unhandled Promise Rejection:", e.reason);
});

// Development tools (only in development)
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  window.dev = {
    app: window.BastianFluegelApp,
    config: APP_CONFIG,
    getModule: (name) => window.BastianFluegelApp.getModule(name),
    listModules: () => Array.from(window.BastianFluegelApp.modules.keys()),
    storage: window.BastianFluegelApp.utils.storage,
    clearStorage: () => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(APP_CONFIG.storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
      console.log("🧹 Cleared app storage");
    },
  };

  console.log("🔧 Development tools available at window.dev");
}
