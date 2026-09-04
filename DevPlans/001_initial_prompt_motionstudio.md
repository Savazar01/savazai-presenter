# 001 - Initial Prompt: MotionStudio Visual Showcase Platform

**Date:** 2026-09-04
**Author / Initiator:** Lead Architect
**Status:** Approved for Implementation

---

## User Prompt

```text
Act as the Principal Full-Stack Engineer and Graphics Systems Developer. I am the Lead Architect. Your objective is to build and deliver the complete, production-grade, local-first codebase for "MotionStudio" — an open-source visual showcase platform merging screen capture, 3D device staging, timeline-driven motion choreography, and multi-surface publishing (Video, Slides, PDFs, and e-Books).

Review the reference architectures thoroughly before generating code:
1. OpenVid (https://github.com/CristianOlivera1/openvid) for client-side stream recording, PiP webcam mixing, and 3D device canvas compositing.
2. Anime.js v4 (https://github.com/juliangarnier/anime) for timeline orchestration, spring kinematics, SVG path morphing, split typography, and its official Three.js adapter (`animejs/adapters/three`).

================================================================================
STRICT RUNTIME & ENVIRONMENT CONSTRAINTS
================================================================================
1. Local Docker-First: The application must be fully containerized using a clean, multi-stage Dockerfile and docker-compose.yml ready to run on local Docker Desktop.
2. Custom Port Binding: The app MUST be exposed and served strictly on port 9090 (both within Docker and local preview scripts).
3. Local-First & Client-Side: Zero reliance on external paid rendering APIs. All frame captures, Three.js spatial scenes, Web Audio mixing, PDF generation, and EPUB packaging must occur client-side in the browser.
4. Framework & Tooling: Vite + React 18+ (or Next.js App Router), TypeScript (strict mode), Three.js, Anime.js v4, Tailwind CSS, jsPDF, html2canvas-pro, and JSZip.

================================================================================
DETAILED FEATURE SCOPE TO IMPLEMENT
================================================================================

MODULE 1: Media Ingestion & Audio Mixing
- Capture screen/window/tab up to 4K 60fps via navigator.mediaDevices.getDisplayMedia.
- Picture-in-picture webcam stream (getUserMedia) with circular crop and draggable positioning.
- Real-time dual audio mixing via Web Audio API (display/tab audio + microphone input).

MODULE 2: 3D Spatial Canvas Engine (Three.js)
- Responsive 3D device frames: MacBook Pro, iPhone 16 Pro, and a minimalist floating browser chrome with dark/light glassmorphism.
- Live texture binding: Stream video directly onto device screens using THREE.VideoTexture with zero latency drift.
- Camera choreography: Smooth rotational pitch/yaw/roll, isometric tilts, and focal depth changes driven programmatically.
- Studio lighting, soft contact shadows, and realistic PBR metallic materials.

MODULE 3: Unified Motion Choreography (Anime.js v4)
- Register and utilize the Anime.js Three.js adapter to animate camera FOV/position and device mesh rotations directly from a single master timeline.
- 2D DOM/SVG orchestration: Synchronized cursor clicks, SVG path morphing (morphTo), spring easings (createSpring), and staggered kinetic typography (splitText).
- Scrubbable UI timeline bar allowing frame-accurate seeking and step-by-step cue triggering.

MODULE 4: Multi-Surface Publishing Hub
1. Video Pipeline: Frame-accurate offscreen canvas render pump using WebCodecs / MediaRecorder for MP4 (H.264) and WebM export.
2. Interactive Slide Deck: Fullscreen presentation mode with keyboard step navigation (Space / Arrow keys) binding timeline cue points to slides.
3. PDF Exporter: Multi-page vector + high-res raster slide export using jsPDF and html2canvas-pro at 1920x1080 landscape resolution.
4. e-Book Publisher: Valid EPUB3 container generator using JSZip containing rendered chapter slides, embedded high-res imagery, and structured metadata.

================================================================================
YOUR DELIVERABLES REQUIRED NOW
================================================================================
Please output the complete, production-ready codebase without placeholders:
1. Docker Configuration:
   - Complete `Dockerfile` (optimized multi-stage build, serving on port 9090).
   - Complete `docker-compose.yml` mapped to `9090:9090`.
2. Project Configuration:
   - `package.json` with all verified dependencies locked.
   - `vite.config.ts` configured for port 9090 and cross-origin isolation (needed for SharedArrayBuffer / WebCodecs if applicable).
3. Complete Implementation Files:
   - `src/core/capture/CaptureEngine.ts`: Display capture, webcam PiP, and Web Audio mixing graph.
   - `src/core/scene/ThreeSceneManager.ts`: Device mesh construction, lighting, and THREE.VideoTexture pipeline.
   - `src/core/motion/TimelineController.ts`: Anime.js v4 master choreo synchronizing Three.js spatial coordinates with 2D DOM text and overlays.
   - `src/core/exporters/DocumentExporters.ts`: Production functions for `exportDeckToPdf` and `exportToEpub`.
   - `src/App.tsx` & `src/components/StudioCanvas.tsx`: Primary UI connecting the capture stream, 3D viewport, scrubbable timeline, and multi-surface export modal.

1. I want you to store the 'Prompt' (which I provided), "Implemenation Plan' and Walkthrough all in a Single folder so that I can view all the files as per chronlogical order....so let's only have one main folder name 'DevPlans'...we shoud store every prompt, implemenation plan and Walkthrough file with unique names with appropriate tags.

Can you please make the update above...also add this as a rule in the AGENTS.md so that we can ensure everything is saved.
2. We will be using the Github repo "https://github.com/Savazar01/savazai-presenter", so let's make sure we have initialized this so that we can start sending updates.
3. Please add Shadcn, Playwright, Graphify,  Cloudflare security skills to our stack and also ensure you are updating the Agents.md file with all the rules to follow. The Claude.md file should contain @ so that it is referencing and pointing to Agents.md.
```
