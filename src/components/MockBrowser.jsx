import React from 'react';
import { X, ArrowLeft, ArrowRight, RotateCw, ShieldCheck } from 'lucide-react';

// Chrome logo as inline SVG (lucide-react has no Chrome icon)
const ChromeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#5B8CFF" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="4" fill="#5B8CFF"/>
    <line x1="12" y1="2" x2="12" y2="8" stroke="#5B8CFF" strokeWidth="1.5"/>
    <line x1="21" y1="17" x2="15.5" y2="14" stroke="#5B8CFF" strokeWidth="1.5"/>
    <line x1="3" y1="17" x2="8.5" y2="14" stroke="#5B8CFF" strokeWidth="1.5"/>
  </svg>
);

export default function MockBrowser({ onClose }) {
  return (
    <div style={styles.browserFrame}>
      {/* Chrome Top Bar Controls */}
      <div style={styles.browserHeader}>
        {/* Native OS Buttons */}
        <div style={styles.windowControls}>
          <span style={{ ...styles.dot, backgroundColor: '#EF4444' }} onClick={onClose}></span>
          <span style={{ ...styles.dot, backgroundColor: '#F59E0B' }}></span>
          <span style={{ ...styles.dot, backgroundColor: '#22C55E' }}></span>
        </div>

        {/* Browser Tabs */}
        <div style={styles.tabsContainer}>
          <div style={{ ...styles.tab, ...styles.activeTab }}>
            <ChromeIcon />
            <span style={styles.tabText}>React Reference - Hooks</span>
            <X size={10} style={styles.tabClose} onClick={onClose} />
          </div>
          <div style={styles.tab}>
            <span style={styles.tabText}>Echo Architecture</span>
          </div>
        </div>
      </div>

      {/* Navigation & Address Bar */}
      <div style={styles.navBar}>
        <div style={styles.navArrows}>
          <ArrowLeft size={14} style={styles.navIcon} />
          <ArrowRight size={14} style={{ ...styles.navIcon, opacity: 0.3 }} />
          <RotateCw size={12} style={styles.navIcon} />
        </div>

        <div style={styles.addressBar}>
          <ShieldCheck size={12} style={{ color: '#22C55E', marginRight: 6 }} />
          <span style={styles.addressText}>https://react.dev/reference/react/useSyncExternalStore</span>
        </div>

        <button style={styles.actionBtn} onClick={onClose} title="Detach Copilot Sidebar">
          <X size={14} style={{ color: '#7E8799' }} />
        </button>
      </div>

      {/* Web Page Viewport Content */}
      <div style={styles.viewport}>
        <div style={styles.pageContent}>
          <div style={styles.pageHeader}>
            <span style={styles.category}>REFERENCE • REACT HOOKS</span>
            <h1 style={styles.title}>useSyncExternalStore</h1>
            <p style={styles.lead}>
              `useSyncExternalStore` is a React Hook that lets you subscribe to an external store.
            </p>
          </div>

          {/* Quick Info Box */}
          <div style={styles.infoBox}>
            <p style={{ margin: 0, fontWeight: '600', color: '#5B8CFF', fontSize: '11px', letterSpacing: '0.04em' }}>
              💡 INTEGRATED DESKTOP COPILOT ACTIVE
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#B8C0D4', lineHeight: '1.4' }}>
              Echo is linked to this active tab. You can ask the sidebar on the right to summarize, extract hooks, or generate client wrapper files.
            </p>
          </div>

          <h2 style={styles.sectionTitle}>Usage</h2>
          <p style={styles.paragraph}>
            Call `useSyncExternalStore` at the top level of your component to read a value from an external data store.
          </p>

          {/* Mock Code Block in the documentation page */}
          <div style={styles.docCodeBlock}>
            <span style={{ color: '#7E8799', fontSize: '10px', display: 'block', marginBottom: '8px' }}>react_component.js</span>
            <code style={styles.docCode}>
              <span style={{ color: '#5B8CFF' }}>import </span>
              <span style={{ color: '#FFFFFF' }}>&#123; useSyncExternalStore &#125; </span>
              <span style={{ color: '#5B8CFF' }}>from </span>
              <span style={{ color: '#22C55E' }}>'react'</span>;<br />
              <span style={{ color: '#5B8CFF' }}>import </span>
              <span style={{ color: '#FFFFFF' }}>&#123; todosStore &#125; </span>
              <span style={{ color: '#5B8CFF' }}>from </span>
              <span style={{ color: '#22C55E' }}>'./todoStore.js'</span>;<br /><br />
              <span style={{ color: '#5B8CFF' }}>function </span>
              <span style={{ color: '#F59E0B' }}>TodosApp</span>
              <span style={{ color: '#FFFFFF' }}>() &#123;</span><br />
              <span style={{ color: '#5B8CFF' }}>  const </span>
              <span style={{ color: '#FFFFFF' }}>todos = </span>
              <span style={{ color: '#F59E0B' }}>useSyncExternalStore</span>
              <span style={{ color: '#FFFFFF' }}>(todosStore.subscribe, todosStore.getSnapshot);</span><br />
              <span style={{ color: '#5B8CFF' }}>  return </span>
              <span style={{ color: '#EF4444' }}>&lt;TodoList items=&#123;todos&#125; /&gt;</span>;<br />
              <span style={{ color: '#FFFFFF' }}>&#125;</span>
            </code>
          </div>

          <h2 style={styles.sectionTitle}>Parameters</h2>
          <p style={styles.paragraph}>
            * **`subscribe`**: A function that takes a single callback argument and subscribes it to the store.
          </p>
          <p style={styles.paragraph}>
            * **`getSnapshot`**: A function that returns a snapshot of the data in the store that the component needs.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  browserFrame: {
    width: '660px',
    height: '100%',
    backgroundColor: '#0F1626',
    borderTopLeftRadius: '28px',
    borderBottomLeftRadius: '28px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  browserHeader: {
    height: '40px',
    backgroundColor: '#070B13',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    gap: '20px',
  },
  windowControls: {
    display: 'flex',
    gap: '6px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    cursor: 'pointer',
  },
  tabsContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    height: '100%',
    gap: '4px',
  },
  tab: {
    height: '32px',
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  activeTab: {
    backgroundColor: '#0F1626',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderBottom: 'none',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabText: {
    whiteSpace: 'nowrap',
  },
  tabClose: {
    marginLeft: '8px',
    opacity: 0.5,
    ':hover': {
      opacity: 1,
    }
  },
  navBar: {
    height: '38px',
    backgroundColor: '#0B1220',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    gap: '12px',
  },
  navArrows: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'var(--text-secondary)',
  },
  navIcon: {
    cursor: 'pointer',
    opacity: 0.8,
  },
  addressBar: {
    flex: 1,
    height: '26px',
    borderRadius: '6px',
    backgroundColor: '#070B13',
    border: '1px solid rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
  },
  addressText: {
    color: 'var(--text-secondary)',
    fontSize: '10.5px',
    fontFamily: 'monospace',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.06)',
    }
  },
  viewport: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#0F1626',
    padding: '24px 32px',
  },
  pageContent: {
    maxWidth: '560px',
    margin: '0 auto',
    textAlign: 'left',
  },
  pageHeader: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  category: {
    fontSize: '9px',
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: '0.1em',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
    color: '#FFFFFF',
    marginTop: '6px',
    marginBottom: '10px',
  },
  lead: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  infoBox: {
    backgroundColor: 'rgba(91, 140, 255, 0.05)',
    border: '1.5px solid rgba(91, 140, 255, 0.15)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: '24px',
    marginBottom: '10px',
    fontFamily: 'var(--font-display)',
  },
  paragraph: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  docCodeBlock: {
    backgroundColor: '#070B13',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '14px',
    fontFamily: 'monospace',
    fontSize: '11px',
    lineHeight: '1.5',
    marginBottom: '20px',
  },
  docCode: {
    color: '#B8C0D4',
  }
};
