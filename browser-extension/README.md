# Echo — Browser Extension

This extension injects the Echo chat sidebar **directly inside every webpage** — pushing the page content left, exactly like Copilot in Edge.

## How to Install

### Chrome / Brave / Edge (3 steps)
1. Open your browser and go to `chrome://extensions` (or `brave://extensions` / `edge://extensions`)
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **"Load unpacked"** → select this `browser-extension/` folder

### Firefox
1. Open Firefox and go to `about:debugging`
2. Click **"This Firefox"** → **"Load Temporary Add-on..."**
3. Select the **`manifest-firefox.json`** file inside this folder

---

## How to Use

Once installed, open **any website** and you'll see:

- **A small vertical "AI" tab** on the right edge of the page.
- Click it → the Echo sidebar **slides in from the right**, pushing the page content left.
- Click the **✕** button or the tab again to close it.

### Shortcut
- Click the **Echo icon** in your browser toolbar to toggle the sidebar.

---

## Features
- ✅ Works on **all websites** — no exceptions
- ✅ **Chrome, Brave, Edge** (Manifest V3)
- ✅ **Firefox** (Manifest V2)
- ✅ Summarizes page content using real DOM data
- ✅ Explains, translates, helps write
- ✅ Reads actual code snippets from the page
- ✅ Connects to Echo Desktop app for enhanced responses (when running)

## Desktop App Connection
When the **Echo Electron app** is running, the extension automatically connects to it via `http://localhost:7890` for more intelligent responses.

If the desktop app is closed, the extension still works with built-in smart responses.
