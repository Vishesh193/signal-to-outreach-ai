# 🔥 FireReach — Autonomous Outreach Engine

> Built for Rabbitt AI | Agentic AI Developer Challenge

FireReach is a fully autonomous B2B outreach agent. Give it a target company and your ICP — it researches live signals, writes a hyper-personalized email, and sends it. Zero templates. Zero manual work.

## Quick Demo

**Input:**
- ICP: *"We sell high-end cybersecurity training to Series B startups"*
- Target: *"Acme Corp"*
- Recipient: *your-email@example.com*

**What happens:**
1. Agent harvests live funding/hiring/news signals from Google News
2. AI synthesizes a strategic account brief with ICP alignment score
3. AI writes signal-grounded email → auto-dispatched via Resend

## Stack

- **Agent LLM**: Groq (llama3-70b-8192) — free, fast
- **Signals**: Serper.dev Google News API — deterministic, real data
- **Email**: Resend API — auto-dispatch
- **Backend**: Python + FastAPI + SSE streaming
- **Frontend**: React + Vite — live agent log dashboard

## Setup

```bash
# Backend (Python / FastAPI)
cd backend && cp .env.example .env
# Add: GROQ_API_KEY, SERPER_API_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL
pip install -r requirements.txt && python main.py

# Frontend  
cd frontend && npm install && npm run dev
```

## Documentation

See [DOCS.md](./DOCS.md) for:
- Full logic flow diagram
- Tool schemas (JSON Schema format)
- System prompt
- Deployment guide

## Architecture

```
Signal Harvester → Research Analyst → Outreach Sender
(Serper API)        (Groq LLM)         (Groq + Resend)
  ↓                   ↓                   ↓
Live signals    Account brief       Email sent ✅
```
