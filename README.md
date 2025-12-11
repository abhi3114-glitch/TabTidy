# TabTidy — Smart Browser Tab Organizer

**TabTidy** is a lightweight, privacy-focused Chrome extension designed to declutter your browser and boost productivity. It automatically groups your open tabs by domain, allows you to "Focus" by hiding non-essential tabs, and lets you save sessions for later.

![TabTidy Icon](icons/icon128.png)

## 🚀 Features

### 🗂️ Smart Tab Grouping
- Automatically detects all your open tabs and groups them by domain (e.g., all GitHub tabs together, all Google Docs together).
- Displays a clean count of tabs per domain.
- **Custom Rules**: Map specific subdomains to custom group names in Settings (e.g., `mail.google.com` → "Work").

### 🎯 Focus Mode
- One-click **Focus Mode** hides all tabs that aren't on your "Whitelist".
- Distracting tabs are safely saved to a session before being closed, ensuring you never lose work.
- fully customizable Whitelist via Settings.

### 💾 Session Management
- **Save Sessions**: Save your current set of open tabs with a custom name.
- **Restore**: Restore any saved session with a single click.
- **Auto-Backup**: Focus Mode automatically creates a backup session of hidden tabs.

### 🔍 Quick Search
- Instantly filter open tabs by title or URL using the search bar.

### ⚙️ advanced Settings
- **Whitelist Management**: Add or remove domains that should stay open during Focus Mode.
- **Restorable Defaults**: Easily reset your whitelist to a developer-friendly default set.
- **Data Privacy**: All data (sessions, settings) is stored locally in your browser (`chrome.storage.local`). No external servers.

## 🛠️ Installation

1. **Clone or Download** this repository.
   ```bash
   git clone https://github.com/abhi3114-glitch/TabTidy.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the `TabTidy` folder from your computer.

## 📖 Usage Guide

1. **Opening the Extension**: Click the TabTidy icon in your browser toolbar.
2. **Managing Tabs**: Click on any tab in the list to jump to it. Click the `×` to close it.
3. **Focusing**: Click **Focus Mode** to hide distractions. To get them back, go to **Sessions**, find the auto-saved session, and click **Restore**.
4. **Saving Work**: Click **Save Session**, give it a name, and close your browser without worry.
5. **Configuring**: Click the Gear icon (⚙️) to access Settings.
   - Add domains like `spotify.com` or `youtube.com` to your whitelist if you want them to stay open.
   - Create custom rules to organize your tabs better.

## 💻 Development

### Tech Stack
- **Manifest V3**
- HTML5, CSS3 (Modern Variables & Glassmorphism)
- Vanilla JavaScript (ES6+)
- Chrome Extension APIs (`tabs`, `storage`, `scripting`)

### Project Structure
```
TabTidy/
├── manifest.json       # Extension configuration
├── popup.html          # Main UI structure
├── popup.css           # Styling
├── popup.js            # Frontend logic
├── background.js       # Service worker & initialization
├── settings.html       # Options page structure
├── settings.js         # Options logic
└── icons/              # App icons
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
MIT License. Free to use and modify.
