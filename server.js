const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'vibe-awards-secret-key-2024';

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Initialize SQLite database
const db = new sqlite3.Database('./vibe_awards.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Database initialization
function initializeDatabase() {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'developer',
      avatar_url TEXT,
      bio TEXT,
      website_url TEXT,
      twitter_handle TEXT,
      linkedin_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Apps table
    `CREATE TABLE IF NOT EXISTS apps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      short_description TEXT NOT NULL,
      full_description TEXT NOT NULL,
      developer_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      platform TEXT NOT NULL,
      icon_url TEXT,
      website_url TEXT,
      app_store_url TEXT,
      demo_video_url TEXT,
      status TEXT DEFAULT 'pending',
      featured BOOLEAN DEFAULT 0,
      trending BOOLEAN DEFAULT 0,
      staff_pick BOOLEAN DEFAULT 0,
      battle_ready BOOLEAN DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      nomination_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (developer_id) REFERENCES users (id)
    )`,

    // App screenshots table
    `CREATE TABLE IF NOT EXISTS app_screenshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      caption TEXT,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (app_id) REFERENCES apps (id) ON DELETE CASCADE
    )`,

    // App features table
    `CREATE TABLE IF NOT EXISTS app_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id INTEGER NOT NULL,
      feature_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (app_id) REFERENCES apps (id) ON DELETE CASCADE
    )`,

    // Battles table
    `CREATE TABLE IF NOT EXISTS battles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      app1_id INTEGER NOT NULL,
      app2_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      battle_date DATE NOT NULL,
      status TEXT DEFAULT 'upcoming',
      app1_votes INTEGER DEFAULT 0,
      app2_votes INTEGER DEFAULT 0,
      total_votes INTEGER DEFAULT 0,
      winner_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (app1_id) REFERENCES apps (id),
      FOREIGN KEY (app2_id) REFERENCES apps (id),
      FOREIGN KEY (winner_id) REFERENCES apps (id)
    )`,

    // Votes table
    `CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      battle_id INTEGER NOT NULL,
      app_id INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (battle_id) REFERENCES battles (id),
      FOREIGN KEY (app_id) REFERENCES apps (id),
      UNIQUE(user_id, battle_id),
      UNIQUE(ip_address, battle_id)
    )`,

    // App likes table
    `CREATE TABLE IF NOT EXISTS app_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      app_id INTEGER NOT NULL,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (app_id) REFERENCES apps (id),
      UNIQUE(user_id, app_id),
      UNIQUE(ip_address, app_id)
    )`,

    // Nominations table
    `CREATE TABLE IF NOT EXISTS nominations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      app_id INTEGER NOT NULL,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (app_id) REFERENCES apps (id),
      UNIQUE(user_id, app_id),
      UNIQUE(ip_address, app_id)
    )`,

    // Reviews table
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id INTEGER NOT NULL,
      user_id INTEGER,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title TEXT,
      content TEXT NOT NULL,
      helpful_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (app_id) REFERENCES apps (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(app_id, user_id)
    )`,

    // Comments table
    `CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id INTEGER NOT NULL,
      user_id INTEGER,
      parent_id INTEGER,
      content TEXT NOT NULL,
      upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (app_id) REFERENCES apps (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (parent_id) REFERENCES comments (id)
    )`,

    // Comment votes table
    `CREATE TABLE IF NOT EXISTS comment_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comment_id INTEGER NOT NULL,
      user_id INTEGER,
      vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (comment_id) REFERENCES comments (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(comment_id, user_id),
      UNIQUE(comment_id, ip_address)
    )`,

    // Collaboration posts table
    `CREATE TABLE IF NOT EXISTS collaboration_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      project_stage TEXT NOT NULL CHECK (project_stage IN ('idea', 'prototype', 'mvp', 'near_complete')),
      collaboration_type TEXT NOT NULL CHECK (collaboration_type IN ('co_founder', 'developer', 'designer', 'marketer', 'mentor', 'other')),
      skills_needed TEXT NOT NULL,
      project_category TEXT NOT NULL,
      tech_stack TEXT,
      repo_url TEXT,
      demo_url TEXT,
      contact_method TEXT,
      equity_offered BOOLEAN DEFAULT 0,
      paid_opportunity BOOLEAN DEFAULT 0,
      time_commitment TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
      view_count INTEGER DEFAULT 0,
      interest_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`,

    // Collaboration interests table  
    `CREATE TABLE IF NOT EXISTS collaboration_interests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      message TEXT,
      portfolio_url TEXT,
      contact_info TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES collaboration_posts (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(post_id, user_id)
    )`,

    // Collaboration matches table
    `CREATE TABLE IF NOT EXISTS collaboration_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      creator_id INTEGER NOT NULL,
      collaborator_id INTEGER NOT NULL,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (post_id) REFERENCES collaboration_posts (id),
      FOREIGN KEY (creator_id) REFERENCES users (id),
      FOREIGN KEY (collaborator_id) REFERENCES users (id)
    )`
  ];

  tables.forEach((table, index) => {
    db.run(table, (err) => {
      if (err) {
        console.error(`Error creating table ${index + 1}:`, err.message);
      }
    });
  });

  // Insert sample data
  insertSampleData();
}

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
}

// Get client IP helper
function getClientIP(req) {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// API Routes

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role = 'developer' } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userUuid = uuidv4();

    db.run(
      'INSERT INTO users (uuid, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [userUuid, username, email, hashedPassword, role],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign(
          { id: this.lastID, uuid: userUuid, username, email, role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: this.lastID, uuid: userUuid, username, email, role }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, uuid: user.uuid, username: user.username, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: { id: user.id, uuid: user.uuid, username: user.username, email: user.email, role: user.role }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Apps routes
app.get('/api/apps', authenticateToken, (req, res) => {
  const { category, status, featured, trending, limit = 50, offset = 0 } = req.query;
  
  let query = `
    SELECT 
      a.*,
      u.username as developer_name,
      u.avatar_url as developer_avatar,
      COUNT(DISTINCT r.id) as review_count,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT al.id) as like_count,
      COUNT(DISTINCT n.id) as nomination_count
    FROM apps a
    LEFT JOIN users u ON a.developer_id = u.id
    LEFT JOIN reviews r ON a.id = r.app_id
    LEFT JOIN app_likes al ON a.id = al.app_id
    LEFT JOIN nominations n ON a.id = n.app_id
    WHERE a.status = 'approved'
  `;
  
  const params = [];
  
  if (category && category !== 'all') {
    query += ' AND a.category = ?';
    params.push(category);
  }
  
  if (featured === 'true') {
    query += ' AND a.featured = 1';
  }
  
  if (trending === 'true') {
    query += ' AND a.trending = 1';
  }
  
  query += `
    GROUP BY a.id
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, apps) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Get screenshots for each app
    const appIds = apps.map(app => app.id);
    if (appIds.length === 0) {
      return res.json({ apps: [], total: 0 });
    }
    
    db.all(
      `SELECT * FROM app_screenshots WHERE app_id IN (${appIds.map(() => '?').join(',')}) ORDER BY order_index ASC`,
      appIds,
      (err, screenshots) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Group screenshots by app_id
        const screenshotsByApp = screenshots.reduce((acc, screenshot) => {
          if (!acc[screenshot.app_id]) acc[screenshot.app_id] = [];
          acc[screenshot.app_id].push(screenshot);
          return acc;
        }, {});
        
        // Add screenshots to apps
        apps.forEach(app => {
          app.screenshots = screenshotsByApp[app.id] || [];
        });
        
        res.json({ apps, total: apps.length });
      }
    );
  });
});

app.get('/api/apps/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT 
      a.*,
      u.username as developer_name,
      u.email as developer_email,
      u.avatar_url as developer_avatar,
      u.bio as developer_bio,
      u.website_url as developer_website,
      COUNT(DISTINCT r.id) as review_count,
      COALESCE(AVG(r.rating), 0) as avg_rating
    FROM apps a
    LEFT JOIN users u ON a.developer_id = u.id
    LEFT JOIN reviews r ON a.id = r.app_id
    WHERE a.uuid = ? OR a.id = ?
    GROUP BY a.id
  `, [id, id], (err, app) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }
    
    // Increment view count
    db.run('UPDATE apps SET view_count = view_count + 1 WHERE id = ?', [app.id]);
    
    // Get screenshots
    db.all(
      'SELECT * FROM app_screenshots WHERE app_id = ? ORDER BY order_index ASC',
      [app.id],
      (err, screenshots) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Get features
        db.all(
          'SELECT * FROM app_features WHERE app_id = ?',
          [app.id],
          (err, features) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            
            app.screenshots = screenshots;
            app.features = features.map(f => f.feature_name);
            
            res.json(app);
          }
        );
      }
    );
  });
});

app.post('/api/apps', authenticateToken, upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'screenshots', maxCount: 10 }
]), (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const {
      name,
      short_description,
      full_description,
      category,
      platform,
      website_url,
      app_store_url,
      demo_video_url,
      features
    } = req.body;
    
    if (!name || !short_description || !full_description || !category || !platform) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const appUuid = uuidv4();
    const iconUrl = req.files.icon ? `/uploads/${req.files.icon[0].filename}` : null;
    
    db.run(`
      INSERT INTO apps (
        uuid, name, short_description, full_description, developer_id,
        category, platform, icon_url, website_url, app_store_url, demo_video_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      appUuid, name, short_description, full_description, req.user.id,
      category, platform, iconUrl, website_url, app_store_url, demo_video_url
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const appId = this.lastID;
      
      // Insert screenshots
      if (req.files.screenshots) {
        const screenshotPromises = req.files.screenshots.map((file, index) => {
          return new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO app_screenshots (app_id, url, order_index) VALUES (?, ?, ?)',
              [appId, `/uploads/${file.filename}`, index],
              (err) => err ? reject(err) : resolve()
            );
          });
        });
        
        Promise.all(screenshotPromises).catch(console.error);
      }
      
      // Insert features
      if (features) {
        const featureList = Array.isArray(features) ? features : features.split(',');
        featureList.forEach(feature => {
          if (feature.trim()) {
            db.run(
              'INSERT INTO app_features (app_id, feature_name) VALUES (?, ?)',
              [appId, feature.trim()]
            );
          }
        });
      }
      
      res.status(201).json({
        message: 'App submitted successfully',
        app: { id: appId, uuid: appUuid, name, status: 'pending' }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Voting routes
app.post('/api/apps/:id/like', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const ipAddress = getClientIP(req);
  
  // First check if app exists
  db.get('SELECT id FROM apps WHERE uuid = ? OR id = ?', [id, id], (err, app) => {
    if (err || !app) {
      return res.status(404).json({ error: 'App not found' });
    }
    
    // Check if already liked
    db.get(
      'SELECT id FROM app_likes WHERE app_id = ? AND (user_id = ? OR ip_address = ?)',
      [app.id, userId, ipAddress],
      (err, existingLike) => {
        if (existingLike) {
          // Unlike
          db.run(
            'DELETE FROM app_likes WHERE app_id = ? AND (user_id = ? OR ip_address = ?)',
            [app.id, userId, ipAddress],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }
              
              // Update like count
              db.run('UPDATE apps SET like_count = like_count - 1 WHERE id = ?', [app.id]);
              
              res.json({ message: 'Like removed', liked: false });
            }
          );
        } else {
          // Like
          db.run(
            'INSERT INTO app_likes (app_id, user_id, ip_address) VALUES (?, ?, ?)',
            [app.id, userId, ipAddress],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }
              
              // Update like count
              db.run('UPDATE apps SET like_count = like_count + 1 WHERE id = ?', [app.id]);
              
              res.json({ message: 'App liked', liked: true });
            }
          );
        }
      }
    );
  });
});

app.post('/api/apps/:id/nominate', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const ipAddress = getClientIP(req);
  
  db.get('SELECT id FROM apps WHERE uuid = ? OR id = ?', [id, id], (err, app) => {
    if (err || !app) {
      return res.status(404).json({ error: 'App not found' });
    }
    
    // Check if already nominated
    db.get(
      'SELECT id FROM nominations WHERE app_id = ? AND (user_id = ? OR ip_address = ?)',
      [app.id, userId, ipAddress],
      (err, existingNomination) => {
        if (existingNomination) {
          return res.status(400).json({ error: 'Already nominated this app' });
        }
        
        db.run(
          'INSERT INTO nominations (app_id, user_id, ip_address) VALUES (?, ?, ?)',
          [app.id, userId, ipAddress],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            
            // Update nomination count
            db.run('UPDATE apps SET nomination_count = nomination_count + 1 WHERE id = ?', [app.id]);
            
            res.json({ message: 'App nominated for battle' });
          }
        );
      }
    );
  });
});

// Battles routes
app.get('/api/battles', (req, res) => {
  const { status = 'all', limit = 20 } = req.query;
  
  let query = `
    SELECT 
      b.*,
      a1.name as app1_name, a1.icon_url as app1_icon, a1.uuid as app1_uuid,
      a2.name as app2_name, a2.icon_url as app2_icon, a2.uuid as app2_uuid,
      u1.username as app1_developer,
      u2.username as app2_developer
    FROM battles b
    LEFT JOIN apps a1 ON b.app1_id = a1.id
    LEFT JOIN apps a2 ON b.app2_id = a2.id
    LEFT JOIN users u1 ON a1.developer_id = u1.id
    LEFT JOIN users u2 ON a2.developer_id = u2.id
  `;
  
  if (status !== 'all') {
    query += ' WHERE b.status = ?';
  }
  
  query += ' ORDER BY b.battle_date DESC LIMIT ?';
  
  const params = status !== 'all' ? [status, limit] : [limit];
  
  db.all(query, params, (err, battles) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(battles);
  });
});

app.get('/api/battles/current', (req, res) => {
  db.get(`
    SELECT 
      b.*,
      a1.name as app1_name, a1.icon_url as app1_icon, a1.uuid as app1_uuid,
      a2.name as app2_name, a2.icon_url as app2_icon, a2.uuid as app2_uuid,
      u1.username as app1_developer,
      u2.username as app2_developer
    FROM battles b
    LEFT JOIN apps a1 ON b.app1_id = a1.id
    LEFT JOIN apps a2 ON b.app2_id = a2.id
    LEFT JOIN users u1 ON a1.developer_id = u1.id
    LEFT JOIN users u2 ON a2.developer_id = u2.id
    WHERE b.status = 'active'
    ORDER BY b.battle_date DESC
    LIMIT 1
  `, (err, battle) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(battle || null);
  });
});

app.post('/api/battles/:id/vote', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { app_id } = req.body;
  const userId = req.user?.id;
  const ipAddress = getClientIP(req);
  
  if (!app_id) {
    return res.status(400).json({ error: 'app_id is required' });
  }
  
  // Check if already voted
  db.get(
    'SELECT id FROM votes WHERE battle_id = ? AND (user_id = ? OR ip_address = ?)',
    [id, userId, ipAddress],
    (err, existingVote) => {
      if (existingVote) {
        return res.status(400).json({ error: 'Already voted in this battle' });
      }
      
      // Cast vote
      db.run(
        'INSERT INTO votes (battle_id, app_id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [id, app_id, userId, ipAddress, req.get('User-Agent')],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          // Update battle vote counts
          db.get('SELECT app1_id, app2_id FROM battles WHERE id = ?', [id], (err, battle) => {
            if (!err && battle) {
              if (app_id == battle.app1_id) {
                db.run('UPDATE battles SET app1_votes = app1_votes + 1, total_votes = total_votes + 1 WHERE id = ?', [id]);
              } else if (app_id == battle.app2_id) {
                db.run('UPDATE battles SET app2_votes = app2_votes + 1, total_votes = total_votes + 1 WHERE id = ?', [id]);
              }
            }
          });
          
          res.json({ message: 'Vote cast successfully' });
        }
      );
    }
  );
});

// Collaboration routes
app.get('/api/collaboration/posts', (req, res) => {
  const { category, stage, type, limit = 20, offset = 0 } = req.query;
  
  let query = `
    SELECT 
      cp.*,
      u.username as creator_name,
      u.avatar_url as creator_avatar,
      COUNT(DISTINCT ci.id) as interest_count
    FROM collaboration_posts cp
    LEFT JOIN users u ON cp.user_id = u.id
    LEFT JOIN collaboration_interests ci ON cp.id = ci.post_id
    WHERE cp.status = 'open'
  `;
  
  const params = [];
  
  if (category && category !== 'all') {
    query += ' AND cp.project_category = ?';
    params.push(category);
  }
  
  if (stage && stage !== 'all') {
    query += ' AND cp.project_stage = ?';
    params.push(stage);
  }
  
  if (type && type !== 'all') {
    query += ' AND cp.collaboration_type = ?';
    params.push(type);
  }
  
  query += `
    GROUP BY cp.id
    ORDER BY cp.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, posts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ posts, total: posts.length });
  });
});

app.get('/api/collaboration/posts/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT 
      cp.*,
      u.username as creator_name,
      u.email as creator_email,
      u.avatar_url as creator_avatar,
      COUNT(DISTINCT ci.id) as interest_count
    FROM collaboration_posts cp
    LEFT JOIN users u ON cp.user_id = u.id
    LEFT JOIN collaboration_interests ci ON cp.id = ci.post_id
    WHERE cp.uuid = ? OR cp.id = ?
    GROUP BY cp.id
  `, [id, id], (err, post) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!post) {
      return res.status(404).json({ error: 'Collaboration post not found' });
    }
    
    // Increment view count
    db.run('UPDATE collaboration_posts SET view_count = view_count + 1 WHERE id = ?', [post.id]);
    
    res.json(post);
  });
});

app.post('/api/collaboration/posts', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const {
      title,
      description,
      project_stage,
      collaboration_type,
      skills_needed,
      project_category,
      tech_stack,
      repo_url,
      demo_url,
      contact_method,
      equity_offered,
      paid_opportunity,
      time_commitment,
      deadline
    } = req.body;
    
    if (!title || !description || !project_stage || !collaboration_type || !skills_needed || !project_category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const postUuid = uuidv4();
    
    db.run(`
      INSERT INTO collaboration_posts (
        uuid, user_id, title, description, project_stage, collaboration_type,
        skills_needed, project_category, tech_stack, repo_url, demo_url,
        contact_method, equity_offered, paid_opportunity, time_commitment, deadline
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      postUuid, req.user.id, title, description, project_stage, collaboration_type,
      skills_needed, project_category, tech_stack, repo_url, demo_url,
      contact_method, equity_offered ? 1 : 0, paid_opportunity ? 1 : 0, time_commitment, deadline
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.status(201).json({
        message: 'Collaboration post created successfully',
        post: { id: this.lastID, uuid: postUuid, title, status: 'open' }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/collaboration/posts/:id/interest', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const { id } = req.params;
  const { message, portfolio_url, contact_info } = req.body;
  
  // First check if post exists
  db.get('SELECT id FROM collaboration_posts WHERE uuid = ? OR id = ?', [id, id], (err, post) => {
    if (err || !post) {
      return res.status(404).json({ error: 'Collaboration post not found' });
    }
    
    // Check if already interested
    db.get(
      'SELECT id FROM collaboration_interests WHERE post_id = ? AND user_id = ?',
      [post.id, req.user.id],
      (err, existingInterest) => {
        if (existingInterest) {
          return res.status(400).json({ error: 'Already expressed interest in this post' });
        }
        
        db.run(
          'INSERT INTO collaboration_interests (post_id, user_id, message, portfolio_url, contact_info) VALUES (?, ?, ?, ?, ?)',
          [post.id, req.user.id, message, portfolio_url, contact_info],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            
            // Update interest count
            db.run('UPDATE collaboration_posts SET interest_count = interest_count + 1 WHERE id = ?', [post.id]);
            
            res.json({ message: 'Interest expressed successfully' });
          }
        );
      }
    );
  });
});

// Sample data insertion
function insertSampleData() {
  // Check if data already exists
  db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
    if (err || result.count > 0) return;
    
    console.log('Inserting sample data...');
    
    // Sample users
    const users = [
      {
        uuid: uuidv4(),
        username: 'lukekist',
        email: 'luke@tinkybink.com',
        password_hash: bcrypt.hashSync('password123', 10),
        role: 'developer'
      },
      {
        uuid: uuidv4(),
        username: 'edutech_labs',
        email: 'hello@edutechlabs.com',
        password_hash: bcrypt.hashSync('password123', 10),
        role: 'developer'
      },
      {
        uuid: uuidv4(),
        username: 'sonic_innovations',
        email: 'team@sonicinnovations.com',
        password_hash: bcrypt.hashSync('password123', 10),
        role: 'developer'
      }
    ];
    
    users.forEach(user => {
      db.run(
        'INSERT INTO users (uuid, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [user.uuid, user.username, user.email, user.password_hash, user.role]
      );
    });
    
    // Wait a bit then add apps
    setTimeout(() => {
      const apps = [
        {
          uuid: uuidv4(),
          name: 'TinkyBink AAC',
          short_description: 'Revolutionary AI-powered Augmentative and Alternative Communication platform',
          full_description: 'Revolutionary AI-powered Augmentative and Alternative Communication platform that transforms speech therapy through predictive analytics and real-time family engagement. Features automated IEP goal generation, breakthrough prediction algorithms, and seamless insurance billing integration.',
          developer_id: 1,
          category: 'Healthcare',
          platform: 'Cross-Platform',
          status: 'approved',
          featured: 1,
          trending: 1,
          battle_ready: 1,
          view_count: 2456,
          like_count: 847,
          nomination_count: 156
        },
        {
          uuid: uuidv4(),
          name: 'StudyBuddy AI',
          short_description: 'AI-powered study companion that adapts to your learning style',
          full_description: 'AI-powered study companion that adapts to your learning style and helps you master any subject faster. Features personalized study plans, intelligent flashcards, and progress tracking.',
          developer_id: 2,
          category: 'Education',
          platform: 'Cross-Platform',
          status: 'approved',
          trending: 1,
          battle_ready: 1,
          view_count: 1834,
          like_count: 623,
          nomination_count: 89
        },
        {
          uuid: uuidv4(),
          name: 'BeatMaker Studio',
          short_description: 'Professional music production studio in your pocket',
          full_description: 'Professional music production studio in your pocket with AI-assisted composition and mixing. Create beats, melodies, and full tracks with intuitive tools and powerful effects.',
          developer_id: 3,
          category: 'Entertainment',
          platform: 'iOS',
          status: 'approved',
          staff_pick: 1,
          battle_ready: 1,
          view_count: 1567,
          like_count: 445,
          nomination_count: 67
        }
      ];
      
      apps.forEach(app => {
        db.run(`
          INSERT INTO apps (
            uuid, name, short_description, full_description, developer_id,
            category, platform, status, featured, trending, staff_pick, battle_ready,
            view_count, like_count, nomination_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          app.uuid, app.name, app.short_description, app.full_description,
          app.developer_id, app.category, app.platform, app.status,
          app.featured, app.trending, app.staff_pick, app.battle_ready,
          app.view_count, app.like_count, app.nomination_count
        ]);
      });
      
      // Add sample battles
      setTimeout(() => {
        const battleUuid = uuidv4();
        db.run(`
          INSERT INTO battles (
            uuid, app1_id, app2_id, category, battle_date, status,
            app1_votes, app2_votes, total_votes, winner_id
          ) VALUES (?, 1, 2, 'Featured', DATE('now'), 'active', 3456, 2789, 6245, 1)
        `, [battleUuid]);
        
        // Add sample collaboration posts
        setTimeout(() => {
          const collaborationPosts = [
            {
              uuid: uuidv4(),
              user_id: 1,
              title: 'AI Health Monitoring App - Need iOS Developer',
              description: 'I\'ve built a prototype that uses machine learning to predict health issues from wearable data. The backend is solid with Python/TensorFlow, but I need help building a beautiful iOS app. This could be revolutionary for preventive healthcare.',
              project_stage: 'prototype',
              collaboration_type: 'developer',
              skills_needed: 'Swift, iOS Development, HealthKit, Core ML',
              project_category: 'Healthcare',
              tech_stack: 'Python, TensorFlow, FastAPI, PostgreSQL',
              repo_url: 'https://github.com/lukekist/health-monitor',
              equity_offered: 1,
              time_commitment: '10-20 hours/week',
              contact_method: 'luke@tinkybink.com'
            },
            {
              uuid: uuidv4(),
              user_id: 2,
              title: 'EdTech Startup - Seeking Co-Founder',
              description: 'Revolutionary platform that personalizes learning using AI. We have an MVP with 500+ beta users and strong traction. Looking for a business-minded co-founder to handle marketing, partnerships, and funding.',
              project_stage: 'mvp',
              collaboration_type: 'co_founder',
              skills_needed: 'Business Development, Marketing, Fundraising',
              project_category: 'Education',
              tech_stack: 'React, Node.js, MongoDB, AWS',
              demo_url: 'https://studybuddy-beta.com',
              equity_offered: 1,
              paid_opportunity: 0,
              time_commitment: 'Full-time',
              contact_method: 'hello@edutechlabs.com'
            },
            {
              uuid: uuidv4(),
              user_id: 3,
              title: 'Music Production App - Need UI/UX Designer',
              description: 'Building the next-generation music production tool for mobile. The audio engine is complete, but we need a designer who understands music workflow to create an intuitive interface that rivals desktop DAWs.',
              project_stage: 'near_complete',
              collaboration_type: 'designer',
              skills_needed: 'UI/UX Design, Music Production Knowledge, Figma',
              project_category: 'Entertainment',
              tech_stack: 'React Native, C++ Audio Engine, Firebase',
              paid_opportunity: 1,
              time_commitment: '5-10 hours/week',
              deadline: '2024-12-31',
              contact_method: 'team@sonicinnovations.com'
            }
          ];
          
          collaborationPosts.forEach(post => {
            db.run(`
              INSERT INTO collaboration_posts (
                uuid, user_id, title, description, project_stage, collaboration_type,
                skills_needed, project_category, tech_stack, repo_url, demo_url,
                contact_method, equity_offered, paid_opportunity, time_commitment, deadline
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              post.uuid, post.user_id, post.title, post.description, post.project_stage,
              post.collaboration_type, post.skills_needed, post.project_category,
              post.tech_stack, post.repo_url, post.demo_url, post.contact_method,
              post.equity_offered, post.paid_opportunity, post.time_commitment, post.deadline
            ]);
          });
        }, 1000);
      }, 500);
      
    }, 500);
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: 'Server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend available at: http://localhost:${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});