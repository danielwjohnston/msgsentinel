/**
 * MsgSentinel - Main Application
 * Privacy-focused message sanitization
 */

import { MessageSanitizer } from './filters/sanitizer.js';
import { SecureStorage } from './utils/storage.js';
import { DisplayManager } from './ui/display.js';

// Configuration
const CONFIG = {
    MAX_HISTORY_ITEMS: 50,
    MAX_MESSAGE_LENGTH: 10000,
    COPY_SUCCESS_DURATION: 2000,
    STORAGE_KEYS: {
        SETTINGS: 'msgSentinelSettings',
        HISTORY: 'msgSentinelHistory'
    }
};

class MsgSentinelApp {
    constructor() {
        this.sanitizer = new MessageSanitizer();
        this.storage = new SecureStorage();
        this.display = new DisplayManager();
        this.initialized = false;
    }

    /**
     * Initializes the application
     */
    async init() {
        try {
            console.log('Initializing MsgSentinel...');

            // Initialize display manager
            this.display.initializeElements();

            // Load settings
            await this.loadSettings();

            // Load history
            await this.loadHistory();

            // Set up event listeners
            this.setupEventListeners();

            // Set initial state
            this.display.clearAll();

            this.initialized = true;
            console.log('MsgSentinel initialized successfully');
        } catch (error) {
            console.error('Failed to initialize MsgSentinel:', error);
            this.display.showEmptyState(
                'Failed to initialize application. Please refresh the page.',
                'error'
            );
        }
    }

    /**
     * Sets up all event listeners
     */
    setupEventListeners() {
        // Tab navigation
        this.display.elements.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.handleTabSwitch(e));
        });

        // Main actions
        this.display.elements.sanitizeBtn.addEventListener('click', () => this.handleSanitize());
        this.display.elements.copyBtn.addEventListener('click', () => this.handleCopy());
        this.display.elements.clearBtn.addEventListener('click', () => this.handleClear());
        this.display.elements.clearHistoryBtn.addEventListener('click', () => this.handleClearHistory());

        // Settings changes
        const settingsInputs = [
            'profanityFilter',
            'threatFilter',
            'personalAttackFilter',
            'saveHistory'
        ];

        settingsInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.handleSettingsChange());
            }
        });

        // Keyboard shortcuts
        this.display.elements.inputMessage.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.handleSanitize();
            }
        });
    }

    /**
     * Handles tab switching
     * @param {Event} e - Click event
     */
    handleTabSwitch(e) {
        const tab = e.target.closest('.tab');
        if (!tab) return;

        // Update active tab
        this.display.elements.tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Show corresponding content
        const tabId = tab.getAttribute('data-tab');
        this.display.elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-tab`);
        });
    }

    /**
     * Handles message sanitization
     */
    async handleSanitize() {
        const input = this.display.getInputText().trim();

        // Validate input
        if (!input) {
            this.display.showEmptyState('Please enter a message to sanitize.', 'info');
            return;
        }

        if (input.length > CONFIG.MAX_MESSAGE_LENGTH) {
            this.display.showEmptyState(
                `Message is too long. Maximum ${CONFIG.MAX_MESSAGE_LENGTH} characters allowed.`,
                'error'
            );
            return;
        }

        try {
            // Sanitize the message
            const result = this.sanitizer.sanitize(input);

            // Update display
            if (result.sanitized.trim() === '') {
                this.display.showEmptyState(
                    'This message was completely filtered as it contained harmful content.',
                    'warning'
                );
            } else {
                // Create DOM representation (SAFE - no HTML parsing)
                const domFragment = this.sanitizer.createDOMRepresentation(
                    result.original,
                    result.sanitized,
                    result.filteredWords
                );
                this.display.displayResult(domFragment);
            }

            // Update stats
            this.display.updateStats(result.filteredCount, result.safetyLevel);

            // Save to history if enabled and something was filtered
            const saveHistoryCheckbox = document.getElementById('saveHistory');
            if (saveHistoryCheckbox && saveHistoryCheckbox.checked && result.filteredCount > 0) {
                await this.saveToHistory(result);
            }
        } catch (error) {
            console.error('Sanitization error:', error);
            this.display.showEmptyState(
                'An error occurred while sanitizing the message. Please try again.',
                'error'
            );
        }
    }

    /**
     * Handles copy to clipboard
     */
    async handleCopy() {
        const resultText = this.display.getResultText().trim();

        if (!resultText || resultText.includes('Your sanitized message will appear here')) {
            alert('No sanitized message to copy!');
            return;
        }

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(resultText);
                this.display.showButtonFeedback(
                    this.display.elements.copyBtn,
                    '<i class="fas fa-check" aria-hidden="true"></i> Copied!',
                    CONFIG.COPY_SUCCESS_DURATION
                );
            } else {
                // Fallback for older browsers
                this.fallbackCopy(resultText);
            }
        } catch (error) {
            console.error('Copy failed:', error);
            alert('Failed to copy text. Please select and copy manually.');
        }
    }

    /**
     * Fallback copy method for older browsers
     * @param {string} text - Text to copy
     */
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.setAttribute('aria-hidden', 'true');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.display.showButtonFeedback(
                this.display.elements.copyBtn,
                '<i class="fas fa-check" aria-hidden="true"></i> Copied!',
                CONFIG.COPY_SUCCESS_DURATION
            );
        } catch (err) {
            console.error('Fallback copy failed:', err);
            alert('Failed to copy. Please copy manually.');
        }

        document.body.removeChild(textArea);
    }

    /**
     * Handles clear action
     */
    handleClear() {
        this.display.clearAll();
    }

    /**
     * Handles clear history
     */
    async handleClearHistory() {
        if (confirm('Are you sure you want to clear your history? This cannot be undone.')) {
            try {
                this.storage.removeItem(CONFIG.STORAGE_KEYS.HISTORY);
                await this.loadHistory();
            } catch (error) {
                console.error('Failed to clear history:', error);
                alert('Failed to clear history. Please try again.');
            }
        }
    }

    /**
     * Handles settings change
     */
    async handleSettingsChange() {
        try {
            const profanityFilter = document.getElementById('profanityFilter');
            const threatFilter = document.getElementById('threatFilter');
            const personalAttackFilter = document.getElementById('personalAttackFilter');
            const saveHistory = document.getElementById('saveHistory');

            const settings = {
                profanity: profanityFilter ? profanityFilter.checked : true,
                threats: threatFilter ? threatFilter.checked : true,
                personalAttacks: personalAttackFilter ? personalAttackFilter.checked : true,
                saveHistory: saveHistory ? saveHistory.checked : true
            };

            // Update sanitizer settings
            this.sanitizer.updateSettings(settings);

            // Save to storage (not encrypted - just preferences)
            await this.storage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, settings, false);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    /**
     * Loads settings from storage
     */
    async loadSettings() {
        try {
            const settings = await this.storage.getItem(CONFIG.STORAGE_KEYS.SETTINGS, {
                profanity: true,
                threats: true,
                personalAttacks: true,
                saveHistory: true
            });

            // Apply to UI
            const profanityFilter = document.getElementById('profanityFilter');
            const threatFilter = document.getElementById('threatFilter');
            const personalAttackFilter = document.getElementById('personalAttackFilter');
            const saveHistory = document.getElementById('saveHistory');

            if (profanityFilter) profanityFilter.checked = settings.profanity;
            if (threatFilter) threatFilter.checked = settings.threats;
            if (personalAttackFilter) personalAttackFilter.checked = settings.personalAttacks;
            if (saveHistory) saveHistory.checked = settings.saveHistory;

            // Update sanitizer
            this.sanitizer.updateSettings(settings);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    /**
     * Saves sanitization result to history
     * @param {Object} result - Sanitization result
     */
    async saveToHistory(result) {
        try {
            const history = await this.storage.getItem(CONFIG.STORAGE_KEYS.HISTORY, []);
            const now = new Date();

            const historyItem = {
                id: Date.now(),
                sanitized: result.sanitized.substring(0, CONFIG.MAX_MESSAGE_LENGTH),
                filteredCount: result.filteredCount,
                safetyLevel: result.safetyLevel,
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString(),
                timestamp: now.getTime()
            };

            // Add to beginning (most recent first)
            history.unshift(historyItem);

            // Keep only last MAX_HISTORY_ITEMS
            if (history.length > CONFIG.MAX_HISTORY_ITEMS) {
                history.splice(CONFIG.MAX_HISTORY_ITEMS);
            }

            // Save with encryption
            await this.storage.setItem(CONFIG.STORAGE_KEYS.HISTORY, history, true);
            await this.loadHistory();
        } catch (error) {
            console.error('Failed to save to history:', error);
        }
    }

    /**
     * Loads history from storage
     */
    async loadHistory() {
        try {
            const history = await this.storage.getItem(CONFIG.STORAGE_KEYS.HISTORY, []);
            this.display.displayHistory(history, (id) => this.loadHistoryItem(id));
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    /**
     * Loads a specific history item
     * @param {number} id - History item ID
     */
    async loadHistoryItem(id) {
        try {
            const history = await this.storage.getItem(CONFIG.STORAGE_KEYS.HISTORY, []);
            const item = history.find(h => h.id === id);

            if (!item) {
                this.display.showEmptyState('History item not found.', 'error');
                return;
            }

            // Switch to sanitize tab
            const sanitizeTab = document.querySelector('.tab[data-tab="sanitize"]');
            if (sanitizeTab) {
                sanitizeTab.click();
            }

            // Display the sanitized result (no original - privacy!)
            const textNode = document.createTextNode(item.sanitized);
            const fragment = document.createDocumentFragment();
            fragment.appendChild(textNode);
            this.display.displayResult(fragment);

            this.display.updateStats(item.filteredCount, item.safetyLevel);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Failed to load history item:', error);
            this.display.showEmptyState('Failed to load history item.', 'error');
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new MsgSentinelApp();
        app.init();
    });
} else {
    const app = new MsgSentinelApp();
    app.init();
}
