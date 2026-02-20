# 🏫 AI-Powered Classroom Monitoring System

> **Kenya Science & Engineering Fair (KSEF) — Student Research Project**
> A simulation-based demonstration of real-time AI classroom monitoring for exam integrity, student behavior analysis, and engagement tracking.

---

## 🏅 Project Overview

This project was developed and presented at the **Kenya Science and Engineering Fair (KSEF)** as a student research simulation. It explores the practical implementation of an **AI-powered classroom monitoring system** designed to:

- Enhance **exam integrity** by detecting potential misconduct in real time
- Analyse **student behavior** and classroom discipline
- Track **student engagement** using computer vision and machine learning

The web application serves as a working **proof-of-concept simulator**, demonstrating how AI technology can be applied to real-world educational environments — all running entirely within a modern web browser without any backend infrastructure.

---

## 📋 Research Abstract

Traditional classroom monitoring relies heavily on human supervision, which is susceptible to **fatigue, human error, and oversight** — especially in large classrooms and examination settings. This research explores the use of **real-time object detection** (via TensorFlow.js and the COCO-SSD model) as a scalable alternative to manual monitoring.

The system simulates the detection of suspicious behaviors, tracks student attentiveness through visual cues, and measures classroom noise levels — providing educators with a unified analytical dashboard.

**The study concludes** that AI-based classroom monitoring is a promising tool for enhancing exam integrity and improving student behavior. Future research directions include scaling the system for larger institutions and incorporating **emotion recognition** to better assess student well-being and engagement.

---

## ❗ Problem Statement

Manual classroom supervision faces critical limitations:

| Challenge                    | Impact                                                     |
| ---------------------------- | ---------------------------------------------------------- |
| 👁️ Human fatigue             | Reduced vigilance over long examination periods            |
| ⚠️ Human error               | Subtle cheating behaviors and disengagement go undetected  |
| 📏 Scale limitations         | Large classrooms make comprehensive monitoring impractical |
| 📊 No data trail             | Manual monitoring generates no analyzable behavioral data  |
| 😴 Disengagement blind spots | Passive disengagement is difficult to observe and quantify |

This project demonstrates how AI can address each of these limitations with consistent, data-driven, real-time analysis.

---

## 💡 Solution & Methodology

The system uses **in-browser machine learning** to simulate the monitoring pipeline:

1. **Video input** — live webcam stream or uploaded classroom video
2. **Object detection** — TensorFlow.js + COCO-SSD model detects persons in each frame
3. **Engagement scoring** — detection confidence scores are mapped to attention levels
4. **Noise monitoring** — Web Audio API measures real-time microphone amplitude as a proxy for classroom noise
5. **Dashboard analytics** — aggregated data is displayed via charts, stat cards, and a leaderboard

> 🔬 **Note:** This is a **simulation** built for the Science Fair. All dashboard statistics (engagement %, attendance, cheating alerts) are simulated to demonstrate the intended experience of a deployed system. The camera and video detection features use a real, live AI model (COCO-SSD).

---

## ✨ System Features

| Module                     | Description                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 📊 **Dashboard**           | Overview of engagement %, attendance %, and cheating incident alerts — auto-refreshes every 5 seconds              |
| 🎥 **Live Camera Feed**    | Real-time webcam stream with AI bounding boxes, per-student attention scores, and live microphone noise monitoring |
| 📡 **AI Video Processing** | Upload a recorded classroom video for frame-by-frame AI analysis with attention and noise meters                   |
| 📈 **Statistics**          | Bar and doughnut charts comparing class engagement and noise distribution; classroom leaderboard                   |
| ⚙️ **Settings**            | Configure AI sensitivity, alert threshold, and camera resolution (persisted via `localStorage`)                    |
| 🌙 **Dark Mode**           | System-wide dark mode toggle, persisted across page reloads                                                        |

---

## 🗂️ Project Structure

```
classroomai/
├── index.html          # Dashboard — engagement, attendance & cheating stats
├── camerafeed.html     # Live webcam AI detection & noise monitoring
├── livefeed.html       # Recorded video AI analysis with overlay
├── statistics.html     # Charts & classroom leaderboard
├── settings.html       # System configuration panel
├── style.css           # Shared stylesheet — layout, sidebar, cards, dark mode
├── livefeed.css        # Supplementary styles for the live feed page
├── script.js           # Shared JS — dark mode, camera, AI model, stats simulation
└── README.md           # Research documentation (this file)
```

---

## 🛠️ Technology Stack

| Technology                    | Role                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| **HTML5 / CSS3**              | Page structure and custom design system                                                        |
| **Vanilla JavaScript (ES6+)** | Application logic and AI integration                                                           |
| **Bootstrap 5**               | Responsive grid layout and UI components                                                       |
| **Font Awesome 6**            | Navigation and UI iconography                                                                  |
| **TensorFlow.js**             | In-browser machine learning runtime                                                            |
| **COCO-SSD**                  | Pre-trained object detection model (person detection)                                          |
| **Chart.js**                  | Statistical charts (bar & doughnut)                                                            |
| **Web APIs**                  | `getUserMedia` (camera/microphone), `AudioContext` (noise analysis), `localStorage` (settings) |

---

## 🤖 AI Model Details

| Property              | Value                                                                |
| --------------------- | -------------------------------------------------------------------- |
| **Model**             | COCO-SSD (Common Objects in Context — Single Shot MultiBox Detector) |
| **Runtime**           | TensorFlow.js (fully browser-based, no server)                       |
| **Detection Target**  | `person` class                                                       |
| **Engagement Metric** | Detection confidence score (0–100%)                                  |
| **Inference loop**    | `requestAnimationFrame` (per-frame, real-time)                       |
| **Noise Analysis**    | `AudioContext` + `AnalyserNode` FFT frequency data                   |

> The AI model runs **entirely on the user's device**. No video, audio, or biometric data is ever transmitted to a remote server.

---

## 🚀 Running the Project

### Requirements

- A modern web browser (Google Chrome recommended)
- A local web server such as **Laragon**, XAMPP, or Python's `http.server`
- A webcam and microphone (for camera feed and noise monitoring features)

### Steps

1. Place the project folder in your web server's root directory (e.g., `C:\laragon\www\classroomai`)

2. Start your local server and navigate to:

   ```
   http://classroomai.test       ← Laragon virtual host
   http://localhost/classroomai  ← standard localhost
   ```

3. Open `index.html` to start at the dashboard.

> ⚠️ **Camera Features Require `localhost` or `HTTPS`** — Browsers block camera/microphone access on plain `http://` for security reasons. A local server (Laragon, Live Server, etc.) is sufficient.

---

## 🔬 Research Conclusions

The project demonstrates that:

1. **AI-based monitoring is feasible in-browser** — TensorFlow.js makes it possible to run object detection in real time without dedicated hardware or a server.
2. **Consistency beats manual supervision** — an AI system does not tire, lose focus, or make emotional judgments, making it more reliable for long exam sessions.
3. **Engagement can be quantified** — by mapping detection confidence and presence data to attention scores, the system creates an objective metric for student engagement.
4. **Scalability is achievable** — the same architecture can be extended to multi-camera setups with server-side aggregation for institution-wide analytics.

---

## 🔭 Future Research Directions

- [ ] **Emotion recognition** — integrate facial expression analysis to assess student well-being beyond attention
- [ ] **Backend & database integration** — store behavioral data over time for longitudinal trend analysis
- [ ] **Multi-camera scaling** — support institution-wide monitoring across many rooms simultaneously
- [ ] **Alert system** — real-time notifications (email/SMS) to supervisors for detected misconduct
- [ ] **Facial recognition** — individual student tracking for granular attendance and engagement data
- [ ] **Edge deployment** — run the model on Raspberry Pi or Jetson Nano for offline, low-cost classroom setups
- [ ] **Report generation** — export per-session analytics to PDF or CSV for teacher review

---

## 🔒 Privacy & Ethics Statement

This simulation was developed with student privacy as a core consideration:

- ✅ All AI processing runs **locally in the browser** — no data leaves the device
- ✅ No student images, video, or biometric data is stored or transmitted
- ✅ Deployed systems would require **informed consent** from students, parents, and institutions
- ✅ Sensitivity settings allow institutions to control detection aggressiveness

Responsible deployment of AI monitoring tools requires appropriate institutional policy, transparency, and regulatory compliance.

---

## 👨‍🔬 Project Information

| Field        | Details                                   |
| ------------ | ----------------------------------------- |
| **Event**    | Kenya Science and Engineering Fair (KSEF) |
| **Category** | Computer Science / Engineering            |
| **Year**     | 2025                                      |
| **Type**     | Simulation / Proof-of-Concept             |
| **Level**    | Student Research Project                  |

---

© 2026 Classroom AI Analysis — Kenya Science and Engineering Fair Submission. All rights reserved.
