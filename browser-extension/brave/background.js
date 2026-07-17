// background.js — Service Worker (MV3) / Background Script (MV2)
// Handles the toolbar icon click to toggle the sidebar on the active tab.

const isFirefox = typeof browser !== 'undefined';
const api = isFirefox ? browser : chrome;

// Toggle sidebar when toolbar icon is clicked
api.action
  ? api.action.onClicked.addListener(toggleSidebar)       // MV3
  : api.browserAction.onClicked.addListener(toggleSidebar); // MV2 (Firefox)

function toggleSidebar(tab) {
  api.tabs.sendMessage(tab.id, { type: 'FLOWSYNC_TOGGLE' }, (response) => {
    // If content script not injected yet, inject then toggle
    if (api.runtime.lastError) {
      api.scripting
        ? api.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }, () => {
            setTimeout(() => api.tabs.sendMessage(tab.id, { type: 'FLOWSYNC_TOGGLE' }), 200);
          })
        : api.tabs.executeScript(tab.id, { file: 'content.js' }, () => {
            setTimeout(() => api.tabs.sendMessage(tab.id, { type: 'FLOWSYNC_TOGGLE' }), 200);
          });
    }
  });
}
