const { app, BrowserWindow, ipcMain, screen, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const http = require('http');
const fs = require('fs');

const activeWindows = new Map(); // displayId -> BrowserWindow
let detectionInterval = null;
let lastDetectedApp = null;

// Extension status tracking
let extensionConnected = false;
let lastPingTime = 0;
let pingCheckerInterval = null;

const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');

function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to read settings:', e);
  }
  return {
    models: [
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'google' },
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' }
    ],
    activeModelId: 'gemini-3.5-flash',
    screenMode: 'single', // 'single' | 'multi'
    singleScreenDisplayId: null, // null = primary display
    multiScreenConfigs: {} // displayId -> { enabled: boolean, modelId: string }
  };
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

function updateWindowVisibility() {
  for (const win of activeWindows.values()) {
    if (win.isDestroyed()) continue;
    if (lastDetectedApp === 'browser' && extensionConnected) {
      if (win.isVisible()) {
        win.hide();
      }
    } else {
      if (!win.isVisible()) {
        win.showInactive();
      }
    }
  }
}

function setExtensionConnected(connected) {
  if (extensionConnected !== connected) {
    extensionConnected = connected;
    for (const win of activeWindows.values()) {
      if (!win.isDestroyed()) {
        win.webContents.send('extension-status', { connected });
      }
    }
    updateWindowVisibility();
  }
}

// ─────────────────────────────────────────────
// Local HTTP API — Browser Extension connects here
// ─────────────────────────────────────────────
function startLocalAPIServer() {
  const server = http.createServer((req, res) => {
    // Allow extension to connect from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { 
      res.writeHead(204); 
      res.end(); 
      return; 
    }

    const reqUrl = req.url.split('?')[0];

    // Serve the Extension Onboarding/Install Guide page
    if (req.method === 'GET' && reqUrl === '/install') {
      const installHtmlPath = path.join(__dirname, 'browser-extension', 'install.html');
      fs.readFile(installHtmlPath, 'utf8', (err, html) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading onboarding page');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      });
      return;
    }

    // Ping/Register active tab status
    if (req.method === 'POST' && reqUrl === '/api/active') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { url, title } = JSON.parse(body);
          lastPingTime = Date.now();
          setExtensionConnected(true);

          for (const win of activeWindows.values()) {
            if (!win.isDestroyed()) {
              win.webContents.send('active-tab-updated', { url, title });
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok', extensionConnected: true }));
        } catch (e) {
          res.writeHead(400); res.end(JSON.stringify({ error: 'bad request' }));
        }
      });
      return;
    }

    // Disconnect tab status (fires on pagehide/unload)
    if (reqUrl === '/api/disconnect') {
      setExtensionConnected(false);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', extensionConnected: false }));
      return;
    }

    // Status check for install guide & React app
    if (req.method === 'GET' && reqUrl === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ extensionConnected }));
      return;
    }

    // Process extension chat prompts
    if (req.method === 'POST' && reqUrl === '/api/chat') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { prompt, url, title } = JSON.parse(body);
          lastPingTime = Date.now();
          setExtensionConnected(true);

          // Forward to all windows
          for (const win of activeWindows.values()) {
            if (!win.isDestroyed()) {
              win.webContents.send('extension-chat', { prompt, url, title });
            }
          }
          // Reply with smart response
          const reply = buildAPIReply(prompt, title, url);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ reply, status: 'ok' }));
        } catch (e) {
          res.writeHead(400); res.end(JSON.stringify({ error: 'bad request' }));
        }
      });
      return;
    }

    // Not Found
    res.writeHead(404);
    res.end();
  });

  server.listen(7890, '127.0.0.1', () => {
    console.log('[Echo] Extension API server running on http://localhost:7890');
    
    // Start periodic check to see if extension is still active/pinging
    pingCheckerInterval = setInterval(() => {
      if (extensionConnected && Date.now() - lastPingTime > 8000) {
        setExtensionConnected(false);
      }
    }, 4000);
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') console.log('[Echo] Port 7890 already in use — API server skipped.');
  });
}

function buildAPIReply(prompt, title, url) {
  const t = (prompt || '').toLowerCase();
  if (t.includes('summarize') || t.includes('summary') || t.includes('page')) {
    return `Here's a summary of "${title}":\n\nThis page is hosted at ${new URL(url || 'https://example.com').hostname}. Based on the page title and URL, it appears to contain content related to the topic "${title}". For a detailed summary, please use the in-page suggestion chips which read the actual page content directly.`;
  }
  if (t.includes('explain')) return `This page "${title}" covers topics that I can help break down. Ask me about any specific section and I'll explain it in simple terms.`;
  if (t.includes('translate')) return 'Paste the text you want translated and tell me the target language — I\'ll translate it immediately.';
  if (t.includes('write') || t.includes('draft')) return 'Sure! Tell me what you\'d like to write — email, message, social post, or document — and I\'ll draft it.';
  return `I received your message: "${prompt}". How can I help you further with this page?`;
}


// ─────────────────────────────────────────────
// Browser & App detection maps
// ─────────────────────────────────────────────
const BROWSER_NAMES = new Set([
  'google chrome', 'chrome',
  'firefox', 'firefox developer edition', 'firefox nightly',
  'brave browser', 'brave',
  'microsoft edge', 'edge',
  'safari',
  'arc',
  'opera',
  'vivaldi',
  'tor browser',
  'chrome.exe', 'firefox.exe', 'msedge.exe',
  'brave.exe', 'opera.exe', 'vivaldi.exe',
]);

const VSCODE_NAMES = new Set([
  'visual studio code', 'code', 'code - insiders', 'vscodium', 'code.exe',
]);

const MAIL_NAMES = new Set([
  'gmail',
  'mail', 'apple mail', 'outlook', 'microsoft outlook', 'spark', 'airmail',
  'thunderbird', 'outlook.exe', 'thunderbird.exe',
]);

function getFrontmostAppName(callback) {
  const platform = process.platform;
  if (platform === 'darwin') {
    exec(
      `osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`,
      (err, stdout) => {
        if (err) return callback(null);
        callback(stdout.trim().toLowerCase());
      }
    );
  } else if (platform === 'win32') {
    exec(
      `powershell -Command "Get-Process | Where-Object {$_.MainWindowTitle -ne '' -and $_.Id -eq (Get-Process -Id (Get-WmiObject Win32_Process -Filter \\\"ProcessId=(Add-Type -MemberDefinition '[DllImport(\\\"user32.dll\\\")]public static extern int GetForegroundWindow();' -Name U -PassThru)::GetForegroundWindow())).ProcessId} | Select-Object -ExpandProperty Name -First 1"`,
      (err, stdout) => {
        if (err) {
          exec(
            `powershell -Command "(Get-Process | Where-Object {$_.MainWindowTitle -ne ''} | Sort-Object StartTime -Descending | Select-Object -First 1).Name"`,
            (e2, out2) => {
              if (e2) return callback(null);
              callback(out2.trim().toLowerCase());
            }
          );
          return;
        }
        callback(stdout.trim().toLowerCase());
      }
    );
  } else {
    exec('xdotool getactivewindow getwindowname', (err, stdout) => {
      if (err) return callback(null);
      callback(stdout.trim().toLowerCase());
    });
  }
}

function classifyApp(appName) {
  if (!appName) return 'idle';
  const name = appName.toLowerCase();
  if (name.includes('electron') || name.includes('echo')) return '__self__';
  if (BROWSER_NAMES.has(name) || [...BROWSER_NAMES].some(b => name.includes(b))) {
    return 'browser';
  }
  if (VSCODE_NAMES.has(name) || name.includes('visual studio code') || name.includes('vscodium')) {
    return 'vscode';
  }
  if (MAIL_NAMES.has(name) || name.includes('mail') || name.includes('outlook') || name.includes('thunderbird')) {
    return 'gmail';
  }
  return 'idle';
}

function startAppDetection() {
  if (detectionInterval) return;
  detectionInterval = setInterval(() => {
    getFrontmostAppName((appName) => {
      if (activeWindows.size === 0) return;
      const category = classifyApp(appName);
      if (category === '__self__') return;

      if (category !== lastDetectedApp) {
        lastDetectedApp = category;
        for (const win of activeWindows.values()) {
          if (!win.isDestroyed()) {
            win.webContents.send('active-app-changed', {
              category,
              rawName: appName,
            });
          }
        }
        updateWindowVisibility();
      }
    });
  }, 400);
}

function createWindowForDisplay(display, modelId) {
  const displayIdStr = String(display.id);
  if (activeWindows.has(displayIdStr)) {
    return activeWindows.get(displayIdStr);
  }

  const { x: sx, y: sy, width: sw } = display.workArea;

  const win = new BrowserWindow({
    width: 380,
    height: 56,
    x: sx + Math.round((sw - 380) / 2),
    y: sy + 16,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const queryParams = `?displayId=${encodeURIComponent(displayIdStr)}&modelId=${encodeURIComponent(modelId || '')}`;
  win.loadURL(`http://localhost:5173/${queryParams}`);
  
  win.once('ready-to-show', () => {
    win.show();
    if (!detectionInterval) {
      startAppDetection();
    }
    // Send initial status on load
    setTimeout(() => {
      if (!win.isDestroyed()) {
        win.webContents.send('extension-status', { connected: extensionConnected });
      }
    }, 1000);
  });

  win.on('closed', () => {
    activeWindows.delete(displayIdStr);
    if (activeWindows.size === 0) {
      if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
      }
      if (pingCheckerInterval) {
        clearInterval(pingCheckerInterval);
        pingCheckerInterval = null;
      }
    }
  });

  activeWindows.set(displayIdStr, win);
  return win;
}

function syncWindowsWithSettings() {
  const settings = getSettings();
  const allDisplays = screen.getAllDisplays();

  if (settings.screenMode === 'multi') {
    // For each display, check configuration
    allDisplays.forEach(display => {
      const displayIdStr = String(display.id);
      const config = settings.multiScreenConfigs?.[displayIdStr] || { enabled: true, modelId: settings.activeModelId };

      if (config.enabled) {
        if (!activeWindows.has(displayIdStr)) {
          createWindowForDisplay(display, config.modelId);
        } else {
          // Window exists, make sure model is correct
          const win = activeWindows.get(displayIdStr);
          if (!win.isDestroyed()) {
            win.webContents.send('active-model-changed', config.modelId);
          }
        }
      } else {
        // If config specifies disabled, close if running
        if (activeWindows.has(displayIdStr)) {
          const win = activeWindows.get(displayIdStr);
          if (!win.isDestroyed()) {
            win.destroy();
          }
          activeWindows.delete(displayIdStr);
        }
      }
    });
  } else {
    // Single screen mode
    let targetDisplay = allDisplays[0];
    if (settings.singleScreenDisplayId) {
      const found = allDisplays.find(d => String(d.id) === String(settings.singleScreenDisplayId));
      if (found) targetDisplay = found;
    }
    const targetDisplayIdStr = String(targetDisplay.id);

    // Keep or create the target window
    let targetWin = activeWindows.get(targetDisplayIdStr);
    if (!targetWin) {
      targetWin = createWindowForDisplay(targetDisplay, settings.activeModelId);
    } else {
      if (!targetWin.isDestroyed()) {
        targetWin.webContents.send('active-model-changed', settings.activeModelId);
      }
    }

    // Destroy all other windows
    for (const [displayIdStr, win] of activeWindows.entries()) {
      if (displayIdStr !== targetDisplayIdStr) {
        if (!win.isDestroyed()) {
          win.destroy();
        }
        activeWindows.delete(displayIdStr);
      }
    }
  }
}

ipcMain.on('resize-window', (event, { width, height, position }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win || win.isDestroyed()) return;

  const winBounds = win.getBounds();
  const activeDisplay = screen.getDisplayMatching(winBounds) || screen.getPrimaryDisplay();
  const { x: sx, y: sy, width: sw, height: sh } = activeDisplay.workArea;
  let x, y, w, h, resizable;

  if (position === 'browser-sidebar') {
    const BROWSER_CHROME_HEIGHT = 104;
    w = width || 380;
    h = sh - BROWSER_CHROME_HEIGHT;
    x = sx + sw - w;
    y = sy + BROWSER_CHROME_HEIGHT;
    resizable = true;
    win.setAlwaysOnTop(true, 'floating');
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } else if (position === 'right') {
    w = width || 560;
    h = height || 780;
    x = sx + sw - w - 20;
    y = sy + 20;
    resizable = true;
    win.setAlwaysOnTop(true, 'floating');
  } else {
    w = width || 380;
    h = height || 56;
    x = sx + Math.round((sw - w) / 2);
    y = sy + 16;
    resizable = false;
    win.setAlwaysOnTop(true, 'floating');
  }

  win.setResizable(resizable);
  win.setBounds({ x, y, width: w, height: h }, true);
});

// Trigger opening default browser to instruction page
ipcMain.on('open-install-page', () => {
  shell.openExternal('http://localhost:7890/install');
});

// IPC handlers for Display / Settings management
ipcMain.handle('get-displays', () => {
  const primaryId = screen.getPrimaryDisplay().id;
  return screen.getAllDisplays().map((d, index) => ({
    id: String(d.id),
    label: d.id === primaryId ? 'Primary Screen' : `Secondary Screen ${index + 1}`,
    bounds: d.bounds,
    workArea: d.workArea
  }));
});

ipcMain.handle('get-saved-settings', () => {
  return getSettings();
});

ipcMain.on('save-settings', (event, settings) => {
  saveSettings(settings);
  syncWindowsWithSettings();

  // Broadcast settings update to all remaining windows
  for (const win of activeWindows.values()) {
    if (!win.isDestroyed() && win.webContents !== event.sender) {
      win.webContents.send('settings-updated', settings);
    }
  }
});

app.whenReady().then(() => {
  startLocalAPIServer();
  syncWindowsWithSettings();
  app.on('activate', () => {
    if (activeWindows.size === 0) syncWindowsWithSettings();
  });
});

app.on('window-all-closed', () => {
  if (detectionInterval) clearInterval(detectionInterval);
  if (pingCheckerInterval) clearInterval(pingCheckerInterval);
  if (process.platform !== 'darwin') app.quit();
});

