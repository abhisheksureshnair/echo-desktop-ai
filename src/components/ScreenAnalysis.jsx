import React from 'react';
import { Eye, X, Clipboard, FileText, CheckSquare, Brain, Globe, HelpCircle } from 'lucide-react';

export default function ScreenAnalysis({ onClose, onTriggerAction }) {
  const suggestions = [
    { label: 'Summarize Screen', icon: <FileText size={14} />, action: 'summarize' },
    { label: 'Extract Code/Text', icon: <Clipboard size={14} />, action: 'extract' },
    { label: 'Create Coding Task', icon: <CheckSquare size={14} />, action: 'task' },
    { label: 'Explain Selection', icon: <Brain size={14} />, action: 'explain' },
    { label: 'Translate Content', icon: <Globe size={14} />, action: 'translate' }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <Eye size={15} style={{ color: '#5B8CFF', marginRight: 8 }} />
          <span style={styles.headerText}>Screen Analysis Mode</span>
        </div>
        <button style={styles.closeBtn} onClick={onClose}>
          <X size={15} />
        </button>
      </div>

      {/* Screen Thumbnail Preview */}
      <div style={styles.thumbnailWrapper}>
        <div style={styles.screenFrame}>
          {/* Simulated Workspace Screen inside thumbnail */}
          <div style={styles.mockDesktop}>
            <div style={styles.mockWindow}>
              <div style={styles.mockHeader}>
                <span style={{ ...styles.mockDot, backgroundColor: '#EF4444' }}></span>
                <span style={{ ...styles.mockDot, backgroundColor: '#F59E0B' }}></span>
                <span style={{ ...styles.mockDot, backgroundColor: '#22C55E' }}></span>
                <span style={styles.mockTitle}>App.jsx - VS Code</span>
              </div>
              <div style={styles.mockEditor}>
                <span style={{ color: '#7E8799' }}>1  </span>
                <span style={{ color: '#5B8CFF' }}>import </span>
                <span style={{ color: '#FFFFFF' }}>React </span>
                <span style={{ color: '#5B8CFF' }}>from </span>
                <span style={{ color: '#22C55E' }}>'react'</span><br />
                <span style={{ color: '#7E8799' }}>2  </span>
                <span style={{ color: '#5B8CFF' }}>const </span>
                <span style={{ color: '#F59E0B' }}>Echo </span>
                <span style={{ color: '#FFFFFF' }}>= () =&gt; &#123;</span><br />
                <span style={{ color: '#7E8799' }}>3  </span>
                <span style={{ color: '#5B8CFF' }}>  return </span>
                <span style={{ color: '#EF4444' }}>&lt;Island /&gt;</span><br />
                <span style={{ color: '#7E8799' }}>4  </span>
                <span style={{ color: '#FFFFFF' }}>&#125;</span>
              </div>
            </div>
            
            <div style={styles.hudOverlay}>
              <div style={styles.hudOutline}></div>
              <div style={styles.hudLabel}>Active Selection</div>
            </div>
          </div>
        </div>
        <div style={styles.thumbnailCaption}>
          Desktop Display 1 (Built-in Retina Display)
        </div>
      </div>

      {/* Action Selection */}
      <div style={styles.suggestionsContainer}>
        <span style={styles.sectionTitle}>SUGGESTED ACTIONS</span>
        <div style={styles.grid}>
          {suggestions.map((item, idx) => (
            <button 
              key={idx} 
              style={styles.actionCard} 
              className="glass-card btn-ripple"
              onClick={() => onTriggerAction(item.label)}
            >
              <div style={styles.cardIcon}>{item.icon}</div>
              <span style={styles.cardLabel}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#0B1220',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '16px',
    width: '100%',
    boxShadow: 'var(--shadow-window)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
  },
  headerText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: '0.02em',
    fontFamily: 'var(--font-display)',
  },
  closeBtn: {
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
  thumbnailWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  screenFrame: {
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1.5px solid rgba(91, 140, 255, 0.3)',
    boxShadow: '0 0 16px rgba(91, 140, 255, 0.15)',
    aspectRatio: '16/9',
    backgroundColor: '#070B13',
  },
  mockDesktop: {
    width: '100%',
    height: '100%',
    padding: '10px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(circle, rgba(91, 140, 255, 0.12) 0%, rgba(0,0,0,0) 80%)',
  },
  mockWindow: {
    width: '80%',
    height: '75%',
    backgroundColor: 'rgba(20, 26, 40, 0.85)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  mockHeader: {
    height: '16px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 6px',
    gap: '3px',
  },
  mockDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
  },
  mockTitle: {
    color: '#7E8799',
    fontSize: '6px',
    marginLeft: '6px',
    fontFamily: 'monospace',
  },
  mockEditor: {
    padding: '6px',
    fontFamily: 'monospace',
    fontSize: '7px',
    textAlign: 'left',
    lineHeight: '1.4',
  },
  hudOverlay: {
    position: 'absolute',
    inset: '15px 30px',
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudOutline: {
    position: 'absolute',
    inset: 0,
    border: '1px dashed #5B8CFF',
    borderRadius: '4px',
    animation: 'hud-dash 10s linear infinite',
  },
  hudLabel: {
    fontSize: '8px',
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#5B8CFF',
    padding: '2px 6px',
    borderRadius: '4px',
    boxShadow: '0 4px 10px rgba(91, 140, 255, 0.4)',
    transform: 'translateY(-12px)',
  },
  thumbnailCaption: {
    color: 'var(--text-muted)',
    fontSize: '10px',
    textAlign: 'center',
    fontWeight: '500',
  },
  suggestionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  actionCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    backgroundColor: 'rgba(20, 26, 40, 0.35)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    textAlign: 'left',
    gap: '10px',
    fontFamily: 'var(--font-sans)',
  },
  cardIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5B8CFF',
  },
  cardLabel: {
    fontSize: '11px',
    fontWeight: '600',
  }
};
