# NagarMitra — AI-Powered Civic Issue Resolution Platform
### Project Blueprint for Vibe2Ship Hackathon (22 June – 29 June 2026)

---

## 🤖 Rules for AI Coding Assistant (Antigravity / Cursor)

1. **One task at a time.** Complete only the currently assigned task. Do not proceed to the next task automatically.
2. **Wait for human verification.** After completing a task, stop and wait. Only continue when the human explicitly says "next task" or "task complete, aage badho."
3. **Manual setup alert.** Before starting any task that requires external service configuration (Firebase, Google AI Studio, Google Maps API, etc.), first inform the human exactly what needs to be set up manually, provide the setup link, and wait for confirmation before writing any code.
4. **Task status tracking.** At the top of every response, display the current task number and name clearly.
5. **No assumptions.** If any requirement is unclear, ask before implementing.
6. **Checkpoint saves.** After every completed task, remind the human to commit to GitHub with the task number as the commit message (e.g., `git commit -m "Task 2.1 complete: Photo upload component"`).

---

## 🎯 Project Overview

**Name:** NagarMitra  
**Tagline:** "Aapki awaaz, aapka shehar" — AI-powered civic accountability for every Indian citizen.  
**Problem Statement:** Community Hero — Hyperlocal Problem Solver  
**Core Idea:** A PWA where citizens report civic issues with photos, and an AI agent pipeline handles categorization, department routing, tracking, and accountability verification — including detecting if an officer falsely marks an issue as resolved.

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React (Vite) + TailwindCSS — PWA | Fast build, browser deploy, works on mobile |
| AI Core | Gemini 2.0 Flash via Google AI Studio | Mandatory requirement + Vision + Text |
| Backend | Python FastAPI | Lightweight, easy AI Studio deploy |
| Database | Firebase Firestore | Real-time, Google tech, tamper-resistant rules |
| Auth | Firebase Authentication | Google tech, easy phone/email auth |
| Maps | Google Maps JavaScript API | Geo-tagging, issue map view |
| Storage | Firebase Storage | Photo/video upload |
| Deployment | Google AI Studio (backend) + Firebase Hosting (frontend) | Meets submission requirement |

---

## 🎨 UI/UX Design System

### Design Philosophy
**Civic trust meets modern India.** The UI should feel like something the Government of India would build if they had a great design team — trustworthy, clear, accessible to a first-time smartphone user in tier-2/3 India.

### Color Palette
```
Primary Blue    : #1A56DB  — Trust, government, civic authority
Action Orange   : #F97316  — Report button, CTAs, urgency
Success Green   : #16A34A  — Resolved, verified, positive states
Warning Amber   : #D97706  — Pending, in-progress states
Danger Red      : #DC2626  — Critical issues, disputes, escalations
Background      : #F8FAFC  — Light neutral, easy on eyes
Surface White   : #FFFFFF  — Cards, modals
Text Primary    : #0F172A  — High contrast readable
Text Secondary  : #64748B  — Subtitles, metadata
```

### Typography
```
Display Font  : Inter (700/800) — Clean, modern, government-trustworthy
Body Font     : Inter (400/500) — Same family, consistent
Data/Labels   : Inter Mono (400) — Issue IDs, timestamps
```

### Component Style
- **Border radius:** 12px cards, 8px buttons, 20px badges
- **Shadows:** Subtle `0 1px 3px rgba(0,0,0,0.1)` — no dramatic shadows
- **Icons:** Lucide React — consistent, clean
- **Spacing:** 4px base grid (Tailwind default)

### Signature Design Element
**The Issue Card** — Each reported issue has a "health bar" showing resolution progress with color-coded severity, a before/after photo slot, and a live community verification counter. This is the central UI element every screen revolves around.

### Key Screens
1. **Home / Feed** — Map view toggle + list of nearby issues sorted by severity
2. **Report Issue** — Camera/upload → AI auto-fill form → Submit
3. **Issue Detail** — Timeline, photos, status, community votes, dispute button
4. **Dashboard** — Stats: issues reported, resolved, avg resolution time, top areas
5. **Profile** — Citizen score, badges, reported issues history
6. **Admin/Officer View** — Assigned issues queue, resolve button, photo upload required

### Mobile-First Rules
- All tap targets minimum 44px height
- Bottom navigation bar (not sidebar) for mobile
- Camera button always accessible — floating action button on home screen
- Offline-aware: show cached issues even without internet

---

## 🤖 AI Agent Pipeline (Agentic Depth)

```
CITIZEN SUBMITS PHOTO + DESCRIPTION
            ↓
    ┌───────────────────┐
    │  VISION AGENT     │  → Gemini Vision analyzes photo
    │  (Gemini Flash)   │  → Detects: pothole / leakage / waste /
    └───────────────────┘    streetlight / encroachment / other
            ↓
    ┌───────────────────┐
    │  SEVERITY AGENT   │  → Scores 1-10 based on:
    │  (Gemini Text)    │    photo analysis + description + issue type
    └───────────────────┘  → Maps to: Low / Medium / High / Critical
            ↓
    ┌───────────────────┐
    │  DUPLICATE AGENT  │  → Checks Firestore: same issue type
    │  (Geo + Gemini)   │    within 100m radius already reported?
    └───────────────────┘  → If yes: merge, increment upvote count
            ↓
    ┌───────────────────┐
    │  ROUTER AGENT     │  → Maps issue type → department
    │  (Rule + Gemini)  │    Pothole → PWD | Leakage → Jal Board
    └───────────────────┘    Streetlight → Electricity Board
            ↓
    Issue stored in Firestore → Visible on public feed + map
            ↓
    ┌───────────────────┐
    │  ESCALATION AGENT │  → Scheduled check every 24 hrs
    │  (FastAPI cron)   │  → High/Critical unresolved > 48 hrs → escalate
    └───────────────────┘  → Medium > 7 days → escalate
            ↓
    OFFICER MARKS "RESOLVED" (must upload after-photo)
            ↓
    ┌───────────────────┐
    │ VERIFICATION AGENT│  → Notifies original reporter + nearby users
    │  (Gemini Vision)  │  → 48hr window: citizen uploads verification photo
    └───────────────────┘  → Gemini compares before/after photos
            ↓
         /       \
    CONFIRMED    DISPUTED
    ✅ Closed    ❌ Re-opened + escalated to senior officer
                   Officer flagged in system (pattern tracking)
```

---

## 📦 Phase-wise Task Breakdown

---

### PHASE 1 — Foundation & Setup
**Goal:** Project skeleton running locally, all services connected.

---

#### Task 1.1 — Project Initialization
**Status:** ✅ Complete

Set up the monorepo structure:
```
nagarmitra/
├── frontend/        (React + Vite + TailwindCSS PWA)
├── backend/         (Python FastAPI)
├── .env.example
└── README.md
```
- Initialize frontend: `npm create vite@latest frontend -- --template react`
- Install: TailwindCSS, Lucide React, React Router DOM, Firebase SDK
- Initialize backend: FastAPI + uvicorn + python-dotenv + google-generativeai
- Create `.env.example` with all required keys listed (no actual values)
- Create basic `README.md`

**⚠️ Manual Setup Required Before This Task:**
> None — pure local setup.

---

#### Task 1.2 — Firebase Project Setup
**Status:** ⬜ Pending

⚠️ **MANUAL SETUP — Human must do this first:**
1. Go to https://console.firebase.google.com
2. Create new project: "nagarmitra-prod"
3. Enable: **Authentication** (Email/Password + Google Sign-in)
4. Enable: **Firestore Database** (Start in test mode)
5. Enable: **Firebase Storage**
6. Go to Project Settings → Add Web App → Copy the config object
7. Paste config values into `.env` file

**After manual setup, Antigravity will:**
- Create `frontend/src/lib/firebase.js` with Firebase initialization
- Set up Firestore security rules (write-once, no delete for issue records)
- Set up Storage rules (authenticated users only)

---

#### Task 1.3 — Google AI Studio + Gemini API Setup
**Status:** ⬜ Pending

⚠️ **MANUAL SETUP — Human must do this first:**
1. Go to https://aistudio.google.com
2. Sign in with Google account
3. Click "Get API Key" → Create API key
4. Copy API key → paste in `.env` as `GEMINI_API_KEY`
5. Note: Keep this key secret, never commit to GitHub

**After manual setup, Antigravity will:**
- Create `backend/services/gemini_service.py`
- Write a test function: send a text prompt, verify response works
- Test the connection with a simple "Hello" call

---

#### Task 1.4 — Google Maps API Setup
**Status:** ⬜ Pending

⚠️ **MANUAL SETUP — Human must do this first:**
1. Go to https://console.cloud.google.com
2. Enable: **Maps JavaScript API** and **Geocoding API**
3. Create API key → restrict to your domain
4. Copy key → paste in `.env` as `GOOGLE_MAPS_API_KEY`

**After manual setup, Antigravity will:**
- Install `@react-google-maps/api` package
- Create `frontend/src/components/MapView.jsx` — basic map rendering
- Test: map loads centered on India

---

### PHASE 2 — Core Reporting Flow
**Goal:** Citizen can report an issue with photo and it gets saved.

---

#### Task 2.1 — Authentication UI
**Status:** ⬜ Pending

Build login/signup screen:
- Google Sign-in button (Firebase Auth)
- Email/Password option
- After login: redirect to home feed
- Store user profile in Firestore `users` collection on first login
- Fields: `uid`, `name`, `email`, `photoURL`, `citizenScore: 0`, `createdAt`

---

#### Task 2.2 — Report Issue Screen (UI Only)
**Status:** ⬜ Pending

Build the report form UI (no AI yet):
- Camera capture button (mobile) + file upload fallback
- Photo preview with remove option
- Description text area (max 300 chars)
- Location: auto-detect GPS button + manual pin on map
- Address display (reverse geocoded)
- "Submit Report" CTA button (primary orange)
- Loading state on submit

---

#### Task 2.3 — Gemini Vision Agent (Issue Detection)
**Status:** ⬜ Pending

Backend endpoint: `POST /api/analyze-issue`
- Accept: base64 image + description text
- Gemini Vision prompt to detect:
  - `issue_type`: pothole / water_leakage / streetlight / waste / encroachment / other
  - `severity_score`: 1-10
  - `severity_label`: Low / Medium / High / Critical
  - `suggested_title`: short human-readable title
  - `department`: PWD / Jal Board / Electricity Board / Municipal / Other
  - `confidence`: 0.0-1.0
- Return JSON response
- Frontend: auto-fill form fields from AI response, user can edit before submitting

---

#### Task 2.4 — Duplicate Detection Agent
**Status:** ⬜ Pending

Before saving new issue:
- Query Firestore: same `issue_type` within 100m radius + status not "resolved"
- If duplicate found:
  - Do not create new record
  - Increment `upvote_count` on existing issue
  - Add reporter's UID to `supporters` array
  - Return: "Similar issue already reported nearby. Your support has been added!"
- If no duplicate: proceed to save

---

#### Task 2.5 — Save Issue to Firestore
**Status:** ⬜ Pending

Firestore `issues` collection schema:
```
{
  id: auto,
  title: string,
  description: string,
  issue_type: string,
  severity_score: number,
  severity_label: string,
  department: string,
  status: "open" | "in_progress" | "resolved" | "verified_resolved" | "disputed",
  reporter_uid: string,
  reporter_name: string,
  location: { lat, lng, address },
  photos: { before: [url], after: [url] },
  upvote_count: number,
  supporters: [uid],
  created_at: timestamp,
  updated_at: timestamp,
  resolved_at: timestamp | null,
  escalation_count: number,
  officer_uid: string | null,
  verification_deadline: timestamp | null,
  ai_confidence: number
}
```
- Upload photo to Firebase Storage → get URL → save in issue
- Security rules: only reporter can update their own issue, no deletes allowed

---

### PHASE 3 — Feed, Map & Issue Detail
**Goal:** Citizens can browse and interact with reported issues.

---

#### Task 3.1 — Home Feed Screen
**Status:** ⬜ Pending

Two view modes (toggle):
1. **List View** — Issue cards sorted by severity (Critical first)
2. **Map View** — Google Maps with color-coded markers by severity

Issue card shows:
- Thumbnail photo
- Title + issue type badge
- Severity badge (color-coded)
- Location address
- Time since reported
- Upvote count + button
- Status badge

Filter bar: All / Open / In Progress / Resolved | Filter by type

---

#### Task 3.2 — Issue Detail Screen
**Status:** ⬜ Pending

Full issue page:
- Before photo (large)
- Status timeline (opened → assigned → resolved → verified)
- Department assigned + AI confidence shown
- Upvote button with count
- Reporter info (name + citizen score)
- Community verification section (shown when status = "resolved")
- Dispute button (shown to original reporter when resolved)
- Comments/updates section

---

#### Task 3.3 — Upvoting & Community Verification
**Status:** ⬜ Pending

- Any logged-in citizen can upvote an open issue (once per user)
- Upvote = adds to `supporters` array, increments count
- When status changes to "resolved":
  - Show verification prompt to original reporter + top upvoters
  - Two buttons: "✅ Yes, it's fixed" / "❌ No, still broken"
  - If "No": prompt to upload verification photo + description

---

### PHASE 4 — AI Agent Pipeline (Escalation + Verification)
**Goal:** Autonomous AI agents handle escalation and fake-resolution detection.

---

#### Task 4.1 — Escalation Agent (Scheduled)
**Status:** ⬜ Pending

FastAPI background task / endpoint `POST /api/run-escalation`:
- Query all issues with status = "open" or "in_progress"
- Rules:
  - Critical + unresolved > 24 hrs → escalate
  - High + unresolved > 48 hrs → escalate
  - Medium + unresolved > 7 days → escalate
  - Low + unresolved > 14 days → escalate
- On escalation:
  - Increment `escalation_count`
  - Add escalation event to issue timeline
  - Notify reporter (Firebase Cloud Messaging or in-app notification)
- Log escalation events in separate `escalations` Firestore collection

---

#### Task 4.2 — Officer Resolution Flow
**Status:** ⬜ Pending

Officer view (separate role in auth):
- See issues assigned to their department
- "Mark as Resolved" button → **must upload after-photo** (mandatory)
- Without after-photo: cannot mark resolved (frontend + backend validation)
- On resolve: status → "resolved", `verification_deadline` = now + 48 hrs
- Trigger Verification Agent

---

#### Task 4.3 — Before/After Verification Agent (Gemini Vision)
**Status:** ⬜ Pending

Backend endpoint: `POST /api/verify-resolution`
- Input: `issue_id`
- Fetch before-photo URL + after-photo URL from Firestore
- Send both images to Gemini Vision with prompt:
  > "Compare these two images of a civic issue. Before image shows the reported problem. After image shows the current state. Has the issue been genuinely resolved? Rate resolution quality: not_resolved / partially_resolved / fully_resolved. Explain briefly."
- Store AI verdict in issue: `ai_verification_verdict`
- If `not_resolved`: automatically re-open issue + flag officer
- If citizen disputes + AI says `not_resolved` → escalate to senior
- If citizen confirms OR AI says `fully_resolved` → status = "verified_resolved"

---

#### Task 4.4 — Officer Pattern Flagging
**Status:** ⬜ Pending

Track in `officers` Firestore collection:
- `fake_closure_count`: incremented when AI or citizen disputes their resolution
- `total_resolutions`: all resolutions
- `resolution_quality_score`: auto-calculated ratio
- If `fake_closure_count` >= 3: flag officer in system (visible to admin)
- Admin dashboard shows flagged officers list

---

### PHASE 5 — Dashboard, Gamification & Impact
**Goal:** Engagement features and data visibility.

---

#### Task 5.1 — Impact Dashboard
**Status:** ⬜ Pending

Public dashboard screen:
- Total issues reported (this week / month / all time)
- Total verified resolved
- Average resolution time by department
- Top issue types (pie/donut chart)
- Area heatmap (most problematic zones)
- Department leaderboard (fastest resolvers)
- Live counter: "X issues resolved in your city this month"

Use Recharts or Chart.js for charts.

---

#### Task 5.2 — Citizen Gamification
**Status:** ⬜ Pending

Citizen Score system:
| Action | Points |
|---|---|
| Report an issue (valid, not duplicate) | +10 |
| Issue gets verified resolved | +20 |
| Upvote an issue | +2 |
| Successfully dispute a fake closure | +30 |
| Verify a resolved issue (either way) | +5 |

Badges:
- 🏆 First Report
- 🔍 Issue Hunter (10+ reports)
- 🛡️ Truth Keeper (3+ successful disputes)
- ⭐ Community Champion (100+ points)

Show on Profile screen: score, badges, reported issues history.

---

#### Task 5.3 — Predictive Insights (AI)
**Status:** ⬜ Pending

Gemini text analysis endpoint `GET /api/insights`:
- Analyze last 30 days of issues from Firestore
- Generate 3-5 natural language insights, e.g.:
  - "Potholes spike after rainfall in Zone 3 — 78% of reports come within 24hrs of rain"
  - "Ward 7 has the highest unresolved issue rate (34%) — may need attention"
- Show on dashboard as "AI Insights" card
- Refresh weekly (cached in Firestore)

---

### PHASE 6 — Polish, Deploy & Submit
**Goal:** Production-ready deployment and submission documents.

---

#### Task 6.1 — PWA Configuration
**Status:** ⬜ Pending

- Add `manifest.json` with NagarMitra name, icons, theme color
- Service worker for offline caching (basic — cache issue feed)
- "Add to Home Screen" prompt on mobile
- Test on mobile browser — check camera, GPS, tap targets

---

#### Task 6.2 — Responsive UI Polish
**Status:** ⬜ Pending

- Test all screens on mobile (375px) and desktop (1280px)
- Fix any overflow, spacing, or font size issues
- Ensure bottom navigation works on mobile
- Loading skeletons on all data-fetching screens
- Empty states: friendly message + illustration when no issues found
- Error states: clear messages when API fails

---

#### Task 6.3 — Backend Deployment on Google AI Studio
**Status:** ⬜ Pending

⚠️ **MANUAL SETUP — Human must do this first:**
1. Go to https://aistudio.google.com
2. Follow deployment docs: https://ai.google.dev/gemini-api/docs/aistudio-deploying
3. Note your deployed backend URL
4. Update frontend `.env` with backend URL

**After manual setup, Antigravity will:**
- Prepare FastAPI app for deployment (requirements.txt, health check endpoint)
- Update all frontend API calls to use production URL
- Test all endpoints on deployed URL

---

#### Task 6.4 — Frontend Deployment on Firebase Hosting
**Status:** ⬜ Pending

⚠️ **MANUAL SETUP — Human must do this first:**
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run `firebase login`
3. Run `firebase init hosting` in frontend folder
4. Set public directory to `dist`

**After manual setup, Antigravity will:**
- Build production bundle: `npm run build`
- Deploy: `firebase deploy`
- Test deployed URL — all features working

---

#### Task 6.5 — GitHub Repository Setup
**Status:** ⬜ Pending

⚠️ **MANUAL SETUP — Human must do this first:**
1. Create new GitHub repo: `nagarmitra`
2. Make it public
3. Copy repo URL

**After manual setup, Antigravity will:**
- Create comprehensive `README.md` with:
  - Project description
  - Features list
  - Tech stack
  - Setup instructions
  - Screenshots (placeholder)
  - Live demo link
- Ensure `.env` is in `.gitignore`
- Push all code

---

#### Task 6.6 — Google Doc Submission Preparation
**Status:** ⬜ Pending

Create content for the mandatory Google Doc submission:

**Problem Statement Selected:**
Community Hero — Hyperlocal Problem Solver

**Solution Overview:**
NagarMitra is an AI-powered civic issue reporting and resolution platform that uses Google's Gemini AI to autonomously categorize issues, route them to correct departments, detect duplicate reports, escalate unresolved issues, and verify resolutions using before/after photo comparison — preventing false closures by officers.

**Key Features:**
1. AI Vision-based issue detection and categorization
2. Automatic severity scoring (1-10)
3. Smart duplicate detection using geo-proximity
4. Department auto-routing
5. Time-based escalation agent
6. Officer resolution with mandatory after-photo
7. Before/after Gemini Vision comparison for fake-closure detection
8. Community verification and dispute system
9. Officer pattern flagging for repeat fake closures
10. Gamified citizen engagement (scores + badges)
11. AI-generated predictive insights
12. Real-time impact dashboard

**Technologies Used:**
React, Vite, TailwindCSS, Python FastAPI, Firebase (Auth + Firestore + Storage + Hosting)

**Google Technologies Utilized:**
- Google AI Studio (deployment)
- Gemini 2.0 Flash API (Vision + Text — core AI)
- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- Firebase Hosting
- Google Maps JavaScript API
- Google Geocoding API

---

#### Task 6.7 — Final Testing Checklist
**Status:** ⬜ Pending

Test every flow end-to-end:
- [ ] New user signup + login
- [ ] Report issue with photo → AI categorization works
- [ ] Duplicate detection works (report same location twice)
- [ ] Issue appears on map + feed
- [ ] Upvoting works
- [ ] Officer login → sees assigned issues → marks resolved with photo
- [ ] Verification prompt appears for reporter
- [ ] Dispute flow works → issue re-opens
- [ ] Dashboard stats are correct
- [ ] Gamification scores update
- [ ] App works on mobile browser
- [ ] All links in submission are publicly accessible

---

## 📋 Task Status Summary

| Phase | Tasks | Status |
|---|---|---|
| Phase 1: Foundation | 4 tasks | ✅⬜⬜⬜ |
| Phase 2: Core Reporting | 5 tasks | ⬜⬜⬜⬜⬜ |
| Phase 3: Feed & Detail | 3 tasks | ⬜⬜⬜ |
| Phase 4: AI Agents | 4 tasks | ⬜⬜⬜⬜ |
| Phase 5: Dashboard & Gamification | 3 tasks | ⬜⬜⬜ |
| Phase 6: Deploy & Submit | 7 tasks | ⬜⬜⬜⬜⬜⬜⬜ |
| **Total** | **26 tasks** | |

---

## 🚀 How to Resume Work

When starting a new session with Antigravity/Cursor:

1. Upload this file (`NAGARMITRA_BLUEPRINT.md`)
2. Say: *"Resume NagarMitra project. Check which tasks are marked ✅ complete and tell me the next pending task."*
3. Antigravity will identify the next ⬜ task and begin — following all rules above.

**Task Status Markers:**
- ⬜ Pending
- 🔄 In Progress
- ✅ Complete
- ❌ Blocked (needs manual action)

---

*Last updated: 22 June 2026 | Vibe2Ship Hackathon Submission*
