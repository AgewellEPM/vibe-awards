const fs = require('fs');
const path = require('path');

// Clean mobile menu HTML structure
const crispMobileMenuHTML = `
    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-content">
            <div class="mobile-menu-section">
                <div class="mobile-menu-title">Competition</div>
                <a href="competition.html" class="mobile-menu-link">Main Competition</a>
                <a href="battle-arena.html" class="mobile-menu-link">Battle Arena</a>
                <a href="app-battle-arena.html" class="mobile-menu-link">App Battles</a>
                <a href="challenge-mode.html" class="mobile-menu-link">Challenge Mode</a>
                <a href="tournament.html" class="mobile-menu-link">Tournament</a>
                <a href="leaderboard.html" class="mobile-menu-link">Leaderboard</a>
                <a href="winners.html" class="mobile-menu-link">Past Winners</a>
            </div>

            <div class="mobile-menu-section">
                <div class="mobile-menu-title">Build</div>
                <a href="vibe-forge.html" class="mobile-menu-link">Vibe Forge</a>
                <a href="vibe-toolkit.html" class="mobile-menu-link">Vibe Toolkit</a>
                <a href="getting-started.html" class="mobile-menu-link">Getting Started</a>
                <a href="brainstorm-workspace.html" class="mobile-menu-link">Brainstorm</a>
                <a href="backlog-synthesizer.html" class="mobile-menu-link">Backlog</a>
                <a href="deploy-presets.html" class="mobile-menu-link">Deploy Presets</a>
            </div>

            <div class="mobile-menu-section">
                <div class="mobile-menu-title">Community</div>
                <a href="team-up.html" class="mobile-menu-link">Team Up</a>
                <a href="vibe-hub.html" class="mobile-menu-link">Vibe Hub</a>
                <a href="showcase.html" class="mobile-menu-link">Showcase</a>
                <a href="gallery.html" class="mobile-menu-link">Gallery</a>
                <a href="directory.html" class="mobile-menu-link">Builders Directory</a>
                <a href="messages.html" class="mobile-menu-link">Messages</a>
            </div>

            <div class="mobile-menu-section">
                <div class="mobile-menu-title">Live</div>
                <a href="stream-dashboard.html" class="mobile-menu-link">Stream Dashboard</a>
                <a href="awards-ceremony.html" class="mobile-menu-link">Awards Ceremony</a>
                <a href="random-drop-lobby.html" class="mobile-menu-link">Random Drop</a>
                <a href="voting-history.html" class="mobile-menu-link">Voting History</a>
            </div>

            <div class="mobile-menu-section">
                <div class="mobile-menu-title">About</div>
                <a href="about.html" class="mobile-menu-link">About Us</a>
                <a href="vibe-manifesto.html" class="mobile-menu-link">Manifesto</a>
                <a href="why-vibe-awards.html" class="mobile-menu-link">Why Vibe</a>
                <a href="roadmap.html" class="mobile-menu-link">Roadmap</a>
                <a href="contact.html" class="mobile-menu-link">Contact</a>
            </div>

            <div class="mobile-menu-actions">
                <a href="submit-app.html" class="mobile-menu-cta">Submit App</a>
                <div class="mobile-menu-secondary">
                    <a href="notifications.html" class="mobile-menu-icon-btn" title="Notifications">🔔</a>
                    <a href="profile.html" class="mobile-menu-icon-btn" title="Profile">👤</a>
                    <a href="awards.html" class="mobile-menu-icon-btn" title="Awards">🏆</a>
                </div>
            </div>
        </div>
    </div>`;

// Get all HTML files
const dir = '/Users/lukekist/vibe-awards-project';
const files = fs.readdirSync(dir).filter(file => file.endsWith('.html'));

let updatedCount = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;
    
    // Replace enhanced-mobile-menu.css with crisp-mobile-menu.css
    if (content.includes('enhanced-mobile-menu.css')) {
        content = content.replace(/enhanced-mobile-menu\.css/g, 'crisp-mobile-menu.css');
        modified = true;
    }
    
    // Replace enhanced-mobile-menu.js with crisp-mobile-menu.js
    if (content.includes('enhanced-mobile-menu.js')) {
        content = content.replace(/enhanced-mobile-menu\.js/g, 'crisp-mobile-menu.js');
        modified = true;
    }
    
    // Find and replace mobile menu structure - handle duplicates and malformed HTML
    let mobileMenuStart = content.indexOf('<!-- Mobile Menu -->');
    if (mobileMenuStart !== -1) {
        // Find the end of the mobile menu section
        let searchStart = mobileMenuStart;
        let mobileMenuEnd = -1;
        
        // Look for the closing div of the mobile menu
        let openDivs = 0;
        let inMobileMenu = false;
        let pos = searchStart;
        
        while (pos < content.length) {
            if (content.substr(pos, 22) === '<div class="mobile-menu"') {
                inMobileMenu = true;
                openDivs = 1;
                pos += 22;
                continue;
            }
            
            if (inMobileMenu) {
                if (content.substr(pos, 4) === '<div') {
                    openDivs++;
                } else if (content.substr(pos, 6) === '</div>') {
                    openDivs--;
                    if (openDivs === 0) {
                        mobileMenuEnd = pos + 6;
                        break;
                    }
                }
            }
            pos++;
        }
        
        if (mobileMenuEnd !== -1) {
            // Replace the entire mobile menu section
            const beforeMenu = content.substring(0, mobileMenuStart);
            const afterMenu = content.substring(mobileMenuEnd);
            content = beforeMenu + crispMobileMenuHTML + afterMenu;
            modified = true;
        }
    }
    
    // Remove any old mobile menu JavaScript to prevent conflicts
    content = content.replace(/\/\/ Mobile menu functionality[\s\S]*?}\);/g, '');
    content = content.replace(/\/\/ Enhanced mobile menu[\s\S]*?}\);/g, '');
    
    // Remove duplicate mobile menu sections
    const mobileMenuRegex = /<!-- Mobile Menu -->[\s\S]*?<\/div>\s*<\/div>/g;
    const matches = content.match(mobileMenuRegex);
    if (matches && matches.length > 1) {
        // Keep only the first mobile menu
        content = content.replace(mobileMenuRegex, '');
        content = content.replace('</nav>', '</nav>' + crispMobileMenuHTML);
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        updatedCount++;
        console.log(`✓ Fixed mobile menu in ${file}`);
    } else {
        console.log(`- No issues found in ${file}`);
    }
});

console.log(`\n✨ Mobile menu fix complete!`);
console.log(`   Fixed: ${updatedCount} files`);
console.log(`   Total: ${files.length} HTML files`);