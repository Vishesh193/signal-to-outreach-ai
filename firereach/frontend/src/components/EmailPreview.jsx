import { useState } from 'react'

export default function EmailPreview({ email, loading }) {
  const [view, setView] = useState('text') // text | html

  if (!email && !loading) return (
    <div style={{ ...styles.card, opacity: 0.5 }}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>OUTREACH EMAIL</span>
        <span style={styles.cardNum}>05</span>
      </div>
      <div style={{ padding: '20px' }}>
        <p style={styles.placeholder}>Email will be composed and auto-sent after research...</p>
      </div>
    </div>
  )

  if (loading) return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>OUTREACH EMAIL</span>
        <span style={styles.cardNum}>05</span>
      </div>
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={styles.spinner} />
        <p style={styles.placeholder}>Composing hyper-personalized email & dispatching...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <span style={styles.cardTitle}>OUTREACH EMAIL</span>
          <span style={styles.sentBadge}>✓ SENT</span>
        </div>
        <span style={styles.cardNum}>05</span>
      </div>

      {/* Delivery info bar */}
      <div style={styles.deliveryBar}>
        <div style={styles.deliveryItem}>
          <span style={styles.deliveryLabel}>TO</span>
          <span style={styles.deliveryValue}>{email.recipient}</span>
        </div>
        <div style={styles.deliveryItem}>
          <span style={styles.deliveryLabel}>ID</span>
          <span style={styles.deliveryValue}>{email.email_id}</span>
        </div>
        <div style={styles.deliveryItem}>
          <span style={styles.deliveryLabel}>SENT</span>
          <span style={styles.deliveryValue}>
            {new Date(email.sent_at).toLocaleTimeString('en', { hour12: false })}
          </span>
        </div>
      </div>

      {/* Subject line */}
      <div style={styles.subjectLine}>
        <span style={styles.subjectLabel}>SUBJECT</span>
        <span style={styles.subjectText}>{email.subject}</span>
      </div>

      {/* View toggle */}
      <div style={styles.viewToggle}>
        <button
          style={view === 'text' ? styles.toggleBtnActive : styles.toggleBtn}
          onClick={() => setView('text')}
        >
          PLAIN TEXT
        </button>
        <button
          style={view === 'html' ? styles.toggleBtnActive : styles.toggleBtn}
          onClick={() => setView('html')}
        >
          HTML PREVIEW
        </button>
      </div>

      {/* Email body */}
      <div style={styles.emailBody}>
        {view === 'text' ? (
          <pre style={styles.emailText}>{email.email_preview}</pre>
        ) : (
          <div
            style={styles.emailHtml}
            dangerouslySetInnerHTML={{ __html: email.email_html }}
          />
        )}
      </div>

      {/* Signals referenced */}
      {email.signals_referenced?.length > 0 && (
        <div style={styles.signalsBar}>
          <span style={styles.signalsLabel}>SIGNALS CITED IN EMAIL:</span>
          <div style={styles.signalsList}>
            {email.signals_referenced.map((s, i) => (
              <span key={i} style={styles.signalTag}>⚡ {s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(0,255,136,0.2)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(0,255,136,0.15)',
    background: 'rgba(0,255,136,0.04)',
  },
  cardTitle: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '11px',
    color: '#00ff88',
    letterSpacing: '3px',
    marginRight: '12px',
  },
  sentBadge: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '10px',
    color: '#00ff88',
    background: 'rgba(0,255,136,0.12)',
    border: '1px solid rgba(0,255,136,0.3)',
    padding: '2px 10px',
    borderRadius: '10px',
  },
  cardNum: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '28px',
    fontWeight: 800,
    color: 'rgba(0,255,136,0.15)',
  },
  deliveryBar: {
    display: 'flex',
    gap: '24px',
    padding: '12px 20px',
    background: 'rgba(0,255,136,0.04)',
    borderBottom: '1px solid rgba(0,255,136,0.1)',
  },
  deliveryItem: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '9px',
    color: 'rgba(0,255,136,0.5)',
    letterSpacing: '1px',
  },
  deliveryValue: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '11px',
    color: 'rgba(232,232,240,0.7)',
  },
  subjectLine: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  subjectLabel: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '9px',
    color: 'rgba(232,232,240,0.3)',
    letterSpacing: '2px',
    flexShrink: 0,
  },
  subjectText: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '15px',
    fontWeight: 700,
    color: '#e8e8f0',
  },
  viewToggle: {
    display: 'flex',
    padding: '12px 20px',
    gap: '8px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  toggleBtn: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '10px',
    letterSpacing: '1px',
    padding: '6px 14px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: 'rgba(232,232,240,0.4)',
    cursor: 'pointer',
  },
  toggleBtnActive: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '10px',
    letterSpacing: '1px',
    padding: '6px 14px',
    background: 'rgba(0,255,136,0.1)',
    border: '1px solid rgba(0,255,136,0.4)',
    borderRadius: '4px',
    color: '#00ff88',
    cursor: 'pointer',
  },
  emailBody: {
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  emailText: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '12px',
    color: 'rgba(232,232,240,0.8)',
    lineHeight: 1.8,
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  emailHtml: {
    color: 'rgba(232,232,240,0.8)',
    fontSize: '14px',
    lineHeight: 1.8,
  },
  signalsBar: {
    padding: '14px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  signalsLabel: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '9px',
    color: 'rgba(0,255,136,0.4)',
    letterSpacing: '2px',
  },
  signalsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  signalTag: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '10px',
    color: 'rgba(232,232,240,0.5)',
    background: 'rgba(0,255,136,0.06)',
    border: '1px solid rgba(0,255,136,0.15)',
    borderRadius: '4px',
    padding: '4px 10px',
  },
  placeholder: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '11px',
    color: 'rgba(232,232,240,0.3)',
    margin: 0,
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(0,255,136,0.2)',
    borderTop: '2px solid #00ff88',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  },
}
