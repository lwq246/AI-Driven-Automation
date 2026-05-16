import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Ensure we load the environment variables from .env.local before config initializes
load_dotenv(".env.local")

from database import get_supabase_client
from config import get_settings
def seed_mentors():
    settings = get_settings()
    supabase = get_supabase_client()
    
    # Configure Gemini
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    mock_mentors = [
        {
            "name": "Sarah Lim",
            "expertise_skills": ["Enterprise Sales", "B2B SaaS", "Go-To-Market"],
            "bio": "Ex-VP Sales at TechCorp. Helped scale 3 Malaysian startups to Series B. Expert in closing large government and enterprise contracts.",
            "years_experience": 15,
            "avg_success_score": 92.5
        },
        {
            "name": "Khairul Anwar",
            "expertise_skills": ["Cloud Architecture", "AWS", "AI Infrastructure", "DevOps"],
            "bio": "Former AWS Solutions Architect. Specializes in building scalable backend systems for AI-native applications and cost-optimizing cloud infrastructure.",
            "years_experience": 10,
            "avg_success_score": 88.0
        },
        {
            "name": "Dr. Azmi Rahman",
            "expertise_skills": ["ESG Compliance", "Supply Chain", "Sustainability"],
            "bio": "Academic turned consultant. Advises manufacturing startups on implementing ESG frameworks to secure European export grants.",
            "years_experience": 20,
            "avg_success_score": 95.0
        }
    ]

    print("🌱 Starting mentor seed process with Gemini Embeddings...")
    
    for mentor in mock_mentors:
        print(f"Generating embedding for {mentor['name']}...")
        
        # We create the embedding based on a combination of their bio and skills
        embedding_text = f"Skills: {', '.join(mentor['expertise_skills'])}. Bio: {mentor['bio']}"
        
        response = client.models.embed_content(
            model="gemini-embedding-2-preview",
            contents=embedding_text,
            config=types.EmbedContentConfig(
                task_type="SEMANTIC_SIMILARITY",
                output_dimensionality=768
            )
        )
        
        # Attach the 768-dimensional pgvector array to the mentor object
        mentor["skills_embedding"] = response.embeddings[0].values

        
        # Attach the 768-dimensional pgvector array to the mentor object
        mentor["skills_embedding"] = response.embeddings[0].values
        
        # Insert into Supabase (id is auto-generated)
        print(f"Inserting {mentor['name']} into Supabase...")
        try:
            supabase.table("mentors").insert(mentor).execute()
            print(f"✅ Successfully added {mentor['name']}.")
        except Exception as e:
            print(f"❌ Failed to insert {mentor['name']}: {str(e)}")
            
    print("\n🎉 Seeding complete! The 'mentors' table is now populated with Gemini AI vectors.")
    print("You can now test the /api/ai/match endpoint!")

if __name__ == "__main__":
    seed_mentors()
