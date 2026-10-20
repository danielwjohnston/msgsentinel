const test = require('node:test');
const assert = require('node:assert');
const { sanitize, escapeHtml, findMatches } = require('../sanitizer.js');

const ALL = ['profanity', 'threats', 'personalAttacks'];

test('masks whole words case-insensitively', () => {
    const r = sanitize('You IDIOT, stop.', ALL);
    assert.strictEqual(r.text, 'You *****, stop.');
    assert.strictEqual(r.count, 1);
});

test('does not match inside other words', () => {
    const r = sanitize('A class assignment on Skilled harmony', ALL);
    assert.strictEqual(r.count, 0);
    assert.strictEqual(r.text, 'A class assignment on Skilled harmony');
});

test('respects enabled categories', () => {
    assert.strictEqual(sanitize('kill it', ['profanity']).count, 0);
    assert.strictEqual(sanitize('kill it', ['threats']).count, 1);
    assert.strictEqual(sanitize('kill it', []).count, 0);
});

test('matches multi-word phrases and prefers the longest', () => {
    const r = sanitize('i hate you so much', ['personalAttacks']);
    assert.strictEqual(r.count, 1);
    assert.strictEqual(r.text, '* **** *** so much');
});

test('overlapping matches across categories count once', () => {
    // "kill yourself" (attack) overlaps "kill" (threat)
    assert.deepStrictEqual(findMatches('kill yourself', ALL), [[0, 13]]);
    assert.strictEqual(sanitize('kill yourself', ALL).count, 1);
});

test('html output escapes user input', () => {
    const r = sanitize('<img src=x onerror=alert(1)> idiot', ALL);
    assert.ok(!r.html.includes('<img'));
    assert.ok(r.html.includes('&lt;img'));
    assert.ok(r.html.includes('<span class="filtered-word" title="Filtered">*****</span>'));
});

test('filter markup is not re-scanned by later categories', () => {
    const r = sanitize('fat attack', ALL);
    assert.strictEqual(r.count, 2);
    assert.strictEqual(r.text, '*** ******');
});

test('escapeHtml covers special characters', () => {
    assert.strictEqual(escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
});
