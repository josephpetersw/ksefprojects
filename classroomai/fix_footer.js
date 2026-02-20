const fs = require('fs');
const path = require('path');

const dir = 'c:\\laragon\\www\\ksefproject\\classroomai';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf-8');
    
    // Replace margin-left:240px inline style on footer
    content = content.replace(/margin-left:\s*240px/g, 'margin-left:var(--sidebar-w)');
    content = content.replace(/margin-left:\s*260px/g, 'margin-left:var(--sidebar-w)');
    
    fs.writeFileSync(path.join(dir, file), content);
    console.log("Updated footer on", file);
});
