# 014: Restore Entire Screen Capture, Zero-Click Document PiP Activation & Segmentation Stabilization

## Objective
Permanently resolve three critical architectural flaws:
1. **Restored Full Screen Capture**: Completely removed `monitorTypeSurfaces: 'exclude'` and restrictive surface filters so browser displays "Entire Screen", "Window", and "Chrome Tab".
2. **Zero-Click Synchronous Document PiP Triggering**: Spawns Document PiP synchronously directly on user click of `RECORD STUDIO` before the 5-second countdown to preserve the browser gesture token.
3. **Rock-Solid MediaPipe Segmentation**: Downscaled segmentation model to 256x256 (`modelSelection: 0`), added persistent mask retention with bilateral temporal smoothing, and implemented 2-layer `source-in` subject compositing over background textures.

---

## Changes Implemented

### 1. Capture Engine (`src/core/capture/CaptureEngine.ts`)
- Restored unconstrained `getDisplayMedia` with `displaySurface: 'monitor'`, capturing 4K 60fps with system audio.
- Removed all surface-exclusion filters (`monitorTypeSurfaces: 'exclude'`, etc.).

### 2. Studio Canvas (`src/components/StudioCanvas.tsx`)
- Removed top anti-tunnel banner and clutter.

### 3. MediaPipe & Webcam Pipeline (`src/core/capture/ProcessedWebcamPipeline.ts`)
- Downscaled inference to 256x256 (`modelSelection: 0`) for 60fps inference.
- Implemented `persistentMaskCanvas` retaining previous segmentation weights on dropped frames.
- Implemented true 2-layer composite: Layer 0 background texture -> Layer 1 `source-in` subject cutout.

### 4. Document PiP Manager & Controller (`src/core/capture/DocumentPipManager.ts`, `src/App.tsx`, `src/components/RecordingBoothOverlay.tsx`)
- Triggered `documentPipManager.open(...)` synchronously in the click handler before asynchronous audio setup and countdown.
- Document PiP state updated with countdown numbers and live recording indicators.
- Added collapsible/expandable draggable sticky pill for fallback in-page control.

---

## Verification & Deployment
- TypeScript Check: `npx tsc --noEmit` returned exit code 0.
- Production Build: `npm run build` compiled cleanly.
- Docker Deployment: `docker compose up --build -d` recreated and started `motionstudio-app`.
- Port Health Probe: `curl.exe -I http://localhost:9090` returned `HTTP/1.1 200 OK`.
- Knowledge Graph Sync: `graphify update .` completed successfully (387 nodes, 671 edges).
