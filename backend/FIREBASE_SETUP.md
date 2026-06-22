# Firebase Admin SDK Setup (Backend)

Backend duplicate-check and submit endpoints need the **Firebase Admin SDK**.
Without it, the frontend automatically falls back to Firestore client SDK.

## Steps

1. Open [Firebase Console](https://console.firebase.google.com) → your project
2. **Project Settings** (gear icon) → **Service accounts**
3. Click **Generate new private key** → download JSON
4. Save the file as:

   ```
   backend/serviceAccountKey.json
   ```

5. Confirm `backend/.env` has:

   ```env
   FIREBASE_PROJECT_ID=your_project_id_here
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./serviceAccountKey.json
   ```

6. Restart the backend:

   ```bash
   cd backend
   uvicorn main:app --reload
   ```

7. Verify — open http://localhost:8000/health

   ```json
   { "status": "healthy", "firebase_admin": true }
   ```

## Deploy Storage & Firestore Rules

From the project root (after `firebase login`):

```bash
firebase deploy --only firestore:rules,storage
```

## Security

- **Never commit** `serviceAccountKey.json` — it is already in `.gitignore`
- Rotate the key if it is ever exposed
