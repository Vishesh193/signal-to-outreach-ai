# main.py — FastAPI server with SSE streaming
import json
import os
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from typing import Optional

from agent import run_firereach_agent

app = FastAPI(
    title="FireReach API",
    description="Autonomous B2B Outreach Engine — Rabbitt AI",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "*"), "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response Models ───────────────────────────────────────────────

class OutreachRequest(BaseModel):
    icp: str
    target_company: str
    recipient_email: str
    recipient_name: Optional[str] = ""
    sender_name: Optional[str] = "Alex"
    sender_company: Optional[str] = "FireReach"


class OutreachResponse(BaseModel):
    success: bool
    summary: Optional[str] = None
    signals: Optional[dict] = None
    brief: Optional[dict] = None
    email: Optional[dict] = None
    error: Optional[str] = None


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "FireReach engine online",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "groq": "✅" if os.getenv("GROQ_API_KEY") else "❌ MISSING",
            "serper": "✅" if os.getenv("SERPER_API_KEY") else "❌ MISSING",
            "resend": "✅" if os.getenv("RESEND_API_KEY") else "❌ MISSING",
        },
    }


@app.post("/api/outreach")
async def outreach_stream(req: OutreachRequest):
    """
    Streaming endpoint using Server-Sent Events.
    Emits live agent log entries as the agentic loop progresses.
    """

    async def event_generator():
        # Emit start event
        yield _sse_event("start", {"message": "FireReach agent initializing...", "target": req.target_company})

        logs = []

        def on_log(entry: dict):
            logs.append(entry)
            # Stream each log entry as it happens
            import asyncio
            # We schedule the SSE write via a queue instead
            pass

        # We'll collect via queue for async streaming
        import asyncio
        queue: asyncio.Queue = asyncio.Queue()

        def on_log_queued(entry: dict):
            queue.put_nowait(entry)

        async def run_agent():
            try:
                result = await run_firereach_agent(
                    icp=req.icp,
                    target_company=req.target_company,
                    recipient_email=req.recipient_email,
                    recipient_name=req.recipient_name,
                    sender_name=req.sender_name,
                    sender_company=req.sender_company,
                    on_log=on_log_queued,
                )
                queue.put_nowait({"__done__": True, "result": result})
            except Exception as e:
                queue.put_nowait({"__error__": str(e)})

        # Start agent as background task
        task = asyncio.create_task(run_agent())

        # Stream queue items as SSE
        while True:
            try:
                item = await asyncio.wait_for(queue.get(), timeout=120.0)
            except asyncio.TimeoutError:
                yield _sse_event("error", {"message": "Agent timed out"})
                break

            if "__done__" in item:
                yield _sse_event("complete", {"success": True, "result": item["result"]})
                break
            elif "__error__" in item:
                yield _sse_event("error", {"message": item["__error__"]})
                break
            else:
                yield _sse_event("log", item)

        task.cancel()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.post("/api/outreach/sync", response_model=OutreachResponse)
async def outreach_sync(req: OutreachRequest):
    """
    Non-streaming fallback endpoint — returns full result when complete.
    """
    logs = []
    try:
        result = await run_firereach_agent(
            icp=req.icp,
            target_company=req.target_company,
            recipient_email=req.recipient_email,
            recipient_name=req.recipient_name,
            sender_name=req.sender_name,
            sender_company=req.sender_company,
            on_log=lambda e: logs.append(e),
        )
        return OutreachResponse(success=True, **result)
    except Exception as e:
        return OutreachResponse(success=False, error=str(e))


def _sse_event(event_type: str, data: dict) -> str:
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
