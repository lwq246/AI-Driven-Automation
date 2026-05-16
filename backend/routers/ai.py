"""
AI-related API endpoints:
- Semantic mentor matching via pgvector
- SSM certificate verification via LLM Vision OCR
- Nudge email generation for at-risk linkages
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime

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

    Flow:
    1. Call OpenAI Embeddings API to vectorize the needs_text.
    2. Call the `match_mentors_to_startup` Postgres RPC via Supabase.
    3. Return ranked mentor matches.
    """
    settings = get_settings()
    supabase = get_supabase_client()

    try:
        # Step 1: Generate embedding via OpenAI
        import openai
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        embedding_response = client.embeddings.create(
            model="text-embedding-ada-002",
            input=request.needs_text,
        )
        query_embedding = embedding_response.data[0].embedding

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
                name=row.get("name", "Unknown"),
                skills_summary=row.get("skills_summary"),
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
    Verify a startup's SSM (Suruhanjaya Syarikat Malaysia) certificate
    using LLM Vision API for OCR extraction.

    Flow:
    1. Read the uploaded certificate file.
    2. Send to OpenAI Vision API to extract Company Name and Registration Number.
    3. Update the startup's verification_status in Supabase.
    4. Return extraction results.
    """
    settings = get_settings()
    supabase = get_supabase_client()

    try:
        import openai
        import base64

        # Step 1: Read and encode the uploaded file
        file_content = await file.read()
        base64_image = base64.b64encode(file_content).decode("utf-8")

        # Determine MIME type
        content_type = file.content_type or "image/png"

        # Step 2: Call LLM Vision API for OCR
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        vision_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an OCR specialist for Malaysian business documents. "
                        "Extract the Company Name and SSM Registration Number from the "
                        "provided certificate image. Respond in JSON format with keys: "
                        '"company_name" and "registration_number". '
                        "If you cannot extract the information, set the values to null."
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{content_type};base64,{base64_image}",
                            },
                        },
                        {
                            "type": "text",
                            "text": "Please extract the Company Name and SSM Registration Number from this certificate.",
                        },
                    ],
                },
            ],
            response_format={"type": "json_object"},
            max_tokens=500,
        )

        # Step 3: Parse LLM response
        import json
        extracted = json.loads(vision_response.choices[0].message.content)

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

        # Step 4: Update startup verification status in Supabase
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
    Generate a context-aware nudge email for an at-risk linkage using an LLM.

    The system generates a professional, Malaysian-compliant check-in email
    when a mentorship linkage's health score drops below the threshold.
    """
    settings = get_settings()

    try:
        import openai
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        days_since = (datetime.utcnow() - request.last_interaction_date).days
        topic_context = f" regarding {request.topic}" if request.topic else ""

        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an ecosystem coordinator for Cradle, Malaysia's leading "
                        "innovation agency. Write a polite, highly professional check-in "
                        "email to a mentor. Comply strictly with Malaysian professional "
                        "etiquette. The email should be warm but not pushy. "
                        "Output a JSON object with 'subject' and 'body' keys."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Mentor Name: {request.mentor_name}\n"
                        f"Startup Name: {request.startup_name}\n"
                        f"Last Interaction: {days_since} days ago{topic_context}\n"
                        f"Please generate a professional check-in email."
                    ),
                },
            ],
            response_format={"type": "json_object"},
            max_tokens=800,
        )

        import json
        email_content = json.loads(completion.choices[0].message.content)

        return NudgeResponse(
            linkage_id=request.linkage_id,
            subject=email_content.get("subject", "Mentorship Check-in"),
            body=email_content.get("body", ""),
            generated_at=datetime.utcnow(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nudge generation failed: {str(e)}")
