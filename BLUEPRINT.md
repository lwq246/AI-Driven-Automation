# Technical Blueprint: Ecosystem Linkage Platform (MyHack 2026)

This blueprint outlines the architecture, database schema, project structure, UI/UX, and AI integration strategy for the "Enterprise LinkedIn for Innovation Ecosystems" platform, designed specifically for the Build With AI 2026 KL - MyHack hackathon.

> [!IMPORTANT]
> **Compliance & Legal Strategy**: All architectural designs, data models, and automated AI prompts are designed to be strictly professional, B2B-focused, and fully compliant with Malaysian law (including PDPA guidelines for data handling). The system is carefully sandboxed to exclude any generating or handling of sensitive 3R (Race, Religion, Royalty) topics. 

## 1. Platform Architecture & Logic Flow

The platform transitions innovation ecosystem management from static spreadsheets to a dynamic, AI-driven graph of programmable relationships.

*   **Next.js (App Router)**: Serves as the core application framework. Server Components are used for fast, SEO-friendly rendering of public ecosystem pages, while Client Components power the interactive "LinkedIn-style" feed and real-time dashboard. API routes handle the orchestration of LLM requests.
*   **Supabase (Auth & Database)**: Acts as the foundational backend. PostgreSQL handles relational data (Profiles, Programs, Linkages), while Row Level Security (RLS) ensures startups only see their own private linkage data and public feed items.
*   **pgvector (Semantic Matching)**: Embeddings of mentor skills, startup needs, and program focuses are stored natively in Postgres using `pgvector`. This allows for ultra-fast, in-database similarity searches without needing external vector databases.
*   **Programmable Linkages**: Instead of a "connection" just being a foreign key, a `Linkage` is a state machine with a `status` (Pending, Active, At-Risk, Graduated) and a `health_score`.

### AI Logic Flow
1.  **Auto-Verification**: When a startup registers, they upload their SSM (Suruhanjaya Syarikat Malaysia) certificate. A Next.js API route passes the document to an LLM Vision/Document API to extract the Company Name and Registration Number, automatically verifying the profile without admin intervention.
2.  **Semantic Matching**: When a startup updates their "Current Challenges" (e.g., "Struggling with B2B enterprise sales"), an edge function generates an embedding and queries `pgvector` to find Mentors whose "Expertise Summary" embeddings have the highest cosine similarity.
3.  **Health Tracking**: A Supabase pg_cron job runs daily to evaluate the `last_interaction_date` and frequency of interaction within a Linkage. If health drops below a threshold, an LLM generates a context-aware "Nudge" email to both parties.

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
-- 1. The Structure Tables (The Framework)
-- ==========================================

CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    stage VARCHAR(50),
    verification_status VARCHAR(50) DEFAULT 'Pending',
    growth_metrics JSONB,
    total_funding NUMERIC(15, 2),
    needs_embedding vector(1536) -- Crucial for pgvector matching
);

CREATE TABLE mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    expertise_skills TEXT[], -- Array of Tags
    bio TEXT,
    years_experience INTEGER,
    avg_success_score NUMERIC(5, 2) DEFAULT 0.0, -- AI calculated based on linkage health
    skills_embedding vector(1536) -- Crucial for pgvector matching
);

CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

## 3. Next.js App Router Folder Structure

```text
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Supabase Auth UI
│   │   └── onboard/page.tsx             # Role selection & SSM upload
│   ├── (dashboard)/
│   │   ├── layout.tsx                   # The 3-column "LinkedIn" layout shell
│   │   ├── feed/page.tsx                # Central activity feed (Middle Column)
│   │   ├── network/page.tsx             # Manage active Linkages & Health Scores
│   │   ├── profile/page.tsx             # Public ecosystem profile
│   │   └── admin/page.tsx               # Ecosystem-wide metrics (Cradle View)
│   ├── api/
│   │   ├── ai/
│   │   │   ├── match/route.ts           # Generates embeddings & calls Postgres RPC
│   │   │   ├── verify-ssm/route.ts      # LLM Vision OCR for document verification
│   │   │   └── generate-nudge/route.ts  # LLM logic for "At-Risk" linkages
│   │   └── cron/
│   │       └── health-check/route.ts    # Evaluates linkage health daily
│   ├── layout.tsx                       # Root layout (Providers, Fonts)
│   └── page.tsx                         # Landing page outlining ecosystem value
├── components/
│   ├── ui/                              # Shadcn UI / Base Tailwind components
│   ├── feed/                            # SystemAnnouncementCard, PartnerUpdateBanner
│   ├── network/                         # LinkageHealthMeter, MatchRecommendationCard
│   └── shared/                          # SidebarNav, TrustBadge
├── lib/
│   ├── supabase/                        # Server & Client Supabase initializers
│   ├── ai/                              # LLM API wrappers (Gemini/OpenAI)
│   └── utils.ts                         # Tailwind merge, date formatters
└── types/
    └── database.types.ts                # Auto-generated Supabase types
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

## 5. AI Integration Plan (The "Secret Sauce")

### The `pgvector` Matching Logic
To find the best mentor for a startup, we use **Cosine Distance** (`<=>`). We create a Postgres Stored Procedure (RPC) that the Next.js API route calls:

```sql
CREATE OR REPLACE FUNCTION match_mentors_to_startup(
    query_embedding vector(1536),
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
1.  **Health Decay**: A cron job reduces the `health_score` of a `mentorship_link` by 5 points for every 7 days without a recorded interaction (e.g. check-in log or meeting date).
2.  **Trigger**: If `health_score < 50`, the status shifts to `at_risk`.
3.  **The Nudge Generation**: The system triggers a serverless function that prompts the LLM:
    *   *System Prompt*: "You are an ecosystem coordinator for Cradle. Write a polite, highly professional check-in email to a mentor. Comply strictly with Malaysian professional etiquette."
    *   *Context*: Passes the Mentor's name, Startup's name, and the date of their last interaction.
    *   *Result*: A drafted email/message presented to the Admin (or sent automatically), e.g., *"Dear [Mentor], It's been a few weeks since your last tracked session with [Startup] regarding [Topic]. Please let us know if you need assistance..."*
