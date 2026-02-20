const fs = require('fs');
const path = require('path');

const dir = 'c:\\laragon\\www\\ksefproject\\classroomai';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'camera.html' && f !== 'camerafeed.html' && f !== 'index.html');

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

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf-8');
    
    // Replace sidebar-nav block
    content = content.replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, newSidebar);
    
    // Remove dark mode toggle topbar button
    content = content.replace(/.*<button class="topbar-btn" id="darkModeToggle".*\n/i, '');
    
    // Delete settings dark mode specific lines
    if(file === 'settings.html'){
        content = content.replace(/<div class="switch-wrap">[\s\S]*?<\/div>[\s]*<\/div>/i, ''); // appearance block
        content = content.replace(/const darkSwitch= document\.getElementById\('darkModeSwitch'\);/, '');
        content = content.replace(/darkSwitch\.checked = localStorage\.getItem\('cai_dark_mode'\) !== '0';/, '');
        content = content.replace(/darkSwitch\.addEventListener\('change', \(\) => \{[\s\S]*?\}\);/, '');
        // remove the Appearance section wrapper itself
        content = content.replace(/<!-- Appearance -->[\s\S]*?<\/div>/, '');
    }

    fs.writeFileSync(path.join(dir, file), content);
    console.log("Updated", file);
});
