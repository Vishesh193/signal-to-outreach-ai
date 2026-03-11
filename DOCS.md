# FireReach — Agent Documentation

**Autonomous Outreach Engine | Rabbitt AI Submission**

---

## Overview

FireReach is a fully autonomous B2B outreach agent. Given a target company and an Ideal Customer Profile (ICP), it:
1. Harvests live buyer signals from real APIs (no hallucination)
2. Synthesizes signals + ICP into a strategic account brief
3. Writes a hyper-personalized email and dispatches it automatically

Zero human intervention from input to sent email.

---

## Logic Flow

```
USER INPUT
  ├─ target_company: "Stripe"
  ├─ icp: "We sell cybersecurity training to Series B startups"
  └─ recipient_email: "cto@stripe.com"
          │
          ▼
  ┌──────────────────────────────────┐
  │  GROQ AGENT (llama3-70b-8192)   │
  │  System Prompt: FireReach Persona│
  └──────────────────┬───────────────┘
                     │  decides to call
                     ▼
  ┌──────────────────────────────────────────────┐
  │  TOOL 1: tool_signal_harvester               │
  │  Input: { company_name: "Stripe" }           │
  │  Process: 4 parallel Serper API calls        │
  │    - News: "Stripe funding round 2025"       │
  │    - News: "Stripe hiring engineering 2025"  │
  │    - News: "Stripe leadership changes 2025"  │
  │    - News: "Stripe product launch 2025"      │
  │  Output: Structured signals JSON             │
  │  Source: 100% API — deterministic            │
  └──────────────────────┬───────────────────────┘
                         │ signals passed
                         ▼
  ┌──────────────────────────────────────────────┐
  │  TOOL 2: tool_research_analyst               │
  │  Input: { signals, icp }                     │
  │  Process: Groq LLM call with signals context │
  │  Output:                                     │
  │    - account_brief (2 paragraphs)            │
  │    - icp_alignment_score (0-100)             │
  │    - key_signals_used (array)                │
  └──────────────────────┬───────────────────────┘
                         │ brief passed
                         ▼
  ┌──────────────────────────────────────────────┐
  │  TOOL 3: tool_outreach_automated_sender      │
  │  Input: { account_brief, signals, icp,       │
  │           recipient_email, ... }             │
  │  Process:                                    │
  │    Step A: Groq writes personalized email    │
  │    Step B: Resend API dispatches email       │
  │  Output: { email_id, subject, preview, ... } │
  └──────────────────────────────────────────────┘
          │
          ▼
  Agent returns final summary
  Frontend displays: signals + brief + email preview + confirmation
```

### Why This Flow Guarantees Signal-Grounded Emails

The agent receives the full `signals` object (not a summary string) in Tool 3. The LLM prompt for email composition explicitly lists each harvested signal with its category tag and instructs the model to reference at least 2. The `signals_referenced` field in the output confirms which signals made it into the final email.

---

## Tool Schemas

### Tool 1 — `tool_signal_harvester`

```json
{
  "type": "function",
  "function": {
    "name": "tool_signal_harvester",
    "description": "Fetches live, deterministic buyer signals for a target company from real-time news and search APIs. Returns funding rounds, hiring trends, leadership changes, and product announcements. This tool NEVER guesses — all data is sourced from live APIs.",
    "parameters": {
      "type": "object",
      "properties": {
        "company_name": {
          "type": "string",
          "description": "The full name of the target company (e.g. 'Stripe', 'Notion')"
        },
        "domain": {
          "type": "string",
          "description": "Optional company domain to improve search accuracy (e.g. 'stripe.com')"
        }
      },
      "required": ["company_name"]
    }
  }
}
```

**Implementation**: Fires 4 parallel `POST` requests to `google.serper.dev/news` with time-scoped queries. Results are parsed into a typed `signals` object with `funding[]`, `hiring[]`, `leadership[]`, `product_news[]` arrays, each containing `{ category, title, snippet, source, url, date }`.

**Determinism guarantee**: No LLM is involved. All content comes directly from Serper's Google News index.

---

### Tool 2 — `tool_research_analyst`

```json
{
  "type": "function",
  "function": {
    "name": "tool_research_analyst",
    "description": "Takes harvested live signals and the seller's ICP to generate a 2-paragraph strategic Account Brief. Identifies specific pain points, strategic alignment, and why the prospect needs outreach NOW.",
    "parameters": {
      "type": "object",
      "properties": {
        "signals": {
          "type": "object",
          "description": "The full signals object returned by tool_signal_harvester"
        },
        "icp": {
          "type": "string",
          "description": "The seller's ICP — who they sell to and what value they provide"
        }
      },
      "required": ["signals", "icp"]
    }
  }
}
```

**Implementation**: Formats signals into structured markdown sections and passes them to `llama3-70b-8192` at temperature 0.4. The prompt enforces: Paragraph 1 = company situation (signal-grounded), Paragraph 2 = pain point + timing rationale. Also computes an `icp_alignment_score` (0-100) based on signal richness.

---

### Tool 3 — `tool_outreach_automated_sender`

```json
{
  "type": "function",
  "function": {
    "name": "tool_outreach_automated_sender",
    "description": "Composes a hyper-personalized outreach email referencing live signals and the account brief, then automatically dispatches it via Resend. This is the final execution step — it both writes AND sends the email.",
    "parameters": {
      "type": "object",
      "properties": {
        "account_brief": { "type": "string" },
        "signals": { "type": "object" },
        "icp": { "type": "string" },
        "recipient_email": { "type": "string" },
        "recipient_name": { "type": "string" },
        "sender_name": { "type": "string" },
        "sender_company": { "type": "string" }
      },
      "required": ["account_brief", "signals", "icp", "recipient_email"]
    }
  }
}
```

**Implementation**: Two-phase internal execution:
- **Phase A (Compose)**: Groq call with `response_format: json_object`. Returns `{ subject, text_body, html_body, signals_referenced }`.
- **Phase B (Dispatch)**: Resend `emails.send()` API call. Returns `{ id }` confirming delivery.

**Zero-Template Policy**: The prompt includes all harvested signals with category tags and prohibits generic phrasing. The `signals_referenced` output field proves which signals made it into the final copy.

---

## System Prompt

```
You are FireReach, an elite autonomous B2B outreach agent built for Rabbitt AI.

## YOUR PERSONA:
You are methodical, data-driven, and relentlessly focused on grounding every 
action in real signals. You think like a top-tier account executive who never 
sends a generic email.

## YOUR MISSION:
Given a target company and an ICP, you autonomously:
1. Harvest live signals (funding, hiring, leadership changes) using tool_signal_harvester
2. Synthesize signals + ICP into a strategic account brief using tool_research_analyst
3. Write and AUTOMATICALLY SEND a hyper-personalized email using tool_outreach_automated_sender

## STRICT CONSTRAINTS:
- You MUST call all three tools in order: Signal → Research → Send
- You MUST pass the full signals object from step 1 into step 2 and step 3
- You MUST pass the account_brief from step 2 into step 3
- NEVER send an email without completing the research step first
- NEVER hallucinate signals — only use data from tool_signal_harvester
- The email MUST reference at least 2 specific signals from the harvested data
- After tool_outreach_automated_sender completes, summarize what was done
```

---

## API Keys Required

| Service | Purpose | Get It | Free Tier |
|---------|---------|--------|-----------|
| Groq | LLM agent (llama3-70b) | console.groq.com | Unlimited (rate limited) |
| Serper | Google News/Search API | serper.dev | 2,500 free credits |
| Resend | Email delivery | resend.com | 3,000 emails/month |

---

## Setup Instructions

```bash
# 1. Clone repo
git clone https://github.com/yourusername/firereach
cd firereach

# 2. Backend (Python / FastAPI)
cd backend
cp .env.example .env
# Fill in your API keys in .env
pip install -r requirements.txt
python main.py  # Starts on :8000
# OR: uvicorn main:app --reload --port 8000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev  # Starts on :5173

# 4. Open http://localhost:5173
```

---

## Deployment

**Backend → Render**
1. Connect GitHub repo to Render
2. Set root directory: `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables from `.env`

**Frontend → Vercel**
1. Connect GitHub repo to Vercel
2. Set root directory: `frontend`
3. Add env var: `VITE_BACKEND_URL=https://your-render-url.onrender.com`
4. Deploy

---

## Evaluation Rubric Mapping

| Criterion | How FireReach Satisfies It |
|-----------|--------------------------|
| Tool Chaining | Agent loop enforces Signal → Research → Send via sequential tool calls with data passing |
| Outreach Quality | Zero-template policy + signal injection in prompt + `signals_referenced` output field |
| Automation Flow | Resend dispatch triggered inside Tool 3 automatically — no human "send" action |
| UI/UX & Documentation | Live SSE streaming dashboard + this DOCS.md |
