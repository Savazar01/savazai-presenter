# MotionStudio
> **Next-Gen Local-First 3D Screen Recording & Motion Graphics Studio**  
> *Part of the SavazAI Presentation Suite by Savazar*

[![React](https://img.shields.io/badge/React-18-61dafb.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000.svg?style=flat-square&logo=three.js)](https://threejs.org/)
[![Docker Port](https://img.shields.io/badge/Docker-Port%209090-2496ed.svg?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## Overview

**MotionStudio** is an advanced, local-first interactive screen recording, spatial staging, and video editing platform engineered for **Savazar**. It empowers creators and developers to capture high-framerate desktop demonstrations, stage them within interactive 3D/2D device mockups, apply motion graphics and zoom keyframing, and export deterministic, high-definition presentation media—completely offline and client-side.

Everything runs 100% locally in the browser with zero cloud dependencies and zero data egress, providing maximum performance, security, and data privacy.

---

## Key Capabilities

- **Interactive Capture Calibration**: Pre-recording setup modal featuring live camera bubble previews, 4-corner placement snapping, squircle/circle/square geometry selectors, audio VU meters, and unconstrained display surface capture (Entire Screen, Window, Tab).
- **Streamlined Recording Controller**: High-contrast, minimal top-center transport pill with real-time elapsed timecards, single-controller enforcement with Document Picture-in-Picture (PiP), and global `Alt+D` finish hotkey.
- **3D & 2D Spatial Staging**: Real-time canvas compositing inside custom device mockups (Frameless Clean, MacBook Pro, Windows PC Desktop, Mobile) running on an optimized Three.js WebGL engine.
- **Multi-Track Motion Suite**: Layered visual timeline featuring dedicated tracks for raw screen capture, zoom fragments, and kinetic typography callouts with precision scrubber controls.
- **Studio-Grade Web Audio Graph**: Hardware-prioritized microphone input paired with live VU level analysis, 80Hz rumble filtering, and dynamics normalization.
- **Local-First Project Store**: Client-side project persistence powered by IndexedDB for local project saving, loading, renaming, and metadata management without cloud dependencies.
- **Multi-Surface Publishing**: Deterministic 60 FPS video composite export (MP4 / WebM), interactive PDF presentation slide decks, and EPUB3 digital documents.

---

## Tech Stack

- **Frontend / Application Core**: React 18, Vite, TypeScript
- **Spatial 3D Engine**: Three.js (PBR materials, custom UV mapping, WebGL)
- **Kinematic Animation**: Anime.js v4
- **Media Pipeline**: WebCodecs, MediaStream / Display Capture API, Web Audio API DSP
- **AI & Segmentation**: MediaPipe Selfie Segmentation with Exponential Moving Average (EMA) alpha smoothing
- **Local Persistence**: IndexedDB (Native schema)
- **Runtime Environment**: Docker Desktop (Containerized on Port 9090)

---

## Quickstart & Local Deployment

### 1. Run Containerized on Port 9090 (Recommended)
```bash
# Build and start container in detached mode
docker compose up --build -d

# Access MotionStudio in browser
http://localhost:9090
```

### 2. Run Locally for Development
```bash
# Install dependencies
npm install

# Start Vite dev server on port 9090
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Build production bundle
npm run build

# Preview production build on port 9090
npm run preview
```

---

## Repository Structure

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

## Security & Privacy
- **100% Client-Side**: No cloud upload, no telemetry, no tracking.
- **Cross-Origin Isolation**: Protected with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` headers.
- **Sanitized Bundles**: Strict Content Security Policies in exported presentation containers.

---

## License
Proprietary Savazar / SavazAI Presentation Suite ecosystem initiative. Licensed under the [MIT License](LICENSE).
