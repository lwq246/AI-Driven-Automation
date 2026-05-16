"""
Pydantic models for API request/response validation.
These schemas define the contract between the FastAPI backend and the Next.js frontend.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# ==========================================
# Enums
# ==========================================

class LinkageStatus(str, Enum):
    PENDING = "Pending"
    ACTIVE = "Active"
    AT_RISK = "At-Risk"
    GRADUATED = "Graduated"


class VerificationStatus(str, Enum):
    PENDING = "Pending"
    VERIFIED = "Verified"
    REJECTED = "Rejected"


class EcosystemRole(str, Enum):
    STARTUP = "Startup"
    MENTOR = "Mentor"
    PARTNER = "Partner"


# ==========================================
# AI Matching
# ==========================================

class MatchRequest(BaseModel):
    """Request to find mentors matching a startup's needs."""
    startup_id: str
    needs_text: str = Field(..., description="Free-text description of current startup needs")
    match_threshold: float = Field(default=0.7, ge=0.0, le=1.0)
    match_count: int = Field(default=5, ge=1, le=20)


class MentorMatch(BaseModel):
    """A single mentor match result from pgvector similarity search."""
    mentor_id: str
    name: str
    skills_summary: Optional[str] = None
    similarity: float = Field(..., ge=0.0, le=1.0)


class MatchResponse(BaseModel):
    """Response containing ranked mentor matches."""
    startup_id: str
    matches: list[MentorMatch]
    query_text: str


# ==========================================
# SSM Verification (OCR)
# ==========================================

class SSMVerifyResponse(BaseModel):
    """Response after processing SSM certificate via LLM Vision OCR."""
    company_name: Optional[str] = None
    registration_number: Optional[str] = None
    verification_status: VerificationStatus
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    message: str


# ==========================================
# Nudge Generation
# ==========================================

class NudgeRequest(BaseModel):
    """Request to generate an AI nudge email for an at-risk linkage."""
    linkage_id: str
    startup_name: str
    mentor_name: str
    last_interaction_date: datetime
    topic: Optional[str] = None


class NudgeResponse(BaseModel):
    """Response containing the AI-generated nudge email."""
    linkage_id: str
    subject: str
    body: str
    generated_at: datetime


# ==========================================
# Linkages
# ==========================================

class LinkageResponse(BaseModel):
    """A linkage entity (mentorship, enrollment, or partnership)."""
    id: str
    type: str  # "mentorship", "enrollment", "partnership"
    startup_id: str
    counterpart_name: str  # Mentor name or Partner name
    program_name: Optional[str] = None
    status: LinkageStatus
    health_score: Optional[int] = None
    last_interaction_date: Optional[datetime] = None
    created_at: datetime


class LogInteractionRequest(BaseModel):
    """Request to log an interaction within a linkage."""
    notes: Optional[str] = None
    interaction_type: str = Field(default="check-in", description="e.g. check-in, meeting, email")


# ==========================================
# Profiles
# ==========================================

class StartupProfile(BaseModel):
    """Public startup profile data."""
    id: str
    company_name: str
    industry: Optional[str] = None
    stage: Optional[str] = None
    verification_status: VerificationStatus
    bio: Optional[str] = None
    needs: list[str] = []
    total_funding: Optional[float] = None


class MentorProfile(BaseModel):
    """Public mentor profile data."""
    id: str
    name: str
    expertise_skills: list[str] = []
    bio: Optional[str] = None
    years_experience: Optional[int] = None
    avg_success_score: float = 0.0


# ==========================================
# Feed
# ==========================================

class FeedItem(BaseModel):
    """An ecosystem feed item (announcement, opportunity, update)."""
    id: str
    type: str  # "announcement", "opportunity", "linkage_update"
    title: str
    content: str
    created_at: datetime
    metadata: Optional[dict] = None


# ==========================================
# Admin Metrics
# ==========================================

class EcosystemMetrics(BaseModel):
    """Ecosystem-wide KPI metrics for the admin dashboard."""
    total_active_linkages: int
    avg_linkage_health: float
    at_risk_linkages: int
    matches_generated: int
    trending_needs: list[dict] = []


# ==========================================
# Health Check Cron
# ==========================================

class HealthCheckResult(BaseModel):
    """Result of a health check cron run."""
    linkages_evaluated: int
    linkages_decayed: int
    linkages_marked_at_risk: int
    nudges_triggered: int
    run_at: datetime
