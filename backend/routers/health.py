"""
Health check cron endpoint.
Evaluates linkage health, decays scores for inactive linkages,
and triggers nudges for at-risk relationships.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta

from schemas import HealthCheckResult
from database import get_supabase_client

router = APIRouter(prefix="/api/cron", tags=["Cron"])

INACTIVITY_THRESHOLD_DAYS = 7
HEALTH_DECAY_POINTS = 5
AT_RISK_THRESHOLD = 50


@router.post("/health-check", response_model=HealthCheckResult)
async def run_health_check():
    """
    Evaluate all active mentorship linkages and decay health scores
    for those with no recent interactions. Marks at-risk if below threshold.
    """
    supabase = get_supabase_client()

    try:
        result = supabase.table("mentorship_links").select("*").eq(
            "status", "Active"
        ).execute()

        linkages = result.data or []
        now = datetime.utcnow()
        cutoff = now - timedelta(days=INACTIVITY_THRESHOLD_DAYS)

        decayed = 0
        marked_at_risk = 0
        nudges_triggered = 0

        for linkage in linkages:
            last_interaction = datetime.fromisoformat(
                linkage["last_interaction_date"].replace("Z", "+00:00")
            )

            if last_interaction.replace(tzinfo=None) < cutoff:
                new_score = max(0, linkage["health_score"] - HEALTH_DECAY_POINTS)
                update_data = {"health_score": new_score}

                if new_score < AT_RISK_THRESHOLD and linkage["status"] != "At-Risk":
                    update_data["status"] = "At-Risk"
                    marked_at_risk += 1
                    nudges_triggered += 1

                supabase.table("mentorship_links").update(
                    update_data
                ).eq("id", linkage["id"]).execute()

                decayed += 1

        return HealthCheckResult(
            linkages_evaluated=len(linkages),
            linkages_decayed=decayed,
            linkages_marked_at_risk=marked_at_risk,
            nudges_triggered=nudges_triggered,
            run_at=now,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")
