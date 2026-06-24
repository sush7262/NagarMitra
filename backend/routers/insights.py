"""
Router: Predictive Insights (Task 5.3)
GET /api/insights — Uses Gemini to analyze city-wide issues and generate predictive insights.
"""
from fastapi import APIRouter, HTTPException
import json
from services.firebase_service import get_db, is_initialized
from services.gemini_service import client, MODEL_FLASH
import asyncio

router = APIRouter(prefix="/api", tags=["Insights"])

INSIGHTS_PROMPT = """You are an expert City Planner AI. 
I am providing you with a JSON list of recent civic issues reported by citizens in our city.
Analyze this data to find patterns, bottlenecks, or predictive trends. 
For example: Which department is overwhelmed? Are there specific areas with recurring problems? What issue type is most critical?

Return exactly 3 actionable insights in a JSON array format like this:
[
  "Insight 1 text here...",
  "Insight 2 text here...",
  "Insight 3 text here..."
]

Keep each insight to 1-2 concise sentences. Do not use markdown fences in the output, just raw JSON.

Here is the data:
{data}
"""

async def run_in_thread(fn, *args):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, fn, *args)

@router.get("/insights")
async def get_predictive_insights():
    if not is_initialized():
        raise HTTPException(status_code=503, detail="Firebase Admin SDK not configured.")

    try:
        db = get_db()
        departments = ["PWD", "Jal Board", "Electricity Board", "Municipal", "Other"]
        all_docs = []
        for dept in departments:
            group_ref = db.collection_group(dept).limit(30)
            dept_docs = await run_in_thread(lambda g=group_ref: list(g.stream()))
            all_docs.extend(dept_docs)
            
        def get_time(d):
            dt = d.to_dict().get("created_at")
            return dt.timestamp() if dt else 0
            
        all_docs.sort(key=get_time, reverse=True)
        docs = all_docs[:100]
        
        if not docs:
            return {"insights": ["Not enough data yet. Encourage citizens to report more issues!"]}

        # Prepare dataset for Gemini
        dataset = []
        for doc in docs:
            data = doc.to_dict()
            dataset.append({
                "type": data.get("issue_type", "unknown"),
                "dept": data.get("department", "unknown"),
                "status": data.get("status", "open"),
                "severity": data.get("severity_label", "Medium"),
                "location": data.get("location", {}).get("address", "unknown"),
                # Format timestamps simply
                "created": data.get("created_at").isoformat() if data.get("created_at") else None,
                "resolved": data.get("resolved_at").isoformat() if data.get("resolved_at") else None
            })

        # Call Gemini
        prompt = INSIGHTS_PROMPT.replace("{data}", json.dumps(dataset, indent=2))
        
        response = await client.aio.models.generate_content(
            model=MODEL_FLASH,
            contents=prompt
        )
        
        raw_text = response.text or "[]"
        # Clean up any potential markdown fences
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()
        
        try:
            insights = json.loads(raw_text)
            if not isinstance(insights, list):
                insights = [str(insights)]
        except json.JSONDecodeError:
            # Fallback if Gemini fails to output valid JSON
            insights = [raw_text[:200] + "..."]

        return {"insights": insights}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")
