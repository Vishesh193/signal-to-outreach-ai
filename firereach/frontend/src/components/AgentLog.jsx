import { useEffect, useRef } from 'react'

const STEP_CONFIG = {
  init: { icon: '◈', color: '#888', label: 'INIT' },
  tool_call: { icon: '⚙', color: '#ff9500', label: 'TOOL' },
  signal: { icon: '📡', color: '#00aaff', label: 'SIGNALS' },
  research: { icon: '📋', color: '#aa88ff', label: 'RESEARCH' },
  sent: { icon: '📧', color: '#00ff88', label: 'SENT' },
  complete: { icon: '✅', color: '#00ff88', label: 'DONE' },
  error: { icon: '❌', color: '#ff4444', label: 'ERROR' },
}

export default function AgentLog({ logs, status }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>AGENT REASONING LOG</span>
        <div style={styles.headerRight}>
          <span style={styles.logCount}>{logs.length} events</span>
          <span style={styles.cardNum}>02</span>
        </div>
      </div>

      <div style={styles.logContainer}>
        {logs.length === 0 && status === 'idle' && (
          <div style={styles.emptyState}>
            <span style={styles.emptyText}>Awaiting mission parameters...</span>
            <div style={styles.cursor} />
          </div>
        )}

        {logs.map((log, i) => {
          const config = STEP_CONFIG[log.step] || STEP_CONFIG.init
          return (
            <div key={i} style={styles.logEntry}>
              <span style={{ ...styles.logIcon, color: config.color }}>{config.icon}</span>
              <div style={styles.logContent}>
                <div style={styles.logMeta}>
                  <span style={{ ...styles.logBadge, color: config.color, borderColor: config.color + '44' }}>
                    {config.label}
                  </span>
                  <span style={styles.logTime}>
                    {new Date(log.timestamp).toLocaleTimeString('en', { hour12: false })}
                  </span>
                </div>
                <span style={styles.logMessage}>{log.message}</span>
                {log.step === 'signal' && log.data && (
                  <span style={styles.logDetail}>
                    {log.data.total_signals} signals • funding:{log.data.funding?.length} • hiring:{log.data.hiring?.length} • leadership:{log.data.leadership?.length}
                  </span>
                )}
                {log.step === 'research' && log.data && (
                  <span style={styles.logDetail}>
                    ICP Alignment Score: {log.data.icp_alignment_score}%
                  </span>
                )}
                {log.step === 'sent' && log.data && (
                  <span style={{ ...styles.logDetail, color: '#00ff88' }}>
                    ✓ Delivered → {log.data.recipient} | ID: {log.data.email_id}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {status === 'running' && (
          <div style={styles.logEntry}>
            <span style={{ ...styles.logIcon, color: '#ff5000' }}>▸</span>
            <div style={styles.thinkingDots}>
              <span style={{ ...styles.dot, animationDelay: '0ms' }} />
              <span style={{ ...styles.dot, animationDelay: '200ms' }} />
              <span style={{ ...styles.dot, animationDelay: '400ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes dotPulse { 0%,80%,100%{opacity:0.2;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}

const styles = {
  card: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,80,0,0.2)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(255,80,0,0.15)',
    background: 'rgba(255,80,0,0.05)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cardTitle: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '11px',
    color: '#ff5000',
    letterSpacing: '3px',
  },
  logCount: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '10px',
    color: 'rgba(232,232,240,0.3)',
  },
  cardNum: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '28px',
    fontWeight: 800,
    color: 'rgba(255,80,0,0.15)',
  },
  logContainer: {
    padding: '16px',
    maxHeight: '280px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255,80,0,0.2) transparent',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '20px 0',
  },
  emptyText: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '12px',
    color: 'rgba(232,232,240,0.2)',
  },
  cursor: {
    width: '8px',
    height: '14px',
    background: 'rgba(255,80,0,0.5)',
    animation: 'blink 1s ease-in-out infinite',
  },
  logEntry: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  logIcon: {
    fontSize: '14px',
    marginTop: '1px',
    flexShrink: 0,
  },
  logContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    flex: 1,
  },
  logMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logBadge: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '9px',
    letterSpacing: '1.5px',
    border: '1px solid',
    padding: '1px 6px',
    borderRadius: '2px',
  },
  logTime: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '9px',
    color: 'rgba(232,232,240,0.2)',
  },
  logMessage: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '11px',
    color: 'rgba(232,232,240,0.7)',
    lineHeight: 1.5,
  },
  logDetail: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '10px',
    color: 'rgba(232,232,240,0.35)',
  },
  thinkingDots: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    padding: '8px 0',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#ff5000',
    display: 'inline-block',
    animation: 'dotPulse 1.4s ease-in-out infinite',
  },
}
