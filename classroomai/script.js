document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Classroom AI Script Loaded!");

    // 🌙 Dark Mode Toggle
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
        });

        // Load saved dark mode setting
        if (localStorage.getItem("darkMode") === "true") {
            document.body.classList.add("dark-mode");
        }
    }

    // 🎥 Camera Feed Handling
    let videoStream = null;
    const cameraVideo = document.getElementById("cameraVideo") || document.getElementById("liveVideo");
    const startCameraBtn = document.getElementById("startCameraBtn") || document.getElementById("startLiveFeedBtn");
    const stopCameraBtn = document.getElementById("stopCameraBtn") || document.getElementById("stopLiveFeedBtn");
    const cameraStatus = document.getElementById("cameraStatus") || document.getElementById("feedStatus");

    if (startCameraBtn && cameraVideo) {
        startCameraBtn.addEventListener("click", function () {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                    cameraVideo.srcObject = stream;
                    videoStream = stream;
                    cameraStatus.textContent = "🎥 Live feed active.";
                    startCameraBtn.disabled = true;
                    stopCameraBtn.disabled = false;
                    loadTensorFlowModel();
                })
                .catch(function (error) {
                    cameraStatus.textContent = "❌ Camera access denied.";
                    console.error("Camera error:", error);
                });
        });
    }

    if (stopCameraBtn) {
        stopCameraBtn.addEventListener("click", function () {
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
                cameraVideo.srcObject = null;
                cameraStatus.textContent = "📴 Camera feed stopped.";
                startCameraBtn.disabled = false;
                stopCameraBtn.disabled = true;
            }
        });
    }

    // 🤖 AI Object Detection using TensorFlow.js & CocoSSD
    async function loadTensorFlowModel() {
        console.log("⏳ Loading TensorFlow Model...");
        const model = await cocoSsd.load();
        console.log("✅ TensorFlow Model Loaded!");
        analyzeFrame(model);
    }

    async function analyzeFrame(model) {
        if (!cameraVideo.srcObject) return;
        const predictions = await model.detect(cameraVideo);

        const aiLog = document.getElementById("aiLog");
        if (aiLog) aiLog.innerHTML = ""; // Clear logs

        predictions.forEach(prediction => {
            const logEntry = document.createElement("li");
            logEntry.className = "list-group-item";
            logEntry.textContent = `🔹 ${prediction.class} detected (${Math.round(prediction.score * 100)}%)`;
            aiLog.appendChild(logEntry);
        });

        requestAnimationFrame(() => analyzeFrame(model));
    }

    // 🎛️ System Settings Management
    const settingsForm = document.getElementById("settingsForm");
    if (settingsForm) {
        function loadSettings() {
            document.getElementById("aiSensitivity").value = localStorage.getItem("aiSensitivity") || "medium";
            document.getElementById("alertThreshold").value = localStorage.getItem("alertThreshold") || 5;
            document.getElementById("cameraResolution").value = localStorage.getItem("cameraResolution") || "720p";
        }

        settingsForm.addEventListener("submit", function (event) {
            event.preventDefault();
            localStorage.setItem("aiSensitivity", document.getElementById("aiSensitivity").value);
            localStorage.setItem("alertThreshold", document.getElementById("alertThreshold").value);
            localStorage.setItem("cameraResolution", document.getElementById("cameraResolution").value);
            alert("✅ Settings saved successfully!");
        });

        loadSettings();
    }

    // 📊 Real-time Dashboard Stats Update (Simulated Data)
    function updateDashboardStats() {
        if (document.getElementById("engagementStat")) {
            document.getElementById("engagementStat").textContent = `${Math.floor(Math.random() * 100)}%`;
        }
        if (document.getElementById("attendanceStat")) {
            document.getElementById("attendanceStat").textContent = `${Math.floor(Math.random() * 100)}%`;
        }
        if (document.getElementById("cheatingStat")) {
            document.getElementById("cheatingStat").textContent = Math.floor(Math.random() * 5);
        }
    }
    setInterval(updateDashboardStats, 5000); // Update every 5 seconds

    // 📌 Load Notifications in Dashboard (Simulated)
    function loadNotifications() {
        const notificationList = document.getElementById("notificationList");
        if (notificationList) {
            notificationList.innerHTML = `
                <li>🔹 New cheating alert in Form 3 South</li>
                <li>🔹 Engagement dropped below 60% in Form 1 East</li>
                <li>🔹 Live feed started for exam monitoring</li>
            `;
        }
    }
    loadNotifications();
});
