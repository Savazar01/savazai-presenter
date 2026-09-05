# DevPlan 009: Loom-Style Floating PiP Recorder, Native 1:1 Capture Scaling, and Real MediaPipe Segmentation

## 1. Architectural Overview & Context
MotionStudio required a complete overhaul to eliminate aspect ratio distortion, replace black letterbox voids with native edge-to-edge capture filling, integrate real-time MediaPipe selfie segmentation for true virtual backgrounds, and implement a Loom-style "Record & Navigate" workflow.

## 2. Core Remediation Components
1. **MediaPipe Selfie Segmentation Integration**:
   - Integrated @mediapipe/selfie_segmentation directly inside ProcessedWebcamPipeline.ts.
   - Generates confidence masks for presenter extraction, rendering realistic backgrounds (Modern Office, Neon Studio, Sunset Scenic, Bokeh Blur, Custom Image).
   - Removed all dummy/placeholder text ("WEBCAM") from recording buffers; guarantees real camera pixels.
2. **Native 1:1 Aspect Ratio Edge-to-Edge Compositor**:
   - VideoRecorder.ts and ThreeSceneManager.ts dynamically inspect incoming track dimensions and scale edge-to-edge.
   - Three.js VideoTexture uses LinearFilter and disabled mipmaps for razor-sharp text reproduction.
3. **Dual-Surface "Record & Navigate" Paradigm**:
   - In App.tsx and RecordingBoothOverlay.tsx, a 5-second countdown provides clear instructions to switch to the presenter's demo tab.
   - Floating draggable transport pill allows pausing, restarting, toggling mic/camera, and finishing with direct routing into the Video Editor.
   - Studio viewport automatically collapses panels during recording.

## 3. Verification & Mandatory Delivery Protocol
- **TypeScript Type Check**: 
px tsc --noEmit — Exit code 0 (Clean).
- **Production Bundle Check**: 
pm run build — Compiled cleanly to /dist in 8.21s.
- **Automated Docker Deployment**: docker compose up --build -d — Container motionstudio-app recreated and started.
- **Port 9090 Health Check**: curl.exe -I http://localhost:9090 — Returned HTTP/1.1 200 OK.
- **Knowledge Graph Sync**: graphify update . — 347 nodes, 620 edges, 24 communities updated.
