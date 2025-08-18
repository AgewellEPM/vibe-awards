#!/usr/bin/env node

/**
 * Vibe Forge API Server
 * Connects the frontend with backend project generation
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const archiver = require('archiver');
const { promisify } = require('util');
const { exec: execCallback } = require('child_process');
const exec = promisify(execCallback);
const VibeForge = require('./vibe-forge-backend');

const app = express();
const PORT = process.env.PORT || 3457;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize Vibe Forge
const forge = new VibeForge();

// Generate project endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { projectType, constraints, projectName } = req.body;
        
        console.log(`📦 Generating ${projectType} project with constraints:`, constraints);
        
        // Generate the project
        const projectPath = await forge.generateProject(
            projectType || 'Web',
            constraints || [],
            projectName || `vibe-${projectType.toLowerCase()}-${Date.now()}`
        );
        
        // Create a zip file of the generated project
        const zipPath = `${projectPath}.zip`;
        await createZipArchive(projectPath, zipPath);
        
        // Read the zip file
        const zipBuffer = await fs.readFile(zipPath);
        const base64 = zipBuffer.toString('base64');
        
        // Clean up
        await fs.rm(projectPath, { recursive: true, force: true });
        await fs.unlink(zipPath);
        
        res.json({
            success: true,
            projectName: path.basename(projectPath),
            download: {
                filename: `${path.basename(projectPath)}.zip`,
                data: base64
            },
            message: 'Project generated successfully!'
        });
        
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get project structure preview
app.post('/api/preview', async (req, res) => {
    try {
        const { projectType, constraints } = req.body;
        
        // Generate structure preview
        const structure = generateStructurePreview(projectType, constraints);
        const prompts = generatePromptsPreview(projectType, constraints);
        const files = generateFilesPreview(projectType, constraints);
        
        res.json({
            success: true,
            structure,
            prompts,
            files
        });
        
    } catch (error) {
        console.error('Preview error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Vibe Forge API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Create zip archive
async function createZipArchive(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
        const output = require('fs').createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', resolve);
        archive.on('error', reject);
        
        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

// Generate structure preview
function generateStructurePreview(type, constraints) {
    let structure = `📁 vibe-forge-${type.toLowerCase()}/
├── 📄 README.md
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 package.json`;

    if (type === 'Web' || type === 'Mobile') {
        structure += `
├── 📁 src/
│   ├── 📁 components/
│   ├── 📁 services/
│   ├── 📁 hooks/
│   ├── 📁 utils/
│   └── 📄 App.${type === 'Mobile' ? 'tsx' : 'jsx'}`;
    }

    if (type === 'Agent') {
        structure += `
├── 📁 agents/
│   ├── 📁 tools/
│   ├── 📁 chains/
│   ├── 📁 memory/
│   └── 📁 prompts/
├── 📄 agent.py
└── 📄 requirements.txt`;
    }

    if (type === 'API') {
        structure += `
├── 📁 routes/
├── 📁 controllers/
├── 📁 models/
├── 📁 middleware/
└── 📄 server.js`;
    }

    structure += `
├── 📁 ai/
│   ├── 📁 prompts/
│   ├── 📁 chains/
│   └── 📄 config.json`;

    if (constraints.includes('HIPAA')) {
        structure += `
├── 📁 security/
│   ├── 📄 encryption.js
│   ├── 📄 audit-log.js
│   └── 📄 hipaa-compliance.md`;
    }

    if (constraints.includes('Real-time')) {
        structure += `
├── 📁 websocket/
│   ├── 📄 socket-server.js
│   └── 📄 event-handlers.js`;
    }

    structure += `
└── 📁 docs/
    └── 📄 API.md`;

    return structure;
}

// Generate prompts preview
function generatePromptsPreview(type, constraints) {
    let prompts = `// AI Prompt Configuration for ${type} Project\n\n`;
    
    prompts += `export const SYSTEM_PROMPT = \`
You are an expert ${type.toLowerCase()} developer assistant.
Your responses should be:
- Production-ready and scalable
- Following best practices
- Well-documented
${constraints.includes('HIPAA') ? '- HIPAA compliant\n' : ''}${constraints.includes('Multilingual') ? '- Internationalization ready\n' : ''}\`;\n\n`;

    prompts += `export const GENERATION_PROMPT = \`
Generate a ${type} solution with:
- Clean architecture
- Comprehensive error handling
- Performance optimization
- Security best practices
\`;\n\n`;

    if (constraints.includes('Real-time')) {
        prompts += `export const REALTIME_PROMPT = \`
Implement WebSocket communication with:
- Automatic reconnection
- Message queuing
- State synchronization
- Optimistic updates
\`;\n\n`;
    }

    if (constraints.includes('Offline')) {
        prompts += `export const OFFLINE_PROMPT = \`
Enable offline functionality with:
- Service Worker caching
- IndexedDB storage
- Background sync
- Conflict resolution
\`;\n\n`;
    }

    return prompts;
}

// Generate files preview
function generateFilesPreview(type, constraints) {
    let files = '';

    // Package.json
    files += `// package.json
{
  "name": "vibe-forge-${type.toLowerCase()}",
  "version": "1.0.0",
  "description": "AI-powered ${type} application",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node server.js",
    "test": "jest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "openai": "^4.28.0"`;

    if (type === 'Web') {
        files += `,
    "react": "^18.2.0",
    "react-dom": "^18.2.0"`;
    }

    if (constraints.includes('Real-time')) {
        files += `,
    "socket.io": "^4.6.0",
    "socket.io-client": "^4.6.0"`;
    }

    files += `
  }
}\n\n`;

    // Main app file
    if (type === 'Web') {
        files += `// src/App.jsx
import React, { useState } from 'react';
import { AIService } from './services/ai';

function App() {
  const [response, setResponse] = useState('');
  
  const handleGenerate = async () => {
    const result = await AIService.generate({
      prompt: 'Create innovative solution',
      model: 'claude-3-opus'
    });
    setResponse(result);
  };

  return (
    <div className="app">
      <h1>🔥 Vibe Forge ${type}</h1>
      <button onClick={handleGenerate}>
        Generate with AI
      </button>
      {response && <div>{response}</div>}
    </div>
  );
}\n\n`;
    }

    // AI Service
    files += `// services/ai.js
import { Anthropic } from '@anthropic-ai/sdk';

export class AIService {
  static async generate({ prompt, model }) {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response.content[0].text;
  }
}`;

    return files;
}

// Start server
app.listen(PORT, () => {
    console.log(`
🔥 Vibe Forge API Server Running
📍 URL: http://localhost:${PORT}
📡 API: http://localhost:${PORT}/api/generate
🎨 UI: http://localhost:${PORT}/vibe-forge.html

Available endpoints:
  POST /api/generate - Generate a complete project
  POST /api/preview  - Preview project structure
  GET  /api/health   - Health check
    `);
});