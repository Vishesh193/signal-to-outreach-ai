# tools/outreach_sender.py
# AI writes hyper-personalized email → Resend API auto-dispatches it

import asyncio
import json
import os
import resend
from datetime import datetime
from groq import AsyncGroq
from functools import partial

try:
    groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
except BaseException:
    # Handle cases where AsyncGroq might not be initialized, e.g., missing API key
    # For now, we'll just pass, but in a real app, you might want to log or raise.
    pass
resend.api_key = os.getenv("RESEND_API_KEY")


def _build_signal_highlights(signals: dict) -> str:
    all_items = []
    for s in signals.get("funding", []):
        all_items.append(f"FUNDING: {s['title']} — {s['snippet']}")
    for s in signals.get("hiring", []):
        all_items.append(f"HIRING: {s['title']} — {s['snippet']}")
    for s in signals.get("leadership", []):
        all_items.append(f"LEADERSHIP: {s['title']} — {s['snippet']}")
    for s in signals.get("product_news", []):
        all_items.append(f"PRODUCT: {s['title']} — {s['snippet']}")

    return "\n".join(all_items[:6]) or "No specific signals available — use general growth-stage positioning."


async def _compose_email(
    account_brief: str,
    signals: dict,
    icp: str,
    recipient_name: str,
    recipient_email: str,
    sender_name: str,
    sender_company: str,
) -> dict:
    signal_highlights = _build_signal_highlights(signals)

    prompt = f"""You are an elite B2B sales copywriter known for writing emails that get 40%+ reply rates.

## Account Brief (Analyst Research):
{account_brief}

## Live Signals Captured (YOU MUST reference at least 2 explicitly):
{signal_highlights}

## Seller Context:
{icp}
Sender: {sender_name} at {sender_company}

## Recipient: {recipient_name or 'the recipient'} at {signals.get('company', 'the company')}

## Your Task:
Write a cold outreach email that:
1. Opens with a SPECIFIC reference to a real signal (funding, hiring, news — not generic)
2. Connects their growth moment to a real business risk or opportunity
3. Makes a single, clear value proposition tied to their current situation
4. Ends with a low-friction CTA (15-min call, not "buy now")
5. Feels written by a human who did their homework, NOT a template

Return ONLY valid JSON with these exact keys:
{{
  "subject": "compelling subject line under 8 words",
  "text_body": "plain text email body (150-200 words max)",
  "html_body": "same email as clean HTML with <p> tags",
  "signals_referenced": ["signal 1 referenced", "signal 2 referenced"]
}}"""

    response = await groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.5,
        max_tokens=800,
    )

    content = response.choices[0].message.content.strip()
    return json.loads(content)


def _dispatch_email(
    to: str,
    subject: str,
    html_body: str,
    text_body: str,
    sender_name: str,
    sender_company: str,
) -> dict:
    from_email = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")

    params = resend.Emails.SendParams(
        from_=f"{sender_name} at {sender_company} <{from_email}>",
        to=[to],
        subject=subject,
        html=html_body,
        text=text_body,
    )
    result = resend.Emails.send(params)
    return result


async def tool_outreach_automated_sender(
    account_brief: str,
    signals: dict,
    icp: str,
    recipient_email: str,
    recipient_name: str = "",
    sender_name: str = "Alex",
    sender_company: str = "FireReach",
) -> dict:
    """
    Composes a hyper-personalized email and auto-dispatches it via Resend.
    Both WRITES and SENDS the email without human intervention.
    """
    # Step 1: Compose (uses native asyncio with AsyncGroq)
    email = await _compose_email(
        account_brief=account_brief,
        signals=signals,
        icp=icp,
        recipient_name=recipient_name,
        recipient_email=recipient_email,
        sender_name=sender_name,
        sender_company=sender_company,
    )

    # Step 2: Dispatch (runs blocking Resend HTTP call safely via pool)
    loop = asyncio.get_running_loop()
    from_email = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
    
    email_params = {
        "from": f"{sender_name} at {sender_company} <{from_email}>",
        "to": [recipient_email],
        "subject": email["subject"],
        "html": email["html_body"],
        "text": email["text_body"],
    }
    
    pfunc = partial(resend.Emails.send, email_params)
    send_result = await loop.run_in_executor(None, pfunc)  # type: ignore[arg-type]

    return {
        "status": "sent",
        "email_id": send_result.get("id", "unknown"),
        "recipient": recipient_email,
        "subject": email["subject"],
        "email_preview": email["text_body"],
        "email_html": email["html_body"],
        "signals_referenced": email.get("signals_referenced", []),
        "sent_at": datetime.utcnow().isoformat(),
    }


# JSON Schema for Groq tool definition
OUTREACH_SENDER_SCHEMA = {
    "type": "function",
    "function": {
        "name": "tool_outreach_automated_sender",
        "description": (
            "Composes a hyper-personalized outreach email referencing live signals and the "
            "account brief, then automatically dispatches it via Resend. This is the final "
            "execution step — it both writes AND sends the email without human intervention."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "account_brief": {"type": "string", "description": "The 2-paragraph account brief from tool_research_analyst"},
                "signals": {"type": "object", "description": "The full signals object from tool_signal_harvester"},
                "icp": {"type": "string", "description": "The seller ICP string"},
                "recipient_email": {"type": "string", "description": "Email address to send outreach to"},
                "recipient_name": {"type": "string", "description": "Recipient name for personalization"},
                "sender_name": {"type": "string", "description": "Name of the sender"},
                "sender_company": {"type": "string", "description": "Name of the sending company"},
            },
            "required": ["account_brief", "signals", "icp", "recipient_email"],
        },
    },
}
