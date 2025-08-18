const fs = require('fs');
const path = require('path');

// Enhanced mobile menu HTML
const enhancedMobileMenuHTML = `
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

// Enhanced mobile menu JavaScript
const enhancedMobileMenuJS = `
    <script src="enhanced-mobile-menu.js"></script>`;

// Enhanced mobile menu CSS link
const enhancedMobileMenuCSS = `    <link rel="stylesheet" href="enhanced-mobile-menu.css">`;

// Get all HTML files
const dir = '/Users/lukekist/vibe-awards-project';
const files = fs.readdirSync(dir).filter(file => file.endsWith('.html'));

let updatedCount = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;
    
    // Add CSS link after viewport meta tag if not present
    if (!content.includes('enhanced-mobile-menu.css')) {
        const viewportMatch = content.match(/<meta name="viewport"[^>]*>/);
        if (viewportMatch) {
            const insertIndex = content.indexOf(viewportMatch[0]) + viewportMatch[0].length;
            content = content.slice(0, insertIndex) + '\n' + enhancedMobileMenuCSS + content.slice(insertIndex);
            modified = true;
        }
    }
    
    // Find and replace existing mobile menu structure
    const existingMobileMenuMatch = content.match(/<div class="mobile-menu"[^>]*id="mobileMenu"[^>]*>[\s\S]*?<\/div>\s*(?=\n\s*(?:<section|<div|<main|<!--))/);
    if (existingMobileMenuMatch) {
        content = content.replace(existingMobileMenuMatch[0], enhancedMobileMenuHTML.trim());
        modified = true;
    } else {
        // If no existing mobile menu, add it after nav
        const navEnd = content.indexOf('</nav>');
        if (navEnd !== -1) {
            const insertIndex = navEnd + 6; // After </nav>
            content = content.slice(0, insertIndex) + '\n' + enhancedMobileMenuHTML + content.slice(insertIndex);
            modified = true;
        }
    }
    
    // Add enhanced mobile menu JavaScript if not present
    if (!content.includes('enhanced-mobile-menu.js')) {
        // Look for existing script tag before closing body or at end of file
        let insertIndex = -1;
        
        // Try to find existing script section
        const scriptMatches = [...content.matchAll(/<script[^>]*>[\s\S]*?<\/script>/g)];
        if (scriptMatches.length > 0) {
            // Insert before the last script tag
            const lastScript = scriptMatches[scriptMatches.length - 1];
            insertIndex = content.indexOf(lastScript[0]);
        } else {
            // Insert before closing body tag
            const bodyEnd = content.indexOf('</body>');
            if (bodyEnd !== -1) {
                insertIndex = bodyEnd;
            }
        }
        
        if (insertIndex !== -1) {
            content = content.slice(0, insertIndex) + enhancedMobileMenuJS + '\n' + content.slice(insertIndex);
            modified = true;
        }
    }
    
    // Remove any old mobile menu JavaScript functions to avoid conflicts
    content = content.replace(/\/\/ Mobile menu toggle[\s\S]*?document\.querySelectorAll\('\.mobile-menu-link'\)[\s\S]*?\}\);/g, '');
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        updatedCount++;
        console.log(`✓ Enhanced mobile menu in ${file}`);
    } else {
        console.log(`- Skipped ${file} (no changes needed)`);
    }
});

console.log(`\n✨ Enhanced mobile menu update complete!`);
console.log(`   Enhanced: ${updatedCount} files`);
console.log(`   Total: ${files.length} HTML files`);