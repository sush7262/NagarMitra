import sys
import os
import urllib.parse
from datetime import datetime, timezone
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from backend.services.firebase_service import get_db, init_firebase

def create_global_issues():
    init_firebase()
    db = get_db()
    if not db:
        print("DB not initialized")
        return
        
    now = datetime.now(timezone.utc)
    bucket_name = "nagarmitra-8cc51.firebasestorage.app"
    
    # Image 1
    encoded_name_1 = urllib.parse.quote("dummy issue/images.jfif", safe='')
    url_1 = f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_name_1}?alt=media"
    
    # Image 2
    encoded_name_2 = urllib.parse.quote("dummy issue/images (1).jfif", safe='')
    url_2 = f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_name_2}?alt=media"
    
    issues = [
        {
            "title": "Community Cleanliness Drive",
            "description": "A regular cleanliness drive reported in this area. We need volunteers to maintain community hygiene.",
            "issue_type": "waste",
            "severity_score": 3,
            "severity_label": "Low",
            "department": "Sanitation",
            "reporter_uid": "system_global",
            "reporter_name": "NagarMitra Team",
            "status": "open",
            "location": {
                "lat": 19.0760,  # Center of Mumbai or just anywhere, it will show everywhere
                "lng": 72.8777,
                "address": "Global Demo Area"
            },
            "photos": { "before": [url_1] },
            "ai_confidence": 1.0,
            "upvote_count": 15,
            "supporters": [],
            "created_at": now,
            "updated_at": now,
            "is_global": True  # Magic flag
        },
        {
            "title": "Major Pothole on Highway",
            "description": "Large pothole causing major traffic disruptions. Needs urgent attention from PWD.",
            "issue_type": "pothole",
            "severity_score": 8,
            "severity_label": "High",
            "department": "PWD",
            "reporter_uid": "system_global",
            "reporter_name": "NagarMitra Team",
            "status": "open",
            "location": {
                "lat": 19.0760,
                "lng": 72.8777,
                "address": "Global Demo Area"
            },
            "photos": { "before": [url_2] },
            "ai_confidence": 1.0,
            "upvote_count": 25,
            "supporters": [],
            "created_at": now,
            "updated_at": now,
            "is_global": True  # Magic flag
        }
    ]
    
    for i_data in issues:
        db.collection("issues").add(i_data)
        
    print(f"Created {len(issues)} global dummy issues successfully!")

if __name__ == "__main__":
    create_global_issues()
