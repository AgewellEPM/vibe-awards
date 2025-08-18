const fs = require('fs');
const path = require('path');

// All pages to enhance
const pages = [
    'index.html',
    'index-magic.html',
    'dashboard.html',
    'profile.html',
    'messages.html',
    'submit-app.html',
    'leaderboard.html',
    'showcase.html',
    'apple-magic-battle.html',
    'directory.html',
    'team-up.html',
    'vibe-toolkit.html',
    'vibe-hub.html',
    'signup.html'
];

console.log('🚀 Implementing 10000% Ultra-Responsive System\n');
console.log('=' .repeat(60));

// Step 1: Add ultra-responsive CSS to all pages
pages.forEach(page => {
    const filePath = path.join(__dirname, page);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${page} - File not found`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add ultra-responsive CSS if not already present
    if (!content.includes('ultra-responsive.css')) {
        const insertion = `\n    <link rel="stylesheet" href="css/ultra-responsive.css">`;
        content = content.replace(/(<link rel="stylesheet" href="css\/mobile-responsive\.css">)/, `$1${insertion}`);
        
        console.log(`  + Added ultra-responsive.css to ${page}`);
    }
    
    // Enhance existing grid classes
    content = content.replace(/class="([^"]*\b(?:grid|features-grid|stats-grid|content-grid)\b[^"]*)"/g, (match, classes) => {
        if (!classes.includes('ultra-grid')) {
            return `class="${classes} ultra-grid-responsive"`;
        }
        return match;
    });
    
    // Enhance container classes
    content = content.replace(/class="([^"]*\bcontainer\b[^"]*)"/g, (match, classes) => {
        if (!classes.includes('container-fluid')) {
            return `class="${classes} container-fluid"`;
        }
        return match;
    });
    
    // Enhance typography classes
    content = content.replace(/<h1([^>]*class="[^"]*hero-title[^"]*"[^>]*)>/g, '<h1$1 style="font-size: var(--fs-4xl);">');
    content = content.replace(/<h2([^>]*class="[^"]*section-title[^"]*"[^>]*)>/g, '<h2$1 style="font-size: var(--fs-3xl);">');
    content = content.replace(/<h3([^>]*class="[^"]*feature-title[^"]*"[^>]*)>/g, '<h3$1 style="font-size: var(--fs-2xl);">');
    
    // Enhance button classes
    content = content.replace(/class="([^"]*\bbtn\b[^"]*)"/g, (match, classes) => {
        if (!classes.includes('btn-fluid')) {
            return `class="${classes} btn-fluid"`;
        }
        return match;
    });
    
    // Enhance card classes
    content = content.replace(/class="([^"]*\b(?:card|feature-card|section-card|app-card)\b[^"]*)"/g, (match, classes) => {
        if (!classes.includes('card-fluid')) {
            return `class="${classes} card-fluid"`;
        }
        return match;
    });
    
    // Add responsive meta tag if missing
    if (!content.includes('width=device-width')) {
        content = content.replace(
            /<meta name="viewport"[^>]*>/,
            '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
        );
        console.log(`  + Enhanced viewport meta tag in ${page}`);
    }
    
    // Save the enhanced file
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${page} - Enhanced with ultra-responsive system`);
});

console.log('\n' + '=' .repeat(60));
console.log('✅ Ultra-responsive system implemented on all pages!');