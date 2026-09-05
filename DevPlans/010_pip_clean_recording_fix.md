# DevPlan 010: Native Document PiP Controller, Clean Capture Exclusion, and Robust Body Segmentation Pipeline

## 1. Architectural Overview & Problem Context
Two critical operational and visual issues were identified during live deployment verification:
1. **Unwanted UI baked into screen capture & Alt-Tab window switching**: The in-tab recording controller was getting captured into the recording if whole screen was shared, and stopping recording required switching back to localhost:9090.
2. **Webcam Segmentation Edge Tearing & Half-Head Clipping**: The segmentation inference was sent raw uncropped frames while the compositor rendered a center-cropped, horizontally-mirrored frame without coordinate alignment, causing half the head to be clipped.

## 2. Implemented Solutions
1. **Chromium Document Picture-in-Picture API (DocumentPipManager.ts)**:
   - Spawns an independent OS-level floating widget (window.documentPictureInPicture.requestWindow({ width: 380, height: 130 })).
   - Floats always-on-top above target applications, allowing live Pause/Resume, Mic Muting, VU metering, and one-click "Finish & Edit".
   - Because Chromium renders Document PiP as an independent top-level surface, it is automatically excluded when capturing a specific browser tab or application window.
   - Provides clean in-tab pill fallback with a popout button when PiP is unsupported or closed.
2. **Stabilized 1:1 Cropped & Mirrored Inference Segmentation**:
   - Created a 384x384 inferenceCanvas matching the exact square center-crop and horizontal mirror coordinates of the webcam avatar.
   - Applied ctx.filter = 'blur(2.5px)' on the mask canvas to smooth edges and eliminate halos and tearing.
   - Clean compositing: Crisp webcam pixels masked via destination-in over virtual background themes (Office, Neon Studio, Sunset Scenic, Bokeh blur, Custom image).
3. **Clean Canvas Guarantee**:
   - MediaRecorder compositor canvas draws only the clean display video stream and the segmented avatar.

## 3. Mandatory Delivery Verification Loop
- **TypeScript Compilation**: 
px tsc --noEmit — Exit code 0 (Clean).
- **Production Build**: 
pm run build — Compiled in 7.46s to /dist.
- **Automated Docker Deployment**: docker compose up --build -d — Container motionstudio-app recreated and running.
- **Port 9090 Health Check**: curl.exe -I http://localhost:9090 — HTTP/1.1 200 OK.
- **Knowledge Graph Sync**: graphify update . — 361 nodes, 643 edges, 26 communities updated.
