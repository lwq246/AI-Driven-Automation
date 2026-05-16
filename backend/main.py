"""
FastAPI application entrypoint for the Ecosystem Linkage Platform backend.

This server handles all API logic previously planned as Next.js API routes:
- AI matching (pgvector semantic search via Gemini Embeddings)
- SSM certificate verification (Gemini Vision OCR)
- Nudge generation for at-risk linkages (Gemini Chat)
- Health check cron jobs (APScheduler)
- Data CRUD for the frontend
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import ai, health, data


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    print(f"[START] Backend starting | CORS allowed: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}")

    # Start APScheduler for daily health check
    from apscheduler.schedulers.background import BackgroundScheduler
    import httpx

    scheduler = BackgroundScheduler()

    def trigger_health_check():
        """Call the health-check endpoint internally."""
        try:
            port = int(os.getenv("PORT", "8000"))
            response = httpx.post(f"http://localhost:{port}/api/cron/health-check")
            print(f"[HEALTH] Scheduled health check: {response.status_code}")
        except Exception as e:
            print(f"[ERROR] Scheduled health check failed: {e}")

    # Run daily at 2:00 AM (Malaysia time UTC+8 → 18:00 UTC previous day)
    scheduler.add_job(trigger_health_check, "cron", hour=2, minute=0)
    scheduler.start()
    print("[SCHEDULER] APScheduler started - health check runs daily at 2:00 AM")

    app.state.scheduler = scheduler

    yield

    # Shutdown
    scheduler.shutdown(wait=False)
    print("[STOP] Backend shutting down")


app = FastAPI(
    title="Ecosystem Linkage Platform API",
    description=(
        "FastAPI backend for the AI-driven Ecosystem Linkage Platform. "
        "Handles AI matching (Gemini), SSM verification, health tracking, and data serving "
        "for the Next.js frontend."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware — allow the Next.js frontend to call these APIs
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai.router)
app.include_router(health.router)
app.include_router(data.router)


@app.get("/")
async def root():
    """Health check / root endpoint."""
    return {
        "service": "Ecosystem Linkage Platform API",
        "status": "running",
        "ai_provider": "Google Gemini",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
    )
