"""
Firebase Admin SDK Service
Will be fully configured in Task 1.2 after Firebase project is created.
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from dotenv import load_dotenv

load_dotenv()

_app = None


def init_firebase():
    """Initialize Firebase Admin SDK (call once on startup)."""
    global _app
    if _app:
        return _app

    key_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH", "./serviceAccountKey.json")
    project_id = os.getenv("FIREBASE_PROJECT_ID")

    if os.path.exists(key_path):
        cred = credentials.Certificate(key_path)
        _app = firebase_admin.initialize_app(cred, {
            "storageBucket": f"{project_id}.firebasestorage.app"
        })
    else:
        # Running without credentials (dev mode / placeholder)
        print("[Firebase] WARNING: serviceAccountKey.json not found. Running in offline mode.")
        _app = None

    return _app


def get_db():
    """Return Firestore client."""
    return firestore.client()


def get_bucket():
    """Return Firebase Storage bucket."""
    return storage.bucket()
