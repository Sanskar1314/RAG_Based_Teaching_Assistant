'use client';

import { useState, useRef, useEffect } from 'react';

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, var(--bg-primary) 60%, transparent)',
    padding: '16px 24px 24px',
    zIndex: 50,
  },
  inner: {
    maxWidth: '860px',
    margin: '0 auto',
    position: 'relative',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    padding: '8px 8px 8px 20px',
    borderRadius: '20px',
    background: 'var(--bg-tertiary)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--bg-glass-border)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    transition: 'all 0.3s ease',
  },
  inputWrapperFocused: {
    borderColor: 'rgba(99, 102, 241, 0.4)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(99, 102, 241, 0.1)',
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '15px',
    fontFamily: 'var(--font-sans)',
    lineHeight: '1.5',
    resize: 'none',
    padding: '10px 0',
    maxHeight: '120px',
    minHeight: '24px',
  },
  sendButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    background: 'var(--gradient-brand)',
    color: '#fff',
    fontSize: '18px',
    flexShrink: 0,
    transition: 'all 0.25s var(--ease-spring)',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    fontFamily: 'var(--font-sans)',
  },
  sendButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
    transform: 'scale(1)',
  },
  sendButtonHover: {
    transform: 'scale(1.08)',
    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
  },
  hint: {
    textAlign: 'center',
    marginTop: '10px',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
  },
  kbd: {
    display: 'inline-block',
    padding: '1px 6px',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
    marginLeft: '2px',
  },
};

export default function InputBar({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div
          style={{
            ...styles.inputWrapper,
            ...(focused ? styles.inputWrapperFocused : {}),
          }}
        >
          <textarea
            ref={textareaRef}
            id="question-input"
            style={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask about HTML, CSS, JavaScript, or any web dev topic..."
            rows={1}
            disabled={disabled}
            aria-label="Ask a question"
          />
          <button
            id="send-btn"
            style={{
              ...styles.sendButton,
              ...(!canSend ? styles.sendButtonDisabled : {}),
              ...(canSend && hovered ? styles.sendButtonHover : {}),
            }}
            onClick={handleSubmit}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={!canSend}
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
        <div style={styles.hint}>
          Press <span style={styles.kbd}>Enter</span> to send · <span style={styles.kbd}>Shift + Enter</span> for new line
        </div>
      </div>
    </div>
  );
}
