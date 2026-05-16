# Backend Implementation To-Do List (FastAPI)

## 1. Project & Environment Setup
- [ ] Create a new project on [Supabase](https://supabase.com/).
- [ ] Set up Python virtual environment in `backend/` (`python -m venv .venv`).
- [ ] Install dependencies (`pip install -r requirements.txt`).
- [ ] Copy `backend/.env.example` to `backend/.env` and fill in credentials:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - `FRONTEND_URL` (default: `http://localhost:3000`)
- [ ] Verify FastAPI starts: `uvicorn main:app --reload` → check `/docs`.
- [ ] Connect the Next.js frontend to the backend via `NEXT_PUBLIC_API_URL` env var.

## 2. Authentication & Role Management
- [ ] Enable Email/Password Auth in the Supabase Dashboard.
- [ ] Implement `POST /api/auth/register-role` in `backend/routers/auth.py` to map `auth.users.id` to specific roles (Startup/Mentor/Partner) after initial signup.
- [ ] Implement `GET /api/auth/me` in `backend/routers/auth.py` to fetch current user's role and profile data based on their JWT.

## 3. Database Schema (The Framework)
- [ ] Enable the `pgvector` extension in the Supabase SQL editor (`CREATE EXTENSION IF NOT EXISTS vector;`).
- [ ] Create the **user_roles** table for centralized routing.
- [ ] Create the **Structure Tables**: `admins`, `initiatives`, `programs`.
- [ ] Create the **Actor Tables**: `startups`, `mentors`, `partners`.
- [ ] Add `user_id UUID REFERENCES auth.users(id)` to all actor tables (`startups`, `mentors`, `partners`, `admins`).
- [ ] Add `vector(1536)` columns to `startups` (`needs_embedding`) and `mentors` (`skills_embedding`).
- [ ] Create the **First-Class Linkage Tables**: `enrollment_links`, `mentorship_links`, `partnership_links`.
- [ ] Configure Foreign Keys to ensure linkages correctly reference programs and actors.

## 4. Security & Governance
- [ ] Enable Row Level Security (RLS) on all tables.
- [ ] Create RLS policies:
  - [ ] Users can only insert/update their own profile data based on `auth.uid()`.
  - [ ] Startups can only view their own private linkage data.
  - [ ] Startups can view public ecosystem feed items and programs.
  - [ ] Admins have full access to view metrics and govern linkages.
- [ ] Backend uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) — ensure this key is **never** exposed to the frontend.

## 5. AI & Vector Matching Logic
- [ ] Create the `match_mentors_to_startup` Postgres Stored Procedure using Cosine Distance (`<=>`).
- [ ] Wire up `POST /api/ai/match` endpoint in `backend/routers/ai.py`:
  - Receives startup needs text.
  - Generates embedding via OpenAI `text-embedding-ada-002`.
  - Calls the Supabase RPC stored procedure.
  - Returns ranked mentor matches.

## 6. Automated Health Tracking
- [ ] Set up a database trigger to update `last_interaction_date` in `mentorship_links` whenever an interaction is logged.
- [ ] Wire up `POST /api/cron/health-check` endpoint in `backend/routers/health.py`:
  - Decrease `health_score` by 5 points for linkages inactive for > 7 days.
  - Change linkage status to `At-Risk` if `health_score < 50`.
- [ ] Configure scheduling (choose one):
  - [ ] Option A: `pg_cron` in Supabase to call the endpoint daily (production-recommended).
  - [ ] Option B: `APScheduler` within the FastAPI process for simpler setups.

## 7. AI "Nudge" & Verification Endpoints
- [ ] Wire up `POST /api/ai/generate-nudge` in `backend/routers/ai.py`:
  - Pass context (Startup Name, Mentor Name, Last Interaction) to LLM.
  - Generate professional, Malaysian-compliant check-in email.
- [ ] Wire up `POST /api/ai/verify-ssm` in `backend/routers/ai.py`:
  - Implement OCR using LLM Vision API (GPT-4o) to extract Company Name and Registration Number from uploaded certificates.
  - Automatically update Startup `verification_status` to `Verified`.

## 8. Data CRUD Endpoints
- [ ] Wire up `GET /api/feed` in `backend/routers/data.py` — ecosystem feed items.
- [ ] Wire up `GET /api/linkages` in `backend/routers/data.py` — user linkages.
- [ ] Wire up `GET /api/profile/{id}` in `backend/routers/data.py` — startup/mentor profiles.
- [ ] Wire up `GET /api/admin/metrics` in `backend/routers/data.py` — ecosystem KPIs.
- [ ] Wire up `POST /api/linkages/{id}/log-interaction` in `backend/routers/data.py`.
