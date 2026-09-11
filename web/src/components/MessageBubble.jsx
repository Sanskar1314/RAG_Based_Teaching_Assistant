'use client';

import LoadingDots from './LoadingDots';
import SourceCards from './SourceCards';

const styles = {
  wrapper: {
    padding: '20px 24px',
    animation: 'fadeInUp 0.4s var(--ease-out) forwards',
    opacity: 0,
  },
  userRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '4px',
  },
  aiRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '4px',
  },
  userBubble: {
    maxWidth: '75%',
    padding: '14px 20px',
    borderRadius: '20px 20px 6px 20px',
    background: 'var(--gradient-user-msg)',
    color: '#ffffff',
    fontSize: '15px',
    lineHeight: '1.65',
    fontWeight: '400',
    boxShadow: '0 4px 16px rgba(79, 70, 229, 0.25)',
    wordWrap: 'break-word',
  },
  aiBubbleOuter: {
    maxWidth: '85%',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  aiAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'var(--gradient-brand-subtle)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
    marginTop: '2px',
  },
  aiBubble: {
    padding: '16px 20px',
    borderRadius: '6px 20px 20px 20px',
    background: 'var(--bg-glass)',
    border: '1px solid var(--bg-glass-border)',
    color: 'var(--text-primary)',
    fontSize: '15px',
    lineHeight: '1.7',
    fontWeight: '400',
    wordWrap: 'break-word',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  errorBubble: {
    padding: '14px 20px',
    borderRadius: '6px 20px 20px 20px',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '6px',
    padding: '0 4px',
  },
  userLabel: {
    color: 'var(--text-tertiary)',
    textAlign: 'right',
  },
  aiLabel: {
    color: 'var(--text-brand)',
    marginLeft: '46px',
  },
};

export default function MessageBubble({ message }) {
  const { role, content, sources, isLoading, isError } = message;

  if (role === 'user') {
    return (
      <div style={styles.wrapper}>
        <div style={{ ...styles.label, ...styles.userLabel }}>You</div>
        <div style={styles.userRow}>
          <div style={styles.userBubble}>{content}</div>
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.label, ...styles.aiLabel }}>SigmaLearn AI</div>
      <div style={styles.aiRow}>
        <div style={styles.aiBubbleOuter}>
          <div style={styles.aiAvatar}>✨</div>
          <div>
            {isLoading ? (
              <div style={styles.aiBubble}>
                <LoadingDots />
              </div>
            ) : isError ? (
              <div style={styles.errorBubble}>
                ⚠️ {content}
              </div>
            ) : (
              <>
                <div style={styles.aiBubble}>{content}</div>
                {sources && <SourceCards sources={sources} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
