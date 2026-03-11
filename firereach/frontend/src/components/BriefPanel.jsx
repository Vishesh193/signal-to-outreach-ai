export default function BriefPanel({ brief, loading }) {
  if (!brief && !loading) return (
    <div style={{ ...styles.card, opacity: 0.5 }}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>ACCOUNT BRIEF</span>
        <span style={styles.cardNum}>04</span>
      </div>
      <div style={{ padding: '20px' }}>
        <p style={styles.placeholder}>Research analyst will generate brief after signal harvest...</p>
      </div>
    </div>
  )

  if (loading) return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>ACCOUNT BRIEF</span>
        <span style={styles.cardNum}>04</span>
      </div>
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={styles.spinner} />
        <p style={styles.placeholder}>Synthesizing signals + ICP alignment...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <span style={styles.cardTitle}>ACCOUNT BRIEF</span>
          <span style={styles.company}> — {brief.company}</span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.scoreRing(brief.icp_alignment_score)}>
            <span style={styles.scoreText}>{brief.icp_alignment_score}%</span>
          </div>
          <span style={styles.cardNum}>04</span>
        </div>
      </div>

      <div style={styles.content}>
        <p style={styles.briefText}>{brief.account_brief}</p>

        {brief.key_signals_used?.length > 0 && (
          <div style={styles.signalsUsed}>
            <p style={styles.signalsLabel}>SIGNALS REFERENCED IN BRIEF:</p>
            <div style={styles.signalTags}>
              {brief.key_signals_used.map((s, i) => (
                <span key={i} style={styles.tag}>
                  <span style={styles.tagCategory}>{s.category}</span> {s.headline}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(170,136,255,0.2)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(170,136,255,0.15)',
    background: 'rgba(170,136,255,0.04)',
  },
  cardTitle: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '11px',
    color: '#aa88ff',
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
  scoreRing: (score) => ({
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: `conic-gradient(#aa88ff ${score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }),
  scoreText: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '10px',
    color: '#aa88ff',
    fontWeight: 700,
    background: '#0a0a0f',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNum: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '28px',
    fontWeight: 800,
    color: 'rgba(170,136,255,0.15)',
  },
  content: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  briefText: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '14px',
    lineHeight: 1.8,
    color: 'rgba(232,232,240,0.85)',
    margin: 0,
    borderLeft: '3px solid rgba(170,136,255,0.4)',
    paddingLeft: '16px',
  },
  signalsUsed: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  signalsLabel: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '9px',
    color: 'rgba(170,136,255,0.5)',
    letterSpacing: '2px',
    margin: 0,
  },
  signalTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '10px',
    color: 'rgba(232,232,240,0.5)',
    background: 'rgba(170,136,255,0.08)',
    border: '1px solid rgba(170,136,255,0.2)',
    borderRadius: '4px',
    padding: '4px 10px',
  },
  tagCategory: {
    color: '#aa88ff',
    fontWeight: 700,
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
    border: '2px solid rgba(170,136,255,0.2)',
    borderTop: '2px solid #aa88ff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  },
}
