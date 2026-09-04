# 002 - Implementation Plan: MotionStudio Visual Showcase & Publishing Platform

**Date:** 2026-09-04
**Author / Initiator:** Principal Full-Stack & Graphics Systems Engineer
**Status:** Approved by Lead Architect

---

## 1. Executive Summary & Core Objectives
MotionStudio is an open-source, local-first visual showcase and recording studio combining high-resolution screen capture, PiP webcam mixing, realistic 3D device staging (MacBook Pro, iPhone 16 Pro, Floating Glassmorphism Browser), timeline-driven motion choreography via Anime.js, and client-side multi-surface publishing (WebM/MP4 Video, Interactive Slide Presentation, High-Res 1920x1080 PDF Decks, and valid EPUB3 e-Books).

## 2. Strict Environment & Governance Constraints
- **Docker-First Port 9090**: Strictly served on port `9090` across Vite dev, preview, and Docker container.
- **Client-Side & Local-First**: No paid external APIs; 100% in-browser WebGL, Web Audio, WebCodecs/MediaRecorder, jsPDF, and JSZip.
- **Remote Repository**: Initialized with `https://github.com/Savazar01/savazai-presenter`.
- **Chronological DevPlans Archive**: All prompts, plans, and walkthroughs versioned in `/DevPlans/`.
- **Agent Governance**: `AGENTS.md` and `CLAUDE.md` defining rules, local-first mandates, memory management, and skills (Shadcn, Playwright, Graphify, Cloudflare security).

## 3. Architecture Specification

### Module 1: Media Ingestion & Web Audio Engine (`src/core/capture/CaptureEngine.ts`)
- Screen / Window / Tab capture up to 4K 60fps via `navigator.mediaDevices.getDisplayMedia`.
- Webcam stream with circular crop and draggable positioning.
- Real-time dual audio mixing graph (`AudioContext` with display audio source, microphone source, `GainNode` volume controllers, and `AnalyserNode` frequency/time-domain visualizer).

### Module 2: 3D Spatial Canvas Engine (`src/core/scene/ThreeSceneManager.ts`)
- Procedural PBR 3D models with customizable metallic finishes (Space Black, Silver, Natural Titanium):
  1. MacBook Pro (bezel, keyboard tray, trackpad, screen mesh).
  2. iPhone 16 Pro (curved titanium edge, Dynamic Island cutout, OLED display).
  3. Floating Glass Browser (glassmorphic translucent panel, window controls, address bar).
- Dynamic `THREE.VideoTexture` binding with zero-latency drift and dynamic UV aspect ratio calculation.
- Studio lighting rig (key, fill, rim lights) with soft contact shadow plane and programmatic camera choreography.

### Module 3: Anime.js v4 Unified Motion Choreography (`src/core/motion/TimelineController.ts`)
- Master Anime.js timeline orchestrating Three.js camera/mesh transforms alongside 2D DOM/SVG kinematics.
- Kinetic split typography, spring easings, cursor pulse animations, and SVG morphs.
- Scrubbable UI timeline bar with timecodes and cue points.

### Module 4: Multi-Surface Publishing Hub (`src/core/exporters/`)
- **Video Pipeline (`VideoRecorder.ts`)**: Frame-accurate deterministic rendering loop driving Anime.js step-by-step into MediaRecorder/WebCodecs.
- **Interactive Slide Deck (`PresentationMode.tsx`)**: Fullscreen slide player with keyboard cue stepping (`Space`, `ArrowRight`, `ArrowLeft`).
- **PDF Exporter (`DocumentExporters.ts`)**: Multi-page 1920x1080 landscape deck using `jsPDF` and `html2canvas-pro`.
- **EPUB3 Publisher (`DocumentExporters.ts`)**: Standards-compliant EPUB3 container generator with `JSZip`, `container.xml`, `content.opf`, `toc.xhtml`, `toc.ncx`, and styled slide chapters.

## 4. Deliverables Checklist
- [x] Git Remote Configuration (`https://github.com/Savazar01/savazai-presenter`)
- [x] Chronological DevPlans Directory & Archiving
- [x] `AGENTS.md` and `CLAUDE.md` with full governance & skills
- [ ] Multi-stage `Dockerfile` and `docker-compose.yml` on port 9090
- [ ] `package.json`, `vite.config.ts`, Tailwind & TypeScript configs
- [ ] `src/core/capture/CaptureEngine.ts`
- [ ] `src/core/scene/ThreeSceneManager.ts`
- [ ] `src/core/motion/TimelineController.ts`
- [ ] `src/core/exporters/DocumentExporters.ts` & `VideoRecorder.ts`
- [ ] `src/App.tsx` & all UI studio components
- [ ] `npx tsc --noEmit` & `npm run build` verification
- [ ] `DevPlans/003_walkthrough_motionstudio.md` and walkthrough artifact
