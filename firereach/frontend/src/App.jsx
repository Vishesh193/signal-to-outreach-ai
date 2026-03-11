import { useState, useRef, useEffect } from 'react'
import InputPanel from './components/InputPanel.jsx'
import AgentLog from './components/AgentLog.jsx'
import SignalsPanel from './components/SignalsPanel.jsx'
import BriefPanel from './components/BriefPanel.jsx'
import EmailPreview from './components/EmailPreview.jsx'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function App() {
  const [status, setStatus] = useState('idle') // idle | running | complete | error
  const [logs, setLogs] = useState([])
  const [signals, setSignals] = useState(null)
  const [brief, setBrief] = useState(null)
  const [email, setEmail] = useState(null)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const handleSubmit = async (formData) => {
    setStatus('running')
    setLogs([])
    setSignals(null)
    setBrief(null)
    setEmail(null)
    setError(null)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`${BACKEND_URL}/api/outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal,
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        let currentEvent = null
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              handleSSEData(data, currentEvent)
            } catch {}
            currentEvent = null
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
        setStatus('error')
      }
    }
  }

  const handleSSEData = (data, eventType) => {
    // Check by content
    if (data.step) {
      setLogs(prev => [...prev, data])
      if (data.step === 'signal' && data.data) setSignals(data.data)
      if (data.step === 'research' && data.data) setBrief(data.data)
      if (data.step === 'sent' && data.data) {
        setEmail(data.data)
        setStatus('complete')
      }
      if (data.step === 'error') {
        setError(data.message)
        setStatus('error')
      }
    }
    if (data.success === true && data.result) {
      if (data.result.signals && !signals) setSignals(data.result.signals)
      if (data.result.brief && !brief) setBrief(data.result.brief)
      if (data.result.email && !email) setEmail(data.result.email)
      setStatus('complete')
    }
    if (data.message && data.target) {
      setLogs(prev => [...prev, { step: 'init', message: data.message, timestamp: new Date().toISOString() }])
    }
  }

  const handleReset = () => {
    if (abortRef.current) abortRef.current.abort()
    setStatus('idle')
    setLogs([])
    setSignals(null)
    setBrief(null)
    setEmail(null)
    setError(null)
  }

  return (
    <div style={styles.root}>
      {/* Noise texture overlay */}
      <div style={styles.noiseOverlay} />

      {/* Grid background */}
      <div style={styles.gridBg} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoFire}>🔥</span>
            <span style={styles.logoText}>FireReach</span>
            <span style={styles.logoBadge}>AUTONOMOUS ENGINE</span>
          </div>
          <div style={styles.headerMeta}>
            <span style={styles.statusDot(status)} />
            <span style={styles.statusText}>
              {status === 'idle' && 'STANDBY'}
              {status === 'running' && 'EXECUTING'}
              {status === 'complete' && 'MISSION COMPLETE'}
              {status === 'error' && 'ERROR'}
            </span>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main style={styles.main}>
        {/* Left column — Input + Log */}
        <div style={styles.leftCol}>
          <InputPanel
            onSubmit={handleSubmit}
            onReset={handleReset}
            status={status}
          />
          <AgentLog logs={logs} status={status} />
        </div>

        {/* Right column — Results */}
        <div style={styles.rightCol}>
          <SignalsPanel signals={signals} loading={status === 'running' && !signals} />
          <BriefPanel brief={brief} loading={status === 'running' && signals && !brief} />
          <EmailPreview email={email} loading={status === 'running' && brief && !email} />

          {error && (
            <div style={styles.errorBox}>
              <span style={{ color: '#ff4444', fontFamily: 'Space Mono, monospace', fontSize: '13px' }}>
                ❌ {error}
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

const styles = {
  root: {
    minHeight: '100vh',
    background: '#0a0a0f',
    color: '#e8e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  noiseOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0.5,
  },
  gridBg: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,80,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,80,0,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    position: 'relative',
    zIndex: 10,
    borderBottom: '1px solid rgba(255,80,0,0.2)',
    background: 'rgba(10,10,15,0.9)',
    backdropFilter: 'blur(10px)',
  },
  headerInner: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoFire: {
    fontSize: '24px',
  },
  logoText: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 800,
    fontSize: '22px',
    color: '#ff5000',
    letterSpacing: '-0.5px',
  },
  logoBadge: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '9px',
    color: 'rgba(255,80,0,0.6)',
    border: '1px solid rgba(255,80,0,0.3)',
    padding: '2px 8px',
    borderRadius: '2px',
    letterSpacing: '2px',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: (status) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: status === 'running' ? '#ff5000' : status === 'complete' ? '#00ff88' : status === 'error' ? '#ff4444' : '#444',
    boxShadow: status === 'running' ? '0 0 12px #ff5000' : status === 'complete' ? '0 0 12px #00ff88' : 'none',
    animation: status === 'running' ? 'pulse 1s ease-in-out infinite' : 'none',
  }),
  statusText: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '11px',
    color: 'rgba(232,232,240,0.5)',
    letterSpacing: '2px',
  },
  main: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px',
    display: 'grid',
    gridTemplateColumns: '420px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  errorBox: {
    background: 'rgba(255,68,68,0.08)',
    border: '1px solid rgba(255,68,68,0.3)',
    borderRadius: '8px',
    padding: '16px',
  },
}
