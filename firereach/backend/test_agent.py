import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

from agent import run_firereach_agent

async def test_full_flow():
    print("Starting full agent test...")
    def on_log(entry):
        print(f"[{entry['step'].upper()}] {entry['message']}")
        if entry.get('data'):
            # Print only keys to avoid bloat
            print(f"   Data keys: {list(entry['data'].keys())}")

    try:
        result = await run_firereach_agent(
            icp="Software companies in growth stage",
            target_company="Stripe",
            recipient_email="test@example.com",
            recipient_name="Decision Maker",
            sender_name="Alex",
            sender_company="Rabbitt AI",
            on_log=on_log
        )
        print("\nTEST SUCCESSFUL!")
        print(f"Summary: {result['summary'][:200]}...")
    except Exception as e:
        print(f"\nTEST FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_full_flow())
