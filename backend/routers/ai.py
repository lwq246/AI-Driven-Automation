"""
AI-related API endpoints:
- Semantic mentor matching via pgvector
- SSM certificate verification via LLM Vision OCR
- Nudge email generation for at-risk linkages
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
import json

from schemas import (
    MatchRequest, MatchResponse, MentorMatch,
    SSMVerifyResponse, VerificationStatus,
    NudgeRequest, NudgeResponse,
)
from database import get_supabase_client
from config import get_settings

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/match", response_model=MatchResponse)
async def match_mentors(request: MatchRequest):
    """
    Generate an embedding for the startup's needs text and find the best
    mentor matches using pgvector cosine similarity in Supabase.
    """
    settings = get_settings()
    supabase = get_supabase_client()

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)

        # Step 1: Generate embedding via Gemini
        embedding_response = genai.embed_content(
            model="models/text-embedding-004",
            content=request.needs_text,
            task_type="semantic_similarity"
        )
        query_embedding = embedding_response['embedding']

        # Step 2: Call Supabase RPC for pgvector similarity search
        result = supabase.rpc(
            "match_mentors_to_startup",
            {
                "query_embedding": query_embedding,
                "match_threshold": request.match_threshold,
                "match_count": request.match_count,
            },
        ).execute()

        # Step 3: Format response
        matches = [
            MentorMatch(
                mentor_id=row["mentor_id"],
                name=row.get("mentor_name", "Unknown"),
                skills_summary=" \u2022 ".join(row.get("expertise_skills", [])),
                similarity=row["similarity"],
            )
            for row in (result.data or [])
        ]

        return MatchResponse(
            startup_id=request.startup_id,
            matches=matches,
            query_text=request.needs_text,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")


@router.post("/verify-ssm", response_model=SSMVerifyResponse)
async def verify_ssm(
    startup_id: str,
    file: UploadFile = File(..., description="SSM certificate image or PDF"),
):
    """
    Verify a startup's SSM certificate using Gemini Vision API for OCR extraction.
    """
    settings = get_settings()
    supabase = get_supabase_client()

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)

        file_content = await file.read()
        content_type = file.content_type or "image/jpeg"

        model = genai.GenerativeModel(
            'gemini-1.5-flash',
            generation_config={"response_mime_type": "application/json"}
        )

        prompt = (
            "You are an OCR specialist for Malaysian business documents. "
            "Extract the Company Name and SSM Registration Number from this "
            "certificate image. Respond in JSON format with keys: "
            '"company_name" and "registration_number". '
            "If you cannot extract the information, set the values to null."
        )

        vision_response = model.generate_content([
            {"mime_type": content_type, "data": file_content},
            prompt
        ])

        extracted = json.loads(vision_response.text)
        company_name = extracted.get("company_name")
        registration_number = extracted.get("registration_number")

        # Determine verification status
        if company_name and registration_number:
            status = VerificationStatus.VERIFIED
            message = "SSM certificate verified successfully."
            confidence = 0.95
        else:
            status = VerificationStatus.PENDING
            message = "Could not fully extract certificate details. Manual review required."
            confidence = 0.3

        # Update startup verification status in Supabase
        supabase.table("startups").update(
            {"verification_status": status.value}
        ).eq("id", startup_id).execute()

        return SSMVerifyResponse(
            company_name=company_name,
            registration_number=registration_number,
            verification_status=status,
            confidence=confidence,
            message=message,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SSM verification failed: {str(e)}")


@router.post("/generate-nudge", response_model=NudgeResponse)
async def generate_nudge(request: NudgeRequest):
    """
    Generate a context-aware nudge email for an at-risk linkage using Gemini.
    """
    settings = get_settings()

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)

        days_since = (datetime.utcnow() - request.last_interaction_date).days
        topic_context = f" regarding {request.topic}" if request.topic else ""

        model = genai.GenerativeModel(
            'gemini-1.5-flash',
            generation_config={"response_mime_type": "application/json"}
        )

        prompt = (
            "You are an ecosystem coordinator for Cradle, Malaysia's leading "
            "innovation agency. Write a polite, highly professional check-in "
            "email to a mentor. Comply strictly with Malaysian professional "
            "etiquette. The email should be warm but not pushy.\n\n"
            f"Mentor Name: {request.mentor_name}\n"
            f"Startup Name: {request.startup_name}\n"
            f"Last Interaction: {days_since} days ago{topic_context}\n\n"
            "Output a JSON object with exactly two keys: 'subject' and 'body'."
        )

        completion = model.generate_content(prompt)
        email_content = json.loads(completion.text)

        return NudgeResponse(
            linkage_id=request.linkage_id,
            subject=email_content.get("subject", "Mentorship Check-in"),
            body=email_content.get("body", ""),
            generated_at=datetime.utcnow(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nudge generation failed: {str(e)}")
