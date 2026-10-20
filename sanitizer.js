// MsgSentinel filtering core. Works in the browser (window.MsgSentinel) and in Node (module.exports).
(function (root) {
    'use strict';

    // Word lists per category. Matching is whole-word and case-insensitive.
    const filterLists = {
        profanity: [
            'ass', 'arse', 'asshole', 'arsehole', 'bitch', 'bitchy', 'bitching', 'bastard',
            'bollocks', 'bullshit', 'blowjob', 'blowjobs', 'blow job', 'blow jobs', 'blow me'
        ],
        threats: [
            'kill', 'harm', 'hurt', 'attack', 'beat', 'fight', 'stab', 'shoot', 'bomb', 'murder',
            'threat', 'threaten', 'threatening', 'violent', 'violence',
            'rape', 'raping', 'raped', 'rapist', 'abuse', 'abusing', 'abused', 'abuser',
            'harass', 'harassing', 'harassed', 'harassment', 'stalk', 'stalked', 'stalker', 'stalking',
            'revenge', 'dox', 'doxx', 'doxing', 'doxxing', 'doxed', 'doxxed',
            'swat', 'swatting', 'swatted', 'swatter'
        ],
        personalAttacks: [
            'idiot', 'moron', 'stupid', 'dumb', 'retard', 'retarded', 'ugly', 'fat', 'useless',
            'worthless', 'failure', 'loser', 'hate you', 'i hate you', 'i hope you die',
            'i wish you were dead', 'kill yourself', 'go die', 'you should die',
            "you're a waste", "you're pathetic", "you're worthless", "you're useless",
            "you're a loser", "you're a failure", "you're a mistake", "you're garbage",
            "you're trash", "you're a waste of space", "you're a waste of oxygen",
            "you're a waste of time", "you're a waste of life", "you're a waste of skin",
            "you're a waste of air", "you're a waste of breath"
        ]
    };

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Longest phrases first so "i hate you" wins over "hate you".
    function buildRegex(words) {
        const unique = [...new Set(words.map(w => w.toLowerCase()))]
            .sort((a, b) => b.length - a.length)
            .map(w => escapeRegExp(w).replace(/ /g, '\\s+'));
        return new RegExp(`\\b(?:${unique.join('|')})\\b`, 'gi');
    }

    // Find [start, end) ranges of filtered text, merging overlaps across categories.
    function findMatches(text, categories) {
        const ranges = [];
        categories.forEach(category => {
            const words = filterLists[category];
            if (!words) return;
            const regex = buildRegex(words);
            let m;
            while ((m = regex.exec(text)) !== null) {
                ranges.push([m.index, m.index + m[0].length]);
            }
        });
        ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
        const merged = [];
        ranges.forEach(r => {
            const last = merged[merged.length - 1];
            if (last && r[0] < last[1]) {
                last[1] = Math.max(last[1], r[1]);
            } else {
                merged.push([r[0], r[1]]);
            }
        });
        return merged;
    }

    // Sanitize text. Returns the masked plain text, a safe HTML rendering, and the match count.
    function sanitize(text, categories) {
        const input = String(text);
        const matches = findMatches(input, categories);
        let plain = '';
        let html = '';
        let pos = 0;
        matches.forEach(([start, end]) => {
            const before = input.slice(pos, start);
            const mask = input.slice(start, end).replace(/\S/g, '*');
            plain += before + mask;
            html += escapeHtml(before) + `<span class="filtered-word" title="Filtered">${mask}</span>`;
            pos = end;
        });
        plain += input.slice(pos);
        html += escapeHtml(input.slice(pos));
        return { text: plain, html, count: matches.length };
    }

    const api = { filterLists, escapeHtml, findMatches, sanitize };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        root.MsgSentinel = api;
    }
})(typeof window !== 'undefined' ? window : this);
