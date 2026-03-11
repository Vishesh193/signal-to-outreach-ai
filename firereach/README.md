# 🔥 FireReach — Autonomous Outreach Engine

> **LIVE DEMO**: [https://signal-to-outreach-ai.vercel.app/](https://signal-to-outreach-ai.vercel.app/)
> 
> **Submission for Rabbitt AI | Agentic AI Developer Challenge**

FireReach is a fully autonomous B2B outreach agent. Give it a target company and your ICP — it researches live signals, writes a hyper-personalized email, and sends it. Zero templates. Zero manual work.

## Quick Demo

**Input:**
- ICP: *"We sell high-end cybersecurity training to Series B startups"*
- Target: *"Nvidia"*
- Recipient: *your-email@example.com*

**What happens:**
1. Agent harvests 12+ live signals (funding, hiring, news) via **Serper API**.
2. AI synthesizes a strategic account brief + **Alignment Score (85%)** via **Groq (Llama 3.3)**.
3. AI writes signal-grounded email (3-4 citations) → auto-dispatched via **Resend**.

## 🚀 Key Improvements & Fixes
- **Model Upgrade**: Switched to `llama-3.3-70b-versatile` to fix deprecated model issues.
- **Scoring Overhaul**: Resolved the 0% score bug with a dynamic 3-pillar evaluation.
- **Privacy**: Automated PII masking for demo protection.
- **Production Stablity**: Deployed with Gunicorn on Render + Vercel frontend.

## Stack

- **Agent LLM**: Groq (Llama-3.3-70b-versatile)
- **Signals**: Serper.dev Google News API
- **Email**: Resend API
- **Backend**: Python + FastAPI + SSE streaming
- **Frontend**: React + Vite (Glassmorphic Cyber-UI)

## Setup

```bash
# Backend (Python / FastAPI)
cd firereach/backend && cp .env.example .env
# Add: GROQ_API_KEY, SERPER_API_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL
pip install -r requirements.txt && uvicorn main:app --reload

# Frontend  
cd firereach/frontend && npm install && npm run dev
```

## Documentation

See [DOCS.md](./DOCS.md) for:
- Logic flow diagrams
- Evaluation rubric alignment
- Reporting (`result.pdf` & `improvements.pdf`)
- Deployment guide

## Architecture

```
Signal Harvester → Research Analyst → Outreach Sender
(Serper API)        (Groq LLM)         (Groq + Resend)
  ↓                   ↓                   ↓
Live signals    Account brief       Email sent ✅
```
