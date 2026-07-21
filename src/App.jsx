import React, { useState, useEffect, useRef } from 'react';
import AIIsland from './components/AIIsland';
import AssistantWindow from './components/AssistantWindow';
import AuthScreen from './components/AuthScreen';
import { fetchUser as apiFetchUser } from './api/authApi';
import AddModelScreen from './components/AddModelScreen';
import { fetchModelApi } from './api/aiModelApi';

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
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('echo_authenticated') === 'true';
  });

  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('echo_is_guest') === 'true';
  });

  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const [hasAiModelConfigured, setHasAiModelConfigured] = useState(false);

  const isExpandedRef = useRef(false);
  const isBrowserSidebarRef = useRef(false);

  // Keep refs in sync for callbacks
  useEffect(() => { isExpandedRef.current = isExpanded; }, [isExpanded]);
  useEffect(() => { isBrowserSidebarRef.current = isBrowserSidebar; }, [isBrowserSidebar]);

  const checkModelConfiguration = async (currentSettings) => {
    try {
      const response = await fetchModelApi();
      const resData = response.data;
      if (resData && resData.success && resData.data && resData.data.model) {
        setHasAiModelConfigured(true);
        const activeSettings = currentSettings || settings;
        if (activeSettings) {
          const newModel = {
            id: resData.data.model,
            name: `${resData.data.provider} (${resData.data.model})`,
            provider: resData.data.provider,
            status: resData.data.status
          };
          const updatedSettings = {
            ...activeSettings,
            models: [newModel],
            activeModelId: resData.data.model
          };
          setSettings(updatedSettings);
          if (window.electronAPI?.saveSettings) {
            window.electronAPI.saveSettings(updatedSettings);
          }
        }
        return true;
      }
    } catch (err) {
      console.error("Failed to fetch configured AI models:", err);
    }
    setHasAiModelConfigured(false);
    return false;
  };

  // Load settings and verify token on startup
  useEffect(() => {
    async function loadInitialSettings() {
      let saved = null;
      if (window.electronAPI?.getSavedSettings) {
        saved = await window.electronAPI.getSavedSettings();
        setSettings(saved);
      }

      const hasToken = !!localStorage.getItem('token');
      if (hasToken) {
        try {
          const response = await apiFetchUser();
          const data = response.data;
          
          if (data && data.success) {
            const userData = data.finduser || data.user;
            localStorage.setItem('echo_user', JSON.stringify(userData));
            localStorage.setItem('echo_authenticated', 'true');
            setIsAuthenticated(true);
            setIsGuest(false);

            // Fetch configured models
            const hasModel = await checkModelConfiguration(saved);
            if (!hasModel) {
              resizeElectronWindow(400, 620, 'auth');
            }

            // Sync settings if electron exists
            if (window.electronAPI && saved) {
              window.electronAPI.saveSettings({ ...saved, isAuthenticated: true });
            }
          } else {
            throw new Error("Failed to fetch user");
          }
        } catch (err) {
          console.error("Token verification failed on boot:", err);
          const isAuthError = err.response && [400, 401, 403, 404].includes(err.response.status);
          if (isAuthError) {
            localStorage.removeItem('token');
            localStorage.removeItem('echo_authenticated');
            localStorage.removeItem('echo_user');
            localStorage.removeItem('echo_is_guest');
            setIsAuthenticated(false);
            setIsGuest(false);
            setHasAiModelConfigured(false);
            
            // Sync settings if electron exists
            if (window.electronAPI && saved) {
              window.electronAPI.saveSettings({ ...saved, isAuthenticated: false });
            }
          } else {
            // Network connection failure or server down. Keep token intact, but show login screen
            setIsAuthenticated(false);
            setIsGuest(false);
          }
        } finally {
          setIsCheckingAuth(false);
        }
      } else {
        const isGuestSession = localStorage.getItem('echo_is_guest') === 'true';
        if (isGuestSession) {
          setIsAuthenticated(true);
          setIsGuest(true);
          setHasAiModelConfigured(true);
          setIsCheckingAuth(false);
        } else {
          setIsAuthenticated(false);
          setIsGuest(false);
          setIsCheckingAuth(false);
          if (window.electronAPI && saved && saved.isAuthenticated) {
            window.electronAPI.saveSettings({ ...saved, isAuthenticated: false });
          }
        }
      }
    }
    loadInitialSettings();
  }, []);

  // Adjust window size based on authentication status on load/change
  useEffect(() => {
    if (!isAuthenticated) {
      resizeElectronWindow(400, 580, 'auth');
    } else if (!hasAiModelConfigured && !isGuest) {
      resizeElectronWindow(400, 620, 'auth');
    }
  }, [isAuthenticated, hasAiModelConfigured, isGuest]);

  const handleLoginSuccess = async (token, user) => {
    const isGuestSession = token === 'bypass-token';
    
    if (isGuestSession) {
      localStorage.setItem('echo_authenticated', 'false');
      localStorage.removeItem('token');
      localStorage.removeItem('echo_user');
      localStorage.setItem('echo_is_guest', 'true');
      setIsGuest(true);
      setHasAiModelConfigured(true);

      // Keep Electron settings' isAuthenticated as false so that the next boot shows the login screen
      if (window.electronAPI && settings) {
        const updatedSettings = {
          ...settings,
          isAuthenticated: false
        };
        setSettings(updatedSettings);
        window.electronAPI.saveSettings(updatedSettings);
      }
      setIsAuthenticated(true);
      setIsExpanded(false);
      resizeElectronWindow(380, 56, 'center');
    } else {
      localStorage.setItem('echo_authenticated', 'true');
      localStorage.setItem('token', token); // Save as 'token' so axios.js interceptor picks it up
      localStorage.setItem('echo_user', JSON.stringify(user));
      localStorage.setItem('echo_is_guest', 'false');
      setIsGuest(false);

      setIsAuthenticated(true);
      
      const hasModel = await checkModelConfiguration();
      if (!hasModel) {
        resizeElectronWindow(400, 620, 'auth');
      } else {
        setIsExpanded(false);
        resizeElectronWindow(380, 56, 'center');
      }

      // Save to Electron settings so next boot automatically skips login screen
      if (window.electronAPI && settings) {
        const updatedSettings = {
          ...settings,
          isAuthenticated: true
        };
        setSettings(updatedSettings);
        window.electronAPI.saveSettings(updatedSettings);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('echo_authenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('echo_user');
    localStorage.removeItem('echo_is_guest');
    setIsGuest(false);
    setHasAiModelConfigured(false);
    
    // Save to Electron settings
    if (window.electronAPI && settings) {
      const updatedSettings = {
        ...settings,
        isAuthenticated: false,
        models: [],
        activeModelId: null
      };
      setSettings(updatedSettings);
      window.electronAPI.saveSettings(updatedSettings);
    }
    
    setIsAuthenticated(false);
    setIsExpanded(false);
    resizeElectronWindow(400, 580, 'auth');
  };

  const handleAddAiSuccess = (modelData) => {
    setHasAiModelConfigured(true);
    if (settings) {
      const newModel = {
        id: modelData.model,
        name: `${modelData.provider} (${modelData.model})`,
        provider: modelData.provider,
        status: modelData.status
      };
      const updatedSettings = {
        ...settings,
        models: [newModel],
        activeModelId: modelData.model
      };
      setSettings(updatedSettings);
      if (window.electronAPI?.saveSettings) {
        window.electronAPI.saveSettings(updatedSettings);
      }
    }
    setIsExpanded(false);
    resizeElectronWindow(380, 56, 'center');
  };

  const handleSkipAddAi = () => {
    localStorage.setItem('echo_is_guest', 'true');
    setIsGuest(true);
    setHasAiModelConfigured(true);
    setIsExpanded(false);
    resizeElectronWindow(380, 56, 'center');
  };

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

  if (isCheckingAuth) {
    return <div style={{ width: '100vw', height: '100vh', backgroundColor: '#070C15' }} />;
  }

  return (
    <div style={styles.app}>
      {!isAuthenticated ? (
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      ) : !hasAiModelConfigured ? (
        <AddModelScreen onAddSuccess={handleAddAiSuccess} onSkip={handleSkipAddAi} />
      ) : !isExpanded ? (
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
          onLogout={handleLogout}
          isGuest={isGuest}
          settings={settings}
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
