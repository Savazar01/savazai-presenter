// WebcamProcessor — 1:1 Aspect Ratio Center-Crop & Virtual Background Engine
import { WebcamBackgroundConfig } from '@/types';

export class WebcamProcessor {
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private animFrameId: number | null = null;
  private isProcessing = false;
  private backgroundConfig: WebcamBackgroundConfig = { type: 'none' };
  private customImage: HTMLImageElement | null = null;

  constructor(size = 512) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  public setSourceVideo(video: HTMLVideoElement | null): void {
    this.videoElement = video;
    if (video && !this.isProcessing) {
      this.startProcessing();
    } else if (!video && this.isProcessing) {
      this.stopProcessing();
    }
  }

  public setBackgroundConfig(config: WebcamBackgroundConfig): void {
    this.backgroundConfig = config;
    if (config.type === 'custom-image' && config.customImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = config.customImageUrl;
      img.onload = () => {
        this.customImage = img;
      };
    } else {
      this.customImage = null;
    }
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getStream(fps = 30): MediaStream {
    return this.canvas.captureStream(fps);
  }

  public startProcessing(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const renderLoop = () => {
      if (!this.isProcessing) return;
      this.processFrame();
      this.animFrameId = requestAnimationFrame(renderLoop);
    };

    this.animFrameId = requestAnimationFrame(renderLoop);
  }

  public stopProcessing(): void {
    this.isProcessing = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public processFrame(): void {
    if (!this.ctx || !this.videoElement || this.videoElement.readyState < 2) return;
    const ctx = this.ctx;
    const video = this.videoElement;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    const minDim = Math.min(vw, vh);
    const sx = (vw - minDim) / 2;
    const sy = (vh - minDim) / 2;

    ctx.save();
    ctx.clearRect(0, 0, cw, ch);

    const bgType = this.backgroundConfig.type;

    if (bgType === 'none') {
      // 1. Clean 1:1 Center-Cropped Mirrored Video
      ctx.translate(cw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, cw, ch);
    } else if (bgType === 'blur-low' || bgType === 'blur-medium' || bgType === 'blur-high') {
      // 2. Virtual Background Blur
      const blurRadius = bgType === 'blur-low' ? 8 : bgType === 'blur-medium' ? 16 : 28;

      // Draw heavy blurred background layer
      ctx.filter = `blur(${blurRadius}px) brightness(0.9)`;
      ctx.translate(cw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, minDim, minDim, -20, -20, cw + 40, ch + 40);
      ctx.filter = 'none';

      // Draw subtle centered focus layer with soft radial mask
      ctx.save();
      const radialGrad = ctx.createRadialGradient(cw / 2, ch / 2, cw * 0.15, cw / 2, ch / 2, cw * 0.5);
      radialGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      radialGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.9)');
      radialGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      // Draw sharp video over blurred backdrop
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, cw, ch);
      ctx.restore();
    } else if (bgType === 'preset-office' || bgType === 'preset-studio' || bgType === 'preset-scenic') {
      // 3. Procedural Virtual Studio Environments
      if (bgType === 'preset-office') {
        // Modern Minimalist Tech Office
        const grad = ctx.createLinearGradient(0, 0, cw, ch);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);

        // Office accent ambient wall glow
        const glow = ctx.createRadialGradient(cw * 0.7, ch * 0.3, 20, cw * 0.7, ch * 0.3, cw * 0.6);
        glow.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
        glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, cw, ch);
      } else if (bgType === 'preset-studio') {
        // Cyber Neon RGB Studio
        const grad = ctx.createLinearGradient(0, 0, cw, ch);
        grad.addColorStop(0, '#2e1065');
        grad.addColorStop(0.5, '#09090b');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);

        // Dual Neon Accent Lights
        const neonLeft = ctx.createRadialGradient(0, ch * 0.5, 10, 0, ch * 0.5, cw * 0.6);
        neonLeft.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
        neonLeft.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = neonLeft;
        ctx.fillRect(0, 0, cw, ch);

        const neonRight = ctx.createRadialGradient(cw, ch * 0.5, 10, cw, ch * 0.5, cw * 0.6);
        neonRight.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        neonRight.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = neonRight;
        ctx.fillRect(0, 0, cw, ch);
      } else {
        // Warm Sunset Scenic
        const grad = ctx.createLinearGradient(0, 0, cw, ch);
        grad.addColorStop(0, '#431407');
        grad.addColorStop(0.5, '#1c1917');
        grad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);

        const warmSun = ctx.createRadialGradient(cw * 0.3, ch * 0.4, 20, cw * 0.3, ch * 0.4, cw * 0.6);
        warmSun.addColorStop(0, 'rgba(251, 146, 60, 0.35)');
        warmSun.addColorStop(1, 'rgba(251, 146, 60, 0)');
        ctx.fillStyle = warmSun;
        ctx.fillRect(0, 0, cw, ch);
      }

      // Draw center mirrored video composited with soft circular avatar mask
      ctx.translate(cw, 0);
      ctx.scale(-1, 1);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cw / 2, ch / 2, cw * 0.46, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, cw, ch);
      ctx.restore();
    } else if (bgType === 'custom-image' && this.customImage) {
      // 4. Custom Uploaded Image Backdrop
      ctx.drawImage(this.customImage, 0, 0, cw, ch);

      // Draw soft-edged video avatar over custom backdrop
      ctx.translate(cw, 0);
      ctx.scale(-1, 1);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cw / 2, ch / 2, cw * 0.46, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, cw, ch);
      ctx.restore();
    }

    ctx.restore();
  }

  public dispose(): void {
    this.stopProcessing();
    this.videoElement = null;
    this.customImage = null;
  }
}
