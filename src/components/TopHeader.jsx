import React from 'react';
import { Settings, Search, Minimize2, Sparkles, Sidebar } from 'lucide-react';

export default function TopHeader({ status, onToggleSidebar, onToggleSearch, onToggleSettings, onMinimize }) {
  return (
    <div style={styles.headerContainer}>
      {/* Branding Left */}
      <div style={styles.leftSection}>
        {/* Glowing mini logo */}
        <div style={styles.logoWrapper}>
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="rgba(91, 140, 255, 0.4)" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="4" fill="#5B8CFF" style={{ filter: 'drop-shadow(0 0 4px #5B8CFF)' }} />
          </svg>
        </div>
        <div style={styles.titleArea}>
          <span style={styles.title}>Echo</span>
          <div style={styles.statusRow}>
            <span style={styles.statusDot}></span>
            <span style={styles.statusText}>{status || 'Idle'}</span>
          </div>
        </div>
      </div>

      {/* Action Controls Right */}
      <div style={styles.rightSection}>
        <button style={styles.iconBtn} onClick={onToggleSidebar} title="Toggle Workspace Panel">
          <Sidebar size={15} />
        </button>
        <button style={styles.iconBtn} onClick={onToggleSearch} title="Search Workspace">
          <Search size={15} />
        </button>
        <button style={styles.iconBtn} onClick={onToggleSettings} title="Settings">
          <Settings size={15} />
        </button>
        <div style={styles.divider}></div>
        <button style={{ ...styles.iconBtn, ...styles.minimizeBtn }} onClick={onMinimize} title="Minimize to Island">
          <Minimize2 size={14} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(11, 18, 32, 0.25)',
    WebkitAppRegion: 'drag', // Native window dragging!
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoWrapper: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: 'rgba(91, 140, 255, 0.08)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid rgba(91, 140, 255, 0.2)',
  },
  titleArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '-0.01em',
    fontFamily: 'var(--font-display)',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '1px',
  },
  statusDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#22C55E',
  },
  statusText: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    WebkitAppRegion: 'no-drag', // Stop drag on buttons container
  },
  iconBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    WebkitAppRegion: 'no-drag', // Make buttons clickable
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      color: '#FFFFFF',
    }
  },
  divider: {
    width: '1px',
    height: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: '0 4px',
  },
  minimizeBtn: {
    color: '#EF4444',
    WebkitAppRegion: 'no-drag', // Make minimize clickable
    ':hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
      color: '#EF4444',
    }
  }
};
