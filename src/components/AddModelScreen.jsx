import React, { useState } from 'react';
import { Cpu, Globe, Key, Sliders, ArrowRight, ShieldCheck, Info, HelpCircle } from 'lucide-react';
import { addModelApi } from '../api/aiModelApi';

export default function AddModelScreen({ onAddSuccess, onSkip }) {
  // Empty states per requirement: "No any preselection needed"
  const [provider, setProvider] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [temperature, setTemperature] = useState('');
  const [maxTokens, setMaxTokens] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTooltip, setActiveTooltip] = useState(null);

  const tooltips = {
    provider: "The name of your AI model provider (e.g. NVIDIA, OpenAI, Ollama, Anthropic).",
    baseUrl: "The API endpoint URL (e.g. https://api.openai.com/v1 or http://localhost:11434/v1).",
    model: "The exact model identifier (e.g. gpt-4o or meta/llama-3.1-70b-instruct).",
    apiKey: "Your secure developer API key or credential token for the selected provider.",
    temperature: "Controls creative randomness. Values range from 0.0 (precise) to 2.0 (creative). Default is 0.2.",
    maxTokens: "The maximum number of tokens to generate in a single response. Default is 1024."
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Strict Validations
    if (!provider.trim()) {
      setError('Provider Name is required.');
      return;
    }
    if (!baseUrl.trim()) {
      setError('Base URL is required.');
      return;
    }
    if (!model.trim()) {
      setError('Model Name is required.');
      return;
    }
    if (!apiKey.trim()) {
      setError('API Key is required.');
      return;
    }

    const tempVal = temperature.trim() !== '' ? parseFloat(temperature) : 0.2;
    const tokensVal = maxTokens.trim() !== '' ? parseInt(maxTokens, 10) : 1024;

    if (isNaN(tempVal) || tempVal < 0 || tempVal > 2) {
      setError('Temperature must be a number between 0 and 2.');
      return;
    }

    if (isNaN(tokensVal) || tokensVal < 1) {
      setError('Max Tokens must be a positive integer.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await addModelApi({
        apiKey,
        provider: provider.trim(),
        baseUrl: baseUrl.trim(),
        model: model.trim(),
        temperature: tempVal,
        maxTokens: tokensVal,
      });

      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || 'Failed to register AI endpoint');
      }

      onAddSuccess({
        model: model.trim(),
        provider: provider.trim(),
        status: 'Connected',
      });
    } catch (err) {
      console.error('Add AI model error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to register AI model.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Frameless Drag Handle */}
      <div style={styles.draggableHeader}>
        <div style={styles.dragDotGroup}>
          <span style={styles.dragDot} />
          <span style={styles.dragDot} />
          <span style={styles.dragDot} />
        </div>
        <span style={styles.dragTitle}>ADD AI MODEL</span>
      </div>

      <div style={styles.formWrapper}>
        <div style={styles.glowOverlay} />

        {/* Branding Header */}
        <div style={styles.logoContainer}>
          <div style={styles.logoIconBg}>
            <Cpu size={22} style={styles.logoIcon} />
          </div>
          <h2 style={styles.brandTitle}>ACTIVATE ECHO</h2>
          <p style={styles.brandSubtitle}>
            Configure your AI endpoint below to load the assistant.
          </p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div style={styles.errorAlert}>
              <span>{error}</span>
            </div>
          )}

          <div style={styles.fieldsContainer}>
            {/* Provider Name Input */}
            <div style={styles.inputGroup}>
              <div style={styles.inputWrapper}>
                <Cpu size={15} style={styles.inputIcon} />
                <input 
                  style={styles.input} 
                  type="text" 
                  placeholder="Provider Name (e.g. NVIDIA, OpenAI)"
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  style={styles.helpBtn}
                  onClick={() => setActiveTooltip(activeTooltip === 'provider' ? null : 'provider')}
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              {activeTooltip === 'provider' && (
                <div style={styles.tooltip}>{tooltips.provider}</div>
              )}
            </div>

            {/* Base URL Input */}
            <div style={styles.inputGroup}>
              <div style={styles.inputWrapper}>
                <Globe size={15} style={styles.inputIcon} />
                <input 
                  style={styles.input} 
                  type="text" 
                  placeholder="Base URL (e.g. https://api.openai.com/v1)"
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  style={styles.helpBtn}
                  onClick={() => setActiveTooltip(activeTooltip === 'baseUrl' ? null : 'baseUrl')}
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              {activeTooltip === 'baseUrl' && (
                <div style={styles.tooltip}>{tooltips.baseUrl}</div>
              )}
            </div>

            {/* Model Name Input */}
            <div style={styles.inputGroup}>
              <div style={styles.inputWrapper}>
                <Cpu size={15} style={styles.inputIcon} />
                <input 
                  style={styles.input} 
                  type="text" 
                  placeholder="Model Name (e.g. gpt-4o)"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  style={styles.helpBtn}
                  onClick={() => setActiveTooltip(activeTooltip === 'model' ? null : 'model')}
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              {activeTooltip === 'model' && (
                <div style={styles.tooltip}>{tooltips.model}</div>
              )}
            </div>

            {/* API Key Input */}
            <div style={styles.inputGroup}>
              <div style={styles.inputWrapper}>
                <Key size={15} style={styles.inputIcon} />
                <input 
                  style={styles.input} 
                  type="password" 
                  placeholder="API Key / Developer Token"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  style={styles.helpBtn}
                  onClick={() => setActiveTooltip(activeTooltip === 'apiKey' ? null : 'apiKey')}
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              {activeTooltip === 'apiKey' && (
                <div style={styles.tooltip}>{tooltips.apiKey}</div>
              )}
            </div>

            {/* Temperature and Max Tokens */}
            <div style={styles.slidersRow}>
              <div style={styles.inputGroupHalf}>
                <div style={styles.inputWrapper}>
                  <Sliders size={14} style={styles.inputIcon} />
                  <input 
                    style={styles.inputHalf} 
                    type="text" 
                    placeholder="Temp (0.2)"
                    value={temperature}
                    onChange={e => setTemperature(e.target.value)}
                    disabled={isLoading}
                  />
                  <button 
                    type="button" 
                    style={styles.helpBtn}
                    onClick={() => setActiveTooltip(activeTooltip === 'temperature' ? null : 'temperature')}
                  >
                    <HelpCircle size={12} />
                  </button>
                </div>
                {activeTooltip === 'temperature' && (
                  <div style={styles.tooltip}>{tooltips.temperature}</div>
                )}
              </div>

              <div style={styles.inputGroupHalf}>
                <div style={styles.inputWrapper}>
                  <Sliders size={14} style={styles.inputIcon} />
                  <input 
                    style={styles.inputHalf} 
                    type="text" 
                    placeholder="Max Tokens (1024)"
                    value={maxTokens}
                    onChange={e => setMaxTokens(e.target.value)}
                    disabled={isLoading}
                  />
                  <button 
                    type="button" 
                    style={styles.helpBtn}
                    onClick={() => setActiveTooltip(activeTooltip === 'maxTokens' ? null : 'maxTokens')}
                  >
                    <HelpCircle size={12} />
                  </button>
                </div>
                {activeTooltip === 'maxTokens' && (
                  <div style={styles.tooltip}>{tooltips.maxTokens}</div>
                )}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            style={isLoading ? styles.submitBtnLoading : styles.submitBtn}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Activating AI Endpoint…' : 'Activate AI Model'}</span>
            {!isLoading && <ArrowRight size={15} style={styles.btnArrow} />}
          </button>
        </form>

        {/* Skip controls */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>GUEST SESSIONS</span>
          <span style={styles.dividerLine} />
        </div>

        <button 
          type="button" 
          onClick={onSkip}
          style={styles.bypassBtn}
          title="Directly enter Echo in Guest mode"
        >
          <ShieldCheck size={13} style={{ marginRight: 6 }} />
          <span>Skip & Use Guest Mode</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#070C15',
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 20px rgba(91, 140, 255, 0.1)',
  },
  draggableHeader: {
    height: '36px',
    backgroundColor: '#0B1220',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    WebkitAppRegion: 'drag',
    userSelect: 'none',
  },
  dragDotGroup: {
    display: 'flex',
    gap: '6px',
  },
  dragDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  dragTitle: {
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  formWrapper: {
    flex: 1,
    padding: '20px 24px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
  },
  glowOverlay: {
    position: 'absolute',
    top: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '280px',
    height: '180px',
    backgroundColor: '#5B8CFF',
    borderRadius: '50%',
    filter: 'blur(90px)',
    opacity: 0.15,
    pointerEvents: 'none',
    zIndex: 0,
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '18px',
    zIndex: 1,
  },
  logoIconBg: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(91, 140, 255, 0.2) 0%, rgba(91, 140, 255, 0.05) 100%)',
    border: '1.5px solid rgba(91, 140, 255, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
    boxShadow: '0 8px 24px rgba(91, 140, 255, 0.2)',
  },
  logoIcon: {
    color: '#5B8CFF',
  },
  brandTitle: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-display)',
    background: 'linear-gradient(135deg, #FFFFFF 30%, #5B8CFF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '4px',
  },
  brandSubtitle: {
    fontSize: '11px',
    color: '#7E8799',
    maxWidth: '310px',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 1,
  },
  errorAlert: {
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#FCA5A5',
    fontSize: '11px',
    fontWeight: '500',
    textAlign: 'center',
  },
  fieldsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  inputGroupHalf: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    WebkitAppRegion: 'no-drag',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'rgba(255, 255, 255, 0.3)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    height: '38px',
    padding: '0 40px 0 40px',
    backgroundColor: 'rgba(20, 26, 40, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '12.5px',
    outline: 'none',
    transition: 'all 0.2s ease',
    WebkitAppRegion: 'no-drag',
    ':focus': {
      borderColor: 'rgba(91, 140, 255, 0.4)',
      backgroundColor: 'rgba(20, 26, 40, 0.75)',
    }
  },
  inputHalf: {
    width: '100%',
    height: '38px',
    padding: '0 32px 0 36px',
    backgroundColor: 'rgba(20, 26, 40, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '12px',
    outline: 'none',
    transition: 'all 0.2s ease',
    WebkitAppRegion: 'no-drag',
  },
  helpBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.25)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    transition: 'color 0.2s ease',
    WebkitAppRegion: 'no-drag',
    ':hover': {
      color: '#5B8CFF',
    }
  },
  tooltip: {
    fontSize: '10px',
    color: '#B8C0D4',
    backgroundColor: 'rgba(11, 18, 32, 0.95)',
    border: '1px solid rgba(91, 140, 255, 0.15)',
    borderRadius: '6px',
    padding: '6px 10px',
    lineHeight: '1.4',
    marginTop: '2px',
  },
  slidersRow: {
    display: 'flex',
    gap: '10px',
    WebkitAppRegion: 'no-drag',
  },
  submitBtn: {
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #5B8CFF 0%, #3B72F1 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.25s ease',
    boxShadow: '0 6px 20px rgba(91, 140, 255, 0.25)',
    WebkitAppRegion: 'no-drag',
  },
  submitBtnLoading: {
    height: '40px',
    borderRadius: '10px',
    background: 'rgba(20, 26, 40, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitAppRegion: 'no-drag',
  },
  btnArrow: {
    transition: 'transform 0.2s ease',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '14px 0 8px 0',
    opacity: 0.35,
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: '7.5px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    color: '#7E8799',
    padding: '0 8px',
  },
  bypassBtn: {
    height: '34px',
    borderRadius: '9px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    color: '#B8C0D4',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    WebkitAppRegion: 'no-drag',
  }
};
