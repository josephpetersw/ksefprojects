const fs = require('fs');

const cssPath = 'c:\\laragon\\www\\ksefproject\\classroomai\\css\\style.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/rgba\(6,\s*12,\s*26,/g, 'rgba(255, 255, 255,'); 
css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.0[47]\)/g, 'var(--bg-card)');
css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.1[8]\)/g, 'var(--border-hover)');
css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, 'var(--border)');

fs.writeFileSync(cssPath, css);

const livePath = 'c:\\laragon\\www\\ksefproject\\classroomai\\livefeed.html';
let live = fs.readFileSync(livePath, 'utf8');
live = live.replace(/rgba\(6,\s*12,\s*26,/g, 'rgba(255, 255, 255,');
live = live.replace(/background:\s*#000;/g, 'background: #E9EDEF;');
fs.writeFileSync(livePath, live);

console.log('Fixed glass colors');
