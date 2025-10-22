/**
 * Filter patterns with obfuscation handling
 * Handles common bypass techniques: l33t speak, special characters, spacing
 */

/**
 * Character substitution map for common obfuscation
 */
const substitutions = {
    'a': '[a@4]',
    'e': '[e3]',
    'i': '[i!1|]',
    'o': '[o0]',
    's': '[s$5]',
    't': '[t7+]',
    'l': '[l1|]',
    'g': '[g9]',
    'b': '[b8]'
};

/**
 * Builds a regex pattern with obfuscation tolerance
 * @param {string} word - Base word to match
 * @returns {string} Regex pattern string
 */
function buildObfuscatedPattern(word) {
    let pattern = '';
    for (let char of word.toLowerCase()) {
        if (substitutions[char]) {
            pattern += substitutions[char];
        } else {
            pattern += char;
        }
        // Allow optional spaces, dots, dashes between characters
        pattern += '[\\s.\\-_]*';
    }
    return pattern;
}

/**
 * Creates comprehensive filter patterns
 * @param {string[]} words - Array of words to filter
 * @returns {RegExp} Compiled regex pattern
 */
export function createFilterPattern(words) {
    const patterns = words.map(word => {
        const obfuscated = buildObfuscatedPattern(word);
        // Match word boundaries, allowing for common separators
        return `(?:^|\\s|[^a-z0-9])(${obfuscated})(?:$|\\s|[^a-z0-9])`;
    });

    return new RegExp(patterns.join('|'), 'gi');
}

/**
 * Normalizes text for matching (removes obfuscation)
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
export function normalizeText(text) {
    return text
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ')    // Normalize whitespace
        .toLowerCase();
}

/**
 * Profanity filter list
 */
export const profanityList = [
    'ass', 'arse', 'asshole', 'arsehole',
    'bitch', 'bastard', 'bollocks', 'bullshit',
    'damn', 'crap', 'piss', 'shit', 'fuck'
];

/**
 * Threat filter list
 */
export const threatsList = [
    'kill', 'harm', 'hurt', 'attack', 'beat', 'fight',
    'stab', 'shoot', 'bomb', 'murder', 'threat', 'threaten',
    'threatening', 'violent', 'violence', 'weapon',
    'rape', 'raping', 'raped', 'rapist',
    'abuse', 'abusing', 'abused', 'abuser',
    'harass', 'harassing', 'harassed', 'harassment',
    'stalking', 'stalker', 'stalk', 'stalked',
    'torture', 'punish', 'revenge', 'destroy'
];

/**
 * Personal attack filter list
 */
export const personalAttacksList = [
    'idiot', 'moron', 'stupid', 'dumb', 'retard', 'retarded',
    'ugly', 'fat', 'useless', 'worthless', 'failure', 'loser',
    'pathetic', 'garbage', 'trash', 'waste',
    'hate you', 'hate u', 'despise',
    'kill yourself', 'kys', 'go die', 'should die'
];

/**
 * Context-aware filtering - some words are only harmful in certain contexts
 */
export const contextPatterns = {
    // Patterns that need context checking
    conditional: [
        { pattern: /\b(kill|beat|destroy)\s+(you|yourself|them)\b/gi, harmful: true },
        { pattern: /\bwish\s+you\s+(were\s+)?dead\b/gi, harmful: true },
        { pattern: /\bhope\s+you\s+(die|get\s+hurt)\b/gi, harmful: true }
    ]
};

/**
 * Checks if a match is in a harmful context
 * @param {string} text - Full text
 * @param {number} matchIndex - Index of match
 * @param {number} matchLength - Length of match
 * @returns {boolean} Whether the match is harmful in context
 */
export function isHarmfulInContext(text, matchIndex, matchLength) {
    // Get surrounding context (50 chars before and after)
    const start = Math.max(0, matchIndex - 50);
    const end = Math.min(text.length, matchIndex + matchLength + 50);
    const context = text.substring(start, end);

    // Check conditional patterns
    for (const { pattern, harmful } of contextPatterns.conditional) {
        if (pattern.test(context)) {
            return harmful;
        }
    }

    return true; // Default to harmful if no context pattern matches
}
