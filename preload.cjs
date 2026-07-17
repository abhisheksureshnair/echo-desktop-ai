const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Send window resize/reposition command to main process
  resizeWindow: (width, height, position) =>
    ipcRenderer.send('resize-window', { width, height, position }),

  // Subscribe to real active-app detection events from main process
  onActiveAppChanged: (callback) => {
    ipcRenderer.on('active-app-changed', (_event, data) => callback(data));
  },

  // Cleanup listener
  offActiveAppChanged: () => {
    ipcRenderer.removeAllListeners('active-app-changed');
  },

  // Listen to extension status pings from main process
  onExtensionStatus: (callback) => {
    ipcRenderer.on('extension-status', (_event, data) => callback(data));
  },

  offExtensionStatus: () => {
    ipcRenderer.removeAllListeners('extension-status');
  },

  // Trigger opening the installation webpage
  openInstallPage: () => {
    ipcRenderer.send('open-install-page');
  },

  // Display & Settings API
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  getSavedSettings: () => ipcRenderer.invoke('get-saved-settings'),
  saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
  onSettingsUpdated: (callback) => {
    ipcRenderer.on('settings-updated', (_event, data) => callback(data));
  },
  offSettingsUpdated: () => {
    ipcRenderer.removeAllListeners('settings-updated');
  },
  onActiveModelChanged: (callback) => {
    ipcRenderer.on('active-model-changed', (_event, modelId) => callback(modelId));
  },
  offActiveModelChanged: () => {
    ipcRenderer.removeAllListeners('active-model-changed');
  }
});

