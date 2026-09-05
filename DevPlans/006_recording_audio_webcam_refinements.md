# DevPlan 006: Recording Booth, Web Audio DSP, and Webcam Overhaul

## 1. Overview & Objectives
This iteration implements a major overhaul across recording workflows, audio clarity, virtual backgrounds, and webcam compositing:
- **1:1 Center Crop & Oval Distortion Fix**: Mathematical center cropping (`minDim = Math.min(vw, vh)`, `sx = (vw - minDim) / 2`, `sy = (vh - minDim) / 2`) across 2D viewport, Three.js spatial canvas, and MediaRecorder composite offscreen renderer.
- **Virtual Background Pipeline (`WebcamProcessor.ts`)**: Real-time bokeh blur presets (Low, Medium, High), procedural studio backdrops (Modern Office, Neon Studio, Sunset Scenic), and custom JPG/PNG uploads.
- **Full-Screen Recording Booth (`RecordingBoothOverlay.tsx`)**: 5-second countdown overlay with visual pulsating rings, plus floating draggable transport control pill with live REC timer, live VU meter, pause/resume, restart, and "Finish & Open in Video Editor" auto-routing.
- **Studio-Grade Web Audio Graph (`CaptureEngine.ts`)**: 80Hz Biquad highpass filter for rumble/plosive elimination, DynamicsCompressorNode for broadcast speech leveling, and smooth logarithmic volume ramping.
- **Frameless 16:9 Canvas Staging**: Edge-to-edge clean direct framing mode with 3D camera controls and dynamic lighting.

---

## 2. File Modifications & New Modules
- `src/types/index.ts`: Added `VirtualBgType`, `WebcamBackgroundConfig`, `RecordingBoothState`, and `'frameless'` device format.
- `src/core/capture/WebcamProcessor.ts`: Created new real-time 1:1 webcam frame processor with virtual background shading, bokeh blurs, procedural studio gradients, and custom image uploads.
- `src/core/capture/CaptureEngine.ts`: Implemented 80Hz highpass filter, dynamics compressor, smooth gain ramping, and `getMicVULevel()`.
- `src/core/exporters/VideoRecorder.ts`: Integrated 1:1 square crop math, `WebcamProcessor` canvas rendering, and pause/resume stream management.
- `src/core/scene/ThreeSceneManager.ts`: Added support for `'frameless'` clean 16:9 canvas geometry.
- `src/components/RecordingBoothOverlay.tsx`: Created 5-second animated countdown and draggable floating glass control pill with live VU meter.
- `src/components/CaptureControls.tsx`: Added Virtual Background picker, custom image upload input, and audio DSP indicators.
- `src/components/StudioCanvas.tsx`: Added processed canvas support and guaranteed 1:1 aspect-ratio avatar rendering.
- `src/components/DeviceControls.tsx` & `src/components/VideoEditorPanel.tsx`: Added frameless canvas selector.
- `src/App.tsx`: Coordinated recording booth lifecycle, countdowns, webcam processor lifecycle, and automatic transition to Video Editor mode on recording stop.

---

## 3. Protocol Verification Results
- **TypeScript Typecheck (`npx tsc --noEmit`)**: Exit Code 0 (Clean, 0 errors).
- **Production Build (`npm run build`)**: Compiled successfully in 12.59s to `/dist`.
- **Docker Rebuild (`docker compose up --build -d`)**: Container `savazai-presenter-motionstudio` built and `motionstudio-app` recreated & started.
- **Port 9090 Healthcheck**: `curl.exe -I http://localhost:9090` returned `HTTP/1.1 200 OK`.
- **Knowledge Graph Sync**: `graphify update .` completed with 312 nodes and 555 edges.
