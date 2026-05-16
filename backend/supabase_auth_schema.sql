-- 1. Create the user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Startup', 'Mentor', 'Partner', 'Admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add user_id foreign keys to actor tables
-- (Assuming the tables already exist as per the previous blueprint)
ALTER TABLE startups 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE;

ALTER TABLE mentors 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE;

ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE;

ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE;

-- 3. Set up RLS for user_roles so users can read their own role
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role" 
ON user_roles FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Set up basic RLS for actor tables
-- Startups
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Startups are viewable by everyone" ON startups FOR SELECT USING (true);
CREATE POLICY "Users can update own startup profile" ON startups FOR UPDATE USING (auth.uid() = user_id);

-- Mentors
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mentors are viewable by everyone" ON mentors FOR SELECT USING (true);
CREATE POLICY "Users can update own mentor profile" ON mentors FOR UPDATE USING (auth.uid() = user_id);

-- Partners
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners are viewable by everyone" ON partners FOR SELECT USING (true);
CREATE POLICY "Users can update own partner profile" ON partners FOR UPDATE USING (auth.uid() = user_id);
