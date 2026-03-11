# 🔥 FireReach — Autonomous Outreach Engine

> **LIVE DEMO**: [https://signal-to-outreach-ai.vercel.app/](https://signal-to-outreach-ai.vercel.app/)

## 🚀 Overview
FireReach is a state-of-the-art autonomous GTM agent designed to replace generic template-based outreach with **real-time, signal-grounded intelligence**. It identifies "Why Now" moments for any target company and converts them into hyper-personalized emails.

---

## 🛠 Recent Fixes & Improvements
*Fixed the "Internal Server Issue" and "Build Errors" mentioned previously!*

### 1. Model & Reliability Upgrade 
- **The Issue**: Deprecation of `llama3-70b-8192` on Groq caused `400` errors and agent "hangs".
- **The Fix**: Upgraded the entire engine to `llama-3.3-70b-versatile`. This restored lightning-fast inference and 100% uptime.

### 2. ICP Scoring Overhaul (The 0% Bug)
- **The Issue**: The alignment score was stuck at a static 0%.
- **The Fix**: Implemented a dynamic, weighted scoring system (Expansion Momentum 40%, ICP Fit 40%, Urgency 20%). The agent now provides an explainable alignment metric (avg. 85%+ for qualified leads).

### 3. Deep Signal Grounding
- **The Issue**: Emails were sometimes too brief or generic.
- **The Fix**: Updated the outreach tool to **strictly enforce 3-4 specific signal citations** from the research phase, ensuring every email feels hand-written and relevant.

### 4. PII & Privacy Protection
- **The Improvement**: Added automated email masking in the UI logs and previews (e.g., `v*******a@gmail.com`) to ensure safe public demos and privacy compliance.

### 5. Deployment & Stability
- **The Fix**: Resolved Render/Vercel build failures by pinning the backend to Python `3.10.14`, switching to `gunicorn` with Uvicorn workers for production stability, and fixing repository root-directory mapping.

---

## 📂 Project Structure
- `/firereach/backend`: FastAPI server + Agentic logic
- `/firereach/frontend`: React + Vite dashboard
- `DOCS.md`: Detailed architecture and system prompts
- `result.pdf`: Visual walkthrough of the agent in action
- `improvements.pdf`: Technical delta and impact report

---
**Submission for Rabbitt AI | Agentic AI Developer Challenge**
