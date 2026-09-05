// ProcessedWebcamPipeline — Real-Time Segmentation, Virtual Backgrounds & Guaranteed Camera Stamping
import { PipConfig, VirtualBgType } from '@/types';
import { SelfieSegmentation, Results } from '@mediapipe/selfie_segmentation';

export class ProcessedWebcamPipeline {
  private internalVideo: HTMLVideoElement | null = null;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D | null;

  // Inference Canvas (384x384 Square, Center-Cropped & Horizontally Mirrored)
  private inferenceCanvas: HTMLCanvasElement;
  private inferenceCtx: CanvasRenderingContext2D | null;

  // Raw Mask & Persistent Mask Canvases
  private rawMaskCanvas: HTMLCanvasElement;
  private rawMaskCtx: CanvasRenderingContext2D | null;
  private persistentMaskCanvas: HTMLCanvasElement;
  private persistentMaskCtx: CanvasRenderingContext2D | null;
  private hasPreviousMask = false;

  // Pre-allocated Reusable Subject Cutout Buffer (Layer 1)
  private subjectBufferCanvas: HTMLCanvasElement;
  private subjectBufferCtx: CanvasRenderingContext2D | null;

  // Pre-rendered High-Resolution Virtual Background Textures (Layer 0)
  private officeBgCanvas: HTMLCanvasElement | null = null;
  private studioBgCanvas: HTMLCanvasElement | null = null;
  private sunsetBgCanvas: HTMLCanvasElement | null = null;
  private customImage: HTMLImageElement | null = null;

  // MediaPipe Selfie Segmentation Engine
  private segmenter: SelfieSegmentation | null = null;
  private isSegmenterReady = false;
  private isSegmenting = false;

  private isRunning = false;
  private animFrameId: number | null = null;
  private currentBgType: VirtualBgType = 'none';

  constructor(size = 512) {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = size;
    this.offscreenCanvas.height = size;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });

    // High-performance 256x256 inference canvas for zero latency during rapid movement
    const inferSize = 256;
    this.inferenceCanvas = document.createElement('canvas');
    this.inferenceCanvas.width = inferSize;
    this.inferenceCanvas.height = inferSize;
    this.inferenceCtx = this.inferenceCanvas.getContext('2d', { willReadFrequently: true });

    this.rawMaskCanvas = document.createElement('canvas');
    this.rawMaskCanvas.width = size;
    this.rawMaskCanvas.height = size;
    this.rawMaskCtx = this.rawMaskCanvas.getContext('2d');

    this.persistentMaskCanvas = document.createElement('canvas');
    this.persistentMaskCanvas.width = size;
    this.persistentMaskCanvas.height = size;
    this.persistentMaskCtx = this.persistentMaskCanvas.getContext('2d', { willReadFrequently: true });

    this.subjectBufferCanvas = document.createElement('canvas');
    this.subjectBufferCanvas.width = size;
    this.subjectBufferCanvas.height = size;
    this.subjectBufferCtx = this.subjectBufferCanvas.getContext('2d', { willReadFrequently: true });

    this.initBackgroundTextures(size);
    this.initSegmentation();
  }

  /**
   * Generates photorealistic procedural architectural backgrounds
   */
  private initBackgroundTextures(size: number): void {
    // 1. Modern High-Tech Executive Office
    this.officeBgCanvas = document.createElement('canvas');
    this.officeBgCanvas.width = size;
    this.officeBgCanvas.height = size;
    const oCtx = this.officeBgCanvas.getContext('2d');
    if (oCtx) {
      // Deep architectural slate room
      const bgGrad = oCtx.createLinearGradient(0, 0, size, size);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.4, '#1e293b');
      bgGrad.addColorStop(1, '#090d16');
      oCtx.fillStyle = bgGrad;
      oCtx.fillRect(0, 0, size, size);

      // Floor-to-ceiling glass window with skyline depth bokeh
      const winGrad = oCtx.createLinearGradient(0, 0, size * 0.7, size);
      winGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      winGrad.addColorStop(0.5, 'rgba(30, 41, 59, 0.8)');
      winGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
      oCtx.fillStyle = winGrad;
      oCtx.fillRect(20, 20, size * 0.65, size - 40);

      // Window mullions & architectural glass grid
      oCtx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      oCtx.lineWidth = 3;
      oCtx.strokeRect(20, 20, size * 0.65, size - 40);
      oCtx.beginPath();
      oCtx.moveTo(size * 0.35, 20);
      oCtx.lineTo(size * 0.35, size - 20);
      oCtx.moveTo(20, size * 0.5);
      oCtx.lineTo(size * 0.67, size * 0.5);
      oCtx.stroke();

      // Blurred city skyline bokeh circles outside window
      const bokehColors = ['rgba(56, 189, 248, 0.3)', 'rgba(244, 114, 182, 0.2)', 'rgba(253, 224, 71, 0.25)', 'rgba(255, 255, 255, 0.3)'];
      for (let i = 0; i < 18; i++) {
        const bx = 40 + Math.random() * (size * 0.55);
        const by = 40 + Math.random() * (size * 0.6);
        const br = 8 + Math.random() * 22;
        oCtx.fillStyle = bokehColors[i % bokehColors.length];
        oCtx.beginPath();
        oCtx.arc(bx, by, br, 0, Math.PI * 2);
        oCtx.fill();
      }

      // Warm interior desk lamp & acoustic wood panel slats on right
      oCtx.fillStyle = 'rgba(30, 27, 75, 0.85)';
      oCtx.fillRect(size * 0.72, 0, size * 0.28, size);
      oCtx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
      oCtx.lineWidth = 2;
      for (let x = size * 0.74; x < size; x += 14) {
        oCtx.beginPath();
        oCtx.moveTo(x, 0);
        oCtx.lineTo(x, size);
        oCtx.stroke();
      }

      // Warm ambient lamp glow
      const lampGlow = oCtx.createRadialGradient(size * 0.85, size * 0.3, 10, size * 0.85, size * 0.3, 160);
      lampGlow.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
      lampGlow.addColorStop(0.6, 'rgba(245, 158, 11, 0.08)');
      lampGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      oCtx.fillStyle = lampGlow;
      oCtx.fillRect(0, 0, size, size);

      // Ficus indoor plant silhouette in bottom left
      oCtx.fillStyle = 'rgba(5, 15, 25, 0.75)';
      oCtx.beginPath();
      oCtx.ellipse(size * 0.15, size * 0.85, 45, 80, -0.3, 0, Math.PI * 2);
      oCtx.ellipse(size * 0.25, size * 0.88, 40, 70, 0.4, 0, Math.PI * 2);
      oCtx.fill();
    }

    // 2. Creator Cyber Neon RGB Studio
    this.studioBgCanvas = document.createElement('canvas');
    this.studioBgCanvas.width = size;
    this.studioBgCanvas.height = size;
    const sCtx = this.studioBgCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#180728');
      grad.addColorStop(0.5, '#09090b');
      grad.addColorStop(1, '#0c1222');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, size, size);

      // Bookshelf with colored backlight
      sCtx.fillStyle = 'rgba(24, 24, 27, 0.9)';
      sCtx.fillRect(size * 0.08, size * 0.15, size * 0.84, size * 0.7);
      sCtx.strokeStyle = 'rgba(63, 63, 70, 0.8)';
      sCtx.lineWidth = 4;
      sCtx.strokeRect(size * 0.08, size * 0.15, size * 0.84, size * 0.7);

      // Shelves
      for (let y = size * 0.35; y < size * 0.85; y += size * 0.22) {
        sCtx.beginPath();
        sCtx.moveTo(size * 0.08, y);
        sCtx.lineTo(size * 0.92, y);
        sCtx.stroke();
      }

      // Neon LED strip underglow
      const neonPurple = sCtx.createRadialGradient(size * 0.2, size * 0.4, 10, size * 0.2, size * 0.4, 180);
      neonPurple.addColorStop(0, 'rgba(192, 38, 211, 0.45)');
      neonPurple.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = neonPurple;
      sCtx.fillRect(0, 0, size, size);

      const neonCyan = sCtx.createRadialGradient(size * 0.8, size * 0.5, 10, size * 0.8, size * 0.5, 180);
      neonCyan.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
      neonCyan.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = neonCyan;
      sCtx.fillRect(0, 0, size, size);
    }

    // 3. Scenic Penthouse Sunset Skyline
    this.sunsetBgCanvas = document.createElement('canvas');
    this.sunsetBgCanvas.width = size;
    this.sunsetBgCanvas.height = size;
    const sunCtx = this.sunsetBgCanvas.getContext('2d');
    if (sunCtx) {
      const skyGrad = sunCtx.createLinearGradient(0, 0, 0, size);
      skyGrad.addColorStop(0, '#431407');
      skyGrad.addColorStop(0.35, '#c2410c');
      skyGrad.addColorStop(0.7, '#f97316');
      skyGrad.addColorStop(1, '#1c1917');
      sunCtx.fillStyle = skyGrad;
      sunCtx.fillRect(0, 0, size, size);

      // Glowing Sun
      const sun = sunCtx.createRadialGradient(size * 0.35, size * 0.4, 10, size * 0.35, size * 0.4, 120);
      sun.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      sun.addColorStop(0.4, 'rgba(251, 146, 60, 0.5)');
      sun.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sunCtx.fillStyle = sun;
      sunCtx.fillRect(0, 0, size, size);

      // Distant high-rise silhouettes
      sunCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      const buildings = [
        { x: 30, w: 50, h: 180 },
        { x: 90, w: 65, h: 240 },
        { x: 170, w: 45, h: 160 },
        { x: 230, w: 80, h: 280 },
        { x: 320, w: 60, h: 210 },
        { x: 390, w: 75, h: 250 },
      ];
      buildings.forEach((b) => {
        sunCtx.fillRect(b.x, size - b.h, b.w, b.h);
      });
    }
  }

  private initSegmentation(): void {
    try {
      this.segmenter = new SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });

      this.segmenter.setOptions({
        modelSelection: 0, // 0: general real-time model (ultra fast inference, no motion frame drops)
      });

      this.segmenter.onResults((results: Results) => {
        if (results.segmentationMask && this.rawMaskCtx && this.persistentMaskCtx) {
          const cw = this.rawMaskCanvas.width;
          const ch = this.rawMaskCanvas.height;

          // 1. Draw new mask from inference
          this.rawMaskCtx.clearRect(0, 0, cw, ch);
          this.rawMaskCtx.drawImage(results.segmentationMask, 0, 0, cw, ch);

          // 2. Smooth into persistent mask: 80% new frame + 20% previous history
          this.persistentMaskCtx.save();
          if (!this.hasPreviousMask) {
            this.persistentMaskCtx.clearRect(0, 0, cw, ch);
            this.persistentMaskCtx.drawImage(this.rawMaskCanvas, 0, 0, cw, ch);
            this.hasPreviousMask = true;
          } else {
            this.persistentMaskCtx.globalAlpha = 0.8;
            this.persistentMaskCtx.drawImage(this.rawMaskCanvas, 0, 0, cw, ch);
          }
          this.persistentMaskCtx.restore();
        }
        this.isSegmenting = false;
      });

      this.isSegmenterReady = true;
    } catch (err) {
      console.warn('MediaPipe SelfieSegmentation initialization notice:', err);
    }
  }

  public setMediaStream(stream: MediaStream | null): void {
    if (stream) {
      if (!this.internalVideo) {
        this.internalVideo = document.createElement('video');
        this.internalVideo.autoplay = true;
        this.internalVideo.playsInline = true;
        this.internalVideo.muted = true;
      }
      this.internalVideo.srcObject = stream;
      this.internalVideo.play().catch((e) => console.log('Webcam play notice:', e));
      this.startProcessing();
    } else {
      if (this.internalVideo) {
        this.internalVideo.srcObject = null;
      }
      this.stopProcessing();
    }
  }

  public setVideoSource(video: HTMLVideoElement | null): void {
    if (video) {
      this.internalVideo = video;
      this.startProcessing();
    }
  }

  public setCustomBackgroundImage(url: string | null): void {
    if (url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        this.customImage = img;
      };
    } else {
      this.customImage = null;
    }
  }

  public getCanvas(): HTMLCanvasElement {
    return this.offscreenCanvas;
  }

  public startProcessing(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const loop = () => {
      if (!this.isRunning) return;
      this.processFrame(this.currentBgType);
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stopProcessing(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * Processes the webcam video frame with real background segmentation
   */
  public processFrame(bgType: VirtualBgType = 'none'): void {
    this.currentBgType = bgType;
    if (!this.offscreenCtx) return;
    const ctx = this.offscreenCtx;
    const cw = this.offscreenCanvas.width;
    const ch = this.offscreenCanvas.height;

    const video = this.internalVideo;
    const isLive = video && video.readyState >= 2 && !video.paused;

    if (!isLive) {
      return;
    }

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    const minDim = Math.min(vw, vh);
    const sx = (vw - minDim) / 2;
    const sy = (vh - minDim) / 2;

    // 1. Prepare 384x384 Mirrored Center-Cropped Inference Canvas
    if (bgType !== 'none' && this.inferenceCtx) {
      const iw = this.inferenceCanvas.width;
      const ih = this.inferenceCanvas.height;
      this.inferenceCtx.save();
      this.inferenceCtx.clearRect(0, 0, iw, ih);
      this.inferenceCtx.translate(iw, 0);
      this.inferenceCtx.scale(-1, 1);
      this.inferenceCtx.drawImage(video, sx, sy, minDim, minDim, 0, 0, iw, ih);
      this.inferenceCtx.restore();

      // Send 1:1 matched frame to MediaPipe segmenter
      if (this.segmenter && this.isSegmenterReady && !this.isSegmenting) {
        this.isSegmenting = true;
        this.segmenter.send({ image: this.inferenceCanvas }).catch(() => {
          this.isSegmenting = false;
        });
      }
    }

    ctx.save();
    ctx.clearRect(0, 0, cw, ch);

    if (bgType === 'none') {
      // Direct Clean 1:1 Mirrored Center-Crop
      ctx.translate(cw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, cw, ch);
      ctx.restore();
      return;
    }

    // --- TRUE 2-LAYER COMPOSITE PIPELINE ---
    // LAYER 0 (Bottom): Draw High-Resolution Virtual Background Backdrop
    if (bgType === 'preset-office' && this.officeBgCanvas) {
      ctx.drawImage(this.officeBgCanvas, 0, 0, cw, ch);
    } else if (bgType === 'preset-studio' && this.studioBgCanvas) {
      ctx.drawImage(this.studioBgCanvas, 0, 0, cw, ch);
    } else if (bgType === 'preset-scenic' && this.sunsetBgCanvas) {
      ctx.drawImage(this.sunsetBgCanvas, 0, 0, cw, ch);
    } else if (bgType === 'custom-image' && this.customImage) {
      ctx.drawImage(this.customImage, 0, 0, cw, ch);
    } else if (bgType === 'blur-medium') {
      // 16px High-Contrast Gaussian Bokeh Blur of the room
      ctx.save();
      ctx.filter = 'blur(16px) brightness(0.85) saturate(1.2)';
      ctx.translate(cw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, minDim, minDim, -20, -20, cw + 40, ch + 40);
      ctx.restore();
    } else {
      // Elegant fallback architectural gradient (never flat blue or black hole)
      const grad = ctx.createLinearGradient(0, 0, cw, ch);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cw, ch);
    }

    // LAYER 1 (Top): Clean Segmented Person Cutout via source-in mask composition
    if (this.subjectBufferCtx) {
      const sCtx = this.subjectBufferCtx;
      sCtx.clearRect(0, 0, cw, ch);

      if (this.hasPreviousMask && this.persistentMaskCanvas) {
        // A. Draw the smoothed persistent segmentation mask with subtle edge antialiasing
        sCtx.save();
        sCtx.filter = 'blur(2.5px)';
        sCtx.drawImage(this.persistentMaskCanvas, 0, 0, cw, ch);
        sCtx.restore();
      } else {
        // B. Initial warm silhouette mask while model initializes
        sCtx.save();
        sCtx.fillStyle = '#ffffff';
        sCtx.beginPath();
        sCtx.ellipse(cw / 2, ch * 0.55, cw * 0.38, ch * 0.44, 0, 0, Math.PI * 2);
        sCtx.filter = 'blur(6px)';
        sCtx.fill();
        sCtx.restore();
      }

      // Keep only the subject's camera pixels (source-in)
      sCtx.save();
      sCtx.globalCompositeOperation = 'source-in';
      sCtx.translate(cw, 0);
      sCtx.scale(-1, 1);
      sCtx.drawImage(video, sx, sy, minDim, minDim, 0, 0, cw, ch);
      sCtx.restore();

      // Paint the cutout subject cleanly over Layer 0
      ctx.drawImage(this.subjectBufferCanvas, 0, 0, cw, ch);
    }

    ctx.restore();
  }

  /**
   * Guaranteed Synchronous Stamping into 1080p MediaRecorder Canvas and Live Viewport
   */
  public renderAvatarToContext(
    targetCtx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    size: number,
    pipConfig: PipConfig
  ): void {
    if (!pipConfig.enabled) return;

    const bgType = pipConfig.background?.type || 'none';
    this.processFrame(bgType);

    const video = this.internalVideo;
    const isLive = video && video.readyState >= 2 && !video.paused;

    if (!isLive) {
      return; // Do NOT render fake dummy text!
    }

    targetCtx.save();

    // 1. Define Mask Path (Circle, Squircle, Square)
    targetCtx.beginPath();
    if (pipConfig.shape === 'circle') {
      targetCtx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
    } else if (pipConfig.shape === 'rounded-rect') {
      targetCtx.roundRect(centerX - size / 2, centerY - size / 2, size, size, size * 0.22);
    } else {
      targetCtx.rect(centerX - size / 2, centerY - size / 2, size, size);
    }
    targetCtx.closePath();

    // 2. High-Quality Drop Shadow
    if (pipConfig.shadow) {
      targetCtx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      targetCtx.shadowBlur = 24;
      targetCtx.shadowOffsetX = 0;
      targetCtx.shadowOffsetY = 10;
    }

    // 3. Clip and Stamp Processed Webcam Frame with Opaque Solid Base Underneath
    targetCtx.save();
    targetCtx.clip();
    targetCtx.fillStyle = '#090d16';
    targetCtx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
    targetCtx.drawImage(
      this.offscreenCanvas,
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height,
      centerX - size / 2,
      centerY - size / 2,
      size,
      size
    );
    targetCtx.restore();

    // 4. Outer Border Stroke
    targetCtx.beginPath();
    if (pipConfig.shape === 'circle') {
      targetCtx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
    } else if (pipConfig.shape === 'rounded-rect') {
      targetCtx.roundRect(centerX - size / 2, centerY - size / 2, size, size, size * 0.22);
    } else {
      targetCtx.rect(centerX - size / 2, centerY - size / 2, size, size);
    }
    targetCtx.lineWidth = Math.max(3, (pipConfig.borderWidth || 2) * 2);
    targetCtx.strokeStyle = pipConfig.borderColor || '#3b82f6';
    targetCtx.stroke();

    targetCtx.restore();
  }

  public dispose(): void {
    this.stopProcessing();
    if (this.segmenter) {
      this.segmenter.close();
      this.segmenter = null;
    }
    this.internalVideo = null;
    this.customImage = null;
  }
}
