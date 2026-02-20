const fs = require('fs');
const path = require('path');

const uploadFile = path.join(__dirname, 'upload.html');
let content = fs.readFileSync(uploadFile, 'utf8');

// 1. Add Library option to upload screen
const oldUploadBlock = `<div class="upload-zone" id="uploadZone">
        <input type="file" id="fileInput" accept="video/*">
        <i class="fas fa-film"></i>
        <div class="upload-zone-text">Drag &amp; drop a video file, or click to browse</div>
        <div class="upload-zone-sub">Supports MP4, WebM, MOV · AI will analyse each frame</div>
      </div>`;

const newUploadBlock = `<div class="grid-2" style="gap:20px;">
        <div class="upload-zone" id="uploadZone">
          <input type="file" id="fileInput" accept="video/*">
          <i class="fas fa-film"></i>
          <div class="upload-zone-text">Drag &amp; drop a video file, or click to browse</div>
          <div class="upload-zone-sub">Supports MP4, WebM, MOV · AI will analyse each frame</div>
        </div>
        <div class="upload-zone" style="cursor:pointer;" onclick="window.location.href='videos.html'">
          <i class="fas fa-photo-video"></i>
          <div class="upload-zone-text">Select from Video Library</div>
          <div class="upload-zone-sub">Choose a previously uploaded or recorded video</div>
        </div>
      </div>`;

content = content.replace(oldUploadBlock, newUploadBlock);

// 2. Loop video
content = content.replace("uploadVideo.play();\n    addULog('▶ Analysis started', 0);", "uploadVideo.loop = true;\n    uploadVideo.play();\n    addULog('▶ Analysis started', 0);");

// 3. Preload AI models on page load
const oldScriptEnd = `// File selection`;
const newScriptEnd = `// Preload models automatically
  (async function preload() {
    if (!AIEngine.modelsLoaded) {
      AIEngine.loadModels().catch(e => console.error(e));
    }
  })();

  // File selection`;
content = content.replace(oldScriptEnd, newScriptEnd);

fs.writeFileSync(uploadFile, content);
console.log('Fixed upload.html');
