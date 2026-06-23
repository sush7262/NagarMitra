import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

import asyncio
from datetime import datetime, timezone
import random
from backend.services.firebase_service import get_db

async def test_seed():
    db = get_db()
    if not db:
        print("DB not initialized")
        return
    print("DB initialized")
    
    templates = [
        {
            "title": "Severe Pothole on Main Road",
            "description": "Large pothole causing traffic issues and vehicle damage. Needs urgent repair.",
            "issue_type": "pothole",
            "severity_label": "High",
            "severity_score": 8,
            "department": "PWD",
            "image": "https://firebasestorage.googleapis.com/v0/b/nagarmitra-8cc51.firebasestorage.app/o/dummy%20issue%2Fimages%20(1).jfif?alt=media&token=176d4c1c-1459-4e78-99f8-2cf7e333fffb"
        }
    ]
    
    now = datetime.now(timezone.utc)
    for template in templates:
        lat_offset = (random.random() - 0.5) * 0.02
        lng_offset = (random.random() - 0.5) * 0.02
        
        doc_ref = db.collection("issues").document()
        issue_data = {
            "title": template["title"],
            "description": template["description"],
            "issue_type": template["issue_type"],
            "severity_score": template["severity_score"],
            "severity_label": template["severity_label"],
            "department": template["department"],
            "reporter_uid": "system_seed",
            "reporter_name": "System Automated",
            "status": "open",
            "location": {
                "lat": 19.076 + lat_offset,
                "lng": 72.877 + lng_offset,
                "address": "Auto-detected Location"
            },
            "photos": { "before": [template["image"]] },
            "ai_confidence": 0.95,
            "upvote_count": random.randint(0, 5),
            "supporters": [],
            "created_at": now,
            "updated_at": now
        }
        print("Saving issue...")
        doc_ref.set(issue_data)
        print("Issue saved successfully")

if __name__ == "__main__":
    asyncio.run(test_seed())
