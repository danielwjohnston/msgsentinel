/**
 * Core sanitization engine
 * Uses DOM nodes instead of HTML string manipulation for security
 */

import {
    createFilterPattern,
    profanityList,
    threatsList,
    personalAttacksList
} from './patterns.js';

export class MessageSanitizer {
    constructor() {
        this.filters = {
            profanity: createFilterPattern(profanityList),
            threats: createFilterPattern(threatsList),
            personalAttacks: createFilterPattern(personalAttacksList)
        };

        this.settings = {
            profanity: true,
            threats: true,
            personalAttacks: true
        };
    }

    /**
     * Updates filter settings
     * @param {Object} settings - Filter settings
     */
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }

    /**
     * Sanitizes text and returns both sanitized text and metadata
     * @param {string} text - Text to sanitize
     * @returns {Object} Sanitization result
     */
    sanitize(text) {
        if (!text || text.trim() === '') {
            return {
                sanitized: '',
                original: text,
                filteredCount: 0,
                filteredWords: [],
                safetyLevel: 'safe'
            };
        }

        let sanitized = text;
        const filteredWords = [];
        const filterMatches = new Map();

        // Apply each enabled filter
        if (this.settings.profanity) {
            const result = this.applyFilter(sanitized, this.filters.profanity, 'profanity');
            sanitized = result.text;
            filteredWords.push(...result.matches);
        }

        if (this.settings.threats) {
            const result = this.applyFilter(sanitized, this.filters.threats, 'threat');
            sanitized = result.text;
            filteredWords.push(...result.matches);
        }

        if (this.settings.personalAttacks) {
            const result = this.applyFilter(sanitized, this.filters.personalAttacks, 'attack');
            sanitized = result.text;
            filteredWords.push(...result.matches);
        }

        const filteredCount = filteredWords.length;
        const safetyLevel = this.calculateSafetyLevel(filteredCount, text.length);

        return {
            sanitized,
            original: text,
            filteredCount,
            filteredWords,
            safetyLevel
        };
    }

    /**
     * Applies a single filter to text
     * @param {string} text - Text to filter
     * @param {RegExp} pattern - Filter pattern
     * @param {string} category - Filter category
     * @returns {Object} Filtered text and matches
     */
    applyFilter(text, pattern, category) {
        const matches = [];
        let result = text;

        // Find all matches first
        const found = text.matchAll(pattern);
        for (const match of found) {
            if (match[0] && match[0].trim()) {
                matches.push({
                    word: match[0].trim(),
                    category,
                    index: match.index
                });
            }
        }

        // Replace with asterisks (length-preserving)
        result = text.replace(pattern, (match) => {
            if (!match.trim()) return match;
            // Preserve first and last character, replace middle with asterisks
            if (match.length <= 3) {
                return '*'.repeat(match.length);
            }
            return match[0] + '*'.repeat(match.length - 2) + match[match.length - 1];
        });

        return { text: result, matches };
    }

    /**
     * Calculates safety level based on filtered content
     * @param {number} filteredCount - Number of filtered words
     * @param {number} textLength - Original text length
     * @returns {string} Safety level
     */
    calculateSafetyLevel(filteredCount, textLength) {
        if (filteredCount === 0) return 'safe';

        const avgWordLength = 5;
        const estimatedWords = textLength / avgWordLength;
        const ratio = filteredCount / estimatedWords;

        if (ratio < 0.05) return 'mostly-safe';
        if (ratio < 0.15) return 'caution';
        return 'warning';
    }

    /**
     * Creates a DOM representation of sanitized text with highlighted filters
     * This is SAFE - no HTML parsing, only DOM node creation
     * @param {string} original - Original text
     * @param {string} sanitized - Sanitized text
     * @param {Array} filteredWords - Array of filtered word objects
     * @returns {DocumentFragment} DOM fragment
     */
    createDOMRepresentation(original, sanitized, filteredWords) {
        const fragment = document.createDocumentFragment();

        if (!filteredWords || filteredWords.length === 0) {
            // No filtering, just return plain text
            const textNode = document.createTextNode(sanitized);
            fragment.appendChild(textNode);
            return fragment;
        }

        // Split by lines first to preserve formatting
        const lines = sanitized.split('\n');

        lines.forEach((line, lineIndex) => {
            if (lineIndex > 0) {
                fragment.appendChild(document.createElement('br'));
            }

            // For each line, create text nodes and highlight filtered words
            // We'll work character by character to avoid any HTML parsing
            const lineFragment = this.highlightLine(line, original);
            fragment.appendChild(lineFragment);
        });

        return fragment;
    }

    /**
     * Highlights filtered words in a line using DOM nodes
     * @param {string} line - Line of text
     * @param {string} original - Original text for comparison
     * @returns {DocumentFragment} DOM fragment with highlights
     */
    highlightLine(line, original) {
        const fragment = document.createDocumentFragment();
        let currentPos = 0;

        // Find asterisk sequences (filtered words)
        const asteriskPattern = /\*+/g;
        const matches = [...line.matchAll(asteriskPattern)];

        if (matches.length === 0) {
            // No filtered words in this line
            fragment.appendChild(document.createTextNode(line));
            return fragment;
        }

        matches.forEach(match => {
            const matchStart = match.index;
            const matchEnd = matchStart + match[0].length;

            // Add text before match
            if (currentPos < matchStart) {
                const beforeText = line.substring(currentPos, matchStart);
                fragment.appendChild(document.createTextNode(beforeText));
            }

            // Create highlighted span for filtered word
            const span = document.createElement('span');
            span.className = 'filtered-word';
            span.setAttribute('data-filtered', 'true');
            span.textContent = match[0];
            fragment.appendChild(span);

            currentPos = matchEnd;
        });

        // Add remaining text
        if (currentPos < line.length) {
            const remainingText = line.substring(currentPos);
            fragment.appendChild(document.createTextNode(remainingText));
        }

        return fragment;
    }
}
