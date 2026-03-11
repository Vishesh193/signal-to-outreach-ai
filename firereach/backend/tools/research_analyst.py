# tools/research_analyst.py
# AI-powered account brief generator: signals + ICP → strategic 2-paragraph brief

import asyncio
import os
from datetime import datetime
from groq import AsyncGroq

try:
    client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
except BaseException:
    pass


def _build_signal_context(signals: dict) -> str:
    sections = []

    if signals.get("funding"):
        lines = "\n".join(f"- {s['title']} ({s['date']}) — {s['snippet']}" for s in signals["funding"])
        sections.append(f"### Funding Signals:\n{lines}")

    if signals.get("hiring"):
        lines = "\n".join(f"- {s['title']} ({s['date']}) — {s['snippet']}" for s in signals["hiring"])
        sections.append(f"### Hiring Signals:\n{lines}")

    if signals.get("leadership"):
        lines = "\n".join(f"- {s['title']} ({s['date']}) — {s['snippet']}" for s in signals["leadership"])
        sections.append(f"### Leadership Signals:\n{lines}")

    if signals.get("product_news"):
        lines = "\n".join(f"- {s['title']} ({s['date']}) — {s['snippet']}" for s in signals["product_news"])
        sections.append(f"### Product & Growth:\n{lines}")

    return "\n\n".join(sections) if sections else f"No specific signals found for {signals.get('company', 'the company')}."


def _compute_alignment_score(signals: dict) -> int:
    if not isinstance(signals, dict):
        return 0
    score = 0
    if signals.get("funding"): score += 30
    if signals.get("hiring"): score += 25
    if signals.get("leadership"): score += 20
    if signals.get("product_news"): score += 15
    if signals.get("total_signals", 0) > 5: score += 10
    return min(score, 100)


def _extract_key_signals(signals: dict) -> list[dict]:
    all_signals = (
        signals.get("funding", []) +
        signals.get("hiring", []) +
        signals.get("leadership", []) +
        signals.get("product_news", [])
    )
    return [
        {"category": s["category"], "headline": s["title"], "date": s["date"]}
        for s in all_signals[:4]
    ]


async def tool_research_analyst(signals: dict, icp: str) -> dict:
    """
    Takes harvested signals + ICP and generates a strategic 2-paragraph Account Brief.
    """
    signal_text = _build_signal_context(signals)

    prompt = f"""You are a world-class B2B sales strategist and account researcher.

Your task is to write a precise, insightful 2-paragraph "Account Brief" for a sales team.

## Target Company Signals (LIVE DATA — use these specifically):
{signal_text}

## Seller's ICP (Ideal Customer Profile):
{icp}

## Instructions:
- Paragraph 1: Describe the company's current momentum based ONLY on the signals above. Be specific — name the signals (funding amount, number of roles, etc.).
- Paragraph 2: Connect their growth trajectory to a specific pain point the seller's ICP directly solves. Show why NOW is the right time.
- Be sharp, analytical, non-generic. Sound like a McKinsey analyst who understands sales.
- Do NOT invent facts not present in the signals.
- Length: 100-150 words total.

Write only the brief, no preamble or headers."""

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=400,
    )

    brief = response.choices[0].message.content.strip()

    return {
        "account_brief": brief,
        "company": signals.get("company", ""),
        "icp_alignment_score": _compute_alignment_score(signals),
        "key_signals_used": _extract_key_signals(signals),
        "generated_at": datetime.utcnow().isoformat(),
    }


# JSON Schema for Groq tool definition
RESEARCH_ANALYST_SCHEMA = {
    "type": "function",
    "function": {
        "name": "tool_research_analyst",
        "description": (
            "Takes harvested live signals and the seller's ICP to generate a 2-paragraph "
            "strategic Account Brief. Identifies specific pain points, strategic alignment, "
            "and why the prospect needs outreach NOW."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "signals": {
                    "type": "object",
                    "description": "The full signals object returned by tool_signal_harvester",
                },
                "icp": {
                    "type": "string",
                    "description": "The seller's ICP — who they sell to and what value they provide",
                },
            },
            "required": ["signals", "icp"],
        },
    },
}
