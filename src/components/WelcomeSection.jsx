import React from 'react';
import { 
  FileText, Code, Globe, CheckSquare, Mail, Edit3, Clipboard, 
  Eye, Mic, Search, ChevronRight, Sparkles
} from 'lucide-react';

export default function WelcomeSection({ onActionClick, activeApp = 'idle' }) {
  const actions = [
    { label: 'Summarize Page', icon: <FileText size={16} />, color: '#5B8CFF', prompt: 'Summarize the current web page or active document.' },
    { label: 'Explain Code', icon: <Code size={16} />, color: '#5B8CFF', prompt: 'Explain the active code block and suggest optimizations.' },
    { label: 'Translate Content', icon: <Globe size={16} />, color: '#5B8CFF', prompt: 'Translate this selected text to Spanish/French.' },
    { label: 'Create Task', icon: <CheckSquare size={16} />, color: '#F59E0B', prompt: 'Extract checklist tasks from my notes.' },
    { label: 'Generate Email', icon: <Mail size={16} />, color: '#5B8CFF', prompt: 'Draft a professional follow-up email about project status.' },
    { label: 'Meeting Notes', icon: <Edit3 size={16} />, color: '#22C55E', prompt: 'Organize these rough meeting scribbles into minutes.' },
    { label: 'Clipboard History', icon: <Clipboard size={16} />, color: '#5B8CFF', prompt: 'Show my clipboard history.' },
    { label: 'Screen Analysis', icon: <Eye size={16} />, color: '#5B8CFF', actionType: 'screen_analysis' },
    { label: 'Voice Mode', icon: <Mic size={16} />, color: '#5B8CFF', actionType: 'voice_mode' },
    { label: 'Search Files', icon: <Search size={16} />, color: '#5B8CFF', prompt: 'Find recent workspace files.' }
  ];

  // Retrieve details for the active application context card
  const getContextCard = () => {
    switch (activeApp) {
      case 'chrome':
        return {
          title: 'Google Chrome detected',
          actionLabel: 'Summarize current page context',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" fill="#5B8CFF" />
              <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
            </svg>
          ),
          color: '#5B8CFF',
          prompt: 'Summarize the current web page or active document.'
        };
      case 'vscode':
        return {
          title: 'React Project (VS Code)',
          actionLabel: 'Explain selected code block',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
              <line x1="12" y1="20" x2="12" y2="4" transform="rotate(15 12 12)" />
            </svg>
          ),
          color: '#22C55E',
          prompt: 'Explain the active code block in my VS Code selection and suggest optimizations.'
        };
      case 'gmail':
        return {
          title: 'New Email Draft (Gmail)',
          actionLabel: 'Draft professional reply email',
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          ),
          color: '#F59E0B',
          prompt: 'Draft a professional reply to the active email draft.'
        };
      default:
        return null;
    }
  };

  const contextCard = getContextCard();

  return (
    <div style={styles.welcomeContainer}>
      {/* Greeting Header */}
      <div style={styles.header}>
        <h1 style={styles.greeting}>Good Morning 👋</h1>
        <p style={styles.subtitle}>How can I help today?</p>
      </div>

      {/* Intelligent Active App Context Card */}
      {contextCard && (
        <div style={styles.contextSection}>
          <div style={styles.sectionHeader}>
            <Sparkles size={11} style={{ color: contextCard.color, marginRight: 6 }} />
            <span>INTELLIGENT FOCUS ACTION</span>
          </div>
          <div 
            className="btn-ripple" 
            style={{
              ...styles.contextCard,
              borderColor: `${contextCard.color}40`,
              boxShadow: `0 8px 30px -10px rgba(0, 0, 0, 0.7), 0 0 16px 0 ${contextCard.color}15`,
            }}
            onClick={() => onActionClick(contextCard)}
          >
            <div style={styles.contextLeft}>
              <div style={{ ...styles.contextIcon, backgroundColor: `${contextCard.color}10`, border: `1px solid ${contextCard.color}25` }}>
                {contextCard.icon}
              </div>
              <div style={styles.contextText}>
                <span style={styles.contextTitle}>{contextCard.title}</span>
                <span style={styles.contextLabel}>{contextCard.actionLabel}</span>
              </div>
            </div>
            <div style={{ ...styles.arrowBtn, backgroundColor: `${contextCard.color}1E` }}>
              <ChevronRight size={14} style={{ color: contextCard.color }} />
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Grid */}
      <div style={styles.gridSection}>
        <div style={styles.sectionHeader}>
          <span>QUICK WORKSPACE ACTIONS</span>
        </div>
        <div style={styles.grid}>
          {actions.map((item, index) => (
            <div 
              key={index} 
              className="glass-card btn-ripple" 
              style={styles.card}
              onClick={() => onActionClick(item)}
            >
              <div style={{ ...styles.iconWrapper, backgroundColor: `${item.color}0D`, border: `1px solid ${item.color}1E` }}>
                {React.cloneElement(item.icon, { style: { color: item.color } })}
              </div>
              <div style={styles.cardContent}>
                <span style={styles.cardLabel}>{item.label}</span>
                <ChevronRight size={12} style={styles.arrow} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  welcomeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '24px 20px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  greeting: {
    fontSize: '26px',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.02em',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: '9px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  contextSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  contextCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderRadius: '20px',
    backgroundColor: 'rgba(20, 26, 40, 0.85)',
    border: '1.5px solid rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  contextLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  contextIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  contextTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  contextLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arrowBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '16px',
    cursor: 'pointer',
    gap: '12px',
  },
  iconWrapper: {
    width: '30px',
    height: '30px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  arrow: {
    color: 'var(--text-muted)',
    opacity: 0.5,
  }
};
