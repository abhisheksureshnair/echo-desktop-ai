import React, { useState, useEffect, useRef } from 'react';
import AIIsland from './components/AIIsland';
import AssistantWindow from './components/AssistantWindow';

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialModelId = urlParams.get('modelId');

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeApp, setActiveApp] = useState('idle');       // 'idle' | 'browser' | 'vscode' | 'gmail'
  const [detectedBrowser, setDetectedBrowser] = useState(null); // e.g. 'Chrome', 'Firefox'
  const [isExtensionConnected, setIsExtensionConnected] = useState(false);
  const [startVoiceOnExpand, setStartVoiceOnExpand] = useState(false);
  const [isBrowserSidebar, setIsBrowserSidebar] = useState(false);
  
  const [settings, setSettings] = useState(null);
  const [overrideModelId, setOverrideModelId] = useState(initialModelId);
  const [activeModelName, setActiveModelName] = useState('Gemini 3.5 Flash');
  
  const isExpandedRef = useRef(false);
  const isBrowserSidebarRef = useRef(false);

  // Keep refs in sync for callbacks
  useEffect(() => { isExpandedRef.current = isExpanded; }, [isExpanded]);
  useEffect(() => { isBrowserSidebarRef.current = isBrowserSidebar; }, [isBrowserSidebar]);

  // Load settings on startup
  useEffect(() => {
    async function loadInitialSettings() {
      if (window.electronAPI?.getSavedSettings) {
        const saved = await window.electronAPI.getSavedSettings();
        setSettings(saved);
      }
    }
    loadInitialSettings();
  }, []);

  // Listen for broadcasted settings updates
  useEffect(() => {
    if (!window.electronAPI?.onSettingsUpdated) return;
    window.electronAPI.onSettingsUpdated((updated) => {
      setSettings(updated);
    });
    return () => {
      window.electronAPI?.offSettingsUpdated?.();
    };
  }, []);

  // Listen for active model changed specifically for this window (e.g. from multi-screen config)
  useEffect(() => {
    if (!window.electronAPI?.onActiveModelChanged) return;
    window.electronAPI.onActiveModelChanged((modelId) => {
      setOverrideModelId(modelId);
    });
    return () => {
      window.electronAPI?.offActiveModelChanged?.();
    };
  }, []);

  // Compute active model name
  useEffect(() => {
    if (!settings) return;
    const currentModelId = overrideModelId || settings.activeModelId;
    const modelObj = settings.models?.find(m => m.id === currentModelId);
    if (modelObj) {
      setActiveModelName(modelObj.name);
    }
  }, [settings, overrideModelId]);


  // ── IPC: Active App detection ──
  useEffect(() => {
    if (!window.electronAPI?.onActiveAppChanged) return;

    window.electronAPI.onActiveAppChanged(({ category, rawName }) => {
      setActiveApp(category);

      if (category === 'browser') {
        const name = (rawName || '').toLowerCase();
        if (name.includes('firefox')) setDetectedBrowser('Firefox');
        else if (name.includes('brave')) setDetectedBrowser('Brave');
        else if (name.includes('edge') || name.includes('msedge')) setDetectedBrowser('Edge');
        else if (name.includes('chrome')) setDetectedBrowser('Chrome');
        else if (name.includes('safari')) setDetectedBrowser('Safari');
        else if (name.includes('arc')) setDetectedBrowser('Arc');
        else if (name.includes('opera')) setDetectedBrowser('Opera');
        else if (name.includes('vivaldi')) setDetectedBrowser('Vivaldi');
        else setDetectedBrowser('Browser');
      } else {
        setDetectedBrowser(null);
        // Collapse the custom browser-floating window if active app changes away from browser
        if (isBrowserSidebarRef.current) {
          collapseToIsland();
        }
      }
    });

    return () => {
      window.electronAPI?.offActiveAppChanged?.();
    };
  }, []);

  // ── IPC: Extension connection status ──
  useEffect(() => {
    if (!window.electronAPI?.onExtensionStatus) return;

    window.electronAPI.onExtensionStatus(({ connected }) => {
      setIsExtensionConnected(connected);
    });

    return () => {
      window.electronAPI?.offExtensionStatus?.();
    };
  }, []);

  const resizeElectronWindow = (width, height, position) => {
    if (window.electronAPI?.resizeWindow) {
      window.electronAPI.resizeWindow(width, height, position || (width > 400 ? 'right' : 'center'));
    }
  };

  // Global Ctrl+Space toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        if (isExpandedRef.current) collapseToIsland();
        else expandWindow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeApp]);

  const expandWindow = (options = {}) => {
    setIsExpanded(true);
    setStartVoiceOnExpand(!!options.startVoice);

    // If extension is NOT connected and browser is open, prompt install guide
    if (activeApp === 'browser' && !isExtensionConnected) {
      setIsExpanded(false); // keep island compact
      if (window.electronAPI?.openInstallPage) {
        window.electronAPI.openInstallPage();
      }
      return;
    }

    // Otherwise, normal expand
    if (activeApp === 'browser' && isExtensionConnected) {
      // Since extension is active inside the page, the user has the built-in sidebar.
      // We can open a standard floating helper panel on the right side if they click the island,
      // without floating overlapping sidebars.
      setIsBrowserSidebar(false);
      resizeElectronWindow(560, 780, 'right');
    } else {
      setIsBrowserSidebar(false);
      resizeElectronWindow(560, 780, 'right');
    }
  };

  const collapseToIsland = () => {
    setIsExpanded(false);
    setIsBrowserSidebar(false);
    setStartVoiceOnExpand(false);
    resizeElectronWindow(380, 56, 'center');
  };

  const handleTriggerContextAction = (promptText) => {
    if (activeApp === 'browser' && !isExtensionConnected) {
      if (window.electronAPI?.openInstallPage) {
        window.electronAPI.openInstallPage();
      }
      return;
    }
    expandWindow();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('trigger-echo-prompt', { detail: { prompt: promptText } }));
    }, 150);
  };

  return (
    <div style={styles.app}>
      {!isExpanded ? (
        <AIIsland
          onExpand={expandWindow}
          activeApp={activeApp}
          detectedBrowser={detectedBrowser}
          isExtensionConnected={isExtensionConnected}
          notificationCount={0}
          onTriggerContextAction={handleTriggerContextAction}
          activeModelName={activeModelName}
        />
      ) : (
        <AssistantWindow
          onMinimize={collapseToIsland}
          initialVoiceMode={startVoiceOnExpand}
          activeApp={activeApp}
          detectedBrowser={detectedBrowser}
          isBrowserSidebar={isBrowserSidebar}
          onResizeRequest={(w, h) => {
            if (isBrowserSidebar) return;
            resizeElectronWindow(w, h, 'right');
          }}
        />
      )}
    </div>
  );
}

const styles = {
  app: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
};
