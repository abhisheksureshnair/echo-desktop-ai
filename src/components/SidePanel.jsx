import React from 'react';
import { 
  History, Pin, FileCode, CheckSquare, Calendar, Settings, 
  Database, ChevronLeft, Sparkles, MessageSquare, Plus, Clock
} from 'lucide-react';

export default function SidePanel({ isOpen, onClose, onSelectHistory }) {
  if (!isOpen) return null;

  const historyItems = [
    "Refactoring Auth API.py",
    "Designing Glassmorphic CSS",
    "Electron Wrapper Guide",
    "Tauri Config Walkthrough"
  ];

  const pinnedItems = [
    "System Requirements Doc",
    "Echo Core Architecture",
    "Global Styling Palette"
  ];

  const recentFiles = [
    "App.jsx",
    "index.css",
    "main.jsx",
    "package.json"
  ];

  const tasks = [
    { title: "Review UI feedback", done: true },
    { title: "Optimize backdrop blur", done: false },
    { title: "Verify spring easings", done: false }
  ];

  return (
    <div className="glass-panel" style={styles.sidePanelContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <History size={15} style={{ color: '#5B8CFF' }} />
          <span style={styles.headerText}>Echo Workspace</span>
        </div>
        <button style={styles.closeBtn} onClick={onClose}>
          <ChevronLeft size={16} style={{ color: '#7E8799' }} />
        </button>
      </div>

      {/* Content Scroller */}
      <div style={styles.scrollableContent}>
        {/* Pinned Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Pin size={11} style={{ marginRight: 6 }} />
            <span>PINNED CHATS</span>
          </div>
          <div style={styles.list}>
            {pinnedItems.map((item, index) => (
              <div 
                key={index} 
                style={styles.listItem} 
                className="btn-ripple"
                onClick={() => onSelectHistory(`Pinned: ${item}`)}
              >
                <MessageSquare size={13} style={styles.listIcon} />
                <span style={styles.itemText}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* History Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Clock size={11} style={{ marginRight: 6 }} />
            <span>RECENT CHATS</span>
          </div>
          <div style={styles.list}>
            {historyItems.map((item, index) => (
              <div 
                key={index} 
                style={styles.listItem} 
                className="btn-ripple"
                onClick={() => onSelectHistory(item)}
              >
                <MessageSquare size={13} style={styles.listIcon} />
                <span style={styles.itemText}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Files */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <FileCode size={11} style={{ marginRight: 6 }} />
            <span>RECENT FILES</span>
          </div>
          <div style={styles.list}>
            {recentFiles.map((file, index) => (
              <div key={index} style={styles.fileItem}>
                <span style={styles.fileDot}></span>
                <span style={styles.fileText}>{file}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <CheckSquare size={11} style={{ marginRight: 6 }} />
            <span>TODAY'S TASKS</span>
          </div>
          <div style={styles.taskList}>
            {tasks.map((task, index) => (
              <div key={index} style={styles.taskItem}>
                <input 
                  type="checkbox" 
                  checked={task.done} 
                  readOnly 
                  style={styles.checkbox} 
                />
                <span style={{ 
                  ...styles.taskText,
                  textDecoration: task.done ? 'line-through' : 'none',
                  color: task.done ? 'var(--text-muted)' : 'var(--text-secondary)'
                }}>{task.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Alert */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Calendar size={11} style={{ marginRight: 6 }} />
            <span>CALENDAR</span>
          </div>
          <div style={styles.calendarCard}>
            <div style={styles.calendarHeader}>
              <span style={styles.calendarLabel}>Next Event</span>
              <span style={styles.calendarTime}>10:00 AM</span>
            </div>
            <p style={styles.calendarTitle}>Echo Demo & Planning</p>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div style={styles.footer}>
        <div style={styles.footerItem}>
          <Database size={13} style={{ color: '#7E8799', marginRight: 6 }} />
          <span style={styles.footerText}>Memory: 3.4GB / 8GB</span>
        </div>
        <div style={styles.footerItem}>
          <Settings size={13} style={{ color: '#7E8799', marginRight: 6 }} />
          <span style={styles.footerText}>Settings</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidePanelContainer: {
    width: '240px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(11, 18, 32, 0.9)',
    borderTopLeftRadius: '28px',
    borderBottomLeftRadius: '28px',
    overflow: 'hidden',
    animation: 'slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 16px 12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: '0.02em',
    fontFamily: 'var(--font-display)',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    }
  },
  scrollableContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionHeader: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    display: 'flex',
    alignItems: 'center',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid transparent',
    transition: 'all 0.15s ease',
    ':hover': {
      backgroundColor: 'rgba(91, 140, 255, 0.06)',
      borderColor: 'rgba(91, 140, 255, 0.12)',
    }
  },
  listIcon: {
    color: 'var(--text-muted)',
    marginRight: '8px',
    flexShrink: 0,
  },
  itemText: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: '500',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 10px',
  },
  fileDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#5B8CFF',
    marginRight: '10px',
  },
  fileText: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontFamily: 'monospace',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '2px 8px',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkbox: {
    accentColor: '#5B8CFF',
    cursor: 'pointer',
    width: '12px',
    height: '12px',
  },
  taskText: {
    fontSize: '11px',
    fontWeight: '500',
  },
  calendarCard: {
    padding: '10px',
    borderRadius: '10px',
    backgroundColor: 'rgba(91, 140, 255, 0.05)',
    border: '1px solid rgba(91, 140, 255, 0.1)',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    fontWeight: '600',
    color: '#5B8CFF',
    marginBottom: '4px',
  },
  calendarLabel: {
    letterSpacing: '0.04em',
  },
  calendarTime: {
    color: '#FFFFFF',
  },
  calendarTitle: {
    fontSize: '11px',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    padding: '14px 16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  footerText: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '500',
    ':hover': {
      color: '#FFFFFF',
    }
  }
};
