const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname);
const livefeedFile = path.join(dir, 'livefeed.html');

let content = fs.readFileSync(livefeedFile, 'utf8');

const oldScriptEnd = `// ── DOM refs ──`;
const newScriptEnd = `// Preload models
  (async function preload() {
    if (!AIEngine.modelsLoaded) {
      document.getElementById('modelLoadingWrap').classList.add('show');
      document.getElementById('modelStatus').textContent = 'Pre-loading AI Models...';
      AIEngine.loadModels((msg) => { 
        document.getElementById('modelStatus').textContent = msg; 
      }).then(() => {
        document.getElementById('modelLoadingWrap').classList.remove('show');
      }).catch(e => console.error(e));
    }
  })();

  // ── DOM refs ──`;

if (!content.includes('Preload models')) {
    content = content.replace(oldScriptEnd, newScriptEnd);
}
fs.writeFileSync(livefeedFile, content);

const cssFile = path.join(dir, 'css', 'style.css');
let css = fs.readFileSync(cssFile, 'utf8');

// Reduce sidebar width
css = css.replace(/--sidebar-w:\s*260px;/, '--sidebar-w: 200px;');

// Reduce padding on main content to make stats visible
if (!css.includes('padding: 20px 24px 32px;')) {
    css = css.replace(/padding:\s*28px\s*28px\s*48px;/, 'padding: 20px 24px 32px;');
}

fs.writeFileSync(cssFile, css);
console.log('Fixed livefeed.html preloading and reduced padding');
