import asyncio
import httpx

async def test():
    url = "https://firebasestorage.googleapis.com/v0/b/nagarmitra-8cc51.firebasestorage.app/o/dummy%20issue%2Fimages%20%281%29.jfif?alt=media"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        print("Status:", res.status_code)
        import sys
        import os
        sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
        from backend.services.gemini_service import generate_with_image
        try:
            ai_text = await generate_with_image("Describe this.", res.content)
            print("AI response:", ai_text)
        except Exception as e:
            print("AI error:", e)

asyncio.run(test())
