# DevPlan 008: Native Resolution Dynamic Aspect-Ratio, True Live Recording Switcher & Working Virtual Background Pipeline

## 1. Objectives & Overview
This plan resolves all remaining architectural breakdowns:
- **True Webcam Canvas Stamping**: Completely removed the fallback `"WEBCAM"` text placeholder. Connected `ProcessedWebcamPipeline` directly to the active `MediaStream` from `CaptureEngine` using an internal dedicated `HTMLVideoElement`, guaranteeing live camera pixels are continuously stamped onto the 1080p MediaRecorder canvas.
- **Real-Time Virtual Background Segmentation (`@mediapipe/selfie_segmentation`)**: Integrated MediaPipe Selfie Segmentation into `ProcessedWebcamPipeline.ts`. The presenter's body is segmented and composited cleanly over virtual backgrounds (Modern Slate Office, Cyber Neon Studio, Sunset Scenic, Bokeh Blur, Custom Upload).
- **Native Resolution & Zero Letterboxing**: In `VideoRecorder.ts` and `ThreeSceneManager.ts`, the display video stream is rendered edge-to-edge at 100% native resolution for `frameless` and `2d-direct` modes, eliminating letterbox bars and text squishing.
- **Interactive Presenter Recording Switcher**: Integrated countdown notifications and presenter guidance in `RecordingBoothOverlay.tsx`, allowing presenters to switch to their target application while MotionStudio records at 60 FPS in the background.

---

## 2. File Deliverables & Key Changes
- [`src/core/capture/ProcessedWebcamPipeline.ts`](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/core/capture/ProcessedWebcamPipeline.ts): Integrated `@mediapipe/selfie_segmentation`, dedicated internal `HTMLVideoElement`, real-time subject masking, and synchronous 1:1 camera stamping.
- [`src/core/exporters/VideoRecorder.ts`](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/core/exporters/VideoRecorder.ts): Added direct display video edge-to-edge compositing for native aspect ratios and zero letterbox bars.
- [`src/core/scene/ThreeSceneManager.ts`](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/core/scene/ThreeSceneManager.ts): Adjusted camera frustum distance for `frameless` 16:9 canvas to fill the viewport seamlessly.
- [`src/components/RecordingBoothOverlay.tsx`](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/components/RecordingBoothOverlay.tsx): Added presenter countdown guidance for switching to the demo tab during background capture.
- [`src/App.tsx`](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/App.tsx): Connected webcam stream directly to `ProcessedWebcamPipeline` and synced display video references with `VideoRecorder`.

---

## 3. Protocol Verification Results
- **TypeScript Typecheck (`npx tsc --noEmit`)**: Exit Code 0 (0 errors).
- **Vite Production Build (`npm run build`)**: Compiled successfully in 8.23s.
- **Docker Container Rebuild (`docker compose up --build -d`)**: Container `savazai-presenter-motionstudio` built and `motionstudio-app` recreated & started.
- **Port 9090 Health Probe**: `curl.exe -I http://localhost:9090` returned `HTTP/1.1 200 OK`.
- **Knowledge Graph Sync**: `graphify update .` completed with 342 nodes and 613 edges.
