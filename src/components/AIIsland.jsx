import React from 'react';
import { Mic, ArrowRight } from 'lucide-react';

// ── Browser-specific SVG icons ──────────────────────────────
const BrowserIcons = {
  Firefox: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#FF6D00" strokeWidth="1.5"/>
      <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9" stroke="#FF6D00" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" fill="#FF6D00"/>
    </svg>
  ),
  Brave: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 6v6c0 5 3.6 9.3 8 10 4.4-.7 8-5 8-10V6L12 2z" stroke="#FB542B" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="#FB542B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Edge: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M21 12c0 5-4 9-9 9a9 9 0 01-4-17.1C9 7 11 10 15 10c2 0 4-1 5-2.5" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5.5 15H19" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Chrome: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#5B8CFF" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="3.5" fill="#5B8CFF"/>
      <line x1="12" y1="3" x2="12" y2="8.5" stroke="#5B8CFF" strokeWidth="1.5"/>
      <line x1="20.5" y1="16.5" x2="15.5" y2="13.5" stroke="#5B8CFF" strokeWidth="1.5"/>
      <line x1="3.5" y1="16.5" x2="8.5" y2="13.5" stroke="#5B8CFF" strokeWidth="1.5"/>
    </svg>
  ),
  Safari: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#5B8CFF" strokeWidth="1.5"/>
      <line x1="12" y1="4" x2="12" y2="20" stroke="#5B8CFF" strokeWidth="1" strokeDasharray="2 3"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="#5B8CFF" strokeWidth="1" strokeDasharray="2 3"/>
      <path d="M8 8l8 8M16 8l-8 8" stroke="#5B8CFF" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Arc: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 3c-5 0-9 4-9 9s4 9 9 9 9-4 9-9S17 3 12 3z" stroke="#A855F7" strokeWidth="1.5"/>
      <path d="M8 16s1-4 4-4 4 4 4 4" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Default: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#5B8CFF" strokeWidth="1.5"/>
      <path d="M2 12h20M12 2c-3 4-3 12 0 20M12 2c3 4 3 12 0 20" stroke="#5B8CFF" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

// ── VS Code icon ──
const VSCodeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);

// ── Mail icon ──
const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

// ── Idle orbit logo ──
const IdleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" stroke="rgba(91,140,255,0.25)" strokeWidth="1.5"/>
    <circle cx="16" cy="16" r="8"  stroke="rgba(91,140,255,0.45)" strokeWidth="1.5"/>
    <circle cx="16" cy="16" r="4"  fill="#5B8CFF" style={{ filter: 'drop-shadow(0 0 6px #5B8CFF)' }}/>
    <circle cx="16" cy="2"  r="2"  fill="#FFFFFF" className="orbit-dot-1"/>
    <circle cx="16" cy="30" r="1.5" fill="#5B8CFF" className="orbit-dot-2"/>
  </svg>
);

export default function AIIsland({ 
  onExpand,
  activeApp = 'idle',
  detectedBrowser = null,   // 'Chrome' | 'Firefox' | 'Brave' | 'Edge' | 'Safari' | 'Arc' | …
  isExtensionConnected = false,
  notificationCount = 0,
  onTriggerContextAction,
  activeModelName = 'Gemini 3.5 Flash',
}) {
  // ── Derive config from activeApp + detectedBrowser ──────────
  const getConfig = () => {
    if (activeApp === 'browser') {
      const name = detectedBrowser || 'Browser';
      const IconComp = BrowserIcons[name] || BrowserIcons.Default;
      
      if (!isExtensionConnected) {
        return {
          icon: <IconComp />,
          appTitle: name,
          actionText: 'Enable Co-pilot',
          actionColor: '#F59E0B', // warning/orange color
          prompt: null, // triggers install page click
        };
      }

      return {
        icon: <IconComp />,
        appTitle: name,
        actionText: 'Co-pilot Ready ✓',
        actionColor: '#22C55E', // success/green
        prompt: `Summarize the current page content for me.`,
      };
    }
    if (activeApp === 'vscode') return {
      icon: <VSCodeIcon />,
      appTitle: 'VS Code',
      actionText: 'Explain selection',
      actionColor: '#22C55E',
      prompt: 'Explain the active code block in my VS Code selection.',
    };
    if (activeApp === 'gmail') return {
      icon: <MailIcon />,
      appTitle: 'Mail',
      actionText: 'Draft reply',
      actionColor: '#F59E0B',
      prompt: 'Draft a professional reply to the active email.',
    };
    return {
      icon: <IdleIcon />,
      appTitle: activeModelName ? `Echo (${activeModelName})` : 'Echo',
      actionText: 'Ready',
      actionColor: '#8E8E93',
      prompt: null,
    };
  };

  const config = getConfig();

  const getIndicatorColor = () => {
    if (activeApp === 'gmail') return '#FF9500';
    if (activeApp === 'browser') {
      return isExtensionConnected ? '#22C55E' : '#F59E0B';
    }
    if (activeApp === 'vscode') return '#22C55E';
    return '#22C55E';
  };

  return (
    <div
      className="dynamic-island"
      onClick={() => onExpand()}
      style={styles.islandContainer}
    >
      <div style={styles.glowOverlay}/>

      {/* Left */}
      <div style={styles.leftRow}>
        <div style={styles.iconWrapper}>{config.icon}</div>
        <div
          style={styles.textRow}
          onClick={e => {
            e.stopPropagation();
            if (config.prompt) onTriggerContextAction(config.prompt);
            else onExpand();
          }}
        >
          <span style={styles.titleText}>{config.appTitle}</span>
          <span style={styles.dividerDot}>•</span>
          <span style={{ ...styles.actionText, color: config.actionColor, fontWeight: activeApp === 'idle' ? '500' : '600' }}>
            {config.actionText}
          </span>
          {activeApp !== 'idle' && (
            <ArrowRight size={10} style={{ color: config.actionColor, flexShrink: 0 }}/>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={styles.rightSection} onClick={e => e.stopPropagation()}>
        <div className="animate-glow-dot" style={{ ...styles.glowDot, backgroundColor: getIndicatorColor() }}/>
        <button
          style={styles.micButton}
          onClick={e => { e.stopPropagation(); onExpand({ startVoice: true }); }}
          title="Voice Command"
        >
          <Mic size={10} style={{ color: '#8E8E93' }}/>
        </button>
        {notificationCount > 0 && (
          <div style={styles.notifBadge}>
            <span style={styles.badgeCount}>{notificationCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  islandContainer: {
    width: '340px',
    height: '36px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    cursor: 'pointer',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    top: '8px',
    zIndex: 9999,
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    border: '1.5px solid rgba(255,255,255,0.12)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.9)',
    WebkitAppRegion: 'drag',
  },
  glowOverlay: {
    position: 'absolute', inset: '-1px', borderRadius: '999px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
    pointerEvents: 'none', zIndex: -1,
  },
  leftRow: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' },
  iconWrapper: {
    width: '22px', height: '22px', borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    flexShrink: 0, WebkitAppRegion: 'no-drag',
  },
  textRow: {
    display: 'flex', alignItems: 'center', gap: '6px',
    overflow: 'hidden', flex: 1, WebkitAppRegion: 'no-drag',
  },
  titleText: {
    color: '#FFFFFF', fontSize: '11px', fontWeight: '700',
    fontFamily: 'var(--font-display)', letterSpacing: '0.01em',
    whiteSpace: 'nowrap', flexShrink: 0,
  },
  dividerDot: { color: '#555', fontSize: '9px' },
  actionText: { fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rightSection: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, WebkitAppRegion: 'no-drag' },
  glowDot: { width: '5px', height: '5px', borderRadius: '50%' },
  micButton: {
    width: '20px', height: '20px', borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    cursor: 'pointer', transition: 'all 0.2s', WebkitAppRegion: 'no-drag',
  },
  notifBadge: {
    backgroundColor: '#EF4444', width: '14px', height: '14px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #000',
  },
  badgeCount: { color: '#FFF', fontSize: '7.5px', fontWeight: '800' },
};
