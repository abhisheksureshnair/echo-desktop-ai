import React, { useState } from 'react';
import { Paperclip, Mic, ArrowUp, Send, Eye } from 'lucide-react';

export default function InputArea({ onSendMessage, onTriggerVoice, onTriggerScreenAnalysis }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form style={styles.formContainer} onSubmit={handleSubmit}>
      {/* Glassmorphic input wrapper */}
      <div style={styles.inputTray}>
        {/* Left Actions: Upload & Screen Inspect */}
        <div style={styles.actionLeft}>
          <button 
            type="button" 
            style={styles.iconBtn} 
            title="Upload File"
            onClick={() => alert("Select a file to upload to Echo")}
          >
            <Paperclip size={15} />
          </button>
          <button 
            type="button" 
            style={styles.iconBtn} 
            title="Analyze Screen"
            onClick={onTriggerScreenAnalysis}
          >
            <Eye size={15} />
          </button>
        </div>

        {/* Text Input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Echo anything..."
          style={styles.textarea}
          rows="1"
        />

        {/* Right Actions: Voice & Send */}
        <div style={styles.actionRight}>
          <button 
            type="button" 
            style={{ ...styles.iconBtn, ...styles.micBtn }} 
            onClick={onTriggerVoice}
            title="Start Voice Conversation"
          >
            <Mic size={15} />
          </button>
          
          <button 
            type="submit" 
            style={{
              ...styles.sendBtn,
              backgroundColor: text.trim() ? '#5B8CFF' : 'rgba(255,255,255,0.03)',
              color: text.trim() ? '#FFFFFF' : '#7E8799',
              cursor: text.trim() ? 'pointer' : 'default',
              boxShadow: text.trim() ? '0 4px 10px rgba(91, 140, 255, 0.3)' : 'none',
            }}
            disabled={!text.trim()}
            title="Send Message"
          >
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </form>
  );
}

const styles = {
  formContainer: {
    padding: '0 20px 20px 20px',
    backgroundColor: 'transparent',
  },
  inputTray: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 26, 40, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '24px',
    padding: '8px 12px',
    backdropFilter: 'blur(16px)',
    gap: '8px',
    transition: 'border-color 0.2s ease',
    ':focus-within': {
      borderColor: 'rgba(91, 140, 255, 0.4)',
    }
  },
  actionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  actionRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  iconBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#B8C0D4',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      color: '#FFFFFF',
    }
  },
  micBtn: {
    color: '#5B8CFF',
    backgroundColor: 'rgba(91, 140, 255, 0.06)',
    border: '1px solid rgba(91, 140, 255, 0.1)',
    ':hover': {
      backgroundColor: 'rgba(91, 140, 255, 0.12)',
    }
  },
  textarea: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#FFFFFF',
    fontSize: '13px',
    fontFamily: 'var(--font-sans)',
    resize: 'none',
    padding: '8px 4px',
    lineHeight: '1.4',
    maxHeight: '80px',
    overflowY: 'auto',
  },
  sendBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  }
};
