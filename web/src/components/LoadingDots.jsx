'use client';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 20px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--accent-violet)',
  },
  label: {
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    marginLeft: '8px',
    fontWeight: '500',
  },
};

export default function LoadingDots() {
  return (
    <div style={styles.container}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            ...styles.dot,
            animation: `bounce 1.4s ${i * 0.16}s infinite ease-in-out both`,
          }}
        />
      ))}
      <span style={styles.label}>Thinking...</span>
    </div>
  );
}
