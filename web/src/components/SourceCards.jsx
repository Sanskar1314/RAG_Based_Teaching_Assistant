'use client';

import { useState } from 'react';

const styles = {
  container: {
    marginTop: '12px',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--bg-glass-border)',
    background: 'var(--bg-glass)',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: 'var(--font-sans)',
  },
  toggleHover: {
    background: 'var(--bg-glass-hover)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    color: 'var(--text-accent)',
  },
  chevron: {
    fontSize: '10px',
    transition: 'transform 0.3s var(--ease-out)',
  },
  cardsGrid: {
    display: 'grid',
    gap: '10px',
    marginTop: '12px',
    animation: 'fadeInUp 0.35s var(--ease-out) forwards',
  },
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '14px 16px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--bg-glass-border)',
    transition: 'all 0.25s ease',
    cursor: 'default',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    transform: 'translateX(4px)',
  },
  videoIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--gradient-brand-subtle)',
    fontSize: '16px',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '4px',
  },
  videoBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-brand)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
  },
  timestamp: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
    fontWeight: '500',
  },
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function SourceCards({ sources }) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(-1);
  const [toggleHovered, setToggleHovered] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.toggle,
          ...(toggleHovered ? styles.toggleHover : {}),
        }}
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={() => setToggleHovered(true)}
        onMouseLeave={() => setToggleHovered(false)}
        aria-expanded={expanded}
        id="source-toggle-btn"
      >
        <span>📚</span>
        <span>{sources.length} Source{sources.length > 1 ? 's' : ''}</span>
        <span
          style={{
            ...styles.chevron,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div style={styles.cardsGrid}>
          {sources.map((source, index) => (
            <div
              key={index}
              style={{
                ...styles.card,
                ...(hoveredCard === index ? styles.cardHover : {}),
                animationDelay: `${index * 0.05}s`,
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(-1)}
            >
              <div style={styles.videoIcon}>🎥</div>
              <div style={styles.cardContent}>
                <div style={styles.cardTitle}>{source.title}</div>
                <div style={styles.cardMeta}>
                  <span style={styles.videoBadge}>Video #{source.number}</span>
                  <span style={styles.timestamp}>
                    ⏱ {formatTime(source.start)} — {formatTime(source.end)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
