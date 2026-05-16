import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(".env.local")

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

# Since supabase-py RPC doesn't currently easily allow executing raw DDL SQL, 
# and the REST API requires a function, the best way to execute raw SQL is 
# through the postgres connection string or via an RPC function.
# Let's write the SQL out so the user can see it, and try to execute via REST if possible.
# Actually, the python client `supabase.rpc` only calls existing functions.
# Let's use psycopg2 if it's installed, or just instruct the user to run it in the SQL Editor.
