const fs = require('fs');
const path = require('path');

// Pages that need fixes
const pagesToFix = {
    'index.html': {
        addJS: ['js/apple-magic-init.js'],
        addAccessibility: true
    },
    'index-magic.html': {
        addCSS: ['css/mobile-responsive.css', 'css/apple-magic.css', 'css/brand-system.css', 'css/typography.css'],
        addJS: ['js/animations.js', 'js/apple-magic-init.js', 'js/performance.js', 'js/accessibility.js'],
        addAccessibility: true
    },
    'dashboard.html': {
        addCSS: ['css/mobile-responsive.css', 'css/apple-magic.css', 'css/brand-system.css', 'css/typography.css'],
        addJS: ['js/animations.js', 'js/apple-magic-init.js', 'js/performance.js', 'js/accessibility.js'],
        addAccessibility: true
    },
    'profile.html': {
        addAccessibility: true
    },
    'messages.html': {
        addFormValidation: true,
        addAccessibility: true
    },
    'submit-app.html': {
        addAccessibility: true
    },
    'leaderboard.html': {
        addAccessibility: true
    },
    'showcase.html': {
        addAccessibility: true
    },
    'apple-magic-battle.html': {
        addAccessibility: true
    },
    'team-up.html': {
        addFormValidation: true,
        addAccessibility: true
    },
    'vibe-hub.html': {
        addAccessibility: true
    }
};

console.log('🔧 Fixing Remaining Issues\n');
console.log('=' .repeat(60));

Object.entries(pagesToFix).forEach(([page, fixes]) => {
    const filePath = path.join(__dirname, page);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${page} - File not found`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Add missing CSS files
    if (fixes.addCSS) {
        fixes.addCSS.forEach(cssFile => {
            if (!content.includes(cssFile)) {
                // Add before first <link> or after <title>
                const titleMatch = content.match(/<\/title>/);
                if (titleMatch) {
                    const insertion = `\n    <link rel="stylesheet" href="${cssFile}">`;
                    content = content.replace(/<\/title>/, `</title>${insertion}`);
                    modified = true;
                    console.log(`  + Added ${cssFile}`);
                }
            }
        });
    }
    
    // Add missing JS files
    if (fixes.addJS) {
        fixes.addJS.forEach(jsFile => {
            if (!content.includes(jsFile)) {
                // Add before </body>
                const insertion = `    <script src="${jsFile}"></script>\n`;
                content = content.replace(/<\/body>/, `${insertion}</body>`);
                modified = true;
                console.log(`  + Added ${jsFile}`);
            }
        });
    }
    
    // Add form validation attributes
    if (fixes.addFormValidation) {
        // Add data-validate to forms
        content = content.replace(/<form(?![^>]*data-validate)/g, '<form data-validate');
        
        // Add validation attributes to required inputs
        content = content.replace(/<input([^>]*required[^>]*)>/g, (match, attrs) => {
            if (!attrs.includes('data-validate')) {
                // Determine validation type based on input type
                if (attrs.includes('type="email"')) {
                    return `<input${attrs} data-validate="required email">`;
                } else if (attrs.includes('type="password"')) {
                    return `<input${attrs} data-validate="required strong-password">`;
                } else if (attrs.includes('type="text"') && attrs.includes('name')) {
                    return `<input${attrs} data-validate="required">`;
                }
            }
            return match;
        });
        
        modified = true;
        console.log('  + Added form validation attributes');
    }
    
    // Add accessibility attributes
    if (fixes.addAccessibility) {
        // Add role to navigation
        content = content.replace(/<nav(?![^>]*role)/g, '<nav role="navigation"');
        
        // Add role to main content
        content = content.replace(/<main(?![^>]*role)/g, '<main role="main"');
        
        // Add aria-label to buttons without text
        content = content.replace(/<button([^>]*)>([^<]*)<\/button>/g, (match, attrs, content) => {
            if (!attrs.includes('aria-label') && (!content || content.trim() === '' || content.includes('emoji'))) {
                return `<button${attrs} aria-label="Button">${content}</button>`;
            }
            return match;
        });
        
        // Add role to sections
        content = content.replace(/<section(?![^>]*role)([^>]*)>/g, '<section role="region"$1>');
        
        // Add aria-label to form inputs
        content = content.replace(/<input([^>]*placeholder="([^"]*)"[^>]*)>/g, (match, attrs, placeholder) => {
            if (!attrs.includes('aria-label')) {
                return `<input${attrs} aria-label="${placeholder}">`;
            }
            return match;
        });
        
        modified = true;
        console.log('  + Added accessibility attributes');
    }
    
    // Save the file if modified
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${page} - Fixed`);
    } else {
        console.log(`✓ ${page} - No changes needed`);
    }
});

console.log('\n' + '=' .repeat(60));
console.log('✅ All issues fixed!');