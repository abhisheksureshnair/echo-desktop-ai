import React, { useState } from 'react';
import TopHeader from './TopHeader';
import WelcomeSection from './WelcomeSection';
import ChatArea from './ChatArea';
import InputArea from './InputArea';
import SidePanel from './SidePanel';
import VoiceMode from './VoiceMode';
import ScreenAnalysis from './ScreenAnalysis';
import SettingsView from './SettingsView';

// ── Browser-specific accent colours ─────────────────────────
const BROWSER_COLORS = {
  Firefox: '#FF6D00',
  Brave:   '#FB542B',
  Edge:    '#0078D4',
  Chrome:  '#5B8CFF',
  Safari:  '#5B8CFF',
  Arc:     '#A855F7',
};

export default function AssistantWindow({
  onMinimize,
  initialVoiceMode = false,
  activeApp = 'idle',
  detectedBrowser = null,
  isBrowserSidebar = false,
  onResizeRequest,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(initialVoiceMode);
  const [isScreenAnalysisOpen, setIsScreenAnalysisOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [status, setStatus] = useState('Online');
  const [showActions, setShowActions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([{
    id: 'welcome',
    sender: 'assistant',
    text: isBrowserSidebar
      ? `Hi! I'm your Echo co-pilot. I can summarize this page, explain content, translate text, help you write, or answer any question about what you're reading.`
      : "Hello! I'm Echo. Ask me anything, or tap the arrow above to browse quick actions.",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);

  const browserColor = BROWSER_COLORS[detectedBrowser] || '#5B8CFF';

  // ── Message handling ──────────────────────────────────────
  const handleSendMessage = (text) => {
    setShowActions(false);
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setIsTyping(true);
    setStatus('Thinking…');

    setTimeout(() => {
      let reply = "Got it! Let me know how else I can help.";
      let metadata = null;
      const t = text.toLowerCase();

      if (t.includes('summarize') || t.includes('summary') || t.includes('page')) {
        reply = "Here's a summary of the current page:\n\n• The page covers React component UI patterns.\n• It includes live code previews and copy-paste snippets.\n• Key topics: animations, glassmorphism, micro-interactions.\n• Useful for building premium UI libraries.";
      } else if (t.includes('explain') || t.includes('code')) {
        reply = "Here's an explanation of that code:";
        metadata = { type: 'code', title: 'snippet.jsx', content: `// Active component state sync\nconst [state, setState] = useState(null);\n\nuseEffect(() => {\n  const ch = new BroadcastChannel('flowsync');\n  ch.onmessage = e => setState(e.data);\n  return () => ch.close();\n}, []);` };
      } else if (t.includes('translate')) {
        reply = "I can translate the selected text. Please highlight the text on the page and ask me again, or paste it directly here and tell me the target language.";
      } else if (t.includes('write') || t.includes('draft') || t.includes('email')) {
        reply = "Sure! I can help you draft content. Please share what you'd like me to write — a message, email, social post, or document — and I'll get started.";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metadata,
      }]);
      setIsTyping(false);
      setStatus('Online');
    }, 1300);
  };

  const handleActionClick = (action) => {
    setShowActions(false);
    if (action.actionType === 'voice_mode') setIsVoiceOpen(true);
    else if (action.actionType === 'screen_analysis') setIsScreenAnalysisOpen(true);
    else if (action.prompt) handleSendMessage(action.prompt);
  };

  // ── Suggested prompts for browser sidebar ─────────────────
  const BROWSER_SUGGESTIONS = [
    { label: '📄 Summarize this page', prompt: 'Summarize the current page content for me.' },
    { label: '🌐 Translate selection', prompt: 'Translate the selected text to English.' },
    { label: '💡 Explain this', prompt: 'Explain the main concept on this page in simple terms.' },
    { label: '✍️ Help me write', prompt: 'Help me draft a response or message based on this page.' },
  ];

  // ── BROWSER SIDEBAR MODE ──────────────────────────────────
  if (isBrowserSidebar) {
    return (
      <div style={sidebarStyles.root}>
        {/* ── Header — mimics Edge Copilot panel header ── */}
        <div style={sidebarStyles.header}>
          <div style={sidebarStyles.headerLeft}>
            {/* Animated dot */}
            <span style={{ ...sidebarStyles.liveDot, backgroundColor: browserColor, boxShadow: `0 0 6px ${browserColor}` }} />
            <div style={sidebarStyles.headerTitles}>
              <span style={sidebarStyles.headerTitle}>Echo</span>
              <span style={{ ...sidebarStyles.headerSub, color: browserColor }}>
                {detectedBrowser ? `${detectedBrowser} Co-pilot` : 'Browser Co-pilot'}
              </span>
            </div>
          </div>
          <div style={sidebarStyles.headerRight}>
            {/* Minimize to island */}
            <button style={sidebarStyles.iconBtn} onClick={onMinimize} title="Close sidebar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Quick suggestions (only when no messages beyond welcome) ── */}
        {messages.length <= 1 && (
          <div style={sidebarStyles.suggestionsArea}>
            <p style={sidebarStyles.suggestLabel}>What would you like to do?</p>
            <div style={sidebarStyles.suggestionsGrid}>
              {BROWSER_SUGGESTIONS.map(s => (
                <button
                  key={s.label}
                  style={sidebarStyles.suggestionChip}
                  onClick={() => handleSendMessage(s.prompt)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Chat messages ── */}
        <div style={sidebarStyles.chatArea}>
          <ChatArea messages={messages} isTyping={isTyping} />
        </div>

        {/* ── Input bar ── */}
        <div style={sidebarStyles.inputWrapper}>
          <InputArea
            onSendMessage={handleSendMessage}
            onTriggerVoice={() => setIsVoiceOpen(true)}
            onTriggerScreenAnalysis={() => setIsScreenAnalysisOpen(true)}
          />
        </div>

        {/* Voice overlay */}
        {isVoiceOpen && (
          <VoiceMode
            onClose={() => setIsVoiceOpen(false)}
            onSendTranscript={(t) => { setIsVoiceOpen(false); handleSendMessage(t); }}
          />
        )}
      </div>
    );
  }

  // ── STANDARD FLOATING MODE ────────────────────────────────
  return (
    <div style={floatStyles.outerLayout}>
      <SidePanel
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectHistory={(t) => { handleSendMessage(`Load context for: ${t}`); setIsSidebarOpen(false); }}
      />
      <div className="glass-panel" style={floatStyles.windowContainer}>
        {isSettingsOpen ? (
          <SettingsView onClose={() => setIsSettingsOpen(false)} />
        ) : (
          <>
            {isVoiceOpen && (
              <VoiceMode
                onClose={() => setIsVoiceOpen(false)}
                onSendTranscript={(t) => { setIsVoiceOpen(false); handleSendMessage(t); }}
              />
            )}
            <TopHeader
              status={status}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onToggleSearch={() => handleSendMessage("Search workspace files…")}
              onToggleSettings={() => setIsSettingsOpen(true)}
              onMinimize={onMinimize}
            />
            <div style={{
              ...floatStyles.collapsibleActions,
              maxHeight: showActions ? '360px' : '0px',
              borderBottom: showActions ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <WelcomeSection onActionClick={handleActionClick} activeApp={activeApp} />
            </div>
            <div style={floatStyles.toggleBar} onClick={() => setShowActions(v => !v)}>
              <span style={floatStyles.toggleLabel}>{showActions ? 'Hide actions' : 'Quick actions'}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: '#8E8E93', transition: 'transform .3s', transform: showActions ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <div style={floatStyles.contentBody}>
              {isScreenAnalysisOpen ? (
                <div style={{ padding: 20, height: '100%' }}>
                  <ScreenAnalysis
                    onClose={() => setIsScreenAnalysisOpen(false)}
                    onTriggerAction={(label) => { setIsScreenAnalysisOpen(false); handleSendMessage(`Perform "${label}" on screen.`); }}
                  />
                </div>
              ) : (
                <ChatArea messages={messages} isTyping={isTyping} />
              )}
            </div>
            <InputArea
              onSendMessage={handleSendMessage}
              onTriggerVoice={() => setIsVoiceOpen(true)}
              onTriggerScreenAnalysis={() => setIsScreenAnalysisOpen(true)}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ── Browser Sidebar Styles — matches Edge Copilot aesthetic ─
const sidebarStyles = {
  root: {
    position: 'fixed',
    top: 0, right: 0, bottom: 0, left: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(13, 17, 28, 0.96)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    // Left divider — the visual "edge" between browser content and our panel
    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(20, 26, 40, 0.6)',
    flexShrink: 0,
    // Drag handle so user can still move the window
    WebkitAppRegion: 'drag',
    userSelect: 'none',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  liveDot: {
    display: 'inline-block',
    width: '7px', height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
    animation: 'indicator-glow 2s ease-in-out infinite',
  },
  headerTitles: { display: 'flex', flexDirection: 'column', gap: '1px' },
  headerTitle: {
    fontSize: '12px', fontWeight: '700', color: '#FFFFFF',
    fontFamily: 'var(--font-display)', letterSpacing: '-0.01em',
  },
  headerSub: {
    fontSize: '9px', fontWeight: '600',
    letterSpacing: '0.06em', textTransform: 'uppercase',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '4px', WebkitAppRegion: 'no-drag' },
  iconBtn: {
    background: 'none', border: 'none',
    color: '#7E8799', cursor: 'pointer',
    padding: '5px', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  },

  suggestionsArea: {
    padding: '14px 14px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    flexShrink: 0,
  },
  suggestLabel: {
    fontSize: '10px', fontWeight: '600',
    color: '#7E8799', letterSpacing: '0.04em',
    textTransform: 'uppercase', marginBottom: '10px',
  },
  suggestionsGrid: { display: 'flex', flexDirection: 'column', gap: '6px' },
  suggestionChip: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#B8C0D4',
    fontSize: '12px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'var(--font-sans)',
  },

  chatArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  inputWrapper: {
    flexShrink: 0,
    borderTop: '1px solid rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(11,18,32,0.4)',
  },
};

// ── Standard Floating Panel Styles ───────────────────────────
const floatStyles = {
  outerLayout: { display: 'flex', width: '100%', height: '100%', position: 'relative' },
  windowContainer: {
    flex: 1, height: '100%', borderRadius: '24px',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    position: 'relative', backgroundColor: 'rgba(11,18,32,0.88)',
    backdropFilter: 'blur(32px) saturate(160%)',
    WebkitBackdropFilter: 'blur(32px) saturate(160%)',
  },
  collapsibleActions: {
    overflowY: 'auto',
    transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)',
    backgroundColor: 'rgba(11,18,32,0.2)', flexShrink: 0,
  },
  toggleBar: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '5px 12px', backgroundColor: 'rgba(20,26,40,0.3)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    cursor: 'pointer', gap: '6px', flexShrink: 0,
    WebkitAppRegion: 'no-drag',
  },
  toggleLabel: { fontSize: '10px', fontWeight: '600', color: '#8E8E93', letterSpacing: '0.03em' },
  contentBody: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
};
