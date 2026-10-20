# MsgSentinel

A privacy-focused message sanitization tool that masks harmful content in messages. Everything runs locally in your browser.

## Features

- **Message sanitization**: harmful words and phrases are masked (`*****`) and highlighted
- **Filter categories** (toggle each in Settings):
  - Profanity
  - Threats
  - Personal attacks
- **Privacy first**: all processing happens in your browser; nothing is sent anywhere
- **Optional history**: off by default; when enabled, only the masked text is stored in this browser's localStorage
- **Neon Bauhaus Noir design system**: stark black and graphite base, neon lime accent (`#00FF00`), geometric typography, dark theme

## Usage

1. Paste your message into the input box
2. Click **Sanitize Message**
3. Review the result; filtered words are masked and highlighted
4. Click **Copy** to copy the masked text
5. Use the **History** tab to revisit past sanitizations (if enabled)
6. Toggle filter categories and history in the **Settings** tab

## Development

### Project Structure

```
msgsentinel/
├── msgsentinel.html      # Sanitizer app
├── sanitizer.js          # Filtering core (word lists, masking, HTML escaping)
├── index.html            # Design system showcase
├── theme-preview.html    # Design system preview
├── daniel-aesthetic.css  # Design system styles
└── tests/                # Unit tests for sanitizer.js
```

### Running locally

No build step. Open `msgsentinel.html` in a browser.

### Tests

Requires Node.js 18+:

```bash
npm test
```

Tests run in CI on every pull request.

## License

MIT. See [LICENSE](LICENSE).

## Acknowledgments

- Built with vanilla JavaScript, HTML, and CSS
- [Inter](https://rsms.me/inter/) font by Rasmus Andersson
- Icons from [Font Awesome](https://fontawesome.com/)
