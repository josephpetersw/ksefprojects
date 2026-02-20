const fs = require('fs');
const path = require('path');

const dir = 'c:\\laragon\\www\\ksefproject\\classroomai';
const camFile = path.join(dir, 'camera.html');
const liveFile = path.join(dir, 'livefeed.html');

let content = fs.readFileSync(camFile, 'utf-8');

// replace title
content = content.replace(/<title>Camera Monitor/g, '<title>Live Feed');
content = content.replace(/>Camera Monitor</g, '>Live Feed<');
content = content.replace(/Live Camera Monitor/g, 'Live Feed');
content = content.replace(/camera\.html/g, 'livefeed.html');

// standardization
const newSidebar = `<nav class="sidebar-nav">
      <span class="nav-section-label">Monitor</span>
      <a href="dashboard.html" class="nav-link"><i class="fas fa-chart-pie"></i><span>Dashboard</span></a>
      <a href="livefeed.html" class="nav-link"><i class="fas fa-broadcast-tower"></i><span>Live Feed</span></a>
      <a href="upload.html" class="nav-link"><i class="fas fa-film"></i><span>Video Analysis</span></a>
      <span class="nav-section-label">Library</span>
      <a href="videos.html" class="nav-link"><i class="fas fa-photo-video"></i><span>Video Library</span></a>
      <span class="nav-section-label">Insights</span>
      <a href="statistics.html" class="nav-link"><i class="fas fa-chart-line"></i><span>Statistics</span></a>
      <a href="report.html" class="nav-link"><i class="fas fa-file-alt"></i><span>Session Report</span></a>
      <span class="nav-section-label">System</span>
      <a href="settings.html" class="nav-link"><i class="fas fa-sliders"></i><span>Settings</span></a>
      <a href="about.html" class="nav-link"><i class="fas fa-info-circle"></i><span>About</span></a>
      <a href="help.html" class="nav-link"><i class="fas fa-circle-question"></i><span>Help</span></a>
    </nav>`;

content = content.replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/g, newSidebar);
content = content.replace(/<button class="topbar-btn" id="darkModeToggle">.*?<\/button>/g, '');

fs.writeFileSync(liveFile, content);

// Also remove camera.html to avoid confusion
fs.unlinkSync(camFile);
