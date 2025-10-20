# MsgSentinel

A modern, privacy-focused message sanitization tool that helps protect you from harmful content in messages. Built with a clean, accessible interface and designed with security in mind.

![MsgSentinel](https://img.shields.io/badge/privacy-first-green)
![No Dependencies](https://img.shields.io/badge/dependencies-none-blue)
![Vanilla JS](https://img.shields.io/badge/vanilla-js-yellow)

## Features

- **Real-time Message Sanitization**: Instantly filter out harmful content
- **Multiple Filter Categories**:
  - Profanity filtering
  - Threat detection
  - Personal attack prevention
- **Privacy First**: All processing happens locally in your browser - no data sent to servers
- **Message History**: View your sanitization history (stored locally, optional)
- **Modern UI**: Clean, accessible interface with Neon Bauhaus Noir design system
- **Fully Accessible**: WCAG compliant with ARIA labels and keyboard navigation
- **Secure by Design**: Content Security Policy, XSS protection, and SRI hashes
- **No Build Required**: Pure vanilla JavaScript - just open and use

## Design System

MsgSentinel uses a custom "Neon Bauhaus Noir" design system featuring:
- Stark black and graphite base colors (#0b0b0b to #1e1e1e)
- Neon lime green accent (#00FF00)
- Bauhaus-inspired geometric elements
- High contrast typography for optimal readability
- Subtle glows and shadows for depth
- Responsive layout that works on all devices
- Dark theme optimized for long reading sessions

## Getting Started

### Prerequisites

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Internet connection (for initial page load and CDN resources)

### Installation

#### Option 1: Clone and Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/msgsentinel.git

# Navigate to the directory
cd msgsentinel

# Open in browser (no build step required!)
open msgsentinel.html
# or on Linux:
xdg-open msgsentinel.html
```

#### Option 2: Use a Local Server

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Then open http://localhost:8000/msgsentinel.html
```

#### Option 3: Live Demo

Visit [msgsentinel.app](https://msgsentinel.app) to try it instantly.

## Usage

1. **Sanitize Messages**
   - Paste your message in the input box
   - Click **Sanitize Message** or press `Ctrl+Enter` (⌘+Enter on Mac)
   - View the sanitized result with filtered words highlighted
   - Use the **Copy** button to copy the cleaned text

2. **View History**
   - Click the **History** tab to see past sanitizations
   - Click any history item to reload it
   - Maximum 50 items stored locally

3. **Customize Filters**
   - Navigate to the **Settings** tab
   - Toggle individual filter categories on/off:
     - Profanity Filter
     - Threat Filter
     - Personal Attack Filter
   - Enable/disable message history storage
   - Clear all history with one click

## Project Structure

```
msgsentinel/
├── msgsentinel.html          # Main application HTML
├── msgsentinel.js            # Application logic and sanitization engine
├── msgsentinel.css           # Application-specific styles
├── daniel-aesthetic.css      # Design system stylesheet
├── README.md                 # This file
├── theme-preview.html        # Theme toggle demo
├── index.html               # Design system showcase
└── .gitignore               # Git ignore rules
```

## Security Features

- **Content Security Policy (CSP)**: Prevents XSS attacks and unauthorized resource loading
- **Subresource Integrity (SRI)**: Verifies CDN resources haven't been tampered with
- **XSS Protection**: All user input is properly sanitized before display
- **No External Tracking**: Zero analytics, no cookies, no tracking
- **Local Storage Only**: All data stays on your device
- **Error Handling**: Comprehensive error handling for edge cases

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome  | 90+            |
| Firefox | 88+            |
| Safari  | 14+            |
| Edge    | 90+            |
| Opera   | 76+            |

## Development

### No Build Tools Required

This project intentionally uses vanilla JavaScript, HTML, and CSS with no build process. This makes it:
- Easy to understand and modify
- Fast to deploy
- Simple to maintain
- Accessible to beginners

### Making Changes

1. Edit files directly - no compilation needed
2. Refresh browser to see changes
3. Use browser DevTools for debugging

### Code Quality

- **JSDoc comments** for all functions
- **Separation of concerns**: HTML, CSS, and JS in separate files
- **Constants** for configuration values
- **Error handling** throughout
- **Accessibility** built-in, not bolted-on

## Performance

- **Lightweight**: ~15KB total (HTML + CSS + JS, uncompressed)
- **Fast**: Pre-compiled regex patterns for efficient filtering
- **Optimized**: Minimal DOM manipulation
- **Responsive**: Instant feedback on all interactions
- **Offline-capable**: Works without internet after first load (with service worker)

## Privacy & Data

**What data is stored:**
- Sanitized message history (optional, last 50 items)
- User preferences (filter toggles)

**Where it's stored:**
- LocalStorage in your browser only
- Never sent to any server
- Cleared when you clear browser data

**What data is NOT collected:**
- No analytics
- No tracking
- No cookies
- No server-side logging

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Bug Reports

Found a bug? Please open an issue with:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Design**: Custom "Neon Bauhaus Noir" design system inspired by Bauhaus movement
- **Typography**: [Inter](https://rsms.me/inter/) font by Rasmus Andersson
- **Icons**: [Font Awesome](https://fontawesome.com/) 6.5.1
- **Inspiration**: Privacy-focused tools and ethical design principles

## Roadmap

### Planned Features

- [ ] Custom filter word lists (user-defined)
- [ ] Export/import settings and history
- [ ] Multiple language support
- [ ] Service worker for offline functionality
- [ ] Browser extension version
- [ ] Intensity levels for filters (strict, moderate, lenient)
- [ ] Statistics dashboard (words filtered over time)
- [ ] Dark/light theme toggle

### Future Considerations

- TypeScript migration for type safety
- Unit and E2E test suite
- Performance metrics and monitoring
- Internationalization (i18n)

## FAQ

**Q: Is my data sent to a server?**
A: No. All processing happens locally in your browser. Nothing is ever transmitted.

**Q: Can I use this offline?**
A: After the first load, the core functionality works offline. CDN resources (fonts, icons) require internet.

**Q: How do I clear my data?**
A: Use the "Clear History" button in Settings, or clear your browser's localStorage for this domain.

**Q: Can I customize the filter lists?**
A: Not yet - this feature is on the roadmap. Currently, filters are built-in for consistency.

**Q: Is this suitable for children?**
A: MsgSentinel is a tool for filtering content, not a parental control system. Adult supervision is recommended.

---

**Made with care for digital wellbeing** | [Report Issues](https://github.com/yourusername/msgsentinel/issues) | [Documentation](https://docs.msgsentinel.app)
