const fs = require('fs');

// Fix livefeed.html
let livefeed = fs.readFileSync('livefeed.html', 'utf8');

livefeed = livefeed.replace(
    'grid-template-columns: 1fr 320px;',
    'grid-template-columns: minmax(0, 1fr) 300px;'
);

livefeed = livefeed.replace(
    'aspect-ratio: 16/9;',
    'max-height: 60vh;\n      width: 100%;\n      aspect-ratio: 16/9;\n      margin: 0 auto;'
);

livefeed = livefeed.replace(
    'object-fit: cover;',
    'object-fit: contain;'
);

fs.writeFileSync('livefeed.html', livefeed);

// Fix upload.html
let upload = fs.readFileSync('upload.html', 'utf8');

upload = upload.replace(
    'grid-template-columns: 1fr 300px;',
    'grid-template-columns: minmax(0, 1fr) 300px;'
);

upload = upload.replace(
    'border: 1px solid var(--border);\n    }',
    'border: 1px solid var(--border);\n      max-height: 60vh;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      background: #000;\n    }'
);

upload = upload.replace(
    '#uploadVideo { width: 100%; height: auto; display: block; }',
    '#uploadVideo { max-height: 60vh; max-width: 100%; width: auto; height: 100%; object-fit: contain; display: block; }'
);

fs.writeFileSync('upload.html', upload);

console.log("Fixed video container sizings.");
