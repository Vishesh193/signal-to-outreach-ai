# tools/signal_harvester.py
# DETERMINISTIC: All signals sourced from live Serper API — zero LLM guessing

import asyncio
import httpx  # type: ignore[import]
import os
from datetime import datetime
from typing import Optional

SERPER_URL = "https://google.serper.dev"


async def _serper_search(client: httpx.AsyncClient, query: str, search_type: str = "news", num: int = 4) -> dict:
    api_key = os.getenv("SERPER_API_KEY")  # read lazily so dotenv is guaranteed loaded
    endpoint = f"{SERPER_URL}/news" if search_type == "news" else f"{SERPER_URL}/search"
    response = await client.post(
        endpoint,
        headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
        json={"q": query, "num": num},
        timeout=15.0,
    )
    response.raise_for_status()
    data = response.json()
    return data


def _extract_signals(data: dict, category: str) -> list[dict]:
    items = data.get("news") or data.get("organic") or []
    if not isinstance(items, list):
        items = []
    results = []
    for item in items[:3]:  # type: ignore[index]
        results.append({
            "category": category,
            "title": item.get("title", ""),
            "snippet": item.get("snippet") or item.get("description", ""),
            "source": item.get("source") or item.get("domain", "Unknown"),
            "url": item.get("link", ""),
            "date": item.get("date") or item.get("publishedDate", "Recent"),
        })
    return results


async def tool_signal_harvester(company_name: str, domain: str = "") -> dict:
    """
    Fetches live, deterministic buyer signals for a target company.
    All data sourced from real-time APIs — no LLM hallucination.
    """
    signals: dict = {
        "company": company_name,
        "domain": domain,
        "harvested_at": datetime.utcnow().isoformat(),
        "funding": [],
        "hiring": [],
        "leadership": [],
        "product_news": [],
        "total_signals": 0,
        "summary": "",
    }

    queries = [
        {"query": f'"{company_name}" funding round raised 2024 2025', "type": "news", "key": "funding", "label": "Funding & Investment"},
        {"query": f'"{company_name}" hiring jobs engineering growth 2025', "type": "news", "key": "hiring", "label": "Hiring Trends"},
        {"query": f'"{company_name}" CEO CTO leadership appointed joined 2025', "type": "news", "key": "leadership", "label": "Leadership Changes"},
        {"query": f'"{company_name}" product launch expansion announcement 2025', "type": "news", "key": "product_news", "label": "Product & Growth News"},
    ]

    async with httpx.AsyncClient() as client:
        tasks = [_serper_search(client, q["query"], q["type"]) for q in queries]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    errors = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            errors.append(result)
            continue
        key = queries[i]["key"]
        label = queries[i]["label"]
        signals[key] = _extract_signals(result, label)

    if errors and len(errors) == len(queries):
        raise Exception(f"Serper API failed to fetch any signals. First error: {str(errors[0])}")

    funding: list = signals.get("funding", [])
    hiring: list = signals.get("hiring", [])
    leadership: list = signals.get("leadership", [])
    product_news: list = signals.get("product_news", [])

    all_signals: list = funding + hiring + leadership + product_news
    signals["total_signals"] = len(all_signals)

    if all_signals:
        highlights = "\n".join(
            f"[{s['category']}] {s['title']} ({s['date']})" for s in all_signals[:5]  # type: ignore[index]
        )
        signals["summary"] = f"Live signals captured for {company_name}:\n{highlights}"
    else:
        signals["summary"] = f"No recent public signals found for {company_name}."

    return signals


# JSON Schema for Groq tool definition
SIGNAL_HARVESTER_SCHEMA = {
    "type": "function",
    "function": {
        "name": "tool_signal_harvester",
        "description": (
            "Fetches live, deterministic buyer signals for a target company from real-time "
            "news and search APIs. Returns funding rounds, hiring trends, leadership changes, "
            "and product announcements. This tool NEVER guesses — all data is sourced from live APIs."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "company_name": {
                    "type": "string",
                    "description": "The full name of the target company (e.g. 'Stripe', 'Notion')",
                },
                "domain": {
                    "type": "string",
                    "description": "Optional company domain to improve search accuracy (e.g. 'stripe.com')",
                },
            },
            "required": ["company_name"],
        },
    },
}
