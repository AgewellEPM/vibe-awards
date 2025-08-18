const fs = require('fs');
const path = require('path');

// List of all pages to test
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

// Required responsive CSS and JS files
const requiredFiles = {
    css: [
        'css/mobile-responsive.css',
        'css/apple-magic.css',
        'css/brand-system.css',
        'css/typography.css'
    ],
    js: [
        'js/animations.js',
        'js/apple-magic-init.js',
        'js/performance.js',
        'js/accessibility.js'
    ]
};

// Check each page
console.log('🔍 Testing Mobile Responsiveness and Completeness\n');
console.log('=' .repeat(60));

let issuesFound = 0;
const report = {
    complete: [],
    incomplete: [],
    missing: []
};

pages.forEach(page => {
    const filePath = path.join(__dirname, page);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${page} - FILE NOT FOUND`);
        report.missing.push(page);
        issuesFound++;
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for required CSS files
    requiredFiles.css.forEach(cssFile => {
        if (!content.includes(cssFile)) {
            issues.push(`Missing ${cssFile}`);
        }
    });
    
    // Check for required JS files  
    requiredFiles.js.forEach(jsFile => {
        if (!content.includes(jsFile)) {
            issues.push(`Missing ${jsFile}`);
        }
    });
    
    // Check for viewport meta tag
    if (!content.includes('viewport')) {
        issues.push('Missing viewport meta tag');
    }
    
    // Check for mobile-specific media queries
    const hasMediaQueries = content.includes('@media') || 
                           content.includes('mobile-responsive.css');
    if (!hasMediaQueries) {
        issues.push('No responsive design detected');
    }
    
    // Check for form validation
    if (content.includes('<form') && !content.includes('data-validate')) {
        issues.push('Forms lack validation attributes');
    }
    
    // Check for accessibility features
    if (!content.includes('aria-') && !content.includes('role=')) {
        issues.push('Missing accessibility attributes');
    }
    
    // Report findings
    if (issues.length === 0) {
        console.log(`✅ ${page} - COMPLETE`);
        report.complete.push(page);
    } else {
        console.log(`⚠️  ${page} - ISSUES FOUND:`);
        issues.forEach(issue => {
            console.log(`   - ${issue}`);
        });
        report.incomplete.push({ page, issues });
        issuesFound += issues.length;
    }
});

// Summary
console.log('\n' + '=' .repeat(60));
console.log('📊 SUMMARY REPORT\n');
console.log(`✅ Complete Pages: ${report.complete.length}/${pages.length}`);
console.log(`⚠️  Pages with Issues: ${report.incomplete.length}`);
console.log(`❌ Missing Pages: ${report.missing.length}`);
console.log(`📝 Total Issues Found: ${issuesFound}`);

// Detailed report
if (report.incomplete.length > 0) {
    console.log('\n📋 DETAILED ISSUES:');
    report.incomplete.forEach(({ page, issues }) => {
        console.log(`\n${page}:`);
        issues.forEach(issue => console.log(`  • ${issue}`));
    });
}

// Recommendations
console.log('\n💡 RECOMMENDATIONS:');
if (issuesFound === 0) {
    console.log('✨ All pages are complete and mobile-responsive!');
    console.log('✨ Consider testing on actual devices for best results.');
} else {
    console.log('1. Fix missing CSS/JS includes');
    console.log('2. Add form validation where needed');
    console.log('3. Improve accessibility attributes');
    console.log('4. Test on multiple screen sizes');
}

console.log('\n✅ Testing complete!');