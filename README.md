# MsgSentinel

A privacy-focused message sanitization tool that helps filter harmful content from messages. Built with vanilla JavaScript, ES6 modules, and a focus on security and privacy.

![Privacy First](https://img.shields.io/badge/privacy-first-green)
![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-blue)
![ES6 Modules](https://img.shields.io/badge/ES6-modules-yellow)

## ✨ Features

- **Real-time Message Sanitization**: Filters harmful content while preserving message meaning
- **Three Filter Categories**:
  - Profanity filtering
  - Threat detection
  - Personal attack prevention
- **Obfuscation Handling**: Detects common bypass techniques (l33t speak, spacing, character substitution)
- **Privacy-First Architecture**:
  - All processing happens locally in your browser
  - Encrypted storage using Web Crypto API
  - Original harmful messages are NEVER stored (only sanitized versions)
  - Zero tracking, no analytics, no servers
- **Secure by Design**:
  - Strict Content Security Policy (no unsafe-inline)
  - DOM-based rendering (no innerHTML parsing)
  - XSS protection through safe DOM manipulation
  - Encrypted localStorage for sensitive data
- **Fully Accessible**: WCAG compliant with ARIA labels and full keyboard navigation
- **Modular Architecture**: ES6 modules for maintainability and testability

## 🔒 Security Features

### What We Got Right

✅ **No HTML Parsing**: Uses DocumentFragment and DOM nodes instead of innerHTML
✅ **Strict CSP**: No unsafe-inline allowed
✅ **Web Crypto Encryption**: History data encrypted using AES-GCM
✅ **No Original Storage**: Harmful content is never saved
✅ **SRI Hashes**: CDN resources verified with Subresource Integrity
✅ **Input Validation**: Length limits and sanitization
✅ **Comprehensive Error Handling**: All localStorage operations protected

### Known Limitations

⚠️ **Filter Bypass**: Determined users can still bypass filters with creative obfuscation
⚠️ **Encryption Strength**: Uses browser fingerprint for key derivation (better than nothing, not perfect)
⚠️ **Context Awareness**: Limited understanding of context (some false positives/negatives)

This tool provides **reasonable protection** for casual use, not military-grade security.

## 🚀 Getting Started

### Prerequisites

- Modern web browser with ES6 module support:
  - Chrome 61+
  - Firefox 60+
  - Safari 11+
  - Edge 79+
- JavaScript enabled
- Internet connection for initial load (CDN resources)

### Installation

#### Option 1: Clone and Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/msgsentinel.git
cd msgsentinel

# Serve with a local server (required for ES6 modules)
python3 -m http.server 8000
# or
npx serve

# Open in browser
open http://localhost:8000/index-secure.html
```

⚠️ **Important**: Due to ES6 modules, you MUST use a web server. Opening the HTML file directly (`file://`) will not work.

#### Option 2: Deploy to Hosting

Upload to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

### Usage

1. **Sanitize Messages**
   - Paste message in input box
   - Click "Sanitize Message" or press `Ctrl+Enter` (⌘+Enter on Mac)
   - View sanitized result with filtered words shown as `a***k`
   - Use "Copy" button to copy cleaned text

2. **View History**
   - Click "History" tab to see past sanitizations
   - Click any item to view it
   - Note: Only SANITIZED content is stored, never original harmful messages

3. **Customize Filters**
   - Navigate to "Settings" tab
   - Toggle filter categories on/off
   - Enable/disable encrypted history storage
   - Clear all history with one click

## 📁 Project Structure

```
msgsentinel/
├── index-secure.html        # Main app (strict CSP, no inline styles)
├── msgsentinel.html         # Legacy version (compatibility)
├── daniel-aesthetic.css     # Design system
├── msgsentinel.css         # App-specific styles
├── src/                    # ES6 modules
│   ├── app.js             # Main application
│   ├── filters/
│   │   ├── sanitizer.js   # Core sanitization engine
│   │   └── patterns.js    # Filter patterns & obfuscation
│   ├── utils/
│   │   └── storage.js     # Encrypted localStorage wrapper
│   └── ui/
│       └── display.js     # Safe DOM manipulation
├── tests/
│   └── filters.test.html  # Basic test suite
└── README.md
```

## 🧪 Testing

Open `tests/filters.test.html` in a browser to run the test suite:

```bash
# With local server running
open http://localhost:8000/tests/filters.test.html
```

**Current Test Coverage**: ~70% of core filtering logic

### What's Tested

✅ Basic filtering
✅ Obfuscation handling
✅ Safety level calculation
✅ Filter settings
✅ DOM creation security

### What's NOT Tested

❌ Full browser compatibility
❌ Screen reader accessibility
❌ Performance under load
❌ Storage quota handling
❌ Encryption/decryption edge cases

## 🎨 Design System

"Neon Bauhaus Noir" - A custom design system featuring:
- Deep black backgrounds (`#0b0b0b`)
- Neon lime accent (`#00FF00`)
- High contrast for readability
- Geometric Bauhaus-inspired elements
- Fully responsive layout

## ⚡ Performance

- **Lightweight**: ~60KB total (uncompressed)
- **Fast**: Pre-compiled regex patterns
- **Efficient**: Minimal DOM manipulation
- **No Build Step**: Pure ES6 modules

## 🔐 Privacy & Data

### What Gets Stored Locally

| Data | Encrypted | Retention |
|------|-----------|-----------|
| Filter settings | No | Until cleared |
| Sanitized history (50 items max) | Yes (AES-GCM) | Until cleared |
| Original messages | **NEVER** | N/A |

### What Gets Sent to Servers

**Nothing.** All processing is 100% local.

### How to Clear Your Data

1. Click "Clear History" in Settings tab
2. Or clear browser localStorage for the domain
3. Or use browser's "Clear Site Data" feature

## 🛠️ Development

### Making Changes

1. Edit source files in `src/`
2. Refresh browser to see changes
3. No build step required

### Code Architecture

- **Modular**: ES6 modules for separation of concerns
- **Documented**: JSDoc comments on all functions
- **Type-Safe**: Explicit parameter validation
- **Error-Handled**: Try-catch blocks on all risky operations

### Adding New Filters

Edit `src/filters/patterns.js`:

```javascript
export const profanityList = [
    'word1', 'word2', 'word3'
];
```

Patterns automatically handle obfuscation.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

### Areas Needing Help

- [ ] More comprehensive test coverage
- [ ] Better obfuscation detection
- [ ] Internationalization (i18n)
- [ ] Service worker for offline support
- [ ] Browser extension version
- [ ] Accessibility audit with real screen readers

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- **Design**: Custom "Neon Bauhaus Noir" design system
- **Typography**: [Inter](https://rsms.me/inter/) by Rasmus Andersson
- **Icons**: [Font Awesome](https://fontawesome.com/) 6.5.1
- **Inspiration**: Privacy-focused tools and ethical design

## ⚠️ Disclaimer

**This tool is not perfect.** It provides reasonable filtering for casual use but should not be relied upon for:
- Automated content moderation at scale
- Legal compliance
- Protection against determined bad actors
- Child safety (adult supervision recommended)

Use at your own discretion. The developers assume no liability for bypassed filters or false positives.

## 📊 Changelog

### Version 2.0.0 (Current)

**Major Security & Architecture Overhaul**

- ✅ Completely redesigned to eliminate XSS vulnerabilities
- ✅ Strict CSP (no unsafe-inline)
- ✅ ES6 modular architecture
- ✅ Web Crypto API encryption for storage
- ✅ DOM-based rendering (no innerHTML)
- ✅ Improved obfuscation detection
- ✅ Never stores original harmful content
- ✅ Basic test suite added

### Version 1.0.0 (Legacy)

- ❌ Monolithic JavaScript
- ❌ innerHTML-based rendering
- ❌ No encryption
- ❌ Stored original messages
- ❌ No tests

## 🔗 Links

- [Report Issues](https://github.com/yourusername/msgsentinel/issues)
- [View Source](https://github.com/yourusername/msgsentinel)
- [Security Policy](SECURITY.md)

---

**Made for digital wellbeing** | **Privacy is not optional**
