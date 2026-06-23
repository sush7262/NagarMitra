from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.firebase_service import get_db

router = APIRouter(prefix="/api/users", tags=["Users"])

class LocationData(BaseModel):
    lat: float
    lng: float
    address: Optional[str] = None

class UserProfileUpdate(BaseModel):
    uid: str
    location: LocationData

@router.post("/profile")
async def update_user_profile(data: UserProfileUpdate):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        user_ref = db.collection("users").document(data.uid)
        
        update_data = {
            "location": {
                "lat": data.location.lat,
                "lng": data.location.lng,
                "address": data.location.address
            },
            "updated_at": __import__('google').cloud.firestore.SERVER_TIMESTAMP
        }
        
        # Using set(merge=True) creates the document if it doesn't exist,
        # or updates only the specified fields if it does.
        user_ref.set(update_data, merge=True)
        
        return {"status": "success", "message": "User profile updated successfully"}
    except Exception as e:
        print(f"Error updating user profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))
