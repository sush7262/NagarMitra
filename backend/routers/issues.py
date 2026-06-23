"""
Router: Issues
POST /api/check-duplicate — check if similar issue exists within 100m before submitting
POST /api/submit-issue   — full submit: duplicate check → save to Firestore (Task 2.5)
"""
import math
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.firebase_service import get_db, is_initialized

router = APIRouter(prefix="/api", tags=["Issues"])


# ── Pydantic models ────────────────────────────────────────────────────────────

class LocationData(BaseModel):
    lat: float
    lng: float
    address: str


class DuplicateCheckRequest(BaseModel):
    issue_type: str
    location: LocationData
    reporter_uid: str


class DuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    existing_issue_id: Optional[str] = None
    message: str


class SubmitIssueRequest(BaseModel):
    title: str
    description: str
    issue_type: str
    severity_score: int
    severity_label: str
    department: str
    reporter_uid: str
    reporter_name: str
    location: LocationData
    photos: dict  # {"before": ["url1", "url2"]}
    ai_confidence: float


class SubmitIssueResponse(BaseModel):
    issue_id: str
    message: str


class EscalationResponse(BaseModel):
    processed: int
    escalated: int
    message: str


class VerifyResolutionRequest(BaseModel):
    issue_id: str


class VerifyResolutionResponse(BaseModel):
    verdict: str
    explanation: str
    message: str


# ── Haversine distance (meters) ────────────────────────────────────────────────

def haversine_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate great-circle distance in meters between two GPS coordinates."""
    R = 6_371_000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ── Duplicate detection logic ──────────────────────────────────────────────────

def find_duplicate(issue_type: str, lat: float, lng: float, radius_meters: float = 100) -> Optional[dict]:
    """
    Query Firestore for an open/in-progress issue of the same type within radius_meters.
    Returns the matching issue dict (with 'id') or None.
    """
    db = get_db()
    issues_ref = db.collection("issues")

    # Filter by issue_type and non-resolved statuses
    query = (
        issues_ref
        .where("issue_type", "==", issue_type)
        .where("status", "in", ["open", "in_progress"])
        .limit(50)           # reasonable cap; geo-filter applied below
    )

    docs = query.stream()
    for doc in docs:
        data = doc.to_dict()
        loc = data.get("location", {})
        existing_lat = loc.get("lat")
        existing_lng = loc.get("lng")
        if existing_lat is None or existing_lng is None:
            continue
        dist = haversine_meters(lat, lng, existing_lat, existing_lng)
        if dist <= radius_meters:
            return {"id": doc.id, **data}

    return None


# ── Endpoint: duplicate check ──────────────────────────────────────────────────

@router.post("/check-duplicate", response_model=DuplicateCheckResponse)
async def check_duplicate(req: DuplicateCheckRequest):
    """
    Check if a similar open issue already exists within 100m.
    If yes → increment upvote_count and add reporter to supporters array.
    """
    if not is_initialized():
        raise HTTPException(
            status_code=503,
            detail="Firebase Admin SDK not configured. Please add serviceAccountKey.json to the backend folder."
        )

    try:
        duplicate = await _run_in_thread(
            find_duplicate,
            req.issue_type,
            req.location.lat,
            req.location.lng,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Duplicate check failed: {str(e)}")

    if duplicate:
        issue_id = duplicate["id"]
        try:
            db = get_db()
            issue_ref = db.collection("issues").document(issue_id)
            issue_ref.update({
                "upvote_count": _firestore_increment(1),
                "supporters": _firestore_array_union([req.reporter_uid]),
            })
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upvote existing issue: {str(e)}")

        return DuplicateCheckResponse(
            is_duplicate=True,
            existing_issue_id=issue_id,
            message=(
                f"Similar issue already reported nearby (ID: {issue_id}). "
                "Your support has been added! 👍"
            )
        )

    return DuplicateCheckResponse(
        is_duplicate=False,
        message="No duplicate found. Proceed to submit."
    )


# ── Endpoint: submit issue ─────────────────────────────────────────────────────

@router.post("/submit-issue", response_model=SubmitIssueResponse)
async def submit_issue(req: SubmitIssueRequest):
    """
    Save a new issue to Firestore.
    Also does a quick duplicate check just in case.
    """
    if not is_initialized():
        raise HTTPException(
            status_code=503,
            detail="Firebase Admin SDK not configured."
        )

    db = get_db()
    
    # Optional: final duplicate check before saving
    duplicate = await _run_in_thread(
        find_duplicate,
        req.issue_type,
        req.location.lat,
        req.location.lng,
    )

    if duplicate:
        # If somehow they bypassed the check, don't create duplicate
        return SubmitIssueResponse(
            issue_id=duplicate["id"],
            message="Similar issue was just reported! Your support was added instead."
        )

    # Prepare document
    now = datetime.utcnow()
    doc_data = {
        "title": req.title,
        "description": req.description,
        "issue_type": req.issue_type,
        "severity_score": req.severity_score,
        "severity_label": req.severity_label,
        "department": req.department,
        "status": "open",
        "reporter_uid": req.reporter_uid,
        "reporter_name": req.reporter_name,
        "location": {
            "lat": req.location.lat,
            "lng": req.location.lng,
            "address": req.location.address
        },
        "photos": req.photos,
        "upvote_count": 1,
        "supporters": [req.reporter_uid],
        "created_at": now,
        "updated_at": now,
        "resolved_at": None,
        "escalation_count": 0,
        "officer_uid": None,
        "verification_deadline": None,
        "ai_confidence": req.ai_confidence
    }

    try:
        # Save to Firestore
        doc_ref = db.collection("issues").document()
        await _run_in_thread(doc_ref.set, doc_data)
        
        return SubmitIssueResponse(
            issue_id=doc_ref.id,
            message="Issue successfully reported!"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save issue: {str(e)}")


# ── Endpoint: run escalation ───────────────────────────────────────────────────

def process_escalations() -> dict:
    from datetime import datetime, timezone
    db = get_db()
    issues_ref = db.collection("issues")
    
    # Query open and in_progress
    open_docs = list(issues_ref.where("status", "==", "open").stream())
    prog_docs = list(issues_ref.where("status", "==", "in_progress").stream())
    all_docs = open_docs + prog_docs
    
    now = datetime.now(timezone.utc)
    processed = 0
    escalated = 0
    
    thresholds = {
        "Critical": 24,
        "High": 48,
        "Medium": 168,  # 7 days
        "Low": 336      # 14 days
    }
    
    for doc in all_docs:
        processed += 1
        data = doc.to_dict()
        created_at = data.get("created_at")
        if not created_at:
            continue
            
        # Ensure timezone-aware comparison
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
            
        hours_unresolved = (now - created_at).total_seconds() / 3600
        severity = data.get("severity_label", "Medium")
        threshold = thresholds.get(severity, 168)
        
        if hours_unresolved > threshold:
            # Check cooldown: only escalate at most once every 24 hours
            last_escalated = data.get("last_escalated_at")
            if last_escalated:
                if last_escalated.tzinfo is None:
                    last_escalated = last_escalated.replace(tzinfo=timezone.utc)
                hours_since_last = (now - last_escalated).total_seconds() / 3600
                if hours_since_last < 24:
                    continue  # Cooldown active
            
            # Action: Escalate
            escalated += 1
            doc_ref = doc.reference
            
            # Update Issue
            doc_ref.update({
                "escalation_count": _firestore_increment(1),
                "last_escalated_at": now
            })
            
            # Log to 'escalations' collection
            db.collection("escalations").add({
                "issue_id": doc.id,
                "severity_label": severity,
                "hours_unresolved": hours_unresolved,
                "timestamp": now
            })
            
            # Add to 'comments' timeline
            doc_ref.collection("comments").add({
                "text": f"⚠️ System Alert: This issue has been automatically escalated due to being unresolved for over {int(hours_unresolved)} hours.",
                "user_name": "NagarMitra System",
                "user_uid": "system",
                "is_escalation": True,
                "created_at": now
            })
            
    return {"processed": processed, "escalated": escalated}


@router.post("/run-escalation", response_model=EscalationResponse)
async def run_escalation():
    """
    Background/cron task to find overdue issues and escalate them.
    """
    if not is_initialized():
        raise HTTPException(
            status_code=503,
            detail="Firebase Admin SDK not configured."
        )

    try:
        result = await _run_in_thread(process_escalations)
        return EscalationResponse(
            processed=result["processed"],
            escalated=result["escalated"],
            message=f"Escalation complete. Processed {result['processed']} issues, escalated {result['escalated']}."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Escalation task failed: {str(e)}")


# ── Endpoint: Verify Resolution (AI Agent) ─────────────────────────────────────

@router.post("/verify-resolution", response_model=VerifyResolutionResponse)
async def verify_resolution(req: VerifyResolutionRequest):
    """
    Task 4.3: Gemini Vision compares before and after photos.
    """
    if not is_initialized():
        raise HTTPException(status_code=503, detail="Firebase Admin SDK not configured.")

    import json
    import httpx
    from datetime import timezone
    from services.gemini_service import compare_images

    db = get_db()
    issue_ref = db.collection("issues").document(req.issue_id)
    doc = await _run_in_thread(issue_ref.get)
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    data = doc.to_dict()
    before_urls = data.get("photos", {}).get("before", [])
    after_urls = data.get("photos", {}).get("after", [])
    
    if not before_urls or not after_urls:
        raise HTTPException(status_code=400, detail="Issue must have both before and after photos to verify.")
        
    # Fetch images
    async with httpx.AsyncClient() as client:
        try:
            res_before = await client.get(before_urls[0])
            res_before.raise_for_status()
            before_bytes = res_before.content
            
            res_after = await client.get(after_urls[0])
            res_after.raise_for_status()
            after_bytes = res_after.content
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to download photos for AI verification: {str(e)}")
            
    prompt = '''
    Compare these two images of a civic issue. Before image shows the reported problem. After image shows the current state. Has the issue been genuinely resolved? Rate resolution quality as exactly one of: not_resolved, partially_resolved, fully_resolved.
    Return ONLY a valid JSON object matching this schema without any markdown formatting:
    {
      "verdict": "...",
      "explanation": "Briefly explain why."
    }
    '''
    
    try:
        ai_response = await compare_images(prompt, before_bytes, after_bytes)
        ai_response_clean = ai_response.replace('```json', '').replace('```', '').strip()
        result_data = json.loads(ai_response_clean)
        verdict = result_data.get("verdict", "partially_resolved")
        explanation = result_data.get("explanation", "AI verification complete.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Verification failed: {str(e)}")
        
    now = datetime.now(timezone.utc)
    updates = {
        "ai_verification_verdict": verdict,
        "ai_verification_explanation": explanation,
        "updated_at": now
    }
    
    comment_text = f"🤖 AI Verification: Verdict is '{verdict}'. {explanation}"
    officer_uid = data.get("officer_uid")
    
    if verdict == "not_resolved":
        updates["status"] = "in_progress"
        comment_text += " Issue has been automatically re-opened due to fake closure detection."
        if officer_uid:
            officer_ref = db.collection("officers").document(officer_uid)
            # Try to increment fake closure count (creates document if not exists via set with merge)
            await _run_in_thread(lambda: officer_ref.set({"fake_closure_count": _firestore_increment(1)}, merge=True))
    elif verdict == "fully_resolved" and data.get("status") == "resolved":
        updates["status"] = "verified_resolved"
        comment_text += " Resolution verified by AI!"
        
    await _run_in_thread(issue_ref.update, updates)
    
    comments_ref = issue_ref.collection("comments")
    await _run_in_thread(comments_ref.add, {
        "text": comment_text,
        "user_name": "NagarMitra AI",
        "user_uid": "system_ai",
        "is_ai_verification": True,
        "created_at": now
    })
    
    return VerifyResolutionResponse(
        verdict=verdict,
        explanation=explanation,
        message="Verification complete"
    )


# ── Firestore helpers (lazy import to avoid init-time errors) ──────────────────

def _firestore_increment(n: int):
    from google.cloud.firestore import INCREMENT  # type: ignore
    from firebase_admin.firestore import firestore as fs
    return fs.Increment(n)


def _firestore_array_union(items: list):
    from firebase_admin.firestore import firestore as fs
    return fs.ArrayUnion(items)


async def _run_in_thread(fn, *args):
    """Run a sync Firestore call in a thread pool so we don't block the event loop."""
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, fn, *args)
