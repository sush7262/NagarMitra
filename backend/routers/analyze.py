"""
Router: Issue Analysis
POST /api/analyze-issue — Gemini Vision classifies a civic issue from photo + description.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64
import json
import re
from services.gemini_service import client, MODEL_FLASH
from google.genai import types

router = APIRouter(prefix="/api", tags=["Analysis"])


class AnalyzeRequest(BaseModel):
    image_base64: str          # base64-encoded image data
    mime_type: str = "image/jpeg"
    description: str = ""


class AnalyzeResponse(BaseModel):
    issue_type: str
    severity_score: int        # 1-10
    severity_label: str        # Low / Medium / High / Critical
    suggested_title: str
    department: str
    confidence: float          # 0.0 - 1.0
    summary: str               # brief AI-generated description


ANALYSIS_PROMPT = """You are a civic issue detection AI for Indian cities.
Analyze the provided image and description carefully.
Return ONLY a valid JSON object with these exact fields:

{
  "issue_type": "<one of: pothole, water_leakage, streetlight, waste, encroachment, road_damage, drainage, other>",
  "severity_score": <integer 1-10, where 10 is most severe>,
  "severity_label": "<one of: Low, Medium, High, Critical>",
  "suggested_title": "<concise, specific title in 5-8 words>",
  "department": "<one of: PWD, Jal Board, Electricity Board, Municipal, Other>",
  "confidence": <float 0.0-1.0>,
  "summary": "<1-2 sentence description of what you see and the urgency>"
}

Severity guide:
- Critical (8-10): Immediate safety hazard, major water main break, traffic disruption
- High (6-7): Significant inconvenience, potential safety risk
- Medium (4-5): Moderate issue, needs attention within a week
- Low (1-3): Minor issue, can be scheduled

Return ONLY the JSON. No markdown, no explanation."""


@router.post("/analyze-issue", response_model=AnalyzeResponse)
async def analyze_issue(req: AnalyzeRequest):
    """Use Gemini Vision to classify a civic issue from photo + description."""
    try:
        # Decode base64 image
        image_data = base64.b64decode(req.image_base64)

        # Build the prompt — include description if provided
        prompt_text = ANALYSIS_PROMPT
        if req.description.strip():
            prompt_text += f"\n\nUser description: {req.description.strip()}"

        # Call Gemini Vision
        response = await client.aio.models.generate_content(
            model=MODEL_FLASH,
            contents=types.Content(
                role="user",
                parts=[
                    types.Part.from_bytes(data=image_data, mime_type=req.mime_type),
                    types.Part.from_text(text=prompt_text),
                ],
            ),
        )

        raw_text = response.text or ""

        # Strip markdown code fences if present
        raw_text = re.sub(r"```(?:json)?", "", raw_text).strip()

        result = json.loads(raw_text)

        # Validate and clamp values
        severity_score = max(1, min(10, int(result.get("severity_score", 5))))
        confidence = max(0.0, min(1.0, float(result.get("confidence", 0.7))))

        return AnalyzeResponse(
            issue_type=result.get("issue_type", "other"),
            severity_score=severity_score,
            severity_label=result.get("severity_label", "Medium"),
            suggested_title=result.get("suggested_title", "Civic Issue Reported"),
            department=result.get("department", "Municipal"),
            confidence=confidence,
            summary=result.get("summary", req.description),
        )

    except json.JSONDecodeError:
        # Gemini returned non-JSON — fallback gracefully
        raise HTTPException(
            status_code=422,
            detail="AI could not parse the image. Please try with a clearer photo."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
