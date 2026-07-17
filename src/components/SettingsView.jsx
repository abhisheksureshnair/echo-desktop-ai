import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Monitor, Check, Cpu } from 'lucide-react';

export default function SettingsView({ onClose }) {
  const [displays, setDisplays] = useState([]);
  const [settings, setSettings] = useState(null);
  
  // Custom Model Form State
  const [newModelName, setNewModelName] = useState('');
  const [newModelProvider, setNewModelProvider] = useState('google');

  // Load displays and settings from Electron
  useEffect(() => {
    async function loadData() {
      if (window.electronAPI) {
        try {
          const fetchedDisplays = await window.electronAPI.getDisplays();
          const fetchedSettings = await window.electronAPI.getSavedSettings();
          setDisplays(fetchedDisplays);
          setSettings(fetchedSettings);
        } catch (e) {
          console.error("Failed to load settings or displays:", e);
        }
      } else {
        // Fallback for browser testing
        setDisplays([
          { id: '1', label: 'Primary Screen', bounds: { x: 0, y: 0, width: 1920, height: 1080 } },
          { id: '2', label: 'Secondary Screen 2', bounds: { x: 1920, y: 0, width: 1440, height: 900 } }
        ]);
        setSettings({
          models: [
            { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'google' },
            { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
            { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' }
          ],
          activeModelId: 'gemini-3.5-flash',
          screenMode: 'single',
          singleScreenDisplayId: '1',
          multiScreenConfigs: {}
        });
      }
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

  const handleAddModel = (e) => {
    e.preventDefault();
    if (!newModelName.trim()) return;

    const newId = `custom-${Date.now()}`;
    const newModel = {
      id: newId,
      name: newModelName.trim(),
      provider: newModelProvider
    };

    const updated = {
      ...settings,
      models: [...settings.models, newModel],
      activeModelId: newId // Set as active immediately
    };

    setNewModelName('');
    handleSave(updated);
  };

  const handleDeleteModel = (modelId, e) => {
    e.stopPropagation();
    
    // Don't allow deleting core models
    if (['gemini-3.5-flash', 'gpt-4o', 'claude-3.5-sonnet'].includes(modelId)) return;

    let newActiveId = settings.activeModelId;
    if (settings.activeModelId === modelId) {
      newActiveId = 'gemini-3.5-flash';
    }

    const updatedModels = settings.models.filter(m => m.id !== modelId);
    
    // Also clean from multi-screen mappings
    const updatedMultiConfigs = { ...settings.multiScreenConfigs };
    Object.keys(updatedMultiConfigs).forEach(displayId => {
      if (updatedMultiConfigs[displayId].modelId === modelId) {
        updatedMultiConfigs[displayId].modelId = 'gemini-3.5-flash';
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

          {/* Add Custom Model Form */}
          <form style={styles.addModelForm} onSubmit={handleAddModel}>
            <div style={styles.formRow}>
              <input 
                type="text"
                placeholder="Custom Model Name (e.g. DeepSeek V3)"
                value={newModelName}
                onChange={e => setNewModelName(e.target.value)}
                style={styles.input}
              />
              <select 
                value={newModelProvider}
                onChange={e => setNewModelProvider(e.target.value)}
                style={styles.select}
              >
                <option value="google">Google Gemini</option>
                <option value="openai">OpenAI GPT</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="ollama">Ollama (Local)</option>
                <option value="custom">Custom API</option>
              </select>
              <button type="submit" style={styles.addButton} title="Add Model">
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </form>
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
  addModelForm: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '10px',
    padding: '8px',
  },
  formRow: {
    display: 'flex',
    gap: '6px',
  },
  input: {
    flex: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    padding: '6px 10px',
    color: '#FFFFFF',
    fontSize: '11.5px',
    outline: 'none',
  },
  select: {
    flex: 1.2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    padding: '6px',
    color: '#B8C0D4',
    fontSize: '11px',
    outline: 'none',
  },
  addButton: {
    backgroundColor: '#5B8CFF',
    border: 'none',
    borderRadius: '6px',
    color: '#FFFFFF',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
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
  }
};
