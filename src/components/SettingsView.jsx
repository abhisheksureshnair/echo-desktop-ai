import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Monitor, Check, Cpu } from 'lucide-react';
import { fetchModelApi, addModelApi } from '../api/aiModelApi';

export default function SettingsView({ onClose, onLogout }) {
  const [displays, setDisplays] = useState([]);
  const [settings, setSettings] = useState(null);
  
  // Expanded custom model configuration states per backend spec
  const [providerName, setProviderName] = useState('');
  const [modelName, setModelName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [temperature, setTemperature] = useState('');
  const [maxTokens, setMaxTokens] = useState('');
  const [formError, setFormError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Load displays and settings from Electron
  useEffect(() => {
    async function loadData() {
      let fetchedDisplays = [];
      if (window.electronAPI) {
        try {
          fetchedDisplays = await window.electronAPI.getDisplays();
          setDisplays(fetchedDisplays);
        } catch (e) {
          console.error("Failed to load displays:", e);
        }
      } else {
        setDisplays([
          { id: '1', label: 'Primary Screen', bounds: { x: 0, y: 0, width: 1920, height: 1080 } },
          { id: '2', label: 'Secondary Screen 2', bounds: { x: 1920, y: 0, width: 1440, height: 900 } }
        ]);
      }

      let fetchedSettings = null;
      if (window.electronAPI) {
        try {
          fetchedSettings = await window.electronAPI.getSavedSettings();
        } catch (e) {
          console.error("Failed to load settings:", e);
        }
      } else {
        const local = localStorage.getItem('echo-settings');
        fetchedSettings = local ? JSON.parse(local) : null;
      }

      if (!fetchedSettings) {
        fetchedSettings = {
          models: [],
          activeModelId: null,
          screenMode: 'single',
          singleScreenDisplayId: '1',
          multiScreenConfigs: {}
        };
      }

      // Remove default/demo models from settings
      if (fetchedSettings.models) {
        fetchedSettings.models = fetchedSettings.models.filter(
          m => !['gemini-3.5-flash', 'gpt-4o', 'claude-3.5-sonnet'].includes(m.id)
        );
      }

      // Synchronize/load model active state from the backend database
      try {
        const response = await fetchModelApi();
        const resData = response.data;
        if (resData && resData.success && resData.data && resData.data.model) {
          const dbModel = {
            id: resData.data.model,
            name: `${resData.data.provider} (${resData.data.model})`,
            provider: resData.data.provider,
            status: resData.data.status || 'Connected'
          };
          fetchedSettings.models = [dbModel];
          fetchedSettings.activeModelId = resData.data.model;
        }
      } catch (err) {
        console.error("Failed to fetch configured models from API on settings view mount:", err);
      }

      setSettings(fetchedSettings);
    }
    loadData();
  }, []);

  const handleSave = (updatedSettings) => {
    setSettings(updatedSettings);
    if (window.electronAPI?.saveSettings) {
      window.electronAPI.saveSettings(updatedSettings);
    } else {
      localStorage.setItem('echo-settings', JSON.stringify(updatedSettings));
    }
  };

  const handleSelectModel = (modelId) => {
    const updated = {
      ...settings,
      activeModelId: modelId
    };
    handleSave(updated);
  };

  const handleAddModelApiCall = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!providerName.trim() || !modelName.trim() || !baseUrl.trim() || !apiKey.trim()) {
      setFormError('All fields (except Temp/Tokens) are required.');
      return;
    }

    const tempVal = temperature.trim() !== '' ? parseFloat(temperature) : 0.2;
    const tokensVal = maxTokens.trim() !== '' ? parseInt(maxTokens, 10) : 1024;

    if (isNaN(tempVal) || tempVal < 0 || tempVal > 2) {
      setFormError('Temperature must be between 0 and 2.');
      return;
    }
    if (isNaN(tokensVal) || tokensVal < 1) {
      setFormError('Max Tokens must be a positive integer.');
      return;
    }

    setIsAdding(true);

    try {
      const response = await addModelApi({
        apiKey,
        provider: providerName.trim(),
        baseUrl: baseUrl.trim(),
        model: modelName.trim(),
        temperature: tempVal,
        maxTokens: tokensVal
      });

      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || 'Failed to configure endpoint.');
      }

      // Reload configured model configuration from server
      const fetchResponse = await fetchModelApi();
      const resData = fetchResponse.data;
      if (resData && resData.success && resData.data && resData.data.model) {
        const dbModel = {
          id: resData.data.model,
          name: `${resData.data.provider} (${resData.data.model})`,
          provider: resData.data.provider,
          status: resData.data.status || 'Connected'
        };
        const updated = {
          ...settings,
          models: [dbModel],
          activeModelId: resData.data.model
        };
        setSettings(updated);
        if (window.electronAPI?.saveSettings) {
          window.electronAPI.saveSettings(updated);
        }
      }

      // Clear states
      setProviderName('');
      setModelName('');
      setBaseUrl('');
      setApiKey('');
      setTemperature('');
      setMaxTokens('');
      setShowAddForm(false);
      alert('AI Model Configured and Activated Successfully!');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to save AI Endpoint.';
      setFormError(errMsg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteModel = (modelId, e) => {
    e.stopPropagation();

    let newActiveId = settings.activeModelId;
    if (settings.activeModelId === modelId) {
      newActiveId = settings.models.find(m => m.id !== modelId)?.id || null;
    }

    const updatedModels = settings.models.filter(m => m.id !== modelId);
    
    // Also clean from multi-screen mappings
    const updatedMultiConfigs = { ...settings.multiScreenConfigs };
    Object.keys(updatedMultiConfigs).forEach(displayId => {
      if (updatedMultiConfigs[displayId].modelId === modelId) {
        updatedMultiConfigs[displayId].modelId = settings.models.find(m => m.id !== modelId)?.id || null;
      }
    });

    const updated = {
      ...settings,
      models: updatedModels,
      activeModelId: newActiveId,
      multiScreenConfigs: updatedMultiConfigs
    };

    handleSave(updated);
  };

  const handleToggleScreenMode = (mode) => {
    const updated = {
      ...settings,
      screenMode: mode
    };
    handleSave(updated);
  };

  const handleSelectSingleDisplay = (displayId) => {
    const updated = {
      ...settings,
      singleScreenDisplayId: displayId
    };
    handleSave(updated);
  };

  const handleToggleMultiDisplay = (displayId, enabled) => {
    const updatedConfigs = { ...settings.multiScreenConfigs };
    const existing = updatedConfigs[displayId] || { enabled: false, modelId: settings.activeModelId };
    
    updatedConfigs[displayId] = {
      ...existing,
      enabled: enabled
    };

    const updated = {
      ...settings,
      multiScreenConfigs: updatedConfigs
    };
    handleSave(updated);
  };

  const handleSelectMultiModel = (displayId, modelId) => {
    const updatedConfigs = { ...settings.multiScreenConfigs };
    const existing = updatedConfigs[displayId] || { enabled: true, modelId: settings.activeModelId };

    updatedConfigs[displayId] = {
      ...existing,
      modelId: modelId
    };

    const updated = {
      ...settings,
      multiScreenConfigs: updatedConfigs
    };
    handleSave(updated);
  };

  if (!settings) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span style={styles.loadingText}>Loading settings…</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Settings Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onClose} title="Back to Chat">
          <ArrowLeft size={16} />
          <span style={styles.backLabel}>Back</span>
        </button>
        <h2 style={styles.title}>System Settings</h2>
      </div>

      <div style={styles.scrollArea}>
        {/* SECTION 1: AI MODELS */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Cpu size={16} style={styles.sectionIcon} />
            <h3 style={styles.sectionTitle}>AI Language Models</h3>
          </div>
          
          <p style={styles.sectionDesc}>Select the active model or configure your custom AI endpoints below.</p>
          
          {/* Models Grid */}
          <div style={styles.modelsList}>
            {settings.models.map(model => {
              const isActive = settings.activeModelId === model.id && settings.screenMode === 'single';
              const isDeletable = !['gemini-3.5-flash', 'gpt-4o', 'claude-3.5-sonnet'].includes(model.id);
              
              return (
                <div 
                  key={model.id}
                  style={{
                    ...styles.modelCard,
                    ...(isActive ? styles.modelCardActive : {})
                  }}
                  onClick={() => handleSelectModel(model.id)}
                >
                  <div style={styles.modelCardInfo}>
                    <span style={styles.modelName}>{model.name}</span>
                    <span style={styles.modelProvider}>{model.provider.toUpperCase()}</span>
                  </div>
                  <div style={styles.modelCardActions}>
                    {isActive && (
                      <span style={styles.activeCheck} title="Active Single Model">
                        <Check size={12} />
                      </span>
                    )}
                    {isDeletable && (
                      <button 
                        style={styles.deleteModelBtn}
                        onClick={(e) => handleDeleteModel(model.id, e)}
                        title="Remove custom model"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Custom Model API Configuration */}
          {!showAddForm ? (
            <button 
              type="button" 
              style={styles.toggleFormBtn} 
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={14} style={{ marginRight: 6 }} />
              <span>Configure AI Endpoint</span>
            </button>
          ) : (
            <form style={styles.addModelFormExpanded} onSubmit={handleAddModelApiCall}>
              <h4 style={styles.formTitle}>New AI Endpoint</h4>
              {formError && (
                <div style={styles.formError}>{formError}</div>
              )}
              <div style={styles.formFieldsGrid}>
                <div style={styles.fieldContainer}>
                  <label style={styles.fieldLabel}>Provider Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. NVIDIA, OpenAI" 
                    value={providerName} 
                    onChange={e => setProviderName(e.target.value)}
                    style={styles.inputField}
                    disabled={isAdding}
                  />
                </div>
                <div style={styles.fieldContainer}>
                  <label style={styles.fieldLabel}>Model Name / ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. meta/llama-3.1-70b-instruct" 
                    value={modelName} 
                    onChange={e => setModelName(e.target.value)}
                    style={styles.inputField}
                    disabled={isAdding}
                  />
                </div>
                <div style={styles.fieldContainer}>
                  <label style={styles.fieldLabel}>Base URL</label>
                  <input 
                    type="text" 
                    placeholder="e.g. https://api.openai.com/v1" 
                    value={baseUrl} 
                    onChange={e => setBaseUrl(e.target.value)}
                    style={styles.inputField}
                    disabled={isAdding}
                  />
                </div>
                <div style={styles.fieldContainer}>
                  <label style={styles.fieldLabel}>API Key / Token</label>
                  <input 
                    type="password" 
                    placeholder="API Key" 
                    value={apiKey} 
                    onChange={e => setApiKey(e.target.value)}
                    style={styles.inputField}
                    disabled={isAdding}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={styles.fieldContainerHalf}>
                    <label style={styles.fieldLabel}>Temperature</label>
                    <input 
                      type="text" 
                      placeholder="0.2" 
                      value={temperature} 
                      onChange={e => setTemperature(e.target.value)}
                      style={styles.inputField}
                      disabled={isAdding}
                    />
                  </div>
                  <div style={styles.fieldContainerHalf}>
                    <label style={styles.fieldLabel}>Max Tokens</label>
                    <input 
                      type="text" 
                      placeholder="1024" 
                      value={maxTokens} 
                      onChange={e => setMaxTokens(e.target.value)}
                      style={styles.inputField}
                      disabled={isAdding}
                    />
                  </div>
                </div>
              </div>
              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={styles.cancelBtn} 
                  onClick={() => { setShowAddForm(false); setFormError(''); }}
                  disabled={isAdding}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={styles.saveBtn}
                  disabled={isAdding}
                >
                  {isAdding ? 'Saving…' : 'Save AI Endpoint'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* SECTION 2: DISPLAY & SCREEN CONFIG */}
        {displays.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Monitor size={16} style={styles.sectionIcon} />
              <h3 style={styles.sectionTitle}>Screen & Multi-Display Setup</h3>
            </div>
            
            <p style={styles.sectionDesc}>
              Configure where to display the floating AI assistant interface on your workspace.
            </p>

            {/* Screen Mode Toggles */}
            {displays.length > 1 && (
              <div style={styles.tabContainer}>
                <button 
                  style={{
                    ...styles.tabButton,
                    ...(settings.screenMode === 'single' ? styles.tabButtonActive : {})
                  }}
                  onClick={() => handleToggleScreenMode('single')}
                >
                  Single AI Window
                </button>
                <button 
                  style={{
                    ...styles.tabButton,
                    ...(settings.screenMode === 'multi' ? styles.tabButtonActive : {})
                  }}
                  onClick={() => handleToggleScreenMode('multi')}
                >
                  Multi-AI Mode (Different Screens)
                </button>
              </div>
            )}

            {/* Screen Mode Panels */}
            {settings.screenMode === 'single' ? (
              <div style={styles.subConfigArea}>
                <h4 style={styles.subTitle}>Select Screen Target:</h4>
                <div style={styles.screensGrid}>
                  {displays.map(d => {
                    const isSelected = String(settings.singleScreenDisplayId || displays[0].id) === String(d.id);
                    return (
                      <div 
                        key={d.id}
                        style={{
                          ...styles.screenCard,
                          ...(isSelected ? styles.screenCardActive : {})
                        }}
                        onClick={() => handleSelectSingleDisplay(d.id)}
                      >
                        <Monitor size={24} style={isSelected ? styles.screenIconActive : styles.screenIconNormal} />
                        <div style={styles.screenDetails}>
                          <span style={styles.screenLabel}>{d.label}</span>
                          <span style={styles.screenResolution}>{d.bounds.width} × {d.bounds.height}</span>
                        </div>
                        {isSelected && <Check size={16} style={styles.checkIcon} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={styles.subConfigArea}>
                <h4 style={styles.subTitle}>Enable and configure AI on each screen:</h4>
                <div style={styles.multiScreensList}>
                  {displays.map(d => {
                    const config = settings.multiScreenConfigs?.[d.id] || { enabled: true, modelId: settings.activeModelId };
                    const isEnabled = config.enabled;

                    return (
                      <div 
                        key={d.id} 
                        style={{
                          ...styles.multiScreenRow,
                          ...(isEnabled ? styles.multiScreenRowActive : {})
                        }}
                      >
                        <div style={styles.multiScreenLeft}>
                          <input 
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => handleToggleMultiDisplay(d.id, e.target.checked)}
                            style={styles.checkbox}
                            id={`check-${d.id}`}
                          />
                          <label htmlFor={`check-${d.id}`} style={styles.checkboxLabel}>
                            <Monitor size={16} style={{ color: isEnabled ? '#5B8CFF' : '#7E8799', marginRight: 8 }} />
                            <div>
                              <span style={styles.screenLabel}>{d.label}</span>
                              <span style={styles.screenResolution}> ({d.bounds.width}x{d.bounds.height})</span>
                            </div>
                          </label>
                        </div>
                        
                        {isEnabled && (
                          <div style={styles.multiScreenRight}>
                            <span style={styles.modelDropdownLabel}>AI Model:</span>
                            <select
                              value={config.modelId}
                              onChange={(e) => handleSelectMultiModel(d.id, e.target.value)}
                              style={styles.modelDropdown}
                            >
                              {settings.models.map(m => (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: ACCOUNT & SESSION */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.sectionIcon}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h3 style={styles.sectionTitle}>Account & Session</h3>
          </div>
          <p style={styles.sectionDesc}>
            Manage your session, authentication state, or log out of Echo.
          </p>
          <div style={styles.accountCard}>
            <div style={styles.accountDetails}>
              <span style={styles.accountName}>
                {localStorage.getItem('echo_user') ? JSON.parse(localStorage.getItem('echo_user')).fullname : 'Echo User'}
              </span>
              <span style={styles.accountEmail}>
                {localStorage.getItem('echo_user') ? JSON.parse(localStorage.getItem('echo_user')).email : 'user@echo.ai'}
              </span>
            </div>
            {onLogout && (
              <button 
                style={styles.logoutButton} 
                onClick={onLogout} 
                title="Log out of Echo"
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                }}
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'transparent',
    color: '#E1E6F0',
    fontFamily: 'var(--font-sans)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '12px'
  },
  spinner: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.1)',
    borderTopColor: '#5B8CFF',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '12px',
    color: '#7E8799'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(20,26,40,0.3)',
    gap: '16px',
    WebkitAppRegion: 'drag',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '6px 12px',
    color: '#B8C0D4',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    WebkitAppRegion: 'no-drag',
  },
  backLabel: {
    fontSize: '11px',
    fontWeight: '600',
  },
  title: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '-0.01em',
    fontFamily: 'var(--font-display)',
    margin: 0,
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  sectionIcon: {
    color: '#5B8CFF',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#A2ABBE',
    margin: 0,
  },
  sectionDesc: {
    fontSize: '11px',
    color: '#7E8799',
    margin: '0 0 14px 0',
    lineHeight: '1.4',
  },
  modelsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '180px',
    overflowY: 'auto',
    marginBottom: '12px',
    paddingRight: '4px',
  },
  modelCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  modelCardActive: {
    borderColor: 'rgba(91,140,255,0.5)',
    backgroundColor: 'rgba(91,140,255,0.08)',
  },
  modelCardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  modelName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modelProvider: {
    fontSize: '8.5px',
    fontWeight: '700',
    color: '#5B8CFF',
    letterSpacing: '0.04em',
  },
  modelCardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  activeCheck: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
  },
  deleteModelBtn: {
    background: 'none',
    border: 'none',
    color: '#EF4444',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  toggleFormBtn: {
    width: '100%',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(91, 140, 255, 0.1)',
    border: '1px solid rgba(91, 140, 255, 0.25)',
    color: '#5B8CFF',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  addModelFormExpanded: {
    backgroundColor: 'rgba(20, 26, 40, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: '0 0 4px 0',
    letterSpacing: '0.05em',
  },
  formError: {
    padding: '6px 10px',
    borderRadius: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#FCA5A5',
    fontSize: '11px',
    textAlign: 'center',
  },
  formFieldsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldContainerHalf: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldLabel: {
    fontSize: '10.5px',
    fontWeight: '600',
    color: '#7E8799',
  },
  inputField: {
    height: '34px',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '0 10px',
    color: '#FFFFFF',
    fontSize: '11.5px',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '6px',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    color: '#B8C0D4',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  saveBtn: {
    backgroundColor: '#5B8CFF',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    padding: '6px 14px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(91, 140, 255, 0.2)',
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    padding: '2px',
    marginBottom: '16px',
  },
  tabButton: {
    flex: 1,
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 0',
    color: '#7E8799',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  subConfigArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  subTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#A2ABBE',
    margin: 0,
  },
  screensGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  screenCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  screenCardActive: {
    borderColor: 'rgba(91,140,255,0.4)',
    backgroundColor: 'rgba(91,140,255,0.05)',
  },
  screenIconNormal: {
    color: '#7E8799',
    marginRight: '14px',
  },
  screenIconActive: {
    color: '#5B8CFF',
    marginRight: '14px',
  },
  screenDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  screenLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  screenResolution: {
    fontSize: '10px',
    color: '#7E8799',
  },
  checkIcon: {
    position: 'absolute',
    right: '16px',
    color: '#22C55E',
  },
  multiScreensList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  multiScreenRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.04)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    transition: 'all 0.15s ease',
  },
  multiScreenRowActive: {
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  multiScreenLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  checkbox: {
    width: '14px',
    height: '14px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  multiScreenRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  modelDropdownLabel: {
    fontSize: '10px',
    color: '#7E8799',
  },
  modelDropdown: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    padding: '4px 8px',
    color: '#FFFFFF',
    fontSize: '11px',
    outline: 'none',
  },
  accountCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginTop: '10px',
  },
  accountDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  accountName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  accountEmail: {
    fontSize: '11px',
    color: '#7E8799',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '8px',
    padding: '8px 14px',
    color: '#FCA5A5',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }
};
