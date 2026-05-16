import os
from dotenv import load_dotenv

# Ensure we load the environment variables from .env.local before config initializes
load_dotenv(".env.local")

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_ai_match():
    # The API route does not strictly require the startup to exist in the DB
    # because it embeds the needs_text on the fly and matches against mentors.
    
    needs_text = "EcoLogix Malaysia is fundamentally transforming how agricultural supply chains operate by introducing an AI-powered tracing mechanism that ensures sustainability from farm to table. As we scale our operations across Southeast Asia, we are encountering significant hurdles in navigating the complex and ever-changing ESG compliance regulations specific to different jurisdictions. We are actively seeking an experienced mentor who possesses a deep understanding of B2B enterprise sales cycles and regulatory frameworks. Ideally, this mentor can guide us in structuring our compliance reporting to meet international standards and help us refine our pitch to enterprise clients who prioritize sustainable procurement. We also need strategic advice on building long-term partnerships with major agricultural conglomerates."
    
    print(f"🚀 Testing /api/ai/match endpoint")
    print(f"Startup needs: '{needs_text}'\n")
    
    response = client.post(
        "/api/ai/match",
        json={
            "startup_id": "06e57aa9-58bf-4711-a79b-dae161e7234e", # Dummy ID
            "needs_text": needs_text,
            "match_threshold": 0.5, # Adjust this if you aren't getting matches
            "match_count": 3 # Top 3 matches
        }
    )
    
    if response.status_code == 200:
        print("✅ Match API returned successfully!\n")
        import json
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"❌ Match API failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_ai_match()
