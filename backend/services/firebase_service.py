"""
Firebase Admin SDK Service — upgraded with proper initialization and helper functions.
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from dotenv import load_dotenv

load_dotenv()

_app = None
_db = None


def init_firebase():
    """Initialize Firebase Admin SDK (call once on startup)."""
    global _app, _db
    if _app:
        return _app

    key_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH", "./serviceAccountKey.json")
    project_id = os.getenv("FIREBASE_PROJECT_ID")

    if os.path.exists(key_path):
        cred = credentials.Certificate(key_path)
        _app = firebase_admin.initialize_app(cred, {
            "storageBucket": f"{project_id}.firebasestorage.app"
        })
        _db = firestore.client()
        print(f"[Firebase] Initialized for project: {project_id}")
    else:
        print("[Firebase] WARNING: serviceAccountKey.json not found. Running in offline mode.")
        print(f"[Firebase] Expected path: {key_path}")
        _app = None
        _db = None

    return _app


def get_db():
    """Return Firestore client. Raises if Firebase not initialized."""
    if _db is None:
        raise RuntimeError(
            "Firebase not initialized. Please add serviceAccountKey.json to the backend folder "
            "and set FIREBASE_SERVICE_ACCOUNT_KEY_PATH in backend/.env"
        )
    return _db


def get_bucket():
    """Return Firebase Storage bucket."""
    return storage.bucket()


def is_initialized() -> bool:
    """Check if Firebase Admin SDK is ready."""
    return _app is not None
