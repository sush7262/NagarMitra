# NagarMitra 🏙️

> **"Aapki awaaz, aapka shehar"** — AI-powered civic accountability for every Indian citizen.

[![Vibe2Ship Hackathon](https://img.shields.io/badge/Vibe2Ship-2026-orange)](https://vibe2ship.com)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)](https://fastapi.tiangolo.com)
[![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-purple)](https://aistudio.google.com)

---

## 🎯 Problem Statement

**Community Hero — Hyperlocal Problem Solver**

Citizens lack an effective, accountable channel to report civic issues (potholes, water leakage, broken streetlights) and hold government officers accountable for resolution.

---

## 💡 Solution

NagarMitra is an AI-powered PWA where citizens report civic issues with photos, and an autonomous AI agent pipeline handles:

- **Vision-based issue detection** — Gemini Flash identifies the issue type from the photo
- **Severity scoring** — 1-10 score mapped to Low / Medium / High / Critical
- **Smart duplicate detection** — geo-proximity check prevents spam, merges upvotes
- **Department auto-routing** — Pothole → PWD, Leakage → Jal Board, etc.
- **Time-based escalation** — unresolved issues auto-escalate based on severity
- **Before/After verification** — Gemini Vision compares photos to detect fake closures
- **Officer accountability** — fake closure patterns flagged and tracked

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TailwindCSS (PWA) |
| AI Core | Gemini 2.0 Flash (Vision + Text) |
| Backend | Python FastAPI |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| Maps | Google Maps JavaScript API |
| Deployment | Firebase Hosting (frontend) + Google AI Studio (backend) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Firebase project (see Setup)
- Google AI Studio API key

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Fill in your Firebase + Google Maps config values in .env
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your GEMINI_API_KEY and Firebase config in .env
# Download serviceAccountKey.json — see backend/FIREBASE_SETUP.md
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

Verify Firebase Admin: http://localhost:8000/health → `"firebase_admin": true`

Deploy Firestore + Storage rules (from project root):

```bash
firebase deploy --only firestore:rules,storage
```

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API Key |
| `VITE_BACKEND_URL` | Backend API URL (default: `http://localhost:8000`) |

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio API Key |
| `FIREBASE_PROJECT_ID` | Firebase Project ID |
| `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` | Path to Firebase service account JSON |

---

## 🤖 AI Agent Pipeline

```
Photo + Description
       ↓
  Vision Agent (Gemini) → Detect issue type
       ↓
  Severity Agent → Score 1-10 + label
       ↓
  Duplicate Agent → Geo-proximity check
       ↓
  Router Agent → Assign department
       ↓
  [Saved to Firestore + Shown on Feed/Map]
       ↓
  Escalation Agent (scheduled) → Auto-escalate unresolved
       ↓
  Officer marks resolved (must upload after-photo)
       ↓
  Verification Agent (Gemini Vision) → Compare before/after
       ↓
  Confirmed ✅ or Disputed ❌ → Re-open + flag officer
```

---

## 📱 Key Screens

1. **Home Feed** — Map + list of nearby issues sorted by severity
2. **Report Issue** — Camera → AI auto-fill → Submit
3. **Issue Detail** — Timeline, photos, community votes, dispute button
4. **Dashboard** — City-wide stats + AI insights
5. **Profile** — Citizen score, badges, history
6. **Officer View** — Issue queue + resolve with photo

---

## 🏆 Hackathon

Built for **Vibe2Ship Hackathon** (22 June – 29 June 2026)  
Problem Statement: Community Hero — Hyperlocal Problem Solver

---

## 📄 License

MIT License — see [LICENSE](LICENSE)
