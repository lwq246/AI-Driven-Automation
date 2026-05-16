-- ============================================================
-- Migration: Switch to Gemini Embeddings (768 dimensions)
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Alter vector columns from 1536 (OpenAI) to 768 (Gemini text-embedding-004)
-- NOTE: If you have existing embeddings, they will be dropped. Re-generate them after.
ALTER TABLE startups ALTER COLUMN needs_embedding TYPE vector(768);
ALTER TABLE mentors ALTER COLUMN skills_embedding TYPE vector(768);

-- 3. Create the AI matching stored procedure (Cosine Distance)
CREATE OR REPLACE FUNCTION match_mentors_to_startup(
    query_embedding vector(768),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    mentor_id UUID,
    name VARCHAR,
    bio TEXT,
    expertise_skills TEXT[],
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.name,
        m.bio,
        m.expertise_skills,
        1 - (m.skills_embedding <=> query_embedding) AS similarity
    FROM mentors m
    WHERE m.skills_embedding IS NOT NULL
      AND 1 - (m.skills_embedding <=> query_embedding) > match_threshold
    ORDER BY m.skills_embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- 4. Create trigger to auto-update last_interaction_date on mentorship_links
-- This fires whenever any update happens on mentorship_links (e.g. logging an interaction)
CREATE OR REPLACE FUNCTION update_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_interaction_date = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_last_interaction'
    ) THEN
        CREATE TRIGGER trigger_update_last_interaction
            BEFORE UPDATE ON mentorship_links
            FOR EACH ROW
            WHEN (NEW.health_score = 100)  -- Only when health is reset (interaction logged)
            EXECUTE FUNCTION update_last_interaction();
    END IF;
END;
$$;

-- 5. Create a feed_items table for ecosystem feed (if not exists)
CREATE TABLE IF NOT EXISTS feed_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL DEFAULT 'announcement',
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- 6. Insert some seed data for demo purposes
-- Seed mentors with skills embeddings will be generated via the API
INSERT INTO mentors (name, expertise_skills, bio, years_experience) VALUES
    ('Dr. Azmi Rahman', ARRAY['Go-To-Market Strategy', 'B2B Sales', 'Enterprise SaaS'], 'Former VP of Sales at Enterprise Corp with 15 years of experience scaling B2B SaaS companies across Southeast Asia.', 15),
    ('Sarah Lim', ARRAY['Enterprise Sales', 'Fintech', 'B2B Scaling'], 'Ex-VP Sales at TechCorp, specialized in enterprise sales cycles and fintech partnerships.', 12),
    ('Khairul Anwar', ARRAY['AI Infrastructure', 'Cloud Architecture', 'MLOps'], 'AI Solutions Architect with deep expertise in cloud-native AI deployments and MLOps pipelines.', 10),
    ('Dato Sri Tan', ARRAY['Fundraising', 'Series A', 'Investor Relations'], 'Angel investor and startup advisor with 20+ years in Malaysian venture capital.', 20),
    ('Priya Nair', ARRAY['ESG Compliance', 'Sustainability', 'Corporate Governance'], 'ESG consultant helping startups navigate sustainability frameworks and compliance.', 8)
ON CONFLICT DO NOTHING;

-- Seed a startup
INSERT INTO startups (company_name, industry, stage, verification_status) VALUES
    ('TechNova Solutions', 'B2B SaaS', 'Seed', 'Verified')
ON CONFLICT DO NOTHING;

-- Seed feed items
INSERT INTO feed_items (type, title, content, metadata) VALUES
    ('announcement', '🚀 New Linkage Formed', 'TechNova Solutions has officially linked with Dr. Azmi Rahman for Go-To-Market strategy! This linkage is supported by the Cradle Mentorship Initiative.', '{"startup": "TechNova Solutions", "mentor": "Dr. Azmi Rahman"}'),
    ('opportunity', '📢 Digital Export Grant 2026', 'The new Digital Export Grant 2026 applications are now open for verified B2B SaaS startups. Focus areas include AI and Cloud Infrastructure.', '{"source": "MDEC", "deadline": "2026-06-30"}'),
    ('linkage_update', '🎓 Linkage Graduated', 'Startup ABC has successfully graduated from their mentorship with Mentor XYZ. Congratulations!', '{"status": "graduated"}')
ON CONFLICT DO NOTHING;
