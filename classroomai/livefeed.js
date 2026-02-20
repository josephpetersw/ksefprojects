document.addEventListener("DOMContentLoaded", function () {
    const videoUpload = document.getElementById("videoUpload");
    const videoPlayer = document.getElementById("videoPlayer");
    const overlayCanvas = document.getElementById("overlayCanvas");
    const ctx = overlayCanvas.getContext("2d");
    const processVideoBtn = document.getElementById("processVideoBtn");
    const aiLog = document.getElementById("aiLog");
    const attentionMeter = document.getElementById("attentionMeter");
    const noiseMeter = document.getElementById("noiseMeter");
    let model = null;

    async function loadModel() {
        model = await cocoSsd.load();
        console.log("✅ AI Model Loaded");
    }
    loadModel();

    videoUpload.addEventListener("change", function (e) {
        const fileURL = URL.createObjectURL(e.target.files[0]);
        videoPlayer.src = fileURL;
    });

    processVideoBtn.addEventListener("click", function () {
        videoPlayer.play();
        videoPlayer.addEventListener("play", function () {
            overlayCanvas.width = videoPlayer.videoWidth;
            overlayCanvas.height = videoPlayer.videoHeight;

            function analyzeFrame() {
                if (videoPlayer.paused || videoPlayer.ended) return;

                model.detect(videoPlayer).then(predictions => {
                    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
                    
                    let totalAttention = 0;
                    let studentCount = 0;

                    predictions.forEach(prediction => {
                        if (prediction.class === "person") {
                            studentCount++;
                            const attentionScore = Math.round(prediction.score * 100);
                            totalAttention += attentionScore;

                            ctx.strokeStyle = "green";
                            ctx.lineWidth = 4;
                            ctx.strokeRect(...prediction.bbox);
                            ctx.fillStyle = "green";
                            ctx.font = "bold 18px Arial";
                            ctx.fillText(`Attention: ${attentionScore}%`, prediction.bbox[0], prediction.bbox[1] - 10);
                        }
                    });

                    // Update Class Attention Meter
                    let avgAttention = studentCount ? Math.round(totalAttention / studentCount) : 0;
                    attentionMeter.style.width = `${avgAttention}%`;

                    // Simulated Noise Meter (Random Value)
                    let noiseLevel = Math.floor(Math.random() * 100);
                    noiseMeter.style.width = `${noiseLevel}%`;

                    // Update AI Log
                    if (studentCount > 0) {
                        let logEntry = document.createElement("li");
                        logEntry.className = "list-group-item";
                        logEntry.textContent = `📢 Attention Level: ${avgAttention}% (Detected ${studentCount} students)`;
                        aiLog.prepend(logEntry);
                    }

                    // Keep only last 5 logs
                    while (aiLog.children.length > 5) {
                        aiLog.removeChild(aiLog.lastChild);
                    }

                    requestAnimationFrame(analyzeFrame);
                });
            }
            analyzeFrame();
        });
    });
});
