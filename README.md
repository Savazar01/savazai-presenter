# MotionStudio

> **Next-Gen Local-First 3D Screen Recording & Motion Graphics Studio**

[![React](https://img.shields.io/badge/React-18-61dafb.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000.svg?style=flat-square&logo=three.js)](https://threejs.org/)
[![Docker Port](https://img.shields.io/badge/Docker-Port%209090-2496ed.svg?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 🌟 Overview

**MotionStudio** is an open-source, 100% local-first web recording and motion staging suite inspired by OpenVid. It transforms raw screen captures and video recordings into interactive 3D presentations and cinematic product walkthroughs directly in the browser—with zero cloud dependencies and zero data egress.

Everything from screen capture, MediaPipe segmentation, 3D WebGL device mockup compositing, Web Audio graph mixing, to multi-surface rendering (WebM/MP4, PDF decks, EPUB3 containers) executes purely client-side on your local machine.

---

## 🚀 Key Features

### 🎙️ 1. Interactive Capture Setup
- **Pre-Recording Modal Workflow**: Configure cameras, physical microphones, placement presets, and custom bubble shapes before recording.
- **Dynamic Avatar Shapes**: Support for `Squircle`, `Circle`, and `Square` avatar webcam bubbles with horizontal mirroring.
- **Live Hardware Calibration**: Visual VU level audio meter and physical microphone prioritization over virtual DSP utilities.
- **Unconstrained Display Sharing**: Native support for **Entire Screen**, **Application Window**, or individual **Browser Tabs**.
- **Document Picture-in-Picture (PiP)**: External OS floating transport controller with live timer, VU meter, pause/resume, mic mute, and `Alt+D` global stop hotkey.

### 🎨 2. Studio Editor Suite
- **9-Tool Modular Left Rail**:
  1. `Background`: Mesh gradients, solid studio themes, wallpapers, blur, and custom padding.
  2. `Mockup`: 3D Apple MacBook Pro, iPhone, iMac, Windows PC, and Frameless Clean staging.
  3. `Motion`: Cinematic spring physics, yaw/pitch rotation, camera focal zoom, and Anime.js timeline seeking.
  4. `Zoom`: Dynamic keyframe zoom fragments with cubic-bezier easing and focus-point targeting.
  5. `Video`: Speed multiplier (0.5x – 2.0x), volume trimming, loop controls, and replacement.
  6. `Elements`: Kinetic callout annotations, badges, and highlighted text overlays.
  7. `Audio`: Live Web Audio gain staging, mic gain, and system audio normalization.
  8. `Record`: Instant recording booth launch with setup modal trigger.
  9. `Upload`: Direct ingestion of external MP4, WebM, and MOV video assets.

### 🎞️ 3. Multi-Track Timeline & Ingestion
- **Layered Tracks**: Video track, Zoom Fragment track, and Kinetic Callout track.
- **Precision Scrubbing**: Frame-accurate playhead seeking, split/trim handles, and speed playback rates.
- **In-Memory Mounting & Dual-Backup**: Captured videos are automatically downloaded to disk as a safety backup and immediately mounted into the studio stage and timeline.

### 💾 4. Local-First Project Management
- **IndexedDB Persistence**: Offline database saving project states, timeline cues, camera configurations, and video blobs without cloud servers.
- **Project Modal**: Switch projects, rename recordings, create new clean projects, and manage local storage.

### 📦 5. Multi-Surface Publishing Exporters
- **Video Exporter**: Deterministic offline render loop pumping 60 FPS WebGL frames into `MediaRecorder`.
- **Interactive Slide Presentation**: Keyboard cue-point stepping (`Space`, `ArrowRight`, `ArrowLeft`) with speaker notes.
- **PDF Slide Deck**: 1920x1080 landscape slide decks generated via `jsPDF` and `html2canvas-pro`.
- **EPUB3 Publisher**: W3C compliant EPUB3 reflowable/fixed container packager via `JSZip`.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Core Framework** | React 18, TypeScript 5.5, Vite 6.0 |
| **Styling & UI** | Tailwind CSS, Lucide React, Glassmorphism Design System |
| **3D & Graphics** | Three.js (WebGL), Canvas 2D Composite Pipeline, Anime.js |
| **AI / Segmentation** | Google MediaPipe Selfie Segmentation, Exponential Moving Average (EMA) |
| **Audio Engine** | Web Audio API (GainNodes, MediaStreamDestination, AnalyserNode) |
| **Persistence** | IndexedDB (Local Project Management) |
| **Containerization** | Docker, Docker Compose, Alpine Node.js Runner (Port 9090) |

---

## ⚡ Quickstart & Development

### Running with Docker (Recommended)
MotionStudio is pre-configured to run strictly on **Port 9090**:

```bash
# Build and start container in detached mode
docker compose up --build -d

# Open in browser
http://localhost:9090
```

### Running Natively
Ensure you have **Node.js 20+** installed:

```bash
# 1. Install dependencies
npm install

# 2. Start Vite dev server on port 9090
npm run dev

# 3. Build production bundle
npm run build

# 4. Preview production build on port 9090
npm run preview
```

---

## 📁 Repository Structure

```text
├── src/
│   ├── components/
│   │   ├── setup/               # Pre-recording modal & floating transport pill
│   │   ├── studio/              # MultiTrackTimeline, LeftToolRail, LayersPanel
│   │   ├── StudioCanvas.tsx     # 2D/3D Mockup viewport & webcam overlay
│   │   ├── ProjectModal.tsx     # IndexedDB Project CRUD modal
│   │   └── ExportModal.tsx      # Video, PDF, and EPUB3 exporter dialog
│   ├── core/
│   │   ├── capture/             # CaptureEngine, ProcessedWebcamPipeline, DocumentPipManager
│   │   ├── exporters/           # VideoRecorder, PDF/EPUB3 publishers
│   │   ├── projects/            # ProjectManager IndexedDB engine
│   │   ├── scene/               # ThreeSceneManager (WebGL 3D devices & lighting)
│   │   └── timeline/            # TimelineController & Anime.js sequencing
│   ├── types/                   # Unified TypeScript interfaces
│   └── App.tsx                  # Root state orchestration & layout coordinator
├── DevPlans/                    # Chronological engineering plans and walk-throughs
├── Dockerfile                   # Multi-stage production container manifest
├── docker-compose.yml           # Port 9090 host port mapping
└── ARCHITECTURE.md              # In-depth architectural blueprint and data flow
```

---

## 🔒 Security & Privacy
- **Zero Cloud Egress**: Video and audio recordings never leave your machine.
- **Cross-Origin Isolation**: Protected with `COOP: same-origin` and `COEP: credentialless` headers for high-performance memory buffers.
- **Strict Content Security**: All exported documents and HTML bundles are sanitized against XSS.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
