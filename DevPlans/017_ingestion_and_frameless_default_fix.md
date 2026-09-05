# 017 — Default Frameless Staging, Single Controller Enforcement, Guaranteed Recording Ingestion & Audio Device Priority

## 1. Executive Summary & Problem Resolution
This iteration resolves four core functional, visual, and architectural regressions:
1. **Default Staging**: New projects now cleanly default to **Frameless Clean** (`mode: '2d', frame2D: 'none', device3D: 'frameless'`) instead of an Apple MacBook device frame.
2. **Dual Recording Controller Eradication**: Suppressed duplicate in-window transport pills when Document PiP is active. Only strictly ONE floating controller is visible across screen states.
3. **Fail-Safe Video Ingestion & Backup**: When recording stops, the captured blob is simultaneously downloaded as a safety backup (`MotionStudio_Recording_[timestamp].webm`), loaded into `displayVideoRef.current` / `StudioCanvas.tsx` for immediate playback, and saved into IndexedDB via `ProjectManager.ts`.
4. **Physical Audio Hardware Priority & Live VU Calibration**: Audio device enumeration sorts physical microphones ahead of virtual audio drivers/noise canceling filters, and immediately opens the microphone stream upon modal initialization to dance the live VU level meter in real-time.

---

## 2. Key Code Modifications

### 2.1 [ProjectManager.ts](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/core/projects/ProjectManager.ts) & [App.tsx](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/App.tsx)
- Updated `createDefaultProject()` mockup configuration:
  ```ts
  mockupConfig: {
    mode: '2d',
    frame2D: 'none',
    device3D: 'frameless',
  }
  ```
- Guaranteed default stage mode initializes to `'2d-direct'`.

### 2.2 [MotionStudioRecordingPill.tsx](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/components/setup/MotionStudioRecordingPill.tsx)
- Added live state listener `docPipOpen`.
- Returns `null` if `isDocPipActive || docPipOpen` to guarantee that duplicate in-page and out-of-page controllers never render simultaneously.

### 2.3 [StudioCanvas.tsx](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/components/StudioCanvas.tsx)
- Replaced fragile inline ref callback with a persistent `local2DVideoRef` and synchronization `useEffect` that listens to `displayVideoElement`, `displayVideoElement.src`, and `displayVideoElement.srcObject`.
- Plays the mounted video immediately upon completion of recording or file upload.

### 2.4 [App.tsx](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/App.tsx)
- Updated `handleStopRecording` with dual-persistence:
  1. Instant backup download trigger.
  2. In-memory object URL binding to `displayVideoRef.current` and `ThreeSceneManager`.
  3. Automatic IndexedDB persistence.

### 2.5 [MotionStudioSetupModal.tsx](file:///c:/Users/AVASA/Downloads/OpenC/Savazai-presenter/src/components/setup/MotionStudioSetupModal.tsx)
- Added virtual device filter logic placing physical microphones at the top of the device list.
- Initialized mic capture on modal open to power the live VU level indicator.
- Attached `startMicrophoneCapture(newDeviceId)` to dropdown device selection.

---

## 3. Mandatory 6-Step Verification Results
1. **TypeScript Validation**: `npx tsc --noEmit` returned exit code 0.
2. **Production Bundle**: `npm run build` compiled cleanly in 7.8s.
3. **Docker Rebuild**: `docker compose up --build -d` recreated and started `motionstudio-app`.
4. **Port 9090 Probe**: `curl.exe -I http://localhost:9090` returned `HTTP/1.1 200 OK`.
5. **Knowledge Graph**: `graphify update .` synced 455 nodes and 833 edges.
6. **DevPlans Logging**: Documented in `/DevPlans/017_ingestion_and_frameless_default_fix.md`.
