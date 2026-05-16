# Technical Blueprint: Ecosystem Linkage Platform (MyHack 2026)

This blueprint outlines the architecture, database schema, project structure, UI/UX, and AI integration strategy for the "Enterprise LinkedIn for Innovation Ecosystems" platform, designed specifically for the Build With AI 2026 KL - MyHack hackathon.

> [!IMPORTANT]
> **Compliance & Legal Strategy**: All architectural designs, data models, and automated AI prompts are designed to be strictly professional, B2B-focused, and fully compliant with Malaysian law (including PDPA guidelines for data handling). The system is carefully sandboxed to exclude any generating or handling of sensitive 3R (Race, Religion, Royalty) topics. 

## 1. Platform Architecture & Logic Flow

The platform transitions innovation ecosystem management from static spreadsheets to a dynamic, AI-driven graph of programmable relationships. The system uses a **split frontend/backend architecture**:

*   **Next.js Frontend (`frontend/`)**: Serves as the UI layer only. The App Router handles client-side rendering of the "LinkedIn-style" feed, interactive dashboards, and user-facing pages. It communicates with the FastAPI backend via HTTP REST calls. No server-side business logic lives here.
*   **FastAPI Backend (`backend/`)**: A Python-based REST API server that handles all business logic, AI orchestration, and database operations. It exposes endpoints for AI matching, SSM verification, nudge generation, health tracking, and data CRUD. It communicates directly with Supabase using the service role key.
*   **Supabase (Auth & Database)**: Acts as the foundational data layer. PostgreSQL handles relational data (Profiles, Programs, Linkages), while Row Level Security (RLS) ensures startups only see their own private linkage data and public feed items.
*   **pgvector (Semantic Matching)**: Embeddings of mentor skills, startup needs, and program focuses are stored natively in Postgres using `pgvector`. This allows for ultra-fast, in-database similarity searches without needing external vector databases.
*   **Programmable Linkages**: Instead of a "connection" just being a foreign key, a `Linkage` is a state machine with a `status` (Pending, Active, At-Risk, Graduated) and a `health_score`.

### AI Logic Flow
1.  **Auto-Verification**: When a startup registers, they upload their SSM (Suruhanjaya Syarikat Malaysia) certificate. The frontend sends the file to the FastAPI endpoint `POST /api/ai/verify-ssm`, which passes the document to an LLM Vision/Document API to extract the Company Name and Registration Number, automatically verifying the profile without admin intervention.
2.  **Semantic Matching**: When a startup updates their "Current Challenges" (e.g., "Struggling with B2B enterprise sales"), the frontend calls `POST /api/ai/match` which generates an embedding and queries `pgvector` to find Mentors whose "Expertise Summary" embeddings have the highest cosine similarity.
3.  **Health Tracking**: A scheduled job (via `pg_cron` or external scheduler) calls `POST /api/cron/health-check` daily to evaluate the `last_interaction_date` and frequency of interaction within a Linkage. If health drops below a threshold, the backend calls the LLM to generate a context-aware "Nudge" email to both parties via `POST /api/ai/generate-nudge`.

### Authentication & Authorization (Role Management)
*   **Supabase Auth**: The platform leverages Supabase `auth.users` for secure identity management (Email/Password or OAuth).
*   **Role-Based Access Control (RBAC)**: Upon registration and onboarding, a user is mapped to a specific role (`Startup`, `Mentor`, `Partner`, `Admin`) in a central `user_roles` table.
*   **Onboarding Flow (Startups, Mentors, Partners only)**:
    1.  User signs up via the `/login` page.
    2.  If it's their first time, they are redirected to `/onboard`.
    3.  They select their role (limited to `Startup`, `Mentor`, or `Partner`) and submit role-specific data (e.g., SSM cert for startups). *Note: Admin accounts cannot be created via public registration and must be provisioned manually.*
    4.  The backend (`POST /api/auth/register-role`) creates a record in the specific actor table (`startups`, `mentors`, `partners`) linked to their `auth.users.id`.
*   **Login Flow (All Roles)**: Subsequent logins fetch the user's role and route them directly to their personalized dashboard view. This login logic is identical for every role, including `Admin`.

### UN SDGs Addressed
*   **SDG 8 (Decent Work & Economic Growth)**: By accelerating high-quality mentor and partner linkages, the platform directly increases startup survival rates and economic output in the Malaysian tech sector.
*   **SDG 9 (Industry, Innovation & Infrastructure)**: Replaces fragmented, manual coordination with scalable digital infrastructure for national innovation hubs like Cradle.
*   **SDG 17 (Partnerships for the Goals)**: The core thesis of the platform is systematizing and scaling effective partnerships between startups, government agencies, and corporate mentors.

---

## 2. Supabase SQL Schema (with pgvector)

This schema directly reflects your table framework, ensuring that "Linkages" are treated as first-class, programmable entities while utilizing vector embeddings for AI capabilities.

```sql
-- Enable vector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ==========================================
-- 1. Identity & Structure Tables
-- ==========================================

-- Central role mapping for quick routing upon login
CREATE TABLE user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Startup', 'Mentor', 'Partner', 'Admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) CHECK (role IN ('Admin', 'Owner'))
);

CREATE TABLE initiatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    theme VARCHAR(100),
    region_country VARCHAR(100),
    owner_id UUID REFERENCES admins(id)
);

CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id UUID REFERENCES initiatives(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Hackathon', 'Workshop')),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Upcoming'
);

-- ==========================================
-- 2. The Actor Tables (The Profiles)
-- ==========================================

CREATE TABLE startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    stage VARCHAR(50),
    verification_status VARCHAR(50) DEFAULT 'Pending',
    growth_metrics JSONB,
    total_funding NUMERIC(15, 2),
    needs_embedding vector(768) -- Crucial for pgvector matching
);

CREATE TABLE mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name VARCHAR(255) NOT NULL,
    expertise_skills TEXT[], -- Array of Tags
    bio TEXT,
    years_experience INTEGER,
    avg_success_score NUMERIC(5, 2) DEFAULT 0.0, -- AI calculated based on linkage health
    skills_embedding vector(768) -- Crucial for pgvector matching
);

CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Sponsor', 'Provider')),
    service_category VARCHAR(100),
    global_access BOOLEAN DEFAULT FALSE
);

-- ==========================================
-- 3. The Linkage Tables (First-Class Entities)
-- ==========================================

-- Startup to Program (Enrollment)
CREATE TABLE enrollment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id),
    program_id UUID REFERENCES programs(id),
    enrollment_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'Enrolled'
);

-- Startup to Mentor (Mentorship with AI Health Tracking)
CREATE TABLE mentorship_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id),
    mentor_id UUID REFERENCES mentors(id),
    program_id UUID REFERENCES programs(id), -- Connects linkage back to framework
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Active', 'At-Risk', 'Graduated')),
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100) DEFAULT 100,
    last_interaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Startup to Partner (Resource utilization)
CREATE TABLE partnership_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES startups(id),
    partner_id UUID REFERENCES partners(id),
    program_id UUID REFERENCES programs(id),
    status VARCHAR(50) DEFAULT 'Active',
    resource_utilized TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

```

---

## 3. Project Folder Structure (Split Architecture)

```text
/
├── frontend/                            # Next.js App Router (UI Only)
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx           # Supabase Auth UI
│   │   │   └── onboard/page.tsx         # Role selection & SSM upload
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx               # The 3-column "LinkedIn" layout shell
│   │   │   ├── feed/page.tsx            # Central activity feed (Middle Column)
│   │   │   ├── network/page.tsx         # Manage active Linkages & Health Scores
│   │   │   ├── profile/page.tsx         # Public ecosystem profile
│   │   │   └── admin/page.tsx           # Ecosystem-wide metrics (Cradle View)
│   │   ├── layout.tsx                   # Root layout (Providers, Fonts)
│   │   └── page.tsx                     # Landing page / redirect
│   ├── components/
│   │   ├── ui/                          # Shadcn UI / Base Tailwind components
│   │   ├── feed/                        # SystemAnnouncementCard, PartnerUpdateBanner
│   │   ├── network/                     # LinkageHealthMeter, MatchRecommendationCard
│   │   └── shared/                      # SidebarNav, TrustBadge, Navbar
│   ├── lib/
│   │   └── utils.ts                     # Tailwind merge, date formatters
│   ├── next.config.js                   # NEXT_PUBLIC_API_URL → FastAPI backend
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                             # FastAPI (All Business Logic & AI)
│   ├── main.py                          # App entrypoint, CORS, router registration
│   ├── config.py                        # Pydantic Settings (env var loading)
│   ├── database.py                      # Supabase client initialization
│   ├── schemas.py                       # Pydantic request/response models
│   ├── routers/
│   │   ├── auth.py                      # POST /api/auth/register-role, GET /api/auth/me
│   │   ├── ai.py                        # POST /api/ai/match, verify-ssm, generate-nudge
│   │   ├── health.py                    # POST /api/cron/health-check
│   │   └── data.py                      # GET /api/feed, linkages, profile, admin/metrics
│   ├── requirements.txt                 # Python dependencies
│   └── .env.example                     # Environment variable template
│
├── BLUEPRINT.md                         # This file
├── BACKEND_TODO.md                      # Backend implementation checklist
└── .gitignore
```

---

## 4. UI/UX Blueprint ("Enterprise LinkedIn" Layout)

The UI uses a familiar 3-column layout to encourage engagement, but replaces social vanity metrics with ecosystem governance data.

### Left Column: Identity & Trust (Profile Context)
*   **Verified Profile Card**: User Avatar, Name, and Role.
*   **Trust & Compliance Badges**: Crucial for the B2B ecosystem. E.g., `SSM Verified ✓`, `Cradle CIP Spark Grantee`.
*   **Linkage Stats**: A quick summary of their ecosystem footprint:
    *   `Active Mentorships: 2`
    *   `Overall Linkage Health: 94% (Excellent)`

### Middle Column: Ecosystem Feed (The Core)
*   **System Announcements (Auto-generated)**: When a linkage is formed, the system automatically generates a post: *"🚀 [Startup Name] has officially linked with [Mentor Name] for Go-To-Market strategy!"*
*   **Ecosystem Opportunities**: Program openings, grants, and partner resource availability published directly by Ecosystem Admins.
*   **Linkage Updates**: Automated announcements of a linkage successfully graduating or reaching completion.

### Right Column: AI Intelligence & Governance
*   **For Startups (AI Nudges)**: 
    *   **"Suggested Mentors"**: Cards showing top `pgvector` matches based on real-time needs. (e.g., *Match: 92% - Enterprise Sales in Fintech*).
*   **For Ecosystem Admins (Governance)**:
    *   **"Attention Required"**: Alerts for fading relationships. (e.g., *⚠️ Linkage between Startup A and Mentor B has a health score of 45%. [Click to Auto-Nudge]*).
*   **Ecosystem Trends**: "Trending Needs: B2B SaaS Pricing, AI Infrastructure."

---

## 5. API Endpoints Reference (FastAPI Backend)

All backend endpoints are served by the FastAPI application at `http://localhost:8000` (development). The Swagger UI is available at `/docs`.

### Auth Endpoints (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register-role` | Maps an `auth.users.id` to a specific role and creates the actor profile |
| `GET`  | `/api/auth/me` | Returns the current user's role and associated profile data |

### AI Endpoints (`/api/ai`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/match` | Generate embedding & find mentor matches via pgvector |
| `POST` | `/api/ai/verify-ssm` | OCR verification of SSM certificates via LLM Vision |
| `POST` | `/api/ai/generate-nudge` | Generate nudge email for at-risk linkages |

### Cron Endpoints (`/api/cron`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cron/health-check` | Evaluate & decay linkage health scores |

### Data Endpoints (`/api`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/feed` | Fetch ecosystem feed items |
| `GET` | `/api/linkages` | Fetch user's active linkages |
| `GET` | `/api/profile/{id}` | Fetch startup/mentor profile |
| `GET` | `/api/admin/metrics` | Fetch ecosystem-wide KPIs |
| `POST` | `/api/linkages/{id}/log-interaction` | Log an interaction |

---

## 6. AI Integration Plan (The "Secret Sauce")

### The `pgvector` Matching Logic
To find the best mentor for a startup, we use **Cosine Distance** (`<=>`). We create a Postgres Stored Procedure (RPC) that the FastAPI `POST /api/ai/match` endpoint calls:

```sql
CREATE OR REPLACE FUNCTION match_mentors_to_startup(
    query_embedding vector(768),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    mentor_id UUID,
    skills_summary TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.profile_id,
        m.skills_summary,
        1 - (m.skills_embedding <=> query_embedding) AS similarity
    FROM mentors m
    WHERE 1 - (m.skills_embedding <=> query_embedding) > match_threshold
    ORDER BY m.skills_embedding <=> query_embedding ASC -- ASC because smaller distance = higher similarity
    LIMIT match_count;
END;
$$;
```

### Automated Admin Alerts & Linkage Health
Instead of Cradle admins manually emailing mentors to ask "How is the startup doing?", the platform automates it:
1.  **Health Decay**: The FastAPI `POST /api/cron/health-check` endpoint (triggered daily by a scheduler) reduces the `health_score` of a `mentorship_link` by 5 points for every 7 days without a recorded interaction (e.g. check-in log or meeting date).
2.  **Trigger**: If `health_score < 50`, the status shifts to `at_risk`.
3.  **The Nudge Generation**: The system calls `POST /api/ai/generate-nudge` which prompts the LLM:
    *   *System Prompt*: "You are an ecosystem coordinator for Cradle. Write a polite, highly professional check-in email to a mentor. Comply strictly with Malaysian professional etiquette."
    *   *Context*: Passes the Mentor's name, Startup's name, and the date of their last interaction.
    *   *Result*: A drafted email/message presented to the Admin (or sent automatically), e.g., *"Dear [Mentor], It's been a few weeks since your last tracked session with [Startup] regarding [Topic]. Please let us know if you need assistance..."*
