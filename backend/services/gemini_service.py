"""
Gemini AI Service — wraps Google Generative AI SDK.
Will be fleshed out in Task 1.3 (after GEMINI_API_KEY is configured).
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

_api_key = os.getenv("GEMINI_API_KEY")
if _api_key:
    genai.configure(api_key=_api_key)

MODEL_FLASH = "gemini-2.0-flash"


def get_model(model_name: str = MODEL_FLASH):
    """Return a configured GenerativeModel instance."""
    return genai.GenerativeModel(model_name)


async def test_connection() -> dict:
    """Simple ping to verify Gemini API is reachable."""
    model = get_model()
    response = model.generate_content("Say 'NagarMitra AI online' and nothing else.")
    return {"status": "ok", "response": response.text.strip()}
