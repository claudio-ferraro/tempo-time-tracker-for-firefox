# Tempo Time Tracker for Firefox

A Firefox extension to track time and log work to Tempo Timesheets directly from your browser.

## Features

- 🕐 **Track time** from any webpage with a floating overlay
- 🔍 **Search issues** - Find Jira issues by key, URL, or text search
- ⏱️ **Multiple timers** - Run multiple trackers simultaneously
- 🔄 **Sync across tabs** - Trackers stay in sync across all browser tabs
- 💾 **Persistent storage** - Timers continue even after closing the browser
- 🔐 **Secure OAuth 2.0** - Sign in with your Atlassian account using PKCE

## Installation

### From Firefox Add-ons (Recommended)

1. Visit the [Firefox Add-ons page](https://addons.mozilla.org/firefox/addon/tempo-time-tracker/)
2. Click "Add to Firefox"
3. Sign in with your Atlassian account

### Development Installation

1. Clone this repository
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" → "Load Temporary Add-on"
4. Select `manifest.json` from the project folder

## Usage

1. **Sign in** - Click the extension icon and sign in with Atlassian
2. **Start tracking** - Click "Start Tracking" on the floating overlay (bottom-right)
3. **Select issue** - Click on the issue field to search for Jira issues
4. **Log time** - When done, click "Log Time" to save to Tempo

## Development

```bash
# Install dependencies
yarn install

# Run with auto-reload
npx web-ext run --verbose

# Build for production
npx web-ext build --overwrite-dest
```

## Project Structure

```
tempo-time-tracker/
├── assets/           # Extension icons
├── docs/             # GitHub Pages (website + OAuth callback)
├── src/
│   ├── background.js # OAuth & tracker engine
│   ├── overlay.js    # Floating tracker UI
│   ├── popup.html/js/css # Extension popup
├── manifest.json
└── package.json
```

## Privacy

- ✅ Uses OAuth 2.0 with PKCE for secure authentication
- ✅ Stores tokens locally in your browser only
- ✅ Does not collect or transmit personal data
- ✅ Open source - audit the code yourself

## License

MIT License - see [LICENSE](LICENSE) for details.
