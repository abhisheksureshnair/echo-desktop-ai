# Echo AI Assistant & Page Co-pilot

Echo is a premium, cross-platform personal AI assistant that snapped directly to your desktop workspace and extends natively into your web browsers. Built on **Electron**, **React**, and **Vite**, Echo operates as a sleek, dynamic floating island on your desktop and morphs into a native side-by-side Page Co-pilot when web browsing.

---

## Recent Updates (July 21, 2026)

### 🚀 Authentication & User Management
* **Auth Screen**: Added user registration and login interface (`src/components/AuthScreen.jsx`).
* **Session Validation**: Integrated backend-secured JWT profile loading, session tracking, and automatic token expiry handling.

### ⚙️ Custom AI Provider Onboarding
* **Custom Endpoints**: Added `src/components/AddModelScreen.jsx` for onboarding custom AI models (API Key, Base URL, Temperature, Max Tokens).
* **Dynamic Welcome Card**: Updated the Chat interface to prompt the user with `"Please add or select a model to continue."` if no models are active or configured.

### 🖥️ Desktop UI & Stability Fixes
* **Responsive Window Sizing**: Dynamic window resizing during login/onboarding steps to match the screen UI requirements.
* **OxC Parse Error Fix**: Restored a missing `useEffect` hook block wrapper in `SettingsView.jsx` that was causing Vite parsing crashes.

---

## Key Features

### 1. Echo Desktop Island (Dynamic snap)
* Snaps to the top-center of your screen as a beautiful, glassmorphic floating island.
* **App Detection**: Continuously monitors the frontmost window (every 400ms) and dynamically changes its status indicator (e.g. Chrome, VS Code, Gmail, Slack, Spotify).
* **Multi-Monitor Support**: Automatically snaps to the screen or monitor currently nearest to the user's mouse cursor.

### 2. Browser Extension Page Co-pilot
Echo operates natively inside the DOM of all major web browsers:
* **Google Chrome** (`browser-extension/chrome/`)
* **Brave** (`browser-extension/brave/`)
* **Microsoft Edge** (`browser-extension/edge/`)
* **Mozilla Firefox** (`browser-extension/firefox/` - MV2 compliant)

#### Co-pilot Capabilities:
* **Chat Panel**: In-page interactive sidebar to ask Echo questions about the webpage you are viewing.
* **Smart Actions**: Built-in suggestion chips to instantly **Summarize**, **Explain**, **Translate**, and **Extract Code Snippets** from the page.

### 3. Layout Modes (Parallel vs. Overlay)
You can toggle the layout mode directly inside the sidebar header next to the Close button:
* **Parallel Mode (Side-by-Side)**: Dynamically scales the host webpage viewport (`html` and `body` width) to `calc(100% - 380px)` and shifts absolute/fixed containers to prevent overlapping. **No page content is clipped or hidden.**
* **Overlay Mode (Flow Style)**: Floats the sidebar panel on top of the webpage without changing the layout width.
* Preferences are saved to `localStorage` and persist across page reloads.

### 4. Interactive CursorGrid Canvas Background
* The extension sidebar features a premium background built using a high-performance **Vanilla JS Canvas**.
* Dynamically detects cursor coordinates and click events on the sidebar to render grid lighting effects and expanding click-pulses in Echo's signature blue theme.

### 5. Smart Visibility (Auto-Hide / Auto-Show)
* **Auto-Hide**: The moment you open the web browser and the extension co-pilot is active, the desktop floating island card hides itself (`mainWindow.hide()`) to clear up your browser tab bar.
* **Auto-Show**: The moment you close the tab, close the browser, or switch focus to another application (like VS Code, Terminal, Finder), the desktop floating card instantly shows back up (`mainWindow.showInactive()`).
* Hooked up `beforeunload` and `pagehide` beacon events (`/api/disconnect`) to ensure instant responsiveness without server lag.

---

## File Structure

```
├── electron.cjs                    # Main Electron thread, active app polling, API server
├── preload.cjs                     # Electron secure IPC bridge
├── index.html                      # Desktop App HTML Entry point
├── package.json                    # Dependencies & Run scripts
├── src/                            # React Desktop App codebase
│   ├── App.jsx                     # Desktop Island Interface & State
│   ├── components/                 # Compact modules (AssistantWindow, TopHeader, VoiceMode, etc.)
│   └── index.css                   # Global desktop CSS
└── browser-extension/              # Browser extensions codebase
    ├── install.html                # Multi-browser onboarding instructions guide
    ├── chrome/                     # Chrome Manifest V3 files (content, background, icons)
    ├── brave/                      # Brave Manifest V3 files
    ├── edge/                       # Microsoft Edge Manifest V3 files
    └── firefox/                    # Firefox Manifest V2 files (Firefox-compatible scripts)
```

---

## Installation & Setup

### 1. Launch the Desktop Application
Ensure Node.js is installed. Run the following command in the project directory:
```bash
npm install
npm run electron:dev
```

### 2. Enable the Browser Extension
When the app launches, it registers an HTTP API server on `http://localhost:7890`.
1. Open your browser and navigate to `http://localhost:7890/install`.
2. Follow the instructions for your specific browser tab:
   * **Chrome / Brave / Edge**: Go to `extensions`, enable **Developer mode**, click **Load unpacked**, and select the corresponding folder (`browser-extension/chrome`, `browser-extension/brave`, or `browser-extension/edge`).
   * **Firefox**: Go to `about:debugging` -> **This Firefox** -> **Load Temporary Add-on...** and select the `manifest.json` file inside the `browser-extension/firefox/` folder.
3. Click **Verify Connection** on the onboarding page to confirm Echo is ready.
