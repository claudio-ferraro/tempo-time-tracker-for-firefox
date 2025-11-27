# Tempo Time Tracker for Firefox

<p align="center">
  <img src="assets/icon-128.png" alt="Tempo Time Tracker Logo" width="128">
</p>

<p align="center">
  <strong>Track and visualize your progress on Jira issues</strong>
</p>

<p align="center">
  <a href="https://addons.mozilla.org/firefox/addon/tempo-time-tracker-for-firefox/">
    <img src="https://img.shields.io/badge/Firefox%20Add--ons-Install-orange?logo=firefox-browser" alt="Firefox Add-ons">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
</p>

---

Track the duration of your work on Jira issues with real-time browser trackers.

Start a tracker and assign it to a Jira issue, or use it for work outside of Jira:
- Add new trackers and pause or stop them as required
- Use as many trackers as you like when working on multiple issues at once
- Visualize all active trackers across your browser tabs
- Locate trackers easily from the bottom-right of your browser

Time Tracker for Firefox is free and available for all Tempo customers on Jira Cloud.

## ✨ Features

- ⏱️ **Real-time Trackers** - Track time with a floating overlay on every webpage
- 🔍 **Issue Search** - Find Jira issues by key (e.g., "ABC-123"), URL, or text search  
- 📊 **Multiple Timers** - Run as many trackers as you need for parallel tasks
- 🔄 **Cross-Tab Sync** - Trackers stay synchronized across all browser tabs
- 💾 **Persistent Timers** - Timers continue running even after closing Firefox
- 🎯 **Minimal Interface** - Collapses to a small button when not in use
- 🔐 **Secure OAuth 2.0** - Sign in safely with your Atlassian account
- 📖 **Open Source** - Full transparency - audit the code yourself

## 📥 Installation

### From Firefox Add-ons (Recommended)

1. Visit the [Tempo Time Tracker on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tempo-time-tracker-for-firefox/)
2. Click **"Add to Firefox"**
3. Click the extension icon and sign in with your Atlassian account
4. Start tracking your time!

### Manual Installation (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/claudio-ferraro/tempo-time-tracker-for-firefox.git
   cd tempo-time-tracker-for-firefox
   ```

2. Open Firefox and navigate to `about:debugging`
3. Click **"This Firefox"** → **"Load Temporary Add-on"**
4. Select the `manifest.json` file from the project folder

## 🚀 How to Use

### Getting Started
1. **Sign In** - Click the extension icon in your toolbar and sign in with your Atlassian account
2. **Start Tracking** - Click "Start Tracking" on the floating overlay (bottom-right)
3. **Select Issue** - Click the issue field and search for your Jira issue
4. **Track Time** - Use play/pause to control your tracker
5. **Log Work** - Go to the Log Time form on Tempo Timesheets to log your tracked time

### Tips & Tricks
- **Collapse the tracker** by clicking the minimize button (arrow icon)
- **Search by URL** - Paste a Jira issue URL to quickly select it
- **Multiple trackers** - Click the + button to add more trackers for parallel tasks
- **Continue later** - Your timer persists even if you close the browser
- **Add descriptions** - Click on a tracker to expand it and add notes

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Yarn or npm
- Firefox Developer Edition (recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/claudio-ferraro/tempo-time-tracker-for-firefox.git
cd tempo-time-tracker-for-firefox

# Install dependencies
yarn install

# Run with auto-reload (opens Firefox with extension loaded)
npx web-ext run --verbose

# Build for production
npx web-ext build --overwrite-dest
```

### Project Structure

```
tempo-time-tracker-for-firefox/
├── assets/                 # Extension icons (16, 48, 128px)
├── docs/                   # GitHub Pages (landing page + OAuth callback)
│   ├── index.html          # Landing page
│   └── callback/           # OAuth redirect handler
├── src/
│   ├── background.js       # Service worker: OAuth, token management, tracker engine
│   ├── overlay.js          # Content script: floating tracker UI
│   ├── popup.html          # Extension popup HTML
│   ├── popup.js            # Extension popup logic
│   └── popup.css           # Extension popup styles
├── worker/                 # Cloudflare Worker (OAuth proxy)
│   └── src/index.js        # Secure token exchange
├── manifest.json           # Extension manifest
└── package.json
```

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Firefox        │     │  Cloudflare      │     │  Atlassian      │
│  Extension      │────▶│  Worker          │────▶│  OAuth + API    │
│  (background.js)│     │  (token proxy)   │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │
        │ Messages
        ▼
┌─────────────────┐
│  Content Script │
│  (overlay.js)   │
│  Floating UI    │
└─────────────────┘
```

## 🔒 Privacy & Security

This extension is designed with privacy and security as top priorities:

| Aspect | Implementation |
|--------|----------------|
| **Authentication** | OAuth 2.0 with PKCE (Proof Key for Code Exchange) |
| **Token Storage** | Browser's secure local storage only |
| **Data Transmission** | Direct to Atlassian/Tempo APIs - no third-party servers store your data |
| **Token Refresh** | Handled securely via Cloudflare Worker (client_secret never exposed) |
| **Source Code** | Fully open source - verify everything yourself |

### What data is stored?
- OAuth tokens (access + refresh) - stored locally in your browser
- Your Atlassian Cloud ID - needed for API calls
- Active tracker states - so your timers persist

### What data is NOT collected?
- No analytics or tracking
- No personal information
- No browsing history
- No data sent to third parties

## 🐛 Troubleshooting

### Common Issues

**"Sign in failed"**
- Make sure you have a Tempo Timesheets subscription linked to your Atlassian account
- Try signing out and signing in again

**Tracker not appearing**
- Refresh the page
- Check if the extension is enabled in `about:addons`

**Issue search not working**
- Verify you have access to the Jira project
- Check your internet connection
- Try signing out and signing in again

### Reporting Bugs

Found a bug? Please [open an issue](https://github.com/claudio-ferraro/tempo-time-tracker-for-firefox/issues) with:
- Firefox version
- Extension version
- Steps to reproduce
- Expected vs actual behavior

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tempo](https://www.tempo.io/) for their excellent time tracking platform
- [Atlassian](https://www.atlassian.com/) for Jira and the OAuth APIs
- The Firefox Add-ons team for their review process

---

<p align="center">
  Made with ❤️ for the Firefox community
</p>
