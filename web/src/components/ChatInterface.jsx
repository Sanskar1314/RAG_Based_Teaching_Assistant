'use client';

import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 72px)',
    position: 'relative',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '140px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px 24px',
    textAlign: 'center',
    animation: 'fadeIn 0.8s ease forwards',
  },
  emptyIcon: {
    fontSize: '56px',
    marginBottom: '20px',
    animation: 'float 3s ease-in-out infinite',
  },
  emptyTitle: {
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    marginBottom: '10px',
  },
  emptySubtitle: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    maxWidth: '440px',
    lineHeight: '1.6',
    marginBottom: '40px',
  },
  suggestionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
    maxWidth: '700px',
    width: '100%',
  },
  suggestionCard: {
    padding: '16px 18px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-glass)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--bg-glass-border)',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  suggestionCardHover: {
    background: 'var(--bg-glass-hover)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    transform: 'translateY(-2px)',
    boxShadow: 'var(--shadow-glow)',
  },
  suggestionIcon: {
    fontSize: '20px',
    marginBottom: '8px',
    display: 'block',
  },
  suggestionText: {
    fontWeight: '500',
    fontSize: '13px',
  },
};

const SUGGESTIONS = [
  { icon: '🎨', text: 'How do I use CSS Flexbox for layouts?' },
  { icon: '📱', text: 'Explain responsive web design basics' },
  { icon: '⚡', text: 'How to add JavaScript to a website?' },
  { icon: '🏗️', text: 'What HTML tags are taught in this course?' },
  { icon: '🎯', text: 'Where are CSS selectors explained?' },
  { icon: '🔧', text: 'How to create forms in HTML?' },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredSuggestion, setHoveredSuggestion] = useState(-1);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question) => {
    // Add user message
    const userMessage = { role: 'user', content: question };
    const loadingMessage = { role: 'ai', content: '', isLoading: true };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: 'ai',
            content: data.error,
            isError: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: 'ai',
            content: data.response,
            sources: data.sources,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: 'ai',
          content: 'Failed to connect to the server. Please try again.',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text) => {
    handleSend(text);
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={styles.container}>
      <div style={styles.messagesArea}>
        {isEmpty ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🧠</div>
            <h1 style={styles.emptyTitle}>
              <span className="gradient-text">What would you like to learn?</span>
            </h1>
            <p style={styles.emptySubtitle}>
              Ask any question about the Sigma Web Development course. I'll search through all the video content and give you precise answers with timestamps.
            </p>
            <div style={styles.suggestionsGrid}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  id={`suggestion-${i}`}
                  style={{
                    ...styles.suggestionCard,
                    ...(hoveredSuggestion === i ? styles.suggestionCardHover : {}),
                  }}
                  onMouseEnter={() => setHoveredSuggestion(i)}
                  onMouseLeave={() => setHoveredSuggestion(-1)}
                  onClick={() => handleSuggestionClick(s.text)}
                >
                  <span style={styles.suggestionIcon}>{s.icon}</span>
                  <span style={styles.suggestionText}>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <InputBar onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
