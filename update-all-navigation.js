const fs = require('fs');
const path = require('path');

// The complete navigation HTML to inject
const navigationHTML = `    <!-- AI Companies Bar -->
    <div class="companies-bar">
        <div class="companies-track">
            <div class="companies-content">
                <span class="company">OpenAI</span>
                <span class="dot">•</span>
                <span class="company">Anthropic</span>
                <span class="dot">•</span>
                <span class="company">Google DeepMind</span>
                <span class="dot">•</span>
                <span class="company">Meta AI</span>
                <span class="dot">•</span>
                <span class="company">Stability AI</span>
                <span class="dot">•</span>
                <span class="company">Midjourney</span>
                <span class="dot">•</span>
                <span class="company">Cohere</span>
                <span class="dot">•</span>
                <span class="company">Inflection AI</span>
                <span class="dot">•</span>
                <span class="company">Runway</span>
                <span class="dot">•</span>
                <span class="company">Hugging Face</span>
                <span class="dot">•</span>
                <span class="company">Replicate</span>
                <span class="dot">•</span>
                <span class="company">Character AI</span>
                <span class="dot">•</span>
                <span class="company">Eleven Labs</span>
                <span class="dot">•</span>
                <span class="company">Perplexity</span>
                <span class="dot">•</span>
                <span class="company">Mistral AI</span>
                <span class="dot">•</span>
            </div>
            <div class="companies-content" aria-hidden="true">
                <span class="company">OpenAI</span>
                <span class="dot">•</span>
                <span class="company">Anthropic</span>
                <span class="dot">•</span>
                <span class="company">Google DeepMind</span>
                <span class="dot">•</span>
                <span class="company">Meta AI</span>
                <span class="dot">•</span>
                <span class="company">Stability AI</span>
                <span class="dot">•</span>
                <span class="company">Midjourney</span>
                <span class="dot">•</span>
                <span class="company">Cohere</span>
                <span class="dot">•</span>
                <span class="company">Inflection AI</span>
                <span class="dot">•</span>
                <span class="company">Runway</span>
                <span class="dot">•</span>
                <span class="company">Hugging Face</span>
                <span class="dot">•</span>
                <span class="company">Replicate</span>
                <span class="dot">•</span>
                <span class="company">Character AI</span>
                <span class="dot">•</span>
                <span class="company">Eleven Labs</span>
                <span class="dot">•</span>
                <span class="company">Perplexity</span>
                <span class="dot">•</span>
                <span class="company">Mistral AI</span>
                <span class="dot">•</span>
            </div>
        </div>
    </div>

    <!-- Navigation -->
    <nav>
        <div class="nav-container">
            <a href="index.html" class="nav-logo">
                <span class="logo-icon">🏆</span>
                The Vibe Awards
            </a>
            <div class="nav-menu">
                <!-- Competition Dropdown -->
                <div class="nav-dropdown">
                    <span class="nav-link has-dropdown">Competition</span>
                    <div class="dropdown-menu">
                        <a href="competition.html" class="dropdown-item">Main Competition</a>
                        <a href="battle-arena.html" class="dropdown-item">Battle Arena</a>
                        <a href="app-battle-arena.html" class="dropdown-item">App Battles</a>
                        <a href="challenge-mode.html" class="dropdown-item">Challenge Mode</a>
                        <a href="tournament.html" class="dropdown-item">Tournament</a>
                        <div class="dropdown-divider"></div>
                        <a href="leaderboard.html" class="dropdown-item">Leaderboard</a>
                        <a href="winners.html" class="dropdown-item">Past Winners</a>
                    </div>
                </div>

                <!-- Build Dropdown -->
                <div class="nav-dropdown">
                    <span class="nav-link has-dropdown">Build</span>
                    <div class="dropdown-menu">
                        <a href="vibe-forge.html" class="dropdown-item">Vibe Forge</a>
                        <a href="vibe-toolkit.html" class="dropdown-item">Vibe Toolkit</a>
                        <a href="getting-started.html" class="dropdown-item">Getting Started</a>
                        <a href="brainstorm-workspace.html" class="dropdown-item">Brainstorm</a>
                        <a href="backlog-synthesizer.html" class="dropdown-item">Backlog</a>
                        <div class="dropdown-divider"></div>
                        <a href="deploy-presets.html" class="dropdown-item">Deploy Presets</a>
                    </div>
                </div>

                <!-- Community Dropdown -->
                <div class="nav-dropdown">
                    <span class="nav-link has-dropdown">Community</span>
                    <div class="dropdown-menu">
                        <a href="team-up.html" class="dropdown-item">Team Up</a>
                        <a href="vibe-hub.html" class="dropdown-item">Vibe Hub</a>
                        <a href="showcase.html" class="dropdown-item">Showcase</a>
                        <a href="gallery.html" class="dropdown-item">Gallery</a>
                        <div class="dropdown-divider"></div>
                        <a href="directory.html" class="dropdown-item">Builders Directory</a>
                        <a href="messages.html" class="dropdown-item">Messages</a>
                    </div>
                </div>

                <!-- Live Dropdown -->
                <div class="nav-dropdown">
                    <span class="nav-link has-dropdown">Live</span>
                    <div class="dropdown-menu">
                        <a href="stream-dashboard.html" class="dropdown-item">Stream Dashboard</a>
                        <a href="awards-ceremony.html" class="dropdown-item">Awards Ceremony</a>
                        <a href="random-drop-lobby.html" class="dropdown-item">Random Drop</a>
                        <div class="dropdown-divider"></div>
                        <a href="voting-history.html" class="dropdown-item">Voting History</a>
                    </div>
                </div>

                <!-- About Dropdown -->
                <div class="nav-dropdown">
                    <span class="nav-link has-dropdown">About</span>
                    <div class="dropdown-menu">
                        <a href="about.html" class="dropdown-item">About Us</a>
                        <a href="vibe-manifesto.html" class="dropdown-item">Manifesto</a>
                        <a href="why-vibe-awards.html" class="dropdown-item">Why Vibe</a>
                        <a href="roadmap.html" class="dropdown-item">Roadmap</a>
                        <div class="dropdown-divider"></div>
                        <a href="contact.html" class="dropdown-item">Contact</a>
                    </div>
                </div>

                <!-- Direct Links -->
                <a href="awards.html" class="nav-link">Awards</a>

                <!-- Actions -->
                <div class="nav-actions">
                    <a href="notifications.html" class="nav-icon-btn" title="Notifications">🔔</a>
                    <a href="profile.html" class="nav-icon-btn" title="Profile">👤</a>
                    <a href="submit-app.html" class="nav-cta">Submit App</a>
                </div>
            </div>

            <!-- Mobile Menu Toggle -->
            <button type="button" class="mobile-menu-toggle" onclick="toggleMobileMenu()">☰</button>
        </div>
    </nav>`;

// Get all HTML files in the directory
const dir = '/Users/lukekist/vibe-awards-project';
const files = fs.readdirSync(dir).filter(file => file.endsWith('.html'));

let updatedCount = 0;
let skippedCount = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip index.html as it already has the correct navigation
    if (file === 'index.html') {
        console.log(`✓ Skipping ${file} (already has correct navigation)`);
        skippedCount++;
        return;
    }
    
    // Find the opening body tag
    const bodyMatch = content.match(/<body[^>]*>/);
    if (!bodyMatch) {
        console.log(`✗ Skipping ${file} (no body tag found)`);
        skippedCount++;
        return;
    }
    
    const bodyTag = bodyMatch[0];
    const bodyIndex = content.indexOf(bodyTag);
    const afterBodyIndex = bodyIndex + bodyTag.length;
    
    // Find where the current navigation ends (look for first main content element)
    let endNavIndex = content.indexOf('<main', afterBodyIndex);
    if (endNavIndex === -1) endNavIndex = content.indexOf('<section', afterBodyIndex);
    if (endNavIndex === -1) endNavIndex = content.indexOf('<div class="hero"', afterBodyIndex);
    if (endNavIndex === -1) endNavIndex = content.indexOf('<div class="container"', afterBodyIndex);
    if (endNavIndex === -1) endNavIndex = content.indexOf('<!-- Hero', afterBodyIndex);
    if (endNavIndex === -1) endNavIndex = content.indexOf('<!-- Main', afterBodyIndex);
    
    if (endNavIndex === -1) {
        console.log(`⚠ ${file} - couldn't find content start, using manual approach`);
        // Try to find existing nav and replace it
        const navStart = content.indexOf('<nav');
        if (navStart !== -1) {
            const navEnd = content.indexOf('</nav>', navStart) + 6;
            const beforeNav = content.substring(0, navStart);
            const afterNav = content.substring(navEnd);
            
            // Check if there's a companies bar before nav
            let companiesStart = beforeNav.lastIndexOf('<div class="companies-bar">');
            if (companiesStart === -1) {
                // No companies bar, add the full navigation
                content = beforeNav + '\n' + navigationHTML + afterNav;
            } else {
                // Replace from companies bar to end of nav
                content = beforeNav.substring(0, companiesStart) + '\n' + navigationHTML + afterNav;
            }
            updatedCount++;
            console.log(`✓ Updated ${file}`);
        } else {
            // No nav found, insert after body
            content = bodyTag + '\n' + navigationHTML + content.substring(afterBodyIndex);
            updatedCount++;
            console.log(`✓ Added navigation to ${file}`);
        }
    } else {
        // Replace everything between body and main content with new navigation
        const beforeBody = content.substring(0, afterBodyIndex);
        const afterNav = content.substring(endNavIndex);
        content = beforeBody + '\n' + navigationHTML + '\n\n    ' + afterNav;
        updatedCount++;
        console.log(`✓ Updated ${file}`);
    }
    
    // Write the updated content back
    fs.writeFileSync(filePath, content);
});

console.log(`\n✨ Navigation update complete!`);
console.log(`   Updated: ${updatedCount} files`);
console.log(`   Skipped: ${skippedCount} files`);
console.log(`   Total: ${files.length} HTML files`);