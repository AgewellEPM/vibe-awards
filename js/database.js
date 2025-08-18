// Database Configuration for Vibe Awards
// Using Supabase as free database backend

class VibeDatabase {
    constructor() {
        // You'll need to replace these with your actual Supabase credentials
        this.SUPABASE_URL = 'https://your-project.supabase.co';
        this.SUPABASE_ANON_KEY = 'your-anon-key';
        this.isConnected = false;
        this.init();
    }

    async init() {
        try {
            // Test connection
            console.log('🚀 Initializing Vibe Awards Database...');
            this.isConnected = true;
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            this.isConnected = false;
        }
    }

    // Create database tables
    async createTables() {
        const queries = [
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                avatar_url TEXT,
                bio TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );`,

            // AI Projects table
            `CREATE TABLE IF NOT EXISTS ai_projects (
                id SERIAL PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                category VARCHAR(50),
                creator_id INTEGER REFERENCES users(id),
                github_url TEXT,
                demo_url TEXT,
                tech_stack TEXT[],
                votes INTEGER DEFAULT 0,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );`,

            // Chat Messages table
            `CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                room_id VARCHAR(50) NOT NULL,
                user_id INTEGER REFERENCES users(id),
                username VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                avatar VARCHAR(10),
                created_at TIMESTAMP DEFAULT NOW()
            );`,

            // Nominations table
            `CREATE TABLE IF NOT EXISTS nominations (
                id SERIAL PRIMARY KEY,
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
                created_at TIMESTAMP DEFAULT NOW()
            );`,

            // Team Collaboration Posts table
            `CREATE TABLE IF NOT EXISTS team_posts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                username VARCHAR(50) NOT NULL,
                project_title VARCHAR(200) NOT NULL,
                project_description TEXT,
                skills_needed TEXT[],
                tech_stack TEXT[],
                timeline VARCHAR(50),
                contact_info TEXT,
                status VARCHAR(20) DEFAULT 'open',
                created_at TIMESTAMP DEFAULT NOW()
            );`,

            // Votes table
            `CREATE TABLE IF NOT EXISTS votes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                project_id INTEGER REFERENCES ai_projects(id),
                vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, project_id)
            );`
        ];

        return queries;
    }

    // User Management
    async createUser(userData) {
        try {
            const response = await this.supabaseRequest('POST', '/users', userData);
            return response;
        } catch (error) {
            console.error('❌ Error creating user:', error);
            return null;
        }
    }

    async getUser(userId) {
        try {
            const response = await this.supabaseRequest('GET', `/users/${userId}`);
            return response;
        } catch (error) {
            console.error('❌ Error fetching user:', error);
            return null;
        }
    }

    // Chat Messages
    async getChatMessages(roomId, limit = 50) {
        try {
            const response = await this.supabaseRequest('GET', `/chat_messages?room_id=eq.${roomId}&order=created_at.desc&limit=${limit}`);
            return response?.reverse() || [];
        } catch (error) {
            console.error('❌ Error fetching chat messages:', error);
            return this.getFallbackChatData(roomId);
        }
    }

    async sendChatMessage(messageData) {
        try {
            const response = await this.supabaseRequest('POST', '/chat_messages', messageData);
            return response;
        } catch (error) {
            console.error('❌ Error sending message:', error);
            return null;
        }
    }

    // AI Projects
    async getProjects(category = null, limit = 20) {
        try {
            let url = `/ai_projects?order=votes.desc,created_at.desc&limit=${limit}`;
            if (category) {
                url += `&category=eq.${category}`;
            }
            const response = await this.supabaseRequest('GET', url);
            return response || [];
        } catch (error) {
            console.error('❌ Error fetching projects:', error);
            return this.getFallbackProjectData();
        }
    }

    async createProject(projectData) {
        try {
            const response = await this.supabaseRequest('POST', '/ai_projects', projectData);
            return response;
        } catch (error) {
            console.error('❌ Error creating project:', error);
            return null;
        }
    }

    async voteProject(projectId, userId, voteType) {
        try {
            // First, upsert the vote
            const voteData = { user_id: userId, project_id: projectId, vote_type: voteType };
            await this.supabaseRequest('POST', '/votes', voteData);
            
            // Then update the project vote count
            const project = await this.supabaseRequest('GET', `/ai_projects/${projectId}`);
            if (project) {
                const newVotes = voteType === 'up' ? project.votes + 1 : project.votes - 1;
                await this.supabaseRequest('PATCH', `/ai_projects/${projectId}`, { votes: newVotes });
            }
            return true;
        } catch (error) {
            console.error('❌ Error voting on project:', error);
            return false;
        }
    }

    // Nominations
    async submitNomination(nominationData) {
        try {
            const response = await this.supabaseRequest('POST', '/nominations', nominationData);
            return response;
        } catch (error) {
            console.error('❌ Error submitting nomination:', error);
            return null;
        }
    }

    async getNominations(status = null) {
        try {
            let url = '/nominations?order=created_at.desc';
            if (status) {
                url += `&status=eq.${status}`;
            }
            const response = await this.supabaseRequest('GET', url);
            return response || [];
        } catch (error) {
            console.error('❌ Error fetching nominations:', error);
            return [];
        }
    }

    // Team Posts
    async createTeamPost(postData) {
        try {
            const response = await this.supabaseRequest('POST', '/team_posts', postData);
            return response;
        } catch (error) {
            console.error('❌ Error creating team post:', error);
            return null;
        }
    }

    async getTeamPosts(limit = 20) {
        try {
            const response = await this.supabaseRequest('GET', `/team_posts?order=created_at.desc&limit=${limit}`);
            return response || [];
        } catch (error) {
            console.error('❌ Error fetching team posts:', error);
            return this.getFallbackTeamData();
        }
    }

    // Supabase API Helper
    async supabaseRequest(method, endpoint, data = null) {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }

        const url = `${this.SUPABASE_URL}/rest/v1${endpoint}`;
        const headers = {
            'apikey': this.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        };

        const config = { method, headers };
        if (data && (method === 'POST' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(url, config);
        if (!response.ok) {
            throw new Error(`Database request failed: ${response.status}`);
        }

        return method === 'GET' ? await response.json() : await response.text();
    }

    // Fallback data for when database is not connected
    getFallbackChatData(roomId) {
        const fallbackData = {
            'vibe-coders-lounge': [
                { username: 'TechWizard42', avatar: '🧙‍♂️', message: 'Just shipped my AI-powered meditation app!', created_at: '2m ago' },
                { username: 'AIEnthusiast', avatar: '🤖', message: 'Anyone working with Claude API? Amazing results!', created_at: '5m ago' }
            ],
            'startup-founders-hub': [
                { username: 'StartupGuru', avatar: '🚀', message: 'Raised our seed round! AMA about fundraising', created_at: '1m ago' },
                { username: 'VCInsider', avatar: '💼', message: 'Looking for AI startups in healthcare space', created_at: '3m ago' }
            ]
        };
        return fallbackData[roomId] || [];
    }

    getFallbackProjectData() {
        return [
            {
                id: 1,
                title: 'MindfulAI Meditation App',
                description: 'AI-powered personalized meditation experiences',
                category: 'health',
                votes: 247,
                tech_stack: ['React Native', 'TensorFlow', 'Firebase'],
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                title: 'CodeReview Assistant',
                description: 'Automated code review using GPT-4',
                category: 'developer-tools',
                votes: 189,
                tech_stack: ['Python', 'OpenAI API', 'GitHub Actions'],
                created_at: new Date().toISOString()
            }
        ];
    }

    getFallbackTeamData() {
        return [
            {
                id: 1,
                username: 'AIBuilder',
                project_title: 'Revolutionary Voice Assistant',
                project_description: 'Building next-gen voice AI for smart homes',
                skills_needed: ['React Native', 'Machine Learning', 'UI/UX'],
                timeline: '3-6 months',
                created_at: new Date().toISOString()
            }
        ];
    }
}

// Initialize global database instance
window.vibeDB = new VibeDatabase();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibeDatabase;
}