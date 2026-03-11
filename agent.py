# agent.py
# Groq-powered agentic loop: sequential tool chaining with live log streaming

import json
import asyncio
from datetime import datetime
from typing import AsyncGenerator, Callable, Optional
from groq import Groq

from tools import (
    tool_signal_harvester, SIGNAL_HARVESTER_SCHEMA,
    tool_research_analyst, RESEARCH_ANALYST_SCHEMA,
    tool_outreach_automated_sender, OUTREACH_SENDER_SCHEMA,
)

import os

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

TOOLS = [SIGNAL_HARVESTER_SCHEMA, RESEARCH_ANALYST_SCHEMA, OUTREACH_SENDER_SCHEMA]

TOOL_MAP = {
    "tool_signal_harvester": tool_signal_harvester,
    "tool_research_analyst": tool_research_analyst,
    "tool_outreach_automated_sender": tool_outreach_automated_sender,
}

SYSTEM_PROMPT = """You are FireReach, an elite autonomous B2B outreach agent built for Rabbitt AI.

## YOUR PERSONA:
You are methodical, data-driven, and relentlessly focused on grounding every action in real signals. You think like a top-tier account executive who never sends a generic email.

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
- After tool_outreach_automated_sender completes, summarize what was done"""


def _log(step: str, message: str, data=None) -> dict:
    return {
        "step": step,
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
    }


def _sanitize_args(args: dict) -> dict:
    if "signals" in args:
        return {
            **args,
            "signals": f"[Signals: {args['signals'].get('total_signals', '?')} signals for {args['signals'].get('company', '?')}]"
        }
    return args


async def run_firereach_agent(
    icp: str,
    target_company: str,
    recipient_email: str,
    recipient_name: str = "",
    sender_name: str = "Alex",
    sender_company: str = "FireReach",
    on_log: Optional[Callable] = None,
) -> dict:
    def emit(step, message, data=None):
        entry = _log(step, message, data)
        if on_log:
            on_log(entry)
        return entry

    emit("init", f"🔥 FireReach agent activated for target: {target_company}")

    messages = [
        {
            "role": "user",
            "content": (
                f"Execute a full autonomous outreach for the following:\n\n"
                f"Target Company: {target_company}\n"
                f"ICP: {icp}\n"
                f"Recipient Email: {recipient_email}\n"
                f"Recipient Name: {recipient_name or 'the decision maker'}\n"
                f"Sender Name: {sender_name}\n"
                f"Sender Company: {sender_company}\n\n"
                f"Execute all three tools in sequence and send the personalized outreach email."
            ),
        }
    ]

    tool_results = {"signals": None, "brief": None, "email": None}

    # Agentic loop — max 10 iterations
    for iteration in range(10):
        response = groq_client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "system", "content": SYSTEM_PROMPT}] + messages,
            tools=TOOLS,
            tool_choice="auto",
            max_tokens=2048,
            temperature=0.2,
        )

        choice = response.choices[0]
        assistant_message = choice.message

        # Convert to dict for message history
        msg_dict = {"role": "assistant", "content": assistant_message.content or ""}
        if assistant_message.tool_calls:
            msg_dict["tool_calls"] = [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                }
                for tc in assistant_message.tool_calls
            ]
        messages.append(msg_dict)

        # No tool calls = agent finished
        if not assistant_message.tool_calls:
            emit("complete", "✅ Agent completed autonomous outreach", {"summary": assistant_message.content})
            return {
                "success": True,
                "summary": assistant_message.content,
                "signals": tool_results["signals"],
                "brief": tool_results["brief"],
                "email": tool_results["email"],
            }

        # Execute each tool call
        for tc in assistant_message.tool_calls:
            tool_name = tc.function.name
            tool_args = json.loads(tc.function.arguments)

            emit("tool_call", f"⚙ Calling {tool_name}", _sanitize_args(tool_args))

            try:
                tool_fn = TOOL_MAP.get(tool_name)
                if not tool_fn:
                    raise ValueError(f"Unknown tool: {tool_name}")

                # Call the tool (async or sync)
                if asyncio.iscoroutinefunction(tool_fn):
                    result = await tool_fn(**tool_args)
                else:
                    result = tool_fn(**tool_args)

                # Cache and emit stage-specific logs
                if tool_name == "tool_signal_harvester":
                    tool_results["signals"] = result
                    emit("signal", f"📡 Harvested {result['total_signals']} live signals for {result['company']}", result)

                elif tool_name == "tool_research_analyst":
                    tool_results["brief"] = result
                    emit("research", f"📋 Account brief generated (alignment: {result['icp_alignment_score']}%)", result)

                elif tool_name == "tool_outreach_automated_sender":
                    tool_results["email"] = result
                    emit("sent", f"📧 Email dispatched to {result['recipient']} — ID: {result['email_id']}", result)

            except Exception as e:
                result = {"error": str(e)}
                emit("error", f"❌ Tool {tool_name} failed: {e}")

            # Append tool result to message history
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result),
            })

    raise RuntimeError("Agent exceeded maximum iterations without completing")
