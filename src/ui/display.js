/**
 * UI Display utilities
 * Safe DOM manipulation without innerHTML usage
 */

export class DisplayManager {
    constructor() {
        this.elements = {};
    }

    /**
     * Initializes DOM element references
     */
    initializeElements() {
        this.elements = {
            inputMessage: document.getElementById('inputMessage'),
            result: document.getElementById('result'),
            filteredCount: document.getElementById('filteredCount'),
            safetyLevel: document.getElementById('safetyLevel'),
            historyList: document.getElementById('historyList'),
            sanitizeBtn: document.getElementById('sanitizeBtn'),
            copyBtn: document.getElementById('copyBtn'),
            clearBtn: document.getElementById('clearBtn'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),
            tabs: document.querySelectorAll('.tab'),
            tabContents: document.querySelectorAll('.tab-content')
        };
    }

    /**
     * Safely displays sanitized content using DOM nodes
     * @param {DocumentFragment} fragment - DOM fragment to display
     */
    displayResult(fragment) {
        // Clear existing content
        while (this.elements.result.firstChild) {
            this.elements.result.removeChild(this.elements.result.firstChild);
        }

        // Append new content
        this.elements.result.appendChild(fragment);
    }

    /**
     * Shows empty state message
     * @param {string} message - Message to display
     * @param {string} type - Message type: 'info', 'error', 'warning'
     */
    showEmptyState(message, type = 'info') {
        while (this.elements.result.firstChild) {
            this.elements.result.removeChild(this.elements.result.firstChild);
        }

        const p = document.createElement('p');
        p.className = `text-${type === 'error' ? 'danger' : 'muted'}`;
        p.textContent = message;
        this.elements.result.appendChild(p);
    }

    /**
     * Updates statistics display
     * @param {number} filteredCount - Number of filtered words
     * @param {string} safetyLevel - Safety level
     */
    updateStats(filteredCount, safetyLevel) {
        // Update filtered count
        this.elements.filteredCount.textContent =
            `${filteredCount} word${filteredCount !== 1 ? 's' : ''} filtered`;

        // Clear safety level
        while (this.elements.safetyLevel.firstChild) {
            this.elements.safetyLevel.removeChild(this.elements.safetyLevel.firstChild);
        }

        // Add "Safety: " text
        this.elements.safetyLevel.appendChild(document.createTextNode('Safety: '));

        // Add status span
        const statusSpan = document.createElement('span');
        statusSpan.textContent = this.getSafetyLevelText(safetyLevel);
        statusSpan.className = this.getSafetyLevelClass(safetyLevel);
        this.elements.safetyLevel.appendChild(statusSpan);
    }

    /**
     * Gets safety level text
     * @param {string} level - Safety level
     * @returns {string} Display text
     */
    getSafetyLevelText(level) {
        const levels = {
            'safe': 'Safe',
            'mostly-safe': 'Mostly Safe',
            'caution': 'Caution',
            'warning': 'Warning'
        };
        return levels[level] || 'Unknown';
    }

    /**
     * Gets safety level CSS class
     * @param {string} level - Safety level
     * @returns {string} CSS class
     */
    getSafetyLevelClass(level) {
        const classes = {
            'safe': 'text-success',
            'mostly-safe': 'text-success',
            'caution': 'text-warning',
            'warning': 'text-danger'
        };
        return classes[level] || 'text-muted';
    }

    /**
     * Displays history items
     * @param {Array} history - History items
     * @param {Function} onItemClick - Click handler
     */
    displayHistory(history, onItemClick) {
        // Clear existing history
        while (this.elements.historyList.firstChild) {
            this.elements.historyList.removeChild(this.elements.historyList.firstChild);
        }

        if (!history || history.length === 0) {
            const p = document.createElement('p');
            p.className = 'text-muted';
            p.textContent = 'Your sanitization history will appear here.';
            this.elements.historyList.appendChild(p);
            return;
        }

        history.forEach(item => {
            const historyItem = this.createHistoryItem(item, onItemClick);
            this.elements.historyList.appendChild(historyItem);
        });
    }

    /**
     * Creates a history item element
     * @param {Object} item - History item data
     * @param {Function} onClick - Click handler
     * @returns {HTMLElement} History item element
     */
    createHistoryItem(item, onClick) {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.setAttribute('data-id', item.id);
        div.setAttribute('role', 'button');
        div.setAttribute('tabindex', '0');
        div.setAttribute('aria-label', `History item from ${item.date} at ${item.time}`);

        // Preview text
        const p = document.createElement('p');
        const preview = item.sanitized.substring(0, 100);
        const displayText = item.sanitized.length > 100 ? preview + '...' : preview;
        p.textContent = displayText;
        div.appendChild(p);

        // Time info
        const timeDiv = document.createElement('div');
        timeDiv.className = 'history-time';
        timeDiv.textContent = `${item.date} at ${item.time} • ${item.filteredCount} filtered item${item.filteredCount !== 1 ? 's' : ''}`;
        div.appendChild(timeDiv);

        // Event handlers
        div.addEventListener('click', () => onClick(item.id));
        div.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(item.id);
            }
        });

        return div;
    }

    /**
     * Shows button feedback
     * @param {HTMLElement} button - Button element
     * @param {string} text - Feedback text
     * @param {number} duration - Duration in ms
     */
    showButtonFeedback(button, text, duration = 2000) {
        const originalHTML = button.innerHTML;
        button.innerHTML = text;
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.disabled = false;
        }, duration);
    }

    /**
     * Clears input and output
     */
    clearAll() {
        if (this.elements.inputMessage) {
            this.elements.inputMessage.value = '';
        }
        this.showEmptyState('Your sanitized message will appear here...', 'info');
        this.updateStats(0, 'safe');
    }

    /**
     * Gets input text
     * @returns {string} Input text
     */
    getInputText() {
        return this.elements.inputMessage ? this.elements.inputMessage.value : '';
    }

    /**
     * Sets input text
     * @param {string} text - Text to set
     */
    setInputText(text) {
        if (this.elements.inputMessage) {
            this.elements.inputMessage.value = text;
        }
    }

    /**
     * Gets result text (for copying)
     * @returns {string} Result text
     */
    getResultText() {
        return this.elements.result ? this.elements.result.textContent : '';
    }
}
