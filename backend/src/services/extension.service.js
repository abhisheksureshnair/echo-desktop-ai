const state = {
  connected: false,
  lastPingAt: null,
  activeTab: null,
};

export function setActiveTab({ url = '', title = '' }) {
  state.connected = true;
  state.lastPingAt = new Date().toISOString();
  state.activeTab = { url, title };
  return getExtensionStatus();
}

export function disconnectExtension() {
  state.connected = false;
  return getExtensionStatus();
}

export function getExtensionStatus() {
  return { ...state, activeTab: state.activeTab ? { ...state.activeTab } : null };
}
