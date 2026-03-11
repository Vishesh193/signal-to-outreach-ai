const CATEGORY_CONFIG = {
  'Funding & Investment': { icon: '💰', color: '#ffd700' },
  'Hiring Trends': { icon: '👥', color: '#00aaff' },
  'Leadership Changes': { icon: '👤', color: '#aa88ff' },
  'Product & Growth News': { icon: '🚀', color: '#00ff88' },
}

export default function SignalsPanel({ signals, loading }) {
  if (!signals && !loading) return (
    <EmptyCard title="LIVE SIGNALS" num="03" hint="Signal harvester will populate this..." />
  )

  if (loading) return <LoadingCard title="LIVE SIGNALS" num="03" message="Scanning news, hiring boards, funding databases..." />

  const allSignals = [
    ...(signals.funding || []),
    ...(signals.hiring || []),
    ...(signals.leadership || []),
    ...(signals.product_news || []),
  ]

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <span style={styles.cardTitle}>LIVE SIGNALS</span>
          <span style={styles.company}> — {signals.company}</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.signalCount}>{signals.total_signals} signals</span>
          <span style={styles.cardNum}>03</span>
        </div>
      </div>

      <div style={styles.content}>
        {allSignals.length === 0 ? (
          <p style={styles.noSignals}>No public signals found. Consider manual research.</p>
        ) : (
          <div style={styles.signalGrid}>
            {allSignals.map((signal, i) => {
              const config = CATEGORY_CONFIG[signal.category] || { icon: '📌', color: '#888' }
              return (
                <div key={i} style={styles.signalCard}>
                  <div style={styles.signalHeader}>
                    <span style={{ fontSize: '14px' }}>{config.icon}</span>
                    <span style={{ ...styles.signalCategory, color: config.color }}>{signal.category}</span>
                    <span style={styles.signalDate}>{signal.date}</span>
                  </div>
                  <p style={styles.signalTitle}>{signal.title}</p>
                  {signal.snippet && (
                    <p style={styles.signalSnippet}>{signal.snippet.slice(0, 120)}...</p>
                  )}
                  <div style={styles.signalMeta}>
                    <span style={styles.signalSource}>{signal.source}</span>
                    {signal.url && (
                      <a href={signal.url} target="_blank" rel="noreferrer" style={styles.signalLink}>
                        ↗ source
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyCard({ title, num, hint }) {
  return (
    <div style={{ ...styles.card, opacity: 0.5 }}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>{title}</span>
        <span style={styles.cardNum}>{num}</span>
      </div>
      <div style={{ padding: '20px' }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: 'rgba(232,232,240,0.3)' }}>{hint}</p>
      </div>
    </div>
  )
}

function LoadingCard({ title, num, message }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>{title}</span>
        <span style={styles.cardNum}>{num}</span>
      </div>
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={styles.spinner} />
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: 'rgba(232,232,240,0.5)' }}>{message}</p>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const styles = {
  card: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(0,170,255,0.2)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(0,170,255,0.15)',
    background: 'rgba(0,170,255,0.04)',
  },
  cardTitle: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '11px',
    color: '#00aaff',
    letterSpacing: '3px',
  },
  company: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '13px',
    fontWeight: 600,
    color: 'rgba(232,232,240,0.6)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  signalCount: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '10px',
    color: '#00aaff',
    background: 'rgba(0,170,255,0.1)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  cardNum: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '28px',
    fontWeight: 800,
    color: 'rgba(0,170,255,0.15)',
  },
  content: {
    padding: '16px',
  },
  signalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  signalCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  signalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  signalCategory: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '9px',
    letterSpacing: '1px',
    flex: 1,
  },
  signalDate: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '9px',
    color: 'rgba(232,232,240,0.25)',
  },
  signalTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '13px',
    fontWeight: 600,
    color: '#e8e8f0',
    margin: 0,
    lineHeight: 1.4,
  },
  signalSnippet: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '10px',
    color: 'rgba(232,232,240,0.4)',
    margin: 0,
    lineHeight: 1.6,
  },
  signalMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  signalSource: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '9px',
    color: 'rgba(232,232,240,0.25)',
  },
  signalLink: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '9px',
    color: '#00aaff',
    textDecoration: 'none',
  },
  noSignals: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '12px',
    color: 'rgba(232,232,240,0.3)',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(0,170,255,0.2)',
    borderTop: '2px solid #00aaff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  },
}
