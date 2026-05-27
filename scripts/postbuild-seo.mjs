import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

// 1. Read dist/index.html to extract Vite's compiled asset links
const indexPath = join(distDir, 'index.html');
let indexHtml;
try {
  indexHtml = readFileSync(indexPath, 'utf8');
} catch (e) {
  console.error('Error: Could not read dist/index.html. Make sure "vite build" runs before this script.', e.message);
  process.exit(1);
}

const scriptTags = [];
const linkTags = [];

// Extract script tag(s) pointing to Vite's bundled JS files
const scriptRegex = /<script\b[^>]*src="[^"]*\/assets\/index-[^"]+\.js"[^>]*><\/script>/gi;
let match;
while ((match = scriptRegex.exec(indexHtml)) !== null) {
  scriptTags.push(match[0]);
}

// Extract stylesheet link tag(s) pointing to Vite's bundled CSS files
const linkRegex = /<link\b[^>]*href="[^"]*\/assets\/index-[^"]+\.css"[^>]*>/gi;
while ((match = linkRegex.exec(indexHtml)) !== null) {
  linkTags.push(match[0]);
}

console.log('--- Postbuild SEO Optimizer ---');
console.log('Extracted script tags:', scriptTags);
console.log('Extracted stylesheet link tags:', linkTags);

if (scriptTags.length === 0) {
  console.error('Warning: No bundled index script tag found in dist/index.html.');
}

// Helper to recursively find all HTML files except dist/index.html
function getHtmlFiles(dir, filesList = []) {
  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      getHtmlFiles(filePath, filesList);
    } else if (file.endsWith('.html') && filePath !== indexPath) {
      filesList.push(filePath);
    }
  }
  return filesList;
}

const htmlFiles = getHtmlFiles(distDir);
console.log(`Found ${htmlFiles.length} static HTML files to optimize.`);

let optimizedCount = 0;

for (const filePath of htmlFiles) {
  let content = readFileSync(filePath, 'utf8');
  let dirty = false;

  // 1. Replace the raw dev script tag with the compiled/hashed production script tag
  const rawScriptTag = '<script type="module" src="/src/main.ts"></script>';
  if (content.includes(rawScriptTag)) {
    content = content.replace(rawScriptTag, scriptTags.join('\n    '));
    dirty = true;
  }

  // 2. Inject the compiled/hashed stylesheet link tags in the <head> if not already present
  if (linkTags.length > 0) {
    const headEnd = '</head>';
    if (content.includes(headEnd)) {
      // Avoid duplicate injections
      const cssFileName = linkTags[0].match(/href="([^"]+)"/)?.[1];
      if (cssFileName && !content.includes(cssFileName)) {
        const injectedStyles = '    ' + linkTags.join('\n    ') + '\n  ';
        content = content.replace(headEnd, `${injectedStyles}${headEnd}`);
        dirty = true;
      }
    }
  }

  if (dirty) {
    writeFileSync(filePath, content, 'utf8');
    optimizedCount++;
  }
}

console.log(`Successfully optimized ${optimizedCount} of ${htmlFiles.length} pages (injected hashed JS/CSS assets).`);
console.log('--- Optimization Complete ---');
