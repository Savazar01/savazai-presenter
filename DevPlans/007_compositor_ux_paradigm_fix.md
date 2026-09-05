# DevPlan 007: Unified Compositor, Interactive Recording Paradigm & Streamlined UX Overhaul

## 1. Objectives & Overview
This plan implements the complete architectural overhaul to eliminate empty webcam renders, unify real-time frame stamping with virtual backgrounds, support live interactive screen recording, remove clutter from the canvas viewport, and streamline UI controls into compact dropdown pickers:
- **Unified Webcam Pipeline (`ProcessedWebcamPipeline.ts`)**: Single source of truth for 1:1 mathematical center-cropping and virtual background rendering (None, Bokeh Blur, Modern Office, Neon Studio, Sunset Scenic, Custom Image).
- **Guaranteed Avatar Stamping**: Direct synchronous invocation via `pipeline.renderAvatarToContext(ctx, x, y, size, pipConfig)` during composite rendering in `VideoRecorder.ts` and viewport canvas, with high-fidelity fallback to ensure avatars are never rendered as empty black voids.
- **Canvas Clutter Removal**: Removed kinetic placeholder text ("Introducing MotionStudio", "PRO FEATURE") from `StudioCanvas.tsx` to provide a clean edge-to-edge view of the live screen capture.
- **Streamlined UI Rails**: Refactored `DeviceControls.tsx` and `CaptureControls.tsx` with compact select dropdowns, color swatch previews, and segmented pills.
- **Automated Microphone & Pause Sync**: Auto-initialization of microphone capture on recording start and track muting on pause.

---

## 2. File Changes & Deliverables
- [`src/core/capture/ProcessedWebcamPipeline.ts`](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/core/capture/ProcessedWebcamPipeline.ts): Created unified webcam processor with direct canvas stamping, virtual backdrops, and fail-safe rendering.
- [`src/core/exporters/VideoRecorder.ts`](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/core/exporters/VideoRecorder.ts): Integrated `ProcessedWebcamPipeline.renderAvatarToContext` and audio track muting on pause.
- [`src/components/StudioCanvas.tsx`](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/components/StudioCanvas.tsx): Removed text overlays and kinetic clutter.
- [`src/components/DeviceControls.tsx`](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/components/DeviceControls.tsx): Replaced list with compact Select Dropdowns for Device Format, Chassis Finish, and Camera Angle.
- [`src/components/CaptureControls.tsx`](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/components/CaptureControls.tsx): Replaced list with compact Select Dropdown for Virtual Backgrounds and Segmented Pills for Avatar Shape.
- [`src/App.tsx`](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/App.tsx): Integrated `ProcessedWebcamPipeline`, automated microphone acquisition, and auto-routing to Video Editor upon recording finish.

---

## 3. Protocol Verification Results
- **TypeScript Compilation (`npx tsc --noEmit`)**: Exit Code 0 (0 errors).
- **Vite Production Build (`npm run build`)**: Compiled successfully in 8.11s.
- **Docker Deployment (`docker compose up --build -d`)**: Container `savazai-presenter-motionstudio` built and `motionstudio-app` recreated & active.
- **Port 9090 Health Probe**: `curl.exe -I http://localhost:9090` returned `HTTP/1.1 200 OK`.
- **Knowledge Graph Sync**: `graphify update .` completed with 329 nodes and 587 edges.
