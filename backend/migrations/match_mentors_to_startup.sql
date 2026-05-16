-- Create a function to match mentors to startups based on embedding similarity
-- using pgvector's cosine distance operator (<=>)
-- To execute this, copy and paste it into the Supabase SQL Editor and run it.

CREATE OR REPLACE FUNCTION match_mentors_to_startup(
    query_embedding vector(768),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    mentor_id uuid,
    name text,
    bio text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        mentors.id as mentor_id,
        mentors.name::text,
        mentors.bio::text,
        (1 - (mentors.skills_embedding <=> query_embedding))::float as similarity
    FROM
        mentors
    WHERE
        1 - (mentors.skills_embedding <=> query_embedding) > match_threshold
    ORDER BY
        mentors.skills_embedding <=> query_embedding
    LIMIT
        match_count;
END;
$$;
