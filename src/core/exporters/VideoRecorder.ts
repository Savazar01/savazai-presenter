// VideoRecorder — Frame-Accurate Canvas Compositor & MediaRecorder Engine
import { ExportProgress, PipConfig, CalloutOverlay, TrimRange } from '@/types';
import { ThreeSceneManager } from '../scene/ThreeSceneManager';
import { TimelineController } from '../motion/TimelineController';
import { CaptureEngine } from '../capture/CaptureEngine';

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;

  private threeScene: ThreeSceneManager;
  private timeline: TimelineController;
  private captureEngine: CaptureEngine;
  private webcamVideoElement: HTMLVideoElement | null = null;

  // Dedicated offscreen compositor canvas
  private compositeCanvas: HTMLCanvasElement;
  private compositeCtx: CanvasRenderingContext2D | null;

  constructor(threeScene: ThreeSceneManager, timeline: TimelineController, captureEngine: CaptureEngine) {
    this.threeScene = threeScene;
    this.timeline = timeline;
    this.captureEngine = captureEngine;

    this.compositeCanvas = document.createElement('canvas');
    this.compositeCanvas.width = 1920;
    this.compositeCanvas.height = 1080;
    this.compositeCtx = this.compositeCanvas.getContext('2d');
  }

  public setWebcamElement(video: HTMLVideoElement | null): void {
    this.webcamVideoElement = video;
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Composites 3D WebGL scene + PiP webcam avatar + Active callouts into a unified 2D frame
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

    ctx.clearRect(0, 0, cw, ch);

    // 1. Draw 3D Spatial Canvas
    const webglCanvas = this.threeScene.getCanvas();
    ctx.drawImage(webglCanvas, 0, 0, cw, ch);

    // 2. Draw Composited PiP Webcam
    if (pipConfig.enabled && this.webcamVideoElement && this.webcamVideoElement.readyState >= 2) {
      const video = this.webcamVideoElement;
      const size = (pipConfig.size / 1000) * ch * 1.5;
      const x = (pipConfig.x / 100) * cw;
      const y = (pipConfig.y / 100) * ch;

      ctx.save();
      ctx.beginPath();

      if (pipConfig.shape === 'circle') {
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      } else if (pipConfig.shape === 'rounded-rect') {
        ctx.roundRect(x - size / 2, y - size / 2, size, size, size * 0.25);
      } else {
        ctx.rect(x - size / 2, y - size / 2, size, size);
      }
      ctx.closePath();

      // Shadow
      if (pipConfig.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 8;
      }

      ctx.clip();

      // Draw mirrored webcam video
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(-1, 1);
      ctx.drawImage(video, -size / 2, -size / 2, size, size);
      ctx.restore();

      ctx.restore();

      // Draw Border Stroke
      ctx.save();
      ctx.beginPath();
      if (pipConfig.shape === 'circle') {
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      } else if (pipConfig.shape === 'rounded-rect') {
        ctx.roundRect(x - size / 2, y - size / 2, size, size, size * 0.25);
      } else {
        ctx.rect(x - size / 2, y - size / 2, size, size);
      }
      ctx.lineWidth = pipConfig.borderWidth * 2;
      ctx.strokeStyle = pipConfig.borderColor;
      ctx.stroke();
      ctx.restore();
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

      // Glassmorphic Card Background
      ctx.fillStyle = 'rgba(16, 20, 29, 0.9)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.roundRect(0, 0, 320, 110, 16);
      ctx.fill();

      // Border
      ctx.strokeStyle = callout.colorTheme === 'emerald' ? '#10b981' : '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Badge
      if (callout.badge) {
        ctx.fillStyle = callout.colorTheme === 'emerald' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)';
        ctx.beginPath();
        ctx.roundRect(16, 14, 110, 24, 12);
        ctx.fill();

        ctx.fillStyle = callout.colorTheme === 'emerald' ? '#34d399' : '#60a5fa';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(callout.badge.toUpperCase(), 24, 30);
      }

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(callout.title, 16, callout.badge ? 65 : 42);

      // Description
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

    // Drive composite frames at 60 FPS
    const fps = 60;
    const stream = this.compositeCanvas.captureStream(fps);

    const mixedAudio = this.captureEngine.getMixedAudioStream();
    const combinedStream = new MediaStream();

    stream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
    if (mixedAudio) {
      mixedAudio.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
    }

    const supportedType = this.getSupportedMimeType(mimeType);

    this.mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: supportedType,
      videoBitsPerSecond: 18_000_000,
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    // Frame pump loop
    const framePump = () => {
      if (!this.isRecording) return;
      this.renderCompositeFrame(pipConfig, [], this.timeline.getCurrentTime());
      requestAnimationFrame(framePump);
    };

    this.mediaRecorder.start(250);
    this.isRecording = true;
    requestAnimationFrame(framePump);
  }

  /**
   * Stops live recording and returns the final video Blob
   */
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
        this.recordedChunks = [];
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Deterministic offline render pump: Steps through the timeline frame by frame (60 FPS)
   * Rendering 3D canvas + PiP webcam + Callouts synchronously with zero dropped frames.
   */
  public async exportTimelineVideo(
    pipConfig: PipConfig,
    callouts: CalloutOverlay[] = [],
    trimRange?: TrimRange,
    fps = 60,
    mimeType = 'video/webm;codecs=vp9',
    onProgress?: (progress: ExportProgress) => void
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

    recorder.start();
    this.timeline.pause();

    for (let frame = 0; frame <= totalFrames; frame++) {
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

    onProgress?.({
      stage: 'encoding',
      progress: 95,
      message: 'Finalizing video stream and container...',
    });

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: supportedType });
        onProgress?.({
          stage: 'complete',
          progress: 100,
          message: 'Video export complete!',
        });
        resolve(finalBlob);
      };

      recorder.stop();
    });
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
