// Supabase Configuration for Vibe Awards
// To complete setup:
// 1. Go to https://supabase.com/dashboard
// 2. Create a new project (free tier)
// 3. Replace the URL and key below with your project details
// 4. Run the SQL queries to create tables

const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co', // Replace with your Supabase URL
    anonKey: 'your-anon-key-here', // Replace with your Supabase anon key
};

// Supabase Client (simplified)
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    from(table) {
        return new SupabaseQuery(this.url, this.headers, table);
    }

    async rpc(functionName, params = {}) {
        const response = await fetch(`${this.url}/rest/v1/rpc/${functionName}`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(params)
        });
        return await response.json();
    }
}

class SupabaseQuery {
    constructor(url, headers, table) {
        this.url = url;
        this.headers = headers;
        this.table = table;
        this.query = '';
    }

    select(columns = '*') {
        this.query += `?select=${columns}`;
        return this;
    }

    eq(column, value) {
        const separator = this.query.includes('?') ? '&' : '?';
        this.query += `${separator}${column}=eq.${value}`;
        return this;
    }

    order(column, { ascending = false } = {}) {
        const separator = this.query.includes('?') ? '&' : '?';
        const direction = ascending ? 'asc' : 'desc';
        this.query += `${separator}order=${column}.${direction}`;
        return this;
    }

    limit(count) {
        const separator = this.query.includes('?') ? '&' : '?';
        this.query += `${separator}limit=${count}`;
        return this;
    }

    async insert(data) {
        const response = await fetch(`${this.url}/rest/v1/${this.table}`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    async update(data) {
        const response = await fetch(`${this.url}/rest/v1/${this.table}${this.query}`, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    async delete() {
        const response = await fetch(`${this.url}/rest/v1/${this.table}${this.query}`, {
            method: 'DELETE',
            headers: this.headers
        });
        return await response.json();
    }

    async then(resolve, reject) {
        try {
            const response = await fetch(`${this.url}/rest/v1/${this.table}${this.query}`, {
                method: 'GET',
                headers: this.headers
            });
            const data = await response.json();
            resolve(data);
        } catch (error) {
            if (reject) reject(error);
        }
    }
}

// Initialize Supabase client
const supabase = new SupabaseClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Database Schema SQL (Run these in Supabase SQL Editor)
const DATABASE_SCHEMA = `
-- Enable Row Level Security
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS votes ENABLE ROW LEVEL SECURITY;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Projects table
CREATE TABLE IF NOT EXISTS ai_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    creator_id UUID REFERENCES users(id),
    github_url TEXT,
    demo_url TEXT,
    tech_stack TEXT[],
    votes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id),
    username VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    avatar VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nominations table
CREATE TABLE IF NOT EXISTS nominations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    nominee_name VARCHAR(100) NOT NULL,
    nominee_email VARCHAR(100),
    project_title VARCHAR(200) NOT NULL,
    project_description TEXT,
    project_url TEXT,
    github_url TEXT,
    impact_description TEXT,
    nominator_name VARCHAR(100),
    nominator_email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Collaboration Posts table
CREATE TABLE IF NOT EXISTS team_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    username VARCHAR(50) NOT NULL,
    project_title VARCHAR(200) NOT NULL,
    project_description TEXT,
    skills_needed TEXT[],
    tech_stack TEXT[],
    timeline VARCHAR(50),
    contact_info TEXT,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES ai_projects(id),
    vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- Create policies for public access (adjust as needed)
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable read access for all projects" ON ai_projects FOR SELECT USING (true);
CREATE POLICY "Enable read access for all chat messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Enable read access for all nominations" ON nominations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all team posts" ON team_posts FOR SELECT USING (true);
CREATE POLICY "Enable read access for all votes" ON votes FOR SELECT USING (true);

-- Enable insert for all tables (adjust security as needed)
CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all projects" ON ai_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all chat messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all nominations" ON nominations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all team posts" ON team_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all votes" ON votes FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_projects_category ON ai_projects(category);
CREATE INDEX IF NOT EXISTS idx_ai_projects_votes ON ai_projects(votes);
CREATE INDEX IF NOT EXISTS idx_team_posts_status ON team_posts(status);
CREATE INDEX IF NOT EXISTS idx_nominations_status ON nominations(status);

-- Insert some sample data
INSERT INTO users (username, email, avatar_url, bio) VALUES
('TechWizard42', 'wizard@example.com', '🧙‍♂️', 'Full-stack developer passionate about AI'),
('AIEnthusiast', 'ai@example.com', '🤖', 'Machine learning researcher and startup founder'),
('StartupGuru', 'startup@example.com', '🚀', 'Serial entrepreneur in the AI space'),
('VCInsider', 'vc@example.com', '💼', 'Venture capitalist focused on AI startups')
ON CONFLICT (username) DO NOTHING;

-- Insert sample AI projects
INSERT INTO ai_projects (title, description, category, tech_stack, votes) VALUES
('MindfulAI Meditation App', 'AI-powered personalized meditation experiences that adapt to your mood and stress levels', 'health', ARRAY['React Native', 'TensorFlow', 'Firebase', 'OpenAI'], 247),
('CodeReview Assistant', 'Automated code review using GPT-4 to catch bugs and suggest improvements', 'developer-tools', ARRAY['Python', 'OpenAI API', 'GitHub Actions', 'FastAPI'], 189),
('VoiceSync Translator', 'Real-time voice translation with emotional tone preservation', 'communication', ARRAY['PyTorch', 'WebRTC', 'Azure Cognitive Services'], 156),
('SmartHome Oracle', 'Predictive home automation that learns your daily patterns', 'smart-home', ARRAY['IoT', 'Edge Computing', 'TensorFlow Lite'], 134),
('EcoAI Carbon Tracker', 'Personal carbon footprint tracking with AI-powered suggestions', 'environment', ARRAY['React', 'Python', 'Satellite APIs', 'ML'], 98)
ON CONFLICT DO NOTHING;

-- Insert sample chat messages
DO $$
DECLARE
    user_wizard UUID;
    user_ai UUID;
    user_startup UUID;
    user_vc UUID;
BEGIN
    SELECT id INTO user_wizard FROM users WHERE username = 'TechWizard42';
    SELECT id INTO user_ai FROM users WHERE username = 'AIEnthusiast';
    SELECT id INTO user_startup FROM users WHERE username = 'StartupGuru';
    SELECT id INTO user_vc FROM users WHERE username = 'VCInsider';

    INSERT INTO chat_messages (room_id, user_id, username, message, avatar) VALUES
    ('vibe-coders-lounge', user_wizard, 'TechWizard42', 'Just shipped my AI-powered meditation app! The user feedback has been incredible 🚀', '🧙‍♂️'),
    ('vibe-coders-lounge', user_ai, 'AIEnthusiast', 'Anyone working with Claude API? The results are mind-blowing for code generation!', '🤖'),
    ('startup-founders-hub', user_startup, 'StartupGuru', 'Just closed our seed round! Happy to answer any questions about fundraising in the AI space', '🚀'),
    ('startup-founders-hub', user_vc, 'VCInsider', 'Looking for AI startups in the healthcare space. DM me if you''re building something interesting!', '💼'),
    ('demo-day-prep', user_wizard, 'TechWizard42', 'Demo day prep tips: Keep it under 3 minutes, focus on the problem and traction!', '🧙‍♂️')
    ON CONFLICT DO NOTHING;
END $$;
`;

// Export for global use
window.supabase = supabase;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.DATABASE_SCHEMA = DATABASE_SCHEMA;