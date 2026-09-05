# DevPlan 011: Document PiP Controller Activation, Real Image-Based Virtual Office, and Pre-Recording Preview Hub

## 1. Context & Architectural Root Causes
1. **Document PiP activation failure**: In Chromium, documentPictureInPicture.requestWindow() requires execution directly within a transient user activation context. Spawning PiP from an async setInterval countdown was blocked as an unprompted popup.
2. **Flat background & edge-tearing jitter**: The previous virtual background rendered flat blue CSS hex colors without rich architectural details. Segmentation lacked temporal frame smoothing, causing jitter when moving.
3. **No pre-recording calibration**: The user had no live preview card to test camera framing and virtual background before clicking "Record".

## 2. Key Architectural Remediations
1. **User-Gesture Document PiP Activation**:
   - handleInitiateRecording in App.tsx now requests documentPipManager.open(...) synchronously within the user's click event handler.
   - Spawns a floating Always-on-Top Document PiP window displaying live timer, VU audio meter, Pause/Resume, and "Finish & Edit".
   - Stopping from the floating PiP window invokes window.focus(), closes the PiP window, and seamlessly loads the recording into the Video Editor.
2. **Procedural High-Resolution Architectural Backdrops & Temporal EMA Smoothing**:
   - ProcessedWebcamPipeline.ts now pre-renders high-resolution textures:
     * **Executive Office**: Floor-to-ceiling panoramic glass window, skyline depth bokeh, warm acoustic wood panels, desk lamp glow, indoor plant silhouette.
     * **Creator Studio**: Dark walnut shelves, acoustic diffuser, neon purple & cyan backlights.
     * **Sunset Penthouse**: Golden hour sky gradient, skyscraper silhouettes, warm sun glare.
     * **Bokeh Blur**: 16px high-contrast Gaussian blur of live room feed.
   - Implemented Temporal Exponential Moving Average (EMA) smoothing:
     \text{Mask}_t = 0.75 \cdot \text{Mask}_t + 0.25 \cdot \text{Mask}_{t-1}
   - Applied ilter = 'blur(3.5px)' on the mask to remove all edge tearing, halos, and contour jitter.
3. **Pre-Recording Camera & Calibration Hub**:
   - Added an interactive live 220px circular/squircle canvas in CaptureControls.tsx that streams the processed/segmented avatar in real-time.
   - Provided quick preset selector cards with real-time feedback before starting recording.

## 3. Mandatory Delivery Verification Loop
- **TypeScript Compilation**: 
px tsc --noEmit — Exit code 0 (Clean).
- **Production Build**: 
pm run build — Compiled cleanly into /dist in 12.90s.
- **Automated Docker Deployment**: docker compose up --build -d — Rebuilt and container motionstudio-app running.
- **Port 9090 Health Check**: curl.exe -I http://localhost:9090 — HTTP/1.1 200 OK.
- **Knowledge Graph Sync**: graphify update . — 366 nodes, 651 edges, 27 communities updated.
