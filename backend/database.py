"""
Supabase client initialization.
Uses the service role key for full database access from the backend.
"""

from supabase import create_client, Client
from config import get_settings


def get_supabase_client() -> Client:
    """
    Create and return a Supabase client using the service role key.
    The service role key bypasses Row Level Security (RLS) — use only
    in trusted server-side code, never expose to the frontend.
    """
    settings = get_settings()
    client: Client = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY,
    )
    return client
