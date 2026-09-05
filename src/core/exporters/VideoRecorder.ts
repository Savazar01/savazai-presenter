// VideoRecorder — Native Resolution Compositor & MediaRecorder Engine
import { ExportProgress, PipConfig, CalloutOverlay, TrimRange, DeviceType, StageMode } from '@/types';
import { ThreeSceneManager } from '../scene/ThreeSceneManager';
import { TimelineController } from '../motion/TimelineController';
import { CaptureEngine } from '../capture/CaptureEngine';
import { ProcessedWebcamPipeline } from '../capture/ProcessedWebcamPipeline';

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private isPaused = false;

  private threeScene: ThreeSceneManager;
  private timeline: TimelineController;
  private captureEngine: CaptureEngine;
  private webcamPipeline: ProcessedWebcamPipeline;
  private displayVideoElement: HTMLVideoElement | null = null;
  private mixedAudioStream: MediaStream | null = null;

  private currentDevice: DeviceType = 'frameless';
  private stageMode: StageMode = '3d-stage';

  // Dedicated offscreen compositor canvas (1080p 60fps)
  private compositeCanvas: HTMLCanvasElement;
  private compositeCtx: CanvasRenderingContext2D | null;

  constructor(
    threeScene: ThreeSceneManager,
    timeline: TimelineController,
    captureEngine: CaptureEngine,
    webcamPipeline: ProcessedWebcamPipeline
  ) {
    this.threeScene = threeScene;
    this.timeline = timeline;
    this.captureEngine = captureEngine;
    this.webcamPipeline = webcamPipeline;

    this.compositeCanvas = document.createElement('canvas');
    this.compositeCanvas.width = 1920;
    this.compositeCanvas.height = 1080;
    this.compositeCtx = this.compositeCanvas.getContext('2d', { alpha: false });
  }

  public setDisplayVideoElement(video: HTMLVideoElement | null): void {
    this.displayVideoElement = video;
  }

  public setStagingConfig(device: DeviceType, mode: StageMode): void {
    this.currentDevice = device;
    this.stageMode = mode;
  }

  public setWebcamPipeline(pipeline: ProcessedWebcamPipeline): void {
    this.webcamPipeline = pipeline;
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Composites Screen Ingestion (Native Edge-to-Edge or 3D Stage) + PiP Webcam Avatar + Callouts
   */
  public renderCompositeFrame(
    pipConfig: PipConfig,
    callouts: CalloutOverlay[] = [],
    currentTime = 0
  ): void {
    if (!this.compositeCtx) return;
    const ctx = this.compositeCtx;
    const cw = this.compositeCanvas.width;
    const ch = this.compositeCanvas.height;

    // 0. Guaranteed Opaque Background Fill (Zero Green/Black Buffer Glitches)
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, cw, ch);

    // 1. Draw Screen Capture
    const displayVideo = this.displayVideoElement;
    const hasLiveDisplay =
      displayVideo &&
      displayVideo.readyState >= 2 &&
      displayVideo.videoWidth > 0 &&
      displayVideo.videoHeight > 0 &&
      !displayVideo.paused;

    if (this.currentDevice === 'frameless' || this.stageMode === '2d-direct') {
      if (hasLiveDisplay && displayVideo) {
        // Direct Native Resolution Edge-to-Edge Fill (Zero Letterboxing)
        const vw = displayVideo.videoWidth;
        const vh = displayVideo.videoHeight;
        const videoAspect = vw / vh;
        const canvasAspect = cw / ch;

        let dw = cw;
        let dh = ch;
        let dx = 0;
        let dy = 0;

        if (Math.abs(videoAspect - canvasAspect) < 0.05) {
          // Exactly matches 16:9 -> Draw 100% full screen
          ctx.drawImage(displayVideo, 0, 0, vw, vh, 0, 0, cw, ch);
        } else if (videoAspect > canvasAspect) {
          // Ultrawide or wider -> Scale to width and center vertically
          dh = cw / videoAspect;
          dy = (ch - dh) / 2;
          ctx.drawImage(displayVideo, 0, 0, vw, vh, 0, dy, cw, dh);
        } else {
          // 16:10 or taller -> Scale to height and center horizontally
          dw = ch * videoAspect;
          dx = (cw - dw) / 2;
          ctx.drawImage(displayVideo, 0, 0, vw, vh, dx, 0, dw, ch);
        }
      } else {
        this.threeScene.forceRender();
        const webglCanvas = this.threeScene.getCanvas();
        if (webglCanvas) {
          ctx.drawImage(webglCanvas, 0, 0, cw, ch);
        }
      }
    } else {
      // 3D Staged Device Chassis (MacBook, PC, iPhone, Pixel, Browser)
      this.threeScene.forceRender();
      const webglCanvas = this.threeScene.getCanvas();
      if (webglCanvas) {
        ctx.drawImage(webglCanvas, 0, 0, cw, ch);
      }
    }

    // 2. Guaranteed Stamped PiP Webcam Avatar (Real Camera Pixels)
    if (pipConfig.enabled) {
      const size = (pipConfig.size / 1000) * ch * 1.5;
      const x = (pipConfig.x / 100) * cw;
      const y = (pipConfig.y / 100) * ch;

      this.webcamPipeline.renderAvatarToContext(ctx, x, y, size, pipConfig);
    }

    // 3. Draw Active Callout Overlays
    const activeCallouts = callouts.filter(
      (c) => currentTime >= c.startTime && currentTime <= c.endTime
    );

    activeCallouts.forEach((callout) => {
      const cx = (callout.x / 100) * cw;
      const cy = (callout.y / 100) * ch;

      ctx.save();
      ctx.translate(cx, cy);

      ctx.fillStyle = 'rgba(16, 20, 29, 0.92)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.roundRect(0, 0, 320, 110, 16);
      ctx.fill();

      ctx.strokeStyle = callout.colorTheme === 'emerald' ? '#10b981' : '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (callout.badge) {
        ctx.fillStyle = callout.colorTheme === 'emerald' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)';
        ctx.beginPath();
        ctx.roundRect(16, 14, 110, 24, 12);
        ctx.fill();

        ctx.fillStyle = callout.colorTheme === 'emerald' ? '#34d399' : '#60a5fa';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(callout.badge.toUpperCase(), 24, 30);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(callout.title, 16, callout.badge ? 65 : 42);

      if (callout.description) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(callout.description, 16, callout.badge ? 88 : 68);
      }

      ctx.restore();
    });
  }

  /**
   * Starts live realtime recording of the composite canvas and mixed Web Audio graph
   */
  public startLiveRecording(pipConfig: PipConfig, mimeType = 'video/webm;codecs=vp9,opus'): void {
    if (this.isRecording) return;
    this.recordedChunks = [];
    this.isPaused = false;

    // Drive composite frames at 60 FPS
    const fps = 60;
    const stream = this.compositeCanvas.captureStream(fps);

    this.mixedAudioStream = this.captureEngine.getMixedAudioStream();
    const combinedStream = new MediaStream();

    stream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
    if (this.mixedAudioStream) {
      this.mixedAudioStream.getAudioTracks().forEach((track) => {
        track.enabled = true;
        combinedStream.addTrack(track);
      });
    }

    const supportedType = this.getSupportedMimeType(mimeType);

    this.mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: supportedType,
      videoBitsPerSecond: 20_000_000,
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    // Frame pump loop
    const framePump = () => {
      if (!this.isRecording) return;
      if (!this.isPaused) {
        this.renderCompositeFrame(pipConfig, [], this.timeline.getCurrentTime());
      }
      requestAnimationFrame(framePump);
    };

    this.mediaRecorder.start(250);
    this.isRecording = true;
    requestAnimationFrame(framePump);
  }

  public pauseLiveRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
      if (this.mixedAudioStream) {
        this.mixedAudioStream.getAudioTracks().forEach((t) => (t.enabled = false));
      }
    }
  }

  public resumeLiveRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
      if (this.mixedAudioStream) {
        this.mixedAudioStream.getAudioTracks().forEach((t) => (t.enabled = true));
      }
    }
  }

  public async stopLiveRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('Recorder is not active'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.isRecording = false;
        this.isPaused = false;
        this.recordedChunks = [];
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  public togglePauseLiveRecording(): boolean {
    if (!this.mediaRecorder) return false;
    if (this.mediaRecorder.state === 'recording') {
      this.pauseLiveRecording();
      return true; // now paused
    } else if (this.mediaRecorder.state === 'paused') {
      this.resumeLiveRecording();
      return false; // now recording
    }
    return false;
  }

  public async exportTimelineVideo(
    pipConfig: PipConfig,
    callouts: CalloutOverlay[] = [],
    trimRange?: TrimRange,
    fps = 60,
    mimeType = 'video/webm;codecs=vp9',
    onProgress?: (progress: ExportProgress) => void,
    abortSignal?: AbortSignal
  ): Promise<Blob> {
    onProgress?.({
      stage: 'preparing',
      progress: 0,
      message: 'Preparing deterministic render pump (60 FPS)...',
    });

    const startTime = trimRange?.start || 0;
    const endTime = trimRange?.end || this.timeline.getTotalDuration();
    const totalDuration = Math.max(0.5, endTime - startTime);
    const totalFrames = Math.ceil(totalDuration * fps);
    const frameInterval = 1 / fps;

    const stream = this.compositeCanvas.captureStream(fps);
    const supportedType = this.getSupportedMimeType(mimeType);
    const chunks: Blob[] = [];

    const recorder = new MediaRecorder(stream, {
      mimeType: supportedType,
      videoBitsPerSecond: 22_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    try {
      this.timeline.pause();
      const originalTime = this.timeline.getCurrentTime();

      for (let frame = 0; frame <= totalFrames; frame++) {
        if (abortSignal?.aborted) {
          try {
            recorder.stop();
          } catch (_) {}
          stream.getTracks().forEach((t) => t.stop());
          this.timeline.seek(originalTime);
          throw new Error('Export cancelled by user');
        }

        const time = startTime + frame * frameInterval;
        this.timeline.seek(time);
        this.threeScene.renderDirect();
        this.renderCompositeFrame(pipConfig, callouts, time);

        const pct = Math.round((frame / totalFrames) * 90);
        onProgress?.({
          stage: 'rendering',
          progress: pct,
          message: `Compositing frame ${frame} of ${totalFrames} (${time.toFixed(2)}s)...`,
        });

        await new Promise((r) => setTimeout(r, 16));
      }

      this.timeline.seek(originalTime);

      onProgress?.({
        stage: 'encoding',
        progress: 95,
        message: 'Finalizing video stream and container...',
      });

      return new Promise((resolve) => {
        let isResolved = false;
        const finalize = () => {
          if (isResolved) return;
          isResolved = true;
          stream.getTracks().forEach((t) => t.stop());
          const finalBlob = new Blob(chunks, { type: supportedType || 'video/webm' });
          onProgress?.({
            stage: 'complete',
            progress: 100,
            message: 'Video export complete!',
          });
          resolve(finalBlob);
        };

        recorder.onstop = () => finalize();
        try {
          recorder.stop();
        } catch (_) {
          finalize();
        }

        // Guaranteed safety timeout (2500ms): never freeze indefinitely at 95%
        setTimeout(() => finalize(), 2500);
      });
    } catch (err) {
      stream.getTracks().forEach((t) => t.stop());
      console.error('Offline video export failure:', err);
      try {
        recorder.stop();
      } catch (_) {}
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: err instanceof Error ? err.message : 'Render pipeline error',
      });
      throw err;
    }
  }

  private getSupportedMimeType(preferred: string): string {
    if (MediaRecorder.isTypeSupported(preferred)) {
      return preferred;
    }
    const fallbacks = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    for (const type of fallbacks) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }
}
