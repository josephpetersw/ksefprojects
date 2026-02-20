const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // Make sure we haven't already added CCTV Room
    if (!content.includes('cctv_room.html')) {
        const target = '<a href="livefeed.html" class="nav-link"><i class="fas fa-broadcast-tower"></i><span>Live Feed</span></a>';
        const replacement = target + '\n      <a href="cctv_room.html" class="nav-link"><i class="fas fa-video"></i><span>CCTV Room</span></a>';
        content = content.replace(target, replacement);
        
        fs.writeFileSync(path.join(dir, file), content);
        console.log("Added CCTV Room nav to", file);
    }
});
