# Backend Implementation To-Do List

## 1. Project & Environment Setup
- [ ] Create a new project on [Supabase](https://supabase.com/).
- [ ] Connect the Next.js frontend to Supabase (install `@supabase/supabase-js`).
- [ ] Set up environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

## 2. Database Schema (The Framework)
- [ ] Enable the `pgvector` extension in the Supabase SQL editor (`CREATE EXTENSION IF NOT EXISTS vector;`).
- [ ] Create the **Structure Tables**: `admins`, `initiatives`, `programs`.
- [ ] Create the **Actor Tables**: `startups`, `mentors`, `partners`.
- [ ] Add `vector(1536)` columns to `startups` (`needs_embedding`) and `mentors` (`skills_embedding`).
- [ ] Create the **First-Class Linkage Tables**: `enrollment_links`, `mentorship_links`, `partnership_links`.
- [ ] Configure Foreign Keys to ensure linkages correctly reference programs and actors.

## 3. Security & Governance
- [ ] Enable Row Level Security (RLS) on all tables.
- [ ] Create RLS policies:
  - [ ] Startups can only view their own private linkage data.
  - [ ] Startups can view public ecosystem feed items and programs.
  - [ ] Admins have full access to view metrics and govern linkages.

## 4. AI & Vector Matching Logic
- [ ] Create the `match_mentors_to_startup` Postgres Stored Procedure using Cosine Distance (`<=>`).
- [ ] Set up an API route (e.g., `app/api/ai/match/route.ts`) to receive a startup's needs, generate an embedding via OpenAI/Gemini, and call the stored procedure.

## 5. Automated Health Tracking
- [ ] Set up a database trigger to update `last_interaction_date` in `mentorship_links` whenever an interaction is logged.
- [ ] Configure `pg_cron` in Supabase to run a daily task:
  - [ ] Decrease `health_score` by 5 points for linkages inactive for > 7 days.
  - [ ] Change linkage status to `At-Risk` if `health_score < 50`.

## 6. AI "Nudge" & Verification Endpoints
- [ ] Set up Webhook: When a linkage status changes to `At-Risk`, trigger the Next.js API.
- [ ] Create `app/api/ai/generate-nudge/route.ts`:
  - [ ] Pass context (Startup Name, Mentor Name, Last Interaction) to LLM.
  - [ ] Generate professional, Malaysian-compliant check-in email.
- [ ] Create `app/api/ai/verify-ssm/route.ts`:
  - [ ] Implement OCR using an LLM Vision API to extract Company Name and Registration Number from uploaded certificates.
  - [ ] Automatically update Startup `verification_status` to `Verified`.
