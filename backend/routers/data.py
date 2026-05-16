"""
Data CRUD endpoints for the frontend to fetch ecosystem data.
"""

from fastapi import APIRouter, HTTPException, Path
from schemas import (
    LinkageResponse, LogInteractionRequest,
    StartupProfile, FeedItem, EcosystemMetrics,
)
from database import get_supabase_client
from datetime import datetime

router = APIRouter(prefix="/api", tags=["Data"])


@router.get("/feed", response_model=list[FeedItem])
async def get_feed():
    """Fetch ecosystem feed items (announcements, opportunities, updates)."""
    supabase = get_supabase_client()
    try:
        # TODO: Replace with actual feed table query once schema is set up
        # For now, return from a feed_items table or construct from linkage events
        result = supabase.table("feed_items").select("*").order(
            "created_at", desc=True
        ).limit(20).execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/linkages", response_model=list[LinkageResponse])
async def get_linkages(startup_id: str | None = None):
    """Fetch active linkages, optionally filtered by startup_id."""
    supabase = get_supabase_client()
    try:
        query = supabase.table("mentorship_links").select(
            "*, mentors(name), programs(name)"
        )
        if startup_id:
            query = query.eq("startup_id", startup_id)
        result = query.execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/profile/{profile_id}", response_model=StartupProfile)
async def get_profile(profile_id: str = Path(...)):
    """Fetch a startup or mentor profile by ID."""
    supabase = get_supabase_client()
    try:
        result = supabase.table("startups").select("*").eq(
            "id", profile_id
        ).single().execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Profile not found: {str(e)}")


@router.get("/admin/metrics", response_model=EcosystemMetrics)
async def get_admin_metrics():
    """Fetch ecosystem-wide KPI metrics for the admin dashboard."""
    supabase = get_supabase_client()
    try:
        active = supabase.table("mentorship_links").select(
            "id", count="exact"
        ).eq("status", "Active").execute()

        at_risk = supabase.table("mentorship_links").select(
            "id", count="exact"
        ).eq("status", "At-Risk").execute()

        all_links = supabase.table("mentorship_links").select(
            "health_score"
        ).execute()

        scores = [l["health_score"] for l in (all_links.data or []) if l.get("health_score")]
        avg_health = sum(scores) / len(scores) if scores else 0

        return EcosystemMetrics(
            total_active_linkages=active.count or 0,
            avg_linkage_health=round(avg_health, 1),
            at_risk_linkages=at_risk.count or 0,
            matches_generated=0,  # TODO: track in a separate counter table
            trending_needs=[],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/linkages/{linkage_id}/log-interaction")
async def log_interaction(
    linkage_id: str = Path(...),
    request: LogInteractionRequest = None,
):
    """Log an interaction for a linkage, resetting health decay."""
    supabase = get_supabase_client()
    try:
        supabase.table("mentorship_links").update({
            "last_interaction_date": datetime.utcnow().isoformat(),
            "health_score": 100,
            "status": "Active",
        }).eq("id", linkage_id).execute()

        return {"message": "Interaction logged successfully", "linkage_id": linkage_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
