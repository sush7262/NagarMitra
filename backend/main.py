from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from services.firebase_service import init_firebase
init_firebase()

app = FastAPI(
    title="NagarMitra API",
    description="AI-Powered Civic Issue Resolution Backend",
    version="1.0.0",
)

# CORS — allow frontend dev server and production domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "https://*.web.app",       # Firebase Hosting
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "NagarMitra API", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health_check():
    from services.firebase_service import is_initialized
    return {
        "status": "healthy",
        "firebase_admin": is_initialized(),
    }


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
from routers import analyze, issues
app.include_router(analyze.router)
app.include_router(issues.router)
