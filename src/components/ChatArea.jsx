import React, { useRef, useEffect } from 'react';
import { Sparkles, Copy, Check, FileCode, CornerDownLeft } from 'lucide-react';

export default function ChatArea({ messages, isTyping }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Render a mock code block with VS Code visual theme
  const renderCodeBlock = (title, code) => {
    return (
      <div style={styles.codeBlock}>
        <div style={styles.codeHeader}>
          <div style={styles.codeLeft}>
            <FileCode size={13} style={{ color: '#5B8CFF', marginRight: 6 }} />
            <span style={styles.codeTitle}>{title}</span>
          </div>
          <button style={styles.copyBtn} onClick={() => navigator.clipboard.writeText(code)}>
            <Copy size={11} style={{ marginRight: 4 }} />
            <span>Copy</span>
          </button>
        </div>
        <pre style={styles.pre}>
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  // Render glassmorphic data table
  const renderTable = (headers, rows) => {
    return (
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={styles.tr}>
                {row.map((cell, j) => (
                  <td key={j} style={styles.td}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render inline mock image/screenshot with glowing filter
  const renderImage = (src, caption) => {
    return (
      <div style={styles.imageBlock}>
        <img src={src} alt={caption} style={styles.image} />
        {caption && <span style={styles.imageCaption}>{caption}</span>}
      </div>
    );
  };

  const renderMessageContent = (text, type, meta) => {
    if (meta?.type === 'code') {
      return renderCodeBlock(meta.title, meta.content);
    }
    if (meta?.type === 'table') {
      return renderTable(meta.headers, meta.rows);
    }
    if (meta?.type === 'image') {
      return (
        <div>
          <p style={{ marginBottom: 12 }}>{text}</p>
          {renderImage(meta.url, meta.caption)}
        </div>
      );
    }

    return <p style={styles.messageText}>{text}</p>;
  };

  return (
    <div style={styles.chatContainer} ref={scrollRef}>
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';
        return (
          <div 
            key={msg.id} 
            style={{
              ...styles.messageRow,
              justifyContent: isUser ? 'flex-end' : 'flex-start',
            }}
          >
            {/* Assistant Icon */}
            {!isUser && (
              <div style={styles.avatar}>
                <Sparkles size={12} style={{ color: '#FFFFFF' }} />
              </div>
            )}

            {/* Bubble */}
            <div 
              style={{
                ...styles.bubble,
                backgroundColor: isUser ? '#5B8CFF' : 'rgba(20, 26, 40, 0.5)',
                border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                borderBottomLeftRadius: isUser ? '16px' : '4px',
                borderBottomRightRadius: isUser ? '4px' : '16px',
                boxShadow: isUser ? '0 4px 14px rgba(91, 140, 255, 0.3)' : 'none',
              }}
            >
              {renderMessageContent(msg.text, msg.type, msg.metadata)}
              <span style={{
                ...styles.time,
                color: isUser ? 'rgba(255, 255, 255, 0.6)' : 'var(--text-muted)'
              }}>{msg.time}</span>
            </div>
          </div>
        );
      })}

      {/* Typing animation */}
      {isTyping && (
        <div style={styles.messageRow}>
          <div style={styles.avatar}>
            <Sparkles size={12} style={{ color: '#FFFFFF' }} />
          </div>
          <div style={styles.typingBubble}>
            <div style={styles.dot1}></div>
            <div style={styles.dot2}></div>
            <div style={styles.dot3}></div>
          </div>
        </div>
      )}
      
      {/* Inject typing styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes typing-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #5B8CFF;
          display: inline-block;
          margin: 0 2px;
        }
      `}} />
    </div>
  );
}

const styles = {
  chatContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  messageRow: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    alignItems: 'flex-end',
  },
  avatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#5B8CFF',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(91, 140, 255, 0.3)',
    flexShrink: 0,
    marginBottom: '4px',
  },
  bubble: {
    maxWidth: '82%',
    padding: '12px 16px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    position: 'relative',
    fontSize: '13px',
    lineHeight: '1.5',
    color: '#FFFFFF',
  },
  messageText: {
    color: 'var(--text-secondary)',
    wordBreak: 'break-word',
  },
  time: {
    fontSize: '9px',
    alignSelf: 'flex-end',
    fontWeight: '500',
  },
  typingBubble: {
    backgroundColor: 'rgba(20, 26, 40, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    padding: '12px 18px',
    borderRadius: '16px',
    borderBottomLeftRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dot1: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#5B8CFF',
    animation: 'typing-bounce 1s infinite',
    animationDelay: '0s',
  },
  dot2: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#5B8CFF',
    animation: 'typing-bounce 1s infinite',
    animationDelay: '0.15s',
  },
  dot3: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#5B8CFF',
    animation: 'typing-bounce 1s infinite',
    animationDelay: '0.3s',
  },
  codeBlock: {
    borderRadius: '10px',
    backgroundColor: '#070B13',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginTop: '6px',
    marginBottom: '4px',
    width: '100%',
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(20, 26, 40, 0.3)',
  },
  codeLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  codeTitle: {
    color: '#B8C0D4',
    fontSize: '11px',
    fontFamily: 'monospace',
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    color: '#7E8799',
    cursor: 'pointer',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      color: '#FFFFFF',
    }
  },
  pre: {
    padding: '12px',
    margin: 0,
    overflowX: 'auto',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '11.5px',
    color: '#5B8CFF',
    textAlign: 'left',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    marginTop: '6px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11.5px',
  },
  th: {
    backgroundColor: 'rgba(91, 140, 255, 0.08)',
    color: '#FFFFFF',
    padding: '8px 12px',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.02)',
    }
  },
  td: {
    padding: '8px 12px',
    color: '#B8C0D4',
  },
  imageBlock: {
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    marginTop: '8px',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
    maxHeight: '160px',
    objectFit: 'cover',
  },
  imageCaption: {
    display: 'block',
    padding: '8px',
    fontSize: '10px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  }
};
