import os
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

async def test_serper():
    api_key = os.getenv("SERPER_API_KEY")
    print(f"API Key found: {api_key[:5]}...{api_key[-5:] if api_key else ''}")
    url = "https://google.serper.dev/news"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                url,
                headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                json={"q": "Apple funding 2024", "num": 1},
                timeout=10.0
            )
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:200]}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_serper())
