import { useState } from 'react'

const DEFAULT_ICP = "We sell high-end cybersecurity training to Series B startups."

export default function InputPanel({ onSubmit, onReset, status }) {
  const [form, setForm] = useState({
    target_company: '',
    icp: DEFAULT_ICP,
    recipient_email: '',
    recipient_name: '',
    sender_name: 'Alex',
    sender_company: 'CyberShield Academy',
  })

  const isRunning = status === 'running'

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = () => {
    if (!form.target_company || !form.recipient_email || !form.icp) return
    onSubmit(form)
  }

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>MISSION PARAMETERS</span>
        <span style={styles.cardNum}>01</span>
      </div>

      <div style={styles.fields}>
        <Field label="TARGET COMPANY" required>
          <input
            style={styles.input}
            placeholder="e.g. Stripe, Notion, Linear"
            value={form.target_company}
            onChange={set('target_company')}
            disabled={isRunning}
          />
        </Field>

        <Field label="YOUR ICP" required hint="Who you sell to + what you offer">
          <textarea
            style={{ ...styles.input, ...styles.textarea }}
            placeholder="e.g. We sell cybersecurity training to Series B startups"
            value={form.icp}
            onChange={set('icp')}
            disabled={isRunning}
          />
        </Field>

        <div style={styles.row}>
          <Field label="RECIPIENT EMAIL" required>
            <input
              style={styles.input}
              type="email"
              placeholder="target@company.com"
              value={form.recipient_email}
              onChange={set('recipient_email')}
              disabled={isRunning}
            />
          </Field>
          <Field label="RECIPIENT NAME">
            <input
              style={styles.input}
              placeholder="John Doe"
              value={form.recipient_name}
              onChange={set('recipient_name')}
              disabled={isRunning}
            />
          </Field>
        </div>

        <div style={styles.divider} />

        <div style={styles.row}>
          <Field label="SENDER NAME">
            <input
              style={styles.input}
              placeholder="Your name"
              value={form.sender_name}
              onChange={set('sender_name')}
              disabled={isRunning}
            />
          </Field>
          <Field label="SENDER COMPANY">
            <input
              style={styles.input}
              placeholder="Your company"
              value={form.sender_company}
              onChange={set('sender_company')}
              disabled={isRunning}
            />
          </Field>
        </div>
      </div>

      <div style={styles.actions}>
        {status === 'idle' || status === 'error' ? (
          <button
            style={styles.launchBtn}
            onClick={handleSubmit}
            disabled={!form.target_company || !form.recipient_email}
          >
            <span>⚡ LAUNCH AGENT</span>
          </button>
        ) : status === 'running' ? (
          <button style={styles.stopBtn} onClick={onReset}>
            ■ ABORT MISSION
          </button>
        ) : (
          <button style={styles.resetBtn} onClick={onReset}>
            ↺ NEW MISSION
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, children, required, hint }) {
  return (
    <div style={fieldStyles.wrapper}>
      <label style={fieldStyles.label}>
        {label} {required && <span style={{ color: '#ff5000' }}>*</span>}
        {hint && <span style={fieldStyles.hint}> — {hint}</span>}
      </label>
      {children}
    </div>
  )
}

const fieldStyles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '10px',
    color: 'rgba(232,232,240,0.4)',
    letterSpacing: '2px',
  },
  hint: {
    fontSize: '9px',
    color: 'rgba(232,232,240,0.25)',
    letterSpacing: '0.5px',
    textTransform: 'none',
  },
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
  cardTitle: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '11px',
    color: '#ff5000',
    letterSpacing: '3px',
  },
  cardNum: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '28px',
    fontWeight: 800,
    color: 'rgba(255,80,0,0.15)',
  },
  fields: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#e8e8f0',
    fontFamily: 'Space Mono, monospace',
    fontSize: '12px',
    padding: '10px 12px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  textarea: {
    resize: 'vertical',
    minHeight: '72px',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
  },
  actions: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,80,0,0.1)',
  },
  launchBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #ff5000, #ff2200)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontFamily: 'Space Mono, monospace',
    fontWeight: 700,
    fontSize: '13px',
    letterSpacing: '2px',
    cursor: 'pointer',
    boxShadow: '0 0 24px rgba(255,80,0,0.3)',
    transition: 'all 0.2s',
  },
  stopBtn: {
    width: '100%',
    padding: '14px',
    background: 'rgba(255,68,68,0.15)',
    border: '1px solid rgba(255,68,68,0.4)',
    borderRadius: '8px',
    color: '#ff4444',
    fontFamily: 'Space Mono, monospace',
    fontSize: '13px',
    letterSpacing: '2px',
    cursor: 'pointer',
  },
  resetBtn: {
    width: '100%',
    padding: '14px',
    background: 'rgba(0,255,136,0.1)',
    border: '1px solid rgba(0,255,136,0.3)',
    borderRadius: '8px',
    color: '#00ff88',
    fontFamily: 'Space Mono, monospace',
    fontSize: '13px',
    letterSpacing: '2px',
    cursor: 'pointer',
  },
}
