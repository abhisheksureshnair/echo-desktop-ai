import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Check, Sparkles } from 'lucide-react';

export default function VoiceMode({ onClose, onSendTranscript }) {
  const [status, setStatus] = useState('listening'); // 'listening' | 'thinking' | 'speaking'
  const [transcript, setTranscript] = useState('Can you analyze the react rendering cycles for any potential memory leaks or state syncing issues...');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Cycle through states to demonstrate live AI voice interaction
    const timer1 = setTimeout(() => {
      setStatus('thinking');
    }, 4500);

    const timer2 = setTimeout(() => {
      setStatus('speaking');
      setTranscript('Sure! When reviewing React render loops, make sure you hook up cleanups in useEffect and avoid setting state inside render...');
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleFinish = () => {
    onSendTranscript(transcript);
  };

  // Helper to render waveform bars
  const renderWaveform = () => {
    const barsCount = 20;
    const bars = [];
    for (let i = 0; i < barsCount; i++) {
      // Create random delay for organic fluid wave movement
      const delay = (i % 5) * 0.15 + 's';
      const heightVal = status === 'thinking' ? '6px' : (status === 'speaking' ? 'random' : 'normal');
      
      const barStyle = {
        width: '4px',
        backgroundColor: isMuted ? 'var(--text-muted)' : '#5B8CFF',
        borderRadius: '2px',
        margin: '0 2px',
        height: '40px',
        transformScale: 'scaleY(0.4)',
        animation: isMuted || status === 'thinking' 
          ? 'none' 
          : `sound-wave-play 1.2s ease-in-out infinite alternate`,
        animationDelay: delay,
        transformOrigin: 'center',
        filter: isMuted ? 'none' : 'drop-shadow(0 0 4px rgba(91, 140, 255, 0.4))',
      };
      
      bars.push(<div key={i} style={barStyle} />);
    }
    return <div style={styles.waveformContainer}>{bars}</div>;
  };

  return (
    <div style={styles.voiceOverlay}>
      {/* Header controls */}
      <div style={styles.header}>
        <div style={styles.modeIndicator}>
          <Sparkles size={14} style={{ color: '#5B8CFF', marginRight: 6 }} />
          <span style={styles.modeText}>Echo Voice Mode</span>
        </div>
        <button style={styles.closeButton} onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {/* Main waveform and visualizer */}
      <div style={styles.visualizerArea}>
        <div style={styles.avatarGlowContainer}>
          <div style={{
            ...styles.pulsingHalo,
            borderColor: isMuted ? 'rgba(126, 135, 153, 0.15)' : 'rgba(91, 140, 255, 0.15)',
            animation: isMuted ? 'none' : 'voice-glow-pulse 3s infinite',
          }}></div>
          <div style={{
            ...styles.avatarCore,
            backgroundColor: isMuted ? '#2E303A' : '#0B1220',
            borderColor: isMuted ? 'var(--text-muted)' : '#5B8CFF',
          }}>
            <Mic size={24} style={{ color: isMuted ? 'var(--text-muted)' : '#5B8CFF' }} />
          </div>
        </div>

        {/* Dynamic Status Text */}
        <h2 style={styles.statusTitle}>
          {isMuted ? 'Muted' : (status === 'listening' ? 'Listening...' : status === 'thinking' ? 'Thinking...' : 'Speaking...')}
        </h2>

        {/* Waveform graphic */}
        {renderWaveform()}
      </div>

      {/* Live Transcript Pane */}
      <div style={styles.transcriptPane}>
        <p style={{
          ...styles.transcriptText,
          opacity: status === 'thinking' ? 0.5 : 1,
          fontStyle: status === 'speaking' ? 'normal' : 'italic',
        }}>
          "{transcript}"
        </p>
      </div>

      {/* Floating Action Buttons */}
      <div style={styles.controlsRow}>
        <button 
          style={{
            ...styles.actionBtn, 
            backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255,255,255,0.03)',
            borderColor: isMuted ? '#EF4444' : 'rgba(255,255,255,0.08)'
          }}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <Mic size={18} style={{ color: '#EF4444' }} /> : <MicOff size={18} style={{ color: '#B8C0D4' }} />}
        </button>

        <button 
          style={{...styles.actionBtn, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)'}}
          onClick={handleFinish}
          title="Submit Transcript to Chat"
        >
          <Check size={18} style={{ color: '#22C55E' }} />
        </button>
      </div>

      {/* Inject custom voice animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes voice-glow-pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
            box-shadow: 0 0 0 0 rgba(91, 140, 255, 0.3);
          }
          70% {
            transform: scale(1.3);
            opacity: 0;
            box-shadow: 0 0 0 20px rgba(91, 140, 255, 0);
          }
          100% {
            transform: scale(0.95);
            opacity: 0;
            box-shadow: 0 0 0 0 rgba(91, 140, 255, 0);
          }
        }
      `}} />
    </div>
  );
}

const styles = {
  voiceOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#0B1220',
    borderRadius: '28px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    boxShadow: 'var(--shadow-window)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  modeIndicator: {
    display: 'flex',
    alignItems: 'center',
  },
  modeText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: '0.02em',
    fontFamily: 'var(--font-display)',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#7E8799',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      color: '#FFFFFF',
      backgroundColor: 'rgba(255,255,255,0.08)',
    }
  },
  visualizerArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlowContainer: {
    position: 'relative',
    width: '90px',
    height: '90px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '24px',
  },
  pulsingHalo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '2px solid rgba(91, 140, 255, 0.4)',
    pointerEvents: 'none',
  },
  avatarCore: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '1.5px solid #5B8CFF',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 20px rgba(91, 140, 255, 0.25)',
    zIndex: 2,
  },
  statusTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '28px',
    fontFamily: 'var(--font-display)',
  },
  waveformContainer: {
    display: 'flex',
    alignItems: 'center',
    height: '60px',
  },
  transcriptPane: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '18px',
    maxHeight: '110px',
    overflowY: 'auto',
    marginBottom: '28px',
  },
  transcriptText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    textAlign: 'center',
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    alignItems: 'center',
  },
  actionBtn: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
    }
  }
};
