import os
import sys
from datetime import datetime
import random

# Add current directory to path so we can import services
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.firebase_service import get_db, is_initialized, init_firebase

def generate_issues():
    init_firebase()
    if not is_initialized():
        print("Firebase is not initialized. Ensure serviceAccountKey.json is present.")
        return

    db = get_db()
    issues_ref = db.collection("issues")

    base_lat = 26.7271
    base_lng = 88.3953

    departments_data = {
        "PWD": [
            {
                "title": "Large Pothole on Sevoke Road",
                "description": "A very large pothole has developed after recent rains, causing massive traffic slowdowns.",
                "issue_type": "pothole",
                "severity_score": 8,
                "severity_label": "High",
                "photos": {"before": ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400"]}
            },
            {
                "title": "Broken Pavement near Mall",
                "description": "The pedestrian pathway is completely broken making it impossible to walk safely.",
                "issue_type": "road_damage",
                "severity_score": 5,
                "severity_label": "Medium",
                "photos": {"before": ["https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=400"]}
            }
        ],
        "Jal Board": [
            {
                "title": "Severe Water Leakage",
                "description": "Fresh water pipe is leaking continuously for the last 2 days.",
                "issue_type": "water_leak",
                "severity_score": 9,
                "severity_label": "Critical",
                "photos": {"before": ["https://images.unsplash.com/photo-1548610761-46dbce1fb567?auto=format&fit=crop&q=80&w=400"]}
            },
            {
                "title": "Open Manhole",
                "description": "An open manhole is posing a serious danger to vehicles and pedestrians.",
                "issue_type": "drainage",
                "severity_score": 10,
                "severity_label": "Critical",
                "photos": {"before": ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=400"]}
            }
        ],
        "Electricity Board": [
            {
                "title": "Streetlight Not Working",
                "description": "Entire stretch is dark at night because of non-functioning streetlights.",
                "issue_type": "streetlight",
                "severity_score": 4,
                "severity_label": "Medium",
                "photos": {"before": ["https://images.unsplash.com/photo-1502693892582-849c6ba792cb?auto=format&fit=crop&q=80&w=400"]}
            },
            {
                "title": "Sparking from Transformer",
                "description": "Transformer is sparking and making a loud noise. Immediate attention needed.",
                "issue_type": "electrical",
                "severity_score": 10,
                "severity_label": "Critical",
                "photos": {"before": ["https://images.unsplash.com/photo-1555529733-0e67056058e1?auto=format&fit=crop&q=80&w=400"]}
            }
        ],
        "Municipal": [
            {
                "title": "Garbage Dump Overflowing",
                "description": "Garbage has not been collected for a week. The smell is unbearable.",
                "issue_type": "waste",
                "severity_score": 7,
                "severity_label": "High",
                "photos": {"before": ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400"]}
            },
            {
                "title": "Dead Animal on Road",
                "description": "A stray animal has died on the side of the road and needs to be cleared.",
                "issue_type": "waste",
                "severity_score": 6,
                "severity_label": "Medium",
                "photos": {"before": ["https://images.unsplash.com/photo-1605600659928-86d7c71baae0?auto=format&fit=crop&q=80&w=400"]}
            }
        ],
        "Other": [
            {
                "title": "Stray Dog Menace",
                "description": "Large group of aggressive stray dogs chasing vehicles and pedestrians.",
                "issue_type": "animal",
                "severity_score": 5,
                "severity_label": "Medium",
                "photos": {"before": ["https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400"]}
            },
            {
                "title": "Fallen Tree Blocking Road",
                "description": "A large tree has fallen after the storm, completely blocking the lane.",
                "issue_type": "road_blockage",
                "severity_score": 8,
                "severity_label": "High",
                "photos": {"before": ["https://images.unsplash.com/photo-1542308168-f99a37eecfe5?auto=format&fit=crop&q=80&w=400"]}
            }
        ]
    }

    count = 0
    now = datetime.utcnow()
    for dept, issues in departments_data.items():
        for item in issues:
            lat = base_lat + random.uniform(-0.02, 0.02)
            lng = base_lng + random.uniform(-0.02, 0.02)
            
            doc_data = {
                "title": item["title"],
                "description": item["description"],
                "issue_type": item["issue_type"],
                "severity_score": item["severity_score"],
                "severity_label": item["severity_label"],
                "department": dept,
                "status": "open",
                "reporter_uid": "system_seeder",
                "reporter_name": "System Seeder",
                "location": {
                    "lat": lat,
                    "lng": lng,
                    "address": "{} Zone, Siliguri, West Bengal".format(dept)
                },
                "photos": item["photos"],
                "upvote_count": random.randint(1, 15),
                "supporters": ["system_seeder"],
                "created_at": now,
                "updated_at": now,
                "resolved_at": None,
                "escalation_count": 0,
                "officer_uid": None,
                "verification_deadline": None,
                "ai_confidence": random.uniform(0.8, 0.99),
                "is_global": True  # Add is_global so it shows regardless of strict location
            }
            
            # New Structure: issues -> dummy_issue -> department -> doc
            dept_ref = issues_ref.document("dummy_issue").collection(dept)
            doc_ref = dept_ref.document()
            doc_data["issue_id"] = doc_ref.id
            doc_ref.set(doc_data)
            count += 1
            print("Created issue for {}: {}".format(dept, item['title']))
            
    print("Successfully seeded {} issues.".format(count))

if __name__ == '__main__':
    generate_issues()
