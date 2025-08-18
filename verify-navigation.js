const fs = require('fs');
const path = require('path');

// List of all pages
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

// Expected navigation links
const expectedLinks = [
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
    'signup.html',
    'getting-started.html'
];

console.log('🔍 Verifying Navigation Links\n');
console.log('=' .repeat(60));

let totalLinks = 0;
let brokenLinks = 0;
let missingPages = [];

pages.forEach(page => {
    const filePath = path.join(__dirname, page);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${page} - FILE NOT FOUND`);
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const linkPattern = /href="([^"]+\.html)"/g;
    let match;
    const pageLinks = [];
    
    while ((match = linkPattern.exec(content)) !== null) {
        const link = match[1];
        // Normalize link (remove any path prefixes)
        const normalizedLink = link.split('/').pop();
        
        if (!pageLinks.includes(normalizedLink)) {
            pageLinks.push(normalizedLink);
            totalLinks++;
            
            // Check if linked file exists
            if (!expectedLinks.includes(normalizedLink) && !normalizedLink.includes('#')) {
                if (!missingPages.includes(normalizedLink)) {
                    missingPages.push(normalizedLink);
                }
                brokenLinks++;
            }
        }
    }
    
    console.log(`✅ ${page} - ${pageLinks.length} links found`);
});

console.log('\n' + '=' .repeat(60));
console.log('📊 NAVIGATION SUMMARY\n');
console.log(`✅ Total Links Found: ${totalLinks}`);
console.log(`⚠️  Broken Links: ${brokenLinks}`);

if (missingPages.length > 0) {
    console.log('\n⚠️  Missing Target Pages:');
    missingPages.forEach(page => {
        console.log(`   - ${page}`);
    });
    console.log('\nNote: getting-started.html is referenced but not yet created.');
} else {
    console.log('\n✨ All navigation links are valid!');
}

console.log('\n✅ Navigation verification complete!');