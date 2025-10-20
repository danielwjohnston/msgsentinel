/**
 * MsgSentinel - Privacy-focused message sanitization tool
 * All processing happens locally in the browser
 */

// Configuration constants
const CONFIG = {
    MAX_HISTORY_ITEMS: 50,
    MAX_MESSAGE_LENGTH: 10000,
    PREVIEW_LENGTH: 100,
    AVERAGE_WORD_LENGTH: 5,
    COPY_SUCCESS_DURATION: 2000
};

// Enhanced word lists for filtering - cleaned and organized
const filterLists = {
    profanity: [
        'ass', 'arse', 'asshole', 'arsehole',
        'bitch', 'bastard', 'bollocks', 'bullshit',
        'bitchy', 'bitching'
    ],
    threats: [
        'kill', 'harm', 'hurt', 'attack', 'beat', 'fight',
        'stab', 'shoot', 'bomb', 'murder', 'threat', 'threaten',
        'threatening', 'violent', 'violence', 'rape', 'raping',
        'raped', 'rapist', 'abuse', 'abusing', 'abused', 'abuser',
        'harass', 'harassing', 'harassed', 'harassment',
        'stalking', 'stalker', 'stalk', 'stalked'
    ],
    personalAttacks: [
        'idiot', 'moron', 'stupid', 'dumb', 'retard', 'retarded',
        'ugly', 'fat', 'useless', 'worthless', 'failure', 'loser',
        'hate you', 'i hate you', 'i hope you die', 'i wish you were dead',
        'kill yourself', 'go die', 'you should die',
        "you're a waste", "you're pathetic", "you're worthless",
        "you're useless", "you're a loser", "you're a failure",
        "you're a mistake", "you're garbage", "you're trash"
    ]
};

// Pre-compiled regex patterns for better performance
const compiledFilters = {
    profanity: null,
    threats: null,
    personalAttacks: null
};

/**
 * Builds a regex pattern from an array of words
 * @param {string[]} words - Array of words to filter
 * @returns {RegExp} Compiled regular expression
 */
function buildFilterRegex(words) {
    const escapedWords = words.map(word =>
        word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    return new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');
}

// Initialize compiled filters
function initializeFilters() {
    compiledFilters.profanity = buildFilterRegex(filterLists.profanity);
    compiledFilters.threats = buildFilterRegex(filterLists.threats);
    compiledFilters.personalAttacks = buildFilterRegex(filterLists.personalAttacks);
}

// DOM Elements
let tabs, tabContents, inputMessage, resultElement, sanitizeBtn, copyBtn, clearBtn;
let clearHistoryBtn, historyList, filteredCountElement, safetyLevelElement;
let profanityFilter, threatFilter, personalAttackFilter, saveHistory;

/**
 * Safely creates a DOM element with text content
 * @param {string} tag - HTML tag name
 * @param {string} text - Text content
 * @param {string} className - CSS class name
 * @returns {HTMLElement} Created element
 */
function createSafeElement(tag, text, className = '') {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) {
        element.className = className;
    }
    return element;
}

/**
 * Safely sets HTML content by creating elements programmatically
 * @param {HTMLElement} container - Container element
 * @param {string} text - Text content
 * @param {boolean} isFiltered - Whether text contains filtered content
 */
function setSafeContent(container, text, isFiltered = false) {
    container.innerHTML = ''; // Clear existing content

    if (isFiltered) {
        // Parse the filtered text and create safe elements
        const tempDiv = document.createElement('div');
        const parts = text.split(/(<span class="filtered-word".*?<\/span>)/gi);

        parts.forEach(part => {
            if (part.startsWith('<span class="filtered-word"')) {
                // Extract the text content from the span
                const textMatch = part.match(/>([^<]+)</);
                if (textMatch) {
                    const span = document.createElement('span');
                    span.className = 'filtered-word';
                    span.style.cssText = 'background: rgba(255, 0, 0, 0.2); color: var(--danger); padding: 0 2px; border-radius: 3px; text-decoration: line-through;';
                    span.title = 'Filtered word';

                    const innerSpan = document.createElement('span');
                    innerSpan.style.opacity = '0.5';
                    innerSpan.textContent = textMatch[1];

                    span.appendChild(innerSpan);
                    container.appendChild(span);
                }
            } else if (part.trim()) {
                // Regular text - handle line breaks
                const lines = part.split('<br>');
                lines.forEach((line, index) => {
                    if (line.startsWith('</p><p>')) {
                        line = line.replace('</p><p>', '');
                        const p = document.createElement('p');
                        p.textContent = line;
                        container.appendChild(p);
                    } else {
                        const textNode = document.createTextNode(line);
                        container.appendChild(textNode);
                        if (index < lines.length - 1) {
                            container.appendChild(document.createElement('br'));
                        }
                    }
                });
            }
        });
    } else {
        // Simple text content
        const p = document.createElement('p');
        p.textContent = text;
        container.appendChild(p);
    }
}

/**
 * Initializes the application
 */
function init() {
    try {
        // Initialize DOM elements
        tabs = document.querySelectorAll('.tab');
        tabContents = document.querySelectorAll('.tab-content');
        inputMessage = document.getElementById('inputMessage');
        resultElement = document.getElementById('result');
        sanitizeBtn = document.getElementById('sanitizeBtn');
        copyBtn = document.getElementById('copyBtn');
        clearBtn = document.getElementById('clearBtn');
        clearHistoryBtn = document.getElementById('clearHistoryBtn');
        historyList = document.getElementById('historyList');
        filteredCountElement = document.getElementById('filteredCount');
        safetyLevelElement = document.getElementById('safetyLevel');
        profanityFilter = document.getElementById('profanityFilter');
        threatFilter = document.getElementById('threatFilter');
        personalAttackFilter = document.getElementById('personalAttackFilter');
        saveHistory = document.getElementById('saveHistory');

        // Initialize filters
        initializeFilters();

        // Load settings
        loadSettings();

        // Load history
        renderHistory();

        // Set up event listeners
        tabs.forEach(tab => {
            tab.addEventListener('click', switchTab);
        });

        sanitizeBtn.addEventListener('click', sanitizeMessage);
        copyBtn.addEventListener('click', copyToClipboard);
        clearBtn.addEventListener('click', clearMessage);
        clearHistoryBtn.addEventListener('click', clearHistory);

        // Settings change listeners
        profanityFilter.addEventListener('change', saveSettings);
        threatFilter.addEventListener('change', saveSettings);
        personalAttackFilter.addEventListener('change', saveSettings);
        saveHistory.addEventListener('change', saveSettings);

        // Keyboard support - Enter to sanitize
        inputMessage.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                sanitizeMessage();
            }
        });

        console.log('MsgSentinel initialized successfully');
    } catch (error) {
        console.error('Failed to initialize MsgSentinel:', error);
        showError('Failed to initialize application. Please refresh the page.');
    }
}

/**
 * Switches between tabs
 * @param {Event} e - Click event
 */
function switchTab(e) {
    const tab = e.target.closest('.tab');
    if (!tab) return;

    // Update active tab
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Show corresponding content
    const tabId = tab.getAttribute('data-tab');
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}-tab`);
    });

    // Update ARIA attributes
    tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
    tab.setAttribute('aria-selected', 'true');
}

/**
 * Validates message input
 * @param {string} input - Message to validate
 * @returns {Object} Validation result with valid flag and error message
 */
function validateInput(input) {
    if (!input || input.trim() === '') {
        return { valid: false, error: 'Please enter a message to sanitize.' };
    }

    if (input.length > CONFIG.MAX_MESSAGE_LENGTH) {
        return {
            valid: false,
            error: `Message is too long. Maximum ${CONFIG.MAX_MESSAGE_LENGTH} characters allowed.`
        };
    }

    return { valid: true };
}

/**
 * Sanitizes the message by applying enabled filters
 */
function sanitizeMessage() {
    const input = inputMessage.value.trim();

    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
        showEmptyState(validation.error);
        return;
    }

    let sanitized = input;
    let filteredWords = 0;

    try {
        // Apply filters based on settings
        if (profanityFilter.checked) {
            const result = applyFilter(sanitized, compiledFilters.profanity);
            sanitized = result.text;
            filteredWords += result.count;
        }

        if (threatFilter.checked) {
            const result = applyFilter(sanitized, compiledFilters.threats);
            sanitized = result.text;
            filteredWords += result.count;
        }

        if (personalAttackFilter.checked) {
            const result = applyFilter(sanitized, compiledFilters.personalAttacks);
            sanitized = result.text;
            filteredWords += result.count;
        }

        // Update UI
        filteredCountElement.textContent = `${filteredWords} word${filteredWords !== 1 ? 's' : ''} filtered`;
        updateSafetyLevel(filteredWords, input.length);

        // Format the output
        if (sanitized.trim() === '') {
            showEmptyState('This message was filtered out as it contained harmful content.');
        } else {
            // Preserve line breaks and formatting
            const formattedMessage = sanitized
                .replace(/\n\s*\n/g, '</p><p>')
                .replace(/\n/g, '<br>');

            // Use safe content setting
            const wrapper = document.createElement('div');
            setSafeContent(wrapper, formattedMessage, filteredWords > 0);
            resultElement.innerHTML = '';
            resultElement.appendChild(wrapper.firstChild || wrapper);
        }

        // Save to history if enabled
        if (saveHistory.checked && filteredWords > 0) {
            saveToHistory(input, sanitized, filteredWords);
        }
    } catch (error) {
        console.error('Error during sanitization:', error);
        showError('An error occurred while sanitizing the message. Please try again.');
    }
}

/**
 * Applies a filter to the text
 * @param {string} text - Text to filter
 * @param {RegExp} regex - Compiled regex pattern
 * @returns {Object} Result with filtered text and count
 */
function applyFilter(text, regex) {
    let filteredText = text;
    let count = 0;

    const matches = filteredText.match(regex) || [];
    count = matches.length;

    filteredText = filteredText.replace(regex, match => {
        return `<span class="filtered-word">${match}</span>`;
    });

    return { text: filteredText, count };
}

/**
 * Updates the safety level indicator based on filtered content
 * @param {number} filteredCount - Number of filtered words
 * @param {number} inputLength - Length of input text
 */
function updateSafetyLevel(filteredCount, inputLength) {
    const ratio = filteredCount / (inputLength / CONFIG.AVERAGE_WORD_LENGTH);

    // Clear existing content
    safetyLevelElement.textContent = 'Safety: ';

    let statusSpan = document.createElement('span');

    if (filteredCount === 0) {
        statusSpan.className = 'text-success';
        statusSpan.textContent = 'Safe';
    } else if (ratio < 0.1) {
        statusSpan.className = 'text-success';
        statusSpan.textContent = 'Mostly Safe';
    } else if (ratio < 0.3) {
        statusSpan.className = 'text-warning';
        statusSpan.textContent = 'Caution';
    } else {
        statusSpan.className = 'text-danger';
        statusSpan.textContent = 'Warning';
    }

    safetyLevelElement.appendChild(statusSpan);
}

/**
 * Shows an empty state message
 * @param {string} message - Message to display
 */
function showEmptyState(message) {
    resultElement.innerHTML = '';
    const p = createSafeElement('p', message, 'text-muted');
    resultElement.appendChild(p);
}

/**
 * Shows an error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    resultElement.innerHTML = '';
    const p = createSafeElement('p', message, 'text-danger');
    resultElement.appendChild(p);
}

/**
 * Clears the input and output
 */
function clearMessage() {
    inputMessage.value = '';
    showEmptyState('Your sanitized message will appear here...');
    filteredCountElement.textContent = '0 words filtered';

    safetyLevelElement.textContent = 'Safety: ';
    const statusSpan = document.createElement('span');
    statusSpan.className = 'text-success';
    statusSpan.textContent = 'Safe';
    safetyLevelElement.appendChild(statusSpan);
}

/**
 * Copies sanitized message to clipboard
 */
async function copyToClipboard() {
    const resultText = resultElement.textContent.trim();

    if (!resultText || resultText.includes('Your sanitized message will appear here')) {
        alert('No sanitized message to copy!');
        return;
    }

    try {
        if (!navigator.clipboard) {
            // Fallback for browsers without Clipboard API
            fallbackCopyToClipboard(resultText);
            return;
        }

        await navigator.clipboard.writeText(resultText);

        // Show success feedback
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.disabled = true;

        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.disabled = false;
        }, CONFIG.COPY_SUCCESS_DURATION);
    } catch (err) {
        console.error('Failed to copy text:', err);
        alert('Failed to copy text. Please select and copy manually.');
    }
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        alert('Copied to clipboard!');
    } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Failed to copy. Please copy manually.');
    }

    document.body.removeChild(textArea);
}

/**
 * Saves a message to history
 * @param {string} original - Original message
 * @param {string} sanitized - Sanitized message
 * @param {number} filteredCount - Number of filtered words
 */
function saveToHistory(original, sanitized, filteredCount) {
    try {
        const history = getHistory();
        const now = new Date();

        const historyItem = {
            id: Date.now(),
            original: original.substring(0, CONFIG.MAX_MESSAGE_LENGTH),
            sanitized: sanitized.substring(0, CONFIG.MAX_MESSAGE_LENGTH),
            filteredCount,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            timestamp: now.getTime()
        };

        // Add to beginning of array (most recent first)
        history.unshift(historyItem);

        // Keep only the last MAX_HISTORY_ITEMS items
        if (history.length > CONFIG.MAX_HISTORY_ITEMS) {
            history.splice(CONFIG.MAX_HISTORY_ITEMS);
        }

        localStorage.setItem('messageHistory', JSON.stringify(history));
        renderHistory();
    } catch (error) {
        console.error('Failed to save to history:', error);
        if (error.name === 'QuotaExceededError') {
            showError('Storage quota exceeded. Unable to save to history.');
        }
    }
}

/**
 * Retrieves history from localStorage with error handling
 * @returns {Array} History array
 */
function getHistory() {
    try {
        const data = localStorage.getItem('messageHistory');
        if (!data) return [];

        const history = JSON.parse(data);

        // Validate structure
        if (!Array.isArray(history)) {
            console.warn('Invalid history data structure, resetting...');
            return [];
        }

        return history;
    } catch (error) {
        console.error('Failed to load history:', error);
        return [];
    }
}

/**
 * Renders the message history
 */
function renderHistory() {
    try {
        const history = getHistory();

        if (history.length === 0) {
            historyList.innerHTML = '';
            const p = createSafeElement('p', 'Your sanitization history will appear here.', 'text-muted');
            historyList.appendChild(p);
            return;
        }

        historyList.innerHTML = '';

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.setAttribute('data-id', item.id);
            historyItem.setAttribute('role', 'button');
            historyItem.setAttribute('tabindex', '0');

            const preview = item.sanitized.substring(0, CONFIG.PREVIEW_LENGTH);
            const displayText = item.sanitized.length > CONFIG.PREVIEW_LENGTH
                ? preview + '...'
                : preview;

            const p = createSafeElement('p', displayText);
            historyItem.appendChild(p);

            const timeDiv = document.createElement('div');
            timeDiv.className = 'history-time';
            timeDiv.textContent = `${item.date} at ${item.time} • ${item.filteredCount} filtered item${item.filteredCount !== 1 ? 's' : ''}`;
            historyItem.appendChild(timeDiv);

            // Click handler
            historyItem.addEventListener('click', () => loadHistoryItem(item.id));

            // Keyboard support
            historyItem.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    loadHistoryItem(item.id);
                }
            });

            historyList.appendChild(historyItem);
        });
    } catch (error) {
        console.error('Failed to render history:', error);
        showError('Failed to load history.');
    }
}

/**
 * Loads a specific history item
 * @param {number} id - History item ID
 */
function loadHistoryItem(id) {
    try {
        const history = getHistory();
        const historyItem = history.find(h => h.id === id);

        if (!historyItem) {
            showError('History item not found.');
            return;
        }

        // Switch to sanitize tab
        const sanitizeTab = document.querySelector('.tab[data-tab="sanitize"]');
        if (sanitizeTab) {
            sanitizeTab.click();
        }

        // Fill in the input and show the result
        inputMessage.value = historyItem.original;

        // Display sanitized result safely
        resultElement.innerHTML = '';
        const p = createSafeElement('p', historyItem.sanitized);
        resultElement.appendChild(p);

        filteredCountElement.textContent = `${historyItem.filteredCount} word${historyItem.filteredCount !== 1 ? 's' : ''} filtered`;
        updateSafetyLevel(historyItem.filteredCount, historyItem.original.length);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Failed to load history item:', error);
        showError('Failed to load history item.');
    }
}

/**
 * Clears all message history
 */
function clearHistory() {
    if (confirm('Are you sure you want to clear your history? This cannot be undone.')) {
        try {
            localStorage.removeItem('messageHistory');
            renderHistory();
        } catch (error) {
            console.error('Failed to clear history:', error);
            alert('Failed to clear history. Please try again.');
        }
    }
}

/**
 * Saves settings to localStorage
 */
function saveSettings() {
    try {
        const settings = {
            profanityFilter: profanityFilter.checked,
            threatFilter: threatFilter.checked,
            personalAttackFilter: personalAttackFilter.checked,
            saveHistory: saveHistory.checked
        };

        localStorage.setItem('msgSentinelSettings', JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to save settings:', error);
        if (error.name === 'QuotaExceededError') {
            alert('Storage quota exceeded. Unable to save settings.');
        }
    }
}

/**
 * Loads settings from localStorage
 */
function loadSettings() {
    try {
        const data = localStorage.getItem('msgSentinelSettings');
        if (!data) return;

        const settings = JSON.parse(data);

        // Apply saved settings or use defaults
        if (typeof settings.profanityFilter === 'boolean') {
            profanityFilter.checked = settings.profanityFilter;
        }
        if (typeof settings.threatFilter === 'boolean') {
            threatFilter.checked = settings.threatFilter;
        }
        if (typeof settings.personalAttackFilter === 'boolean') {
            personalAttackFilter.checked = settings.personalAttackFilter;
        }
        if (typeof settings.saveHistory === 'boolean') {
            saveHistory.checked = settings.saveHistory;
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
        // Use default settings on error
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
