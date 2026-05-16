from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from database import get_supabase_client

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRoleRequest(BaseModel):
    role: str
    company_name: str | None = None
    industry: str | None = None
    expertise_skills: list[str] | None = None
    verification_status: str = "Pending"
    linkedin_url: str | None = None       # Mentor verification
    service_category: str | None = None    # Partner field

class UserRoleResponse(BaseModel):
    user_id: str
    role: str

def get_current_user_id(authorization: str = Header(...)) -> str:
    """Extract and validate the user ID from the Supabase JWT."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    supabase = get_supabase_client()
    
    response = supabase.auth.get_user(token)
    
    if not response or not response.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        
    return response.user.id

@router.post("/register-role")
async def register_role(
    request: RegisterRoleRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Map an auth.users.id to a specific role and create the actor profile.
    Called during the onboarding flow.
    
    Verification methods differ by role:
    - Startup: SSM certificate OCR via Gemini Vision
    - Mentor: LinkedIn profile URL review
    - Partner: Business document upload + AI verification
    """
    supabase = get_supabase_client()
    
    valid_roles = ["Startup", "Mentor", "Partner"]
    if request.role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role for public registration")

    try:
        # 1. Insert into user_roles
        role_data = {"user_id": user_id, "role": request.role}
        supabase.table("user_roles").insert(role_data).execute()

        # 2. Insert into the specific actor table
        if request.role == "Startup":
            if not request.company_name:
                raise HTTPException(status_code=400, detail="Company name is required for startups")
            startup_data = {
                "user_id": user_id,
                "company_name": request.company_name,
                "industry": request.industry,
                "verification_status": request.verification_status
            }
            supabase.table("startups").insert(startup_data).execute()
            
        elif request.role == "Mentor":
            if not request.company_name:
                raise HTTPException(status_code=400, detail="Name is required for mentors")
            mentor_data = {
                "user_id": user_id,
                "name": request.company_name,
                "expertise_skills": request.expertise_skills or [],
                # Store LinkedIn URL in bio field for now (or add a dedicated column)
                "bio": f"LinkedIn: {request.linkedin_url}" if request.linkedin_url else None,
            }
            supabase.table("mentors").insert(mentor_data).execute()
            
        elif request.role == "Partner":
            if not request.company_name:
                raise HTTPException(status_code=400, detail="Organization name is required for partners")
            partner_data = {
                "user_id": user_id,
                "name": request.company_name,
                "type": "Sponsor",
                "service_category": request.service_category,
            }
            supabase.table("partners").insert(partner_data).execute()

        return {"message": "Role registered successfully", "role": request.role}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=UserRoleResponse)
async def get_me(user_id: str = Depends(get_current_user_id)):
    """
    Returns the current user's role.
    """
    supabase = get_supabase_client()
    
    try:
        result = supabase.table("user_roles").select("*").eq("user_id", user_id).execute()
        if not result.data:
            return {"user_id": user_id, "role": "None"}
            
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
