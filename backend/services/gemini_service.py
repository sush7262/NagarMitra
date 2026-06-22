"""
Gemini AI Service — uses the new google-genai SDK (google.genai).
Upgraded from deprecated google.generativeai package.
"""
import os
import google.genai as genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

_api_key = os.getenv("GEMINI_API_KEY")

# Initialize the client
client = genai.Client(api_key=_api_key)

MODEL_FLASH = "gemini-2.0-flash-exp"


def get_client() -> genai.Client:
    """Return the configured Gemini client."""
    return client


async def generate_text(prompt: str, model: str = MODEL_FLASH) -> str:
    """Send a text prompt and return the response text."""
    response = await client.aio.models.generate_content(
        model=model,
        contents=prompt,
    )
    return response.text or ""


async def generate_with_image(prompt: str, image_bytes: bytes, mime_type: str = "image/jpeg", model: str = MODEL_FLASH) -> str:
    """Send a prompt + image and return the response text (for Vision tasks)."""
    response = await client.aio.models.generate_content(
        model=model,
        contents=types.Content(
            role="user",
            parts=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                types.Part.from_text(text=prompt),
            ],
        ),
    )
    return response.text or ""


async def test_connection() -> dict:
    """Simple ping to verify Gemini API is reachable."""
    response_text = await generate_text("Say 'NagarMitra AI online' and nothing else.")
    return {"status": "ok", "response": response_text.strip()}
