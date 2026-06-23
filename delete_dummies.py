import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from backend.services.firebase_service import get_db, init_firebase

def delete_dummy_issues():
    init_firebase()
    db = get_db()
    if not db:
        print("DB not initialized")
        return
    
    issues_ref = db.collection('issues').where('reporter_uid', '==', 'system_seed')
    docs = issues_ref.stream()
    count = 0
    for doc in docs:
        doc.reference.delete()
        count += 1
    print(f"Deleted {count} old dummy issues!")

if __name__ == "__main__":
    delete_dummy_issues()
