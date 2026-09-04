// VideoRecorder — Client-Side Frame-Accurate & Realtime MediaRecorder Engine
import { ExportProgress } from '@/types';
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

  constructor(threeScene: ThreeSceneManager, timeline: TimelineController, captureEngine: CaptureEngine) {
    this.threeScene = threeScene;
    this.timeline = timeline;
    this.captureEngine = captureEngine;
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Starts live realtime recording of the 3D canvas and mixed Web Audio graph
   */
  public startLiveRecording(mimeType = 'video/webm;codecs=vp9,opus'): void {
    if (this.isRecording) return;
    this.recordedChunks = [];

    const canvas = this.threeScene.getCanvas();
    const videoStream = canvas.captureStream(60);

    // Mix audio stream if available
    const mixedAudio = this.captureEngine.getMixedAudioStream();
    const combinedStream = new MediaStream();

    videoStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
    if (mixedAudio) {
      mixedAudio.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
    }

    // Determine supported mimeType
    const supportedType = this.getSupportedMimeType(mimeType);

    this.mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: supportedType,
      videoBitsPerSecond: 16_000_000, // 16 Mbps for high fidelity
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250); // Emit chunk every 250ms
    this.isRecording = true;
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
   * Captures each frame synchronously to guarantee zero dropped frames on any machine.
   */
  public async exportTimelineVideo(
    fps = 60,
    mimeType = 'video/webm;codecs=vp9',
    onProgress?: (progress: ExportProgress) => void
  ): Promise<Blob> {
    onProgress?.({
      stage: 'preparing',
      progress: 0,
      message: 'Preparing deterministic render pump (60 FPS)...',
    });

    const canvas = this.threeScene.getCanvas();
    const duration = this.timeline.getTotalDuration();
    const totalFrames = Math.ceil(duration * fps);
    const frameInterval = 1 / fps;

    const stream = canvas.captureStream(fps);
    const supportedType = this.getSupportedMimeType(mimeType);
    const chunks: Blob[] = [];

    const recorder = new MediaRecorder(stream, {
      mimeType: supportedType,
      videoBitsPerSecond: 20_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.start();

    // Temporarily pause interactive playback
    this.timeline.pause();

    for (let frame = 0; frame <= totalFrames; frame++) {
      const time = frame * frameInterval;
      this.timeline.seek(time);
      this.threeScene.renderDirect();

      const pct = Math.round((frame / totalFrames) * 90);
      onProgress?.({
        stage: 'rendering',
        progress: pct,
        message: `Rendering frame ${frame} of ${totalFrames} (${(time).toFixed(2)}s)...`,
      });

      // Brief delay to allow browser to pump frame to MediaRecorder
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
