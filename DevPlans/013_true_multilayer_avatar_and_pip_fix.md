# DevPlan 013 — True Multi-Layer Avatar Compositing, Automatic Document PiP Activation, and Curated Background Dropdown

## 1. Problem Statement & Root Cause
1. **Manual PiP Launch Bug**: Previously, the Document PiP popout required manual clicking or was trapped when switching windows.
2. **In-Video Controller Clutter**: When sharing entire screens, control pill bars and window borders leaked into recordings.
3. **Flaky Webcam Layering**: Direct alpha painting over video pixels caused edge tearing, halo artifacts, and color bleeding when the presenter moved.
4. **Uncurated Background UI**: A cluttered grid of buttons lacked clear categorization and visual descriptions.

---

## 2. Implemented Architecture & Solutions

### A. True 2-Layer Avatar Compositor (\ProcessedWebcamPipeline.ts\)
- **Layer 0 (Bottom)**: Photorealistic background texture (Modern Office, Creator RGB Studio, Sunset Penthouse, 16px Bokeh Blur, or architectural linear gradient).
- **Layer 1 (Top)**: Clean cutout subject composed via \source-in\ mask operation using temporal EMA smoothing with 2px antialiasing, completely preventing background bleed through moving hands or hair.
- **Layer 2 (Border & Shadow)**: Stamped into the recording stream and viewport with customizable drop shadow and border ring.

### B. Zero-Click Automatic Document PiP & Ghost Mode (\DocumentPipManager.ts\ & \RecordingBoothOverlay.tsx\)
- Automatically requests \window.documentPictureInPicture.requestWindow({ width: 340, height: 96 })\ upon clicking " RECORD STUDIO\ within user gesture context.
- Added **Ghost Minimize / Expand Mode**: Collapses the PiP controller into an ultra-compact discreet pill with only the blinking REC dot and expand button to eliminate desktop clutter.
- Added clean display capture flags (\preferCurrentTab: false, selfBrowserSurface: 'exclude', surfaceSwitching: 'include'\) and an auto-hiding pro-tip toast banner.

### C. Curated Categorized Background Dropdown (\CaptureControls.tsx\)
- Replaced button grid with an elegant glass dropdown selector grouped by:
 - *Curated 3D Studio Environments* (Modern Office, Creator Studio, Sunset Penthouse)
 - *Optics & Direct Feed* (Bokeh Blur 16px, Clean Camera Pass-Through)
 - *Custom Brand Identity* (Custom Image Backdrop with file uploader)
- Paired with a live real-time 60 FPS calibration canvas.

---

## 3. Verification Protocol & Live Status
- **TypeScript Strict Validation**: \
px tsc --noEmit\ returned exit code 0.
- **Production Build Check**: \
pm run build\ compiled 1,840 modules in 10.15s.
- **Docker Desktop Deployment**: \docker compose up --build -d\ built image and recreated container \motionstudio-app\.
- **Port 9090 Healthcheck**: \curl.exe -I http://localhost:9090\ returned \HTTP/1.1 200 OK\.
- **Knowledge Graph Sync**: \graphify update .\ completed with 379 nodes and 664 edges synchronized.
