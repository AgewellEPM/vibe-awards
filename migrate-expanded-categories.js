#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();

// Open database
const db = new sqlite3.Database('./vibe_awards.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
  migrateDatabase();
});

function migrateDatabase() {
  console.log('Starting migration for expanded categories...');
  
  db.serialize(() => {
    // Step 1: Rename existing apps table to projects
    console.log('Step 1: Creating new projects table...');
    
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      short_description TEXT NOT NULL,
      full_description TEXT NOT NULL,
      developer_id INTEGER NOT NULL,
      project_type TEXT NOT NULL,  -- 'app', 'game', 'visual', 'music', 'video', 'cultural'
      category TEXT NOT NULL,      -- Subcategory within project type
      platform TEXT NOT NULL,
      icon_url TEXT,
      website_url TEXT,
      store_url TEXT,              -- Renamed from app_store_url to be more generic
      demo_url TEXT,                -- Renamed from demo_video_url
      github_url TEXT,              -- New field for open source projects
      status TEXT DEFAULT 'pending',
      featured BOOLEAN DEFAULT 0,
      trending BOOLEAN DEFAULT 0,
      staff_pick BOOLEAN DEFAULT 0,
      battle_ready BOOLEAN DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      nomination_count INTEGER DEFAULT 0,
      award_eligible BOOLEAN DEFAULT 1,  -- New field
      special_award TEXT,                 -- New field for special recognitions
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (developer_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating projects table:', err);
      } else {
        console.log('✓ Projects table created');
      }
    });
    
    // Step 2: Copy data from apps to projects
    console.log('Step 2: Migrating existing apps data...');
    
    db.run(`INSERT INTO projects (
      uuid, name, short_description, full_description, developer_id,
      project_type, category, platform, icon_url, website_url, 
      store_url, demo_url, status, featured, trending, staff_pick,
      battle_ready, view_count, like_count, nomination_count,
      created_at, updated_at
    )
    SELECT 
      uuid, name, short_description, full_description, developer_id,
      'app' as project_type, category, platform, icon_url, website_url,
      app_store_url, demo_video_url, status, featured, trending, staff_pick,
      battle_ready, view_count, like_count, nomination_count,
      created_at, updated_at
    FROM apps WHERE NOT EXISTS (
      SELECT 1 FROM projects WHERE projects.uuid = apps.uuid
    )`, (err) => {
      if (err) {
        console.error('Error migrating apps data:', err);
      } else {
        console.log('✓ Apps data migrated to projects');
      }
    });
    
    // Step 3: Create project_media table for multiple media types
    console.log('Step 3: Creating project_media table...');
    
    db.run(`CREATE TABLE IF NOT EXISTS project_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      media_type TEXT NOT NULL,  -- 'screenshot', 'video', 'audio', 'demo', 'trailer'
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      caption TEXT,
      duration INTEGER,          -- For videos/audio in seconds
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    )`, (err) => {
      if (err) {
        console.error('Error creating project_media table:', err);
      } else {
        console.log('✓ Project media table created');
      }
    });
    
    // Step 4: Migrate screenshots to project_media
    console.log('Step 4: Migrating screenshots...');
    
    db.run(`INSERT INTO project_media (
      project_id, media_type, url, caption, order_index, created_at
    )
    SELECT 
      p.id, 'screenshot', s.url, s.caption, s.order_index, s.created_at
    FROM app_screenshots s
    JOIN apps a ON s.app_id = a.id
    JOIN projects p ON a.uuid = p.uuid
    WHERE NOT EXISTS (
      SELECT 1 FROM project_media 
      WHERE project_media.project_id = p.id 
      AND project_media.url = s.url
    )`, (err) => {
      if (err) {
        console.error('Error migrating screenshots:', err);
      } else {
        console.log('✓ Screenshots migrated');
      }
    });
    
    // Step 5: Create project_features table
    console.log('Step 5: Creating project_features table...');
    
    db.run(`CREATE TABLE IF NOT EXISTS project_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      feature_name TEXT NOT NULL,
      feature_type TEXT,  -- 'technical', 'creative', 'accessibility', etc.
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    )`, (err) => {
      if (err) {
        console.error('Error creating project_features table:', err);
      } else {
        console.log('✓ Project features table created');
      }
    });
    
    // Step 6: Migrate features
    console.log('Step 6: Migrating features...');
    
    db.run(`INSERT INTO project_features (
      project_id, feature_name, created_at
    )
    SELECT 
      p.id, f.feature_name, f.created_at
    FROM app_features f
    JOIN apps a ON f.app_id = a.id
    JOIN projects p ON a.uuid = p.uuid
    WHERE NOT EXISTS (
      SELECT 1 FROM project_features 
      WHERE project_features.project_id = p.id 
      AND project_features.feature_name = f.feature_name
    )`, (err) => {
      if (err) {
        console.error('Error migrating features:', err);
      } else {
        console.log('✓ Features migrated');
      }
    });
    
    // Step 7: Create project_tags table for better categorization
    console.log('Step 7: Creating project_tags table...');
    
    db.run(`CREATE TABLE IF NOT EXISTS project_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      tag TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
      UNIQUE(project_id, tag)
    )`, (err) => {
      if (err) {
        console.error('Error creating project_tags table:', err);
      } else {
        console.log('✓ Project tags table created');
      }
    });
    
    // Step 8: Update battles table to reference projects
    console.log('Step 8: Creating updated battles table...');
    
    db.run(`CREATE TABLE IF NOT EXISTS battles_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      project1_id INTEGER NOT NULL,
      project2_id INTEGER NOT NULL,
      project_type TEXT NOT NULL,  -- Type of projects being battled
      category TEXT NOT NULL,
      battle_date DATE NOT NULL,
      status TEXT DEFAULT 'upcoming',
      project1_votes INTEGER DEFAULT 0,
      project2_votes INTEGER DEFAULT 0,
      total_votes INTEGER DEFAULT 0,
      winner_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project1_id) REFERENCES projects (id),
      FOREIGN KEY (project2_id) REFERENCES projects (id),
      FOREIGN KEY (winner_id) REFERENCES projects (id)
    )`, (err) => {
      if (err) {
        console.error('Error creating battles_new table:', err);
      } else {
        console.log('✓ New battles table created');
      }
    });
    
    // Step 9: Update likes and nominations tables
    console.log('Step 9: Creating project engagement tables...');
    
    db.run(`CREATE TABLE IF NOT EXISTS project_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      project_id INTEGER NOT NULL,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (project_id) REFERENCES projects (id),
      UNIQUE(user_id, project_id),
      UNIQUE(ip_address, project_id)
    )`, (err) => {
      if (err) {
        console.error('Error creating project_likes table:', err);
      } else {
        console.log('✓ Project likes table created');
      }
    });
    
    db.run(`CREATE TABLE IF NOT EXISTS project_nominations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      project_id INTEGER NOT NULL,
      award_category TEXT,  -- Which award they're nominating for
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (project_id) REFERENCES projects (id),
      UNIQUE(user_id, project_id),
      UNIQUE(ip_address, project_id)
    )`, (err) => {
      if (err) {
        console.error('Error creating project_nominations table:', err);
      } else {
        console.log('✓ Project nominations table created');
      }
    });
    
    // Step 10: Add sample projects for new categories
    console.log('Step 10: Adding sample projects for new categories...');
    
    const sampleProjects = [
      {
        type: 'game',
        name: 'Pixel Quest Adventure',
        category: 'Indie Games',
        description: 'A procedurally generated roguelike with AI-driven narrative'
      },
      {
        type: 'visual',
        name: 'Generative Landscapes',
        category: 'Generative Art',
        description: 'AI-powered landscape generator creating unique worlds'
      },
      {
        type: 'music',
        name: 'BeatFlow AI',
        category: 'Music Generation',
        description: 'Real-time AI music composition based on your mood'
      },
      {
        type: 'video',
        name: 'Story Weaver',
        category: 'AI Films',
        description: 'AI-assisted short film creation platform'
      },
      {
        type: 'cultural',
        name: 'AccessiLearn',
        category: 'Accessibility',
        description: 'Making education accessible for all learning abilities'
      }
    ];
    
    sampleProjects.forEach(project => {
      const uuid = require('uuid').v4();
      db.run(`INSERT INTO projects (
        uuid, name, short_description, full_description,
        developer_id, project_type, category, platform,
        status, featured, trending, battle_ready
      ) VALUES (?, ?, ?, ?, 1, ?, ?, 'Web', 'approved', 1, 1, 1)`,
        [uuid, project.name, project.description, 
         project.description + '\n\nThis is a showcase project demonstrating the expanded categories of The Vibe Awards.',
         project.type, project.category],
        (err) => {
          if (err) {
            console.error(`Error inserting ${project.name}:`, err);
          } else {
            console.log(`✓ Added sample project: ${project.name}`);
          }
        }
      );
    });
    
    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Update server.js API endpoints to use projects table');
    console.log('2. Update submit-app.html to include project type selection');
    console.log('3. Update showcase.html to filter by project type');
    console.log('4. Test all functionality with new schema');
    
    // Close database after a delay to ensure all operations complete
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('\nDatabase connection closed.');
        }
      });
    }, 2000);
  });
}