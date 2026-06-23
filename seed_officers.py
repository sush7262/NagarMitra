import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from backend.services.firebase_service import get_db, init_firebase

def seed_officers():
    init_firebase()
    db = get_db()
    if not db:
        print("DB not initialized")
        return
        
    # 1. Departments List
    departments = ["PWD", "Sanitation", "Water Supply", "Electricity", "Municipal"]
    
    # Let's seed departments in a "departments" collection for UI dropdowns
    for dept in departments:
        doc_ref = db.collection('departments').document(dept)
        doc_ref.set({"name": dept, "is_active": True})
        
    print("Created 5 Departments.")
    
    # 2. Seed Officers
    officers = [
        {"officer_id": "PWD001", "password": "admin", "department": "PWD", "name": "Ramesh Singh", "is_officer": True},
        {"officer_id": "SAN001", "password": "admin", "department": "Sanitation", "name": "Geeta Sharma", "is_officer": True},
        {"officer_id": "WAT001", "password": "admin", "department": "Water Supply", "name": "Abdul Khan", "is_officer": True},
        {"officer_id": "ELE001", "password": "admin", "department": "Electricity", "name": "Vikram Patel", "is_officer": True},
        {"officer_id": "MUN001", "password": "admin", "department": "Municipal", "name": "Priya Verma", "is_officer": True},
    ]
    
    for off in officers:
        doc_ref = db.collection('officers').document(off["officer_id"])
        doc_ref.set(off)
        
    print("Created 5 Officers (1 for each department).")
    print("Password for all is 'admin'.")
    
if __name__ == "__main__":
    seed_officers()
