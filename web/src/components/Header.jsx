'use client';

import { useState, useEffect } from 'react';

const styles = {
  header: {
    position: 'relative',
    padding: '0 24px',
    borderBottom: '1px solid var(--bg-glass-border)',
    background: 'rgba(10, 10, 15, 0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    zIndex: 100,
  },
  inner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '72px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'var(--gradient-brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
    transition: 'transform 0.3s var(--ease-spring)',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  logoTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
  },
  logoSubtitle: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-tertiary)',
    letterSpacing: '0.02em',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(52, 211, 153, 0.1)',
    border: '1px solid rgba(52, 211, 153, 0.2)',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--accent-emerald)',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--accent-emerald)',
    animation: 'pulseGlow 2s ease-in-out infinite',
    boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)',
  },
  githubLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-glass)',
    border: '1px solid var(--bg-glass-border)',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    fontSize: '18px',
  },
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        ...styles.header,
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div style={styles.inner}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>🚀</div>
          <div style={styles.logoText}>
            <span style={styles.logoTitle}>SigmaLearn AI</span>
            <span style={styles.logoSubtitle}>Course Assistant</span>
          </div>
        </div>

        <div style={styles.statusContainer}>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot}></span>
            <span>AI Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
