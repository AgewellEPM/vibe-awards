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

console.log('🚀 Achieving 10000% Ultra-Responsiveness\n');
console.log('=' .repeat(60));

pages.forEach(page => {
    const filePath = path.join(__dirname, page);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${page} - File not found`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modifications = 0;
    
    // Enhance viewport meta tag
    if (!content.includes('viewport-fit=cover')) {
        content = content.replace(
            /content="width=device-width, initial-scale=1\.0"/,
            'content="width=device-width, initial-scale=1.0, viewport-fit=cover"'
        );
        modifications++;
        console.log(`  + Enhanced viewport meta tag`);
    }
    
    // Add fluid typography to headings that don't have it
    content = content.replace(
        /<h1([^>]*(?:hero-title|page-title|welcome-title|auth-title)[^>]*)>/g,
        '<h1$1 style="font-size: var(--fs-4xl);">'
    );
    
    content = content.replace(
        /<h2([^>]*(?:section-title|rankings-title|showcase-title)[^>]*)>/g,
        '<h2$1 style="font-size: var(--fs-3xl);">'
    );
    
    content = content.replace(
        /<h3([^>]*(?:feature-title|app-name|podium-app-name)[^>]*)>/g,
        '<h3$1 style="font-size: var(--fs-2xl);">'
    );
    
    // Add responsive spacing using CSS variables
    content = content.replace(
        /margin: (\d+)px/g,
        (match, pixels) => {
            const rem = parseInt(pixels) / 16;
            return `margin: var(--space-${rem <= 0.5 ? 'xs' : rem <= 1 ? 'sm' : rem <= 2 ? 'md' : rem <= 4 ? 'lg' : 'xl'})`;
        }
    );
    
    content = content.replace(
        /padding: (\d+)px/g,
        (match, pixels) => {
            const rem = parseInt(pixels) / 16;
            return `padding: var(--space-${rem <= 0.5 ? 'xs' : rem <= 1 ? 'sm' : rem <= 2 ? 'md' : rem <= 4 ? 'lg' : 'xl'})`;
        }
    );
    
    // Add responsive gaps
    content = content.replace(
        /gap: (\d+)px/g,
        (match, pixels) => {
            const rem = parseInt(pixels) / 16;
            return `gap: var(--gap-${rem <= 0.5 ? 'xs' : rem <= 1 ? 'sm' : rem <= 2 ? 'md' : rem <= 3 ? 'lg' : 'xl'})`;
        }
    );
    
    // Enhance container classes
    content = content.replace(
        /class="([^"]*\bstats-container\b[^"]*)"/g,
        'class="$1 container-fluid"'
    );
    
    content = content.replace(
        /class="([^"]*\bsection-header\b[^"]*)"/g,
        'class="$1 container-fluid"'
    );
    
    // Add fluid scaling to font sizes
    content = content.replace(
        /font-size: (\d+)px/g,
        (match, pixels) => {
            const px = parseInt(pixels);
            if (px <= 12) return 'font-size: var(--fs-xs)';
            if (px <= 14) return 'font-size: var(--fs-sm)';
            if (px <= 16) return 'font-size: var(--fs-base)';
            if (px <= 18) return 'font-size: var(--fs-lg)';
            if (px <= 20) return 'font-size: var(--fs-xl)';
            if (px <= 24) return 'font-size: var(--fs-2xl)';
            if (px <= 32) return 'font-size: var(--fs-3xl)';
            if (px <= 48) return 'font-size: var(--fs-4xl)';
            return 'font-size: var(--fs-5xl)';
        }
    );
    
    // Add clamp() for responsive values
    content = content.replace(
        /width: (\d+)px/g,
        (match, pixels) => {
            const px = parseInt(pixels);
            if (px > 200) {
                return `width: clamp(${Math.floor(px * 0.6)}px, ${px / 16}rem, ${px}px)`;
            }
            return match;
        }
    );
    
    content = content.replace(
        /height: (\d+)px/g,
        (match, pixels) => {
            const px = parseInt(pixels);
            if (px > 100) {
                return `height: clamp(${Math.floor(px * 0.7)}px, ${px / 16}rem, ${px}px)`;
            }
            return match;
        }
    );
    
    // Save enhanced file
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${page} - Enhanced with fluid scaling and responsive units`);
});

console.log('\n' + '=' .repeat(60));
console.log('🌟 All pages enhanced for 10000% responsiveness!');

// Create responsive image enhancement
const responsiveImageCSS = `
/* Ultra-Responsive Image System */
.responsive-image {
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: cover;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.responsive-image-container {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}

.responsive-image-square {
  aspect-ratio: 1;
}

.responsive-image-landscape {
  aspect-ratio: 16 / 9;
}

.responsive-image-portrait {
  aspect-ratio: 3 / 4;
}

/* Ultra-Responsive Typography */
.text-ultra-responsive {
  font-size: clamp(0.875rem, 1rem + 2vw, 1.5rem);
  line-height: clamp(1.3, 1.5, 1.7);
}

.heading-ultra-responsive {
  font-size: clamp(1.5rem, 2rem + 4vw, 4rem);
  line-height: clamp(1.1, 1.2, 1.3);
}

/* Ultra-Responsive Containers */
.container-ultra-responsive {
  width: 100%;
  max-width: min(100vw - 2rem, 80rem);
  margin-inline: auto;
  padding-inline: clamp(1rem, 5vw, 3rem);
}

.container-ultra-narrow {
  width: 100%;
  max-width: min(100vw - 2rem, 40rem);
  margin-inline: auto;
  padding-inline: clamp(1rem, 3vw, 2rem);
}

/* Ultra-Responsive Buttons */
.btn-ultra-responsive {
  padding: clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem);
  font-size: clamp(0.875rem, 1rem + 0.5vw, 1.125rem);
  border-radius: clamp(0.5rem, 1vw, 1rem);
  min-height: clamp(44px, 10vw, 48px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Device-Specific Optimizations */
@media (max-width: 320px) {
  .ultra-responsive-tiny {
    font-size: 0.75rem;
    padding: 0.5rem;
    gap: 0.25rem;
  }
}

@media (min-width: 2560px) {
  .ultra-responsive-huge {
    font-size: clamp(1.25rem, 1.5vw, 2rem);
    padding: clamp(1rem, 2vw, 2rem);
  }
}

/* Foldable device support */
@media (min-width: 280px) and (max-width: 653px) and (orientation: landscape) {
  .foldable-adaptive {
    display: flex;
    flex-direction: row;
    gap: var(--gap-sm);
  }
}

/* Ultra-wide screen optimization */
@media (min-width: 3440px) {
  .ultra-wide-adaptive {
    max-width: 2560px;
    margin-inline: auto;
  }
}
`;

// Add responsive image CSS to ultra-responsive.css
const ultraResponsivePath = path.join(__dirname, 'css', 'ultra-responsive.css');
if (fs.existsSync(ultraResponsivePath)) {
    const existingCSS = fs.readFileSync(ultraResponsivePath, 'utf8');
    if (!existingCSS.includes('Ultra-Responsive Image System')) {
        fs.writeFileSync(ultraResponsivePath, existingCSS + '\n\n' + responsiveImageCSS);
        console.log('✅ Enhanced ultra-responsive.css with advanced responsive features');
    }
}

console.log('\n🎉 10000% Ultra-Responsiveness Achieved!');