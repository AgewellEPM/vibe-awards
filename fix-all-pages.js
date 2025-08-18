#!/usr/bin/env node

/**
 * Script to add Apple Magic system to all Vibe Awards pages
 * This will ensure consistent styling and responsiveness across the platform
 */

const fs = require('fs');
const path = require('path');

// Pages that need Apple Magic system added
const pagesToFix = [
    'directory.html',
    'team-up.html', 
    'vibe-toolkit.html',
    'vibe-hub.html',
    'leaderboard.html',
    'showcase.html',
    'apple-magic-battle.html',
    'submit-app.html',
    'signup.html'
];

// Required CSS files (in order)
const requiredCSS = [
    'css/apple-magic.css',
    'css/brand-system.css', 
    'css/typography.css',
    'css/mobile-responsive.css'
];

// Required JS files for performance
const requiredJS = [
    'js/performance.js',
    'js/accessibility.js'
];

// Apple Magic initialization scripts (at end of body)
const magicScripts = [
    'js/animations.js',
    'js/apple-magic-init.js'
];

function fixPage(filename) {
    const filePath = path.join(__dirname, filename);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filename}`);
        return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Add CSS files to head if missing
    requiredCSS.forEach(cssFile => {
        if (!content.includes(cssFile)) {
            // Find title tag and add CSS after it
            const titleMatch = content.match(/(<title>.*?<\/title>)/);
            if (titleMatch) {
                const newCSS = `    <link rel="stylesheet" href="${cssFile}">`;
                content = content.replace(titleMatch[0], titleMatch[0] + '\n' + newCSS);
                modified = true;
                console.log(`  ✅ Added ${cssFile}`);
            }
        }
    });
    
    // Add performance JS files to head if missing
    requiredJS.forEach(jsFile => {
        if (!content.includes(jsFile)) {
            // Find last CSS link or title and add JS after it
            const lastCSSMatch = content.match(/(.*<link rel="stylesheet".*?\n)/s);
            if (lastCSSMatch) {
                const newJS = `    <script src="${jsFile}"></script>`;
                const insertPoint = lastCSSMatch[0].lastIndexOf('\n');
                content = lastCSSMatch[0].slice(0, insertPoint) + '\n' + newJS + lastCSSMatch[0].slice(insertPoint) + content.slice(lastCSSMatch[0].length);
                modified = true;
                console.log(`  ✅ Added ${jsFile}`);
            }
        }
    });
    
    // Add Apple Magic scripts before closing body tag if missing
    magicScripts.forEach(scriptFile => {
        if (!content.includes(scriptFile)) {
            content = content.replace('</body>', `    <script src="${scriptFile}"></script>\n</body>`);
            modified = true;
            console.log(`  ✅ Added ${scriptFile}`);
        }
    });
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✨ Updated ${filename}`);
        return true;
    } else {
        console.log(`ℹ️  ${filename} already has required files`);
        return false;
    }
}

console.log('🚀 Starting Apple Magic system installation...\n');

let totalFixed = 0;
pagesToFix.forEach(page => {
    console.log(`🔧 Processing ${page}:`);
    if (fixPage(page)) {
        totalFixed++;
    }
    console.log('');
});

console.log(`✅ Installation complete! Fixed ${totalFixed} pages.`);
console.log('🎨 All pages now have Apple Magic styling and responsive design!');