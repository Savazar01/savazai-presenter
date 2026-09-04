// TimelineController — Anime.js Unified Spatial & DOM Motion Choreographer
import anime from 'animejs';
import { CuePoint, SlideData } from '@/types';
import { ThreeSceneManager } from '../scene/ThreeSceneManager';

export const DEFAULT_CUE_POINTS: CuePoint[] = [
  {
    id: 'cue-intro',
    time: 0,
    title: 'Visual Showcase Staging',
    description: 'Welcome to MotionStudio. 3D spatial staging with studio lighting.',
    slideIndex: 0,
    headlineText: 'Introducing MotionStudio',
    subText: 'Next-Gen 3D Staging & Multi-Surface Publishing',
    badgeText: 'STUDIO READY',
    cameraTransform: {
      position: { x: 0, y: 0, z: 16 },
      rotation: { x: 0, y: 0, z: 0 },
      fov: 45,
    },
    deviceRotation: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'cue-isometric',
    time: 4,
    title: 'Isometric Precision',
    description: 'Dynamic metallic reflection, contact shadows, and screen texture.',
    slideIndex: 1,
    headlineText: 'PBR Material Fidelity',
    subText: 'Real-time Ray-aligned Studio Lighting & Anisotropic Shaders',
    badgeText: 'PBR METALLIC',
    cameraTransform: {
      position: { x: -10, y: 8, z: 14 },
      rotation: { x: 0.15, y: -0.35, z: 0 },
      fov: 42,
    },
    deviceRotation: { x: 0.15, y: -0.35, z: 0 },
    cursorTarget: { x: 62, y: 48, click: true },
  },
  {
    id: 'cue-mobile',
    time: 8,
    title: 'Responsive Multi-Device',
    description: 'Switch effortlessly between MacBook Pro, iPhone 16 Pro & Glass Browser.',
    slideIndex: 2,
    headlineText: 'Device Staging Anywhere',
    subText: 'iPhone 16 Pro Dynamic Island & Glassmorphism Floating Browser',
    badgeText: 'MULTI-SURFACE',
    cameraTransform: {
      position: { x: 10, y: 6, z: 14 },
      rotation: { x: 0.12, y: 0.3, z: 0 },
      fov: 40,
    },
    deviceRotation: { x: 0.1, y: 0.35, z: 0 },
    cursorTarget: { x: 45, y: 55, click: true },
  },
  {
    id: 'cue-export',
    time: 12,
    title: 'Multi-Surface Publishing',
    description: '1-click export to 4K Video, Interactive Presentation, PDF & valid EPUB3.',
    slideIndex: 3,
    headlineText: 'Publish in Every Format',
    subText: 'Client-Side Offline Render Pump, jsPDF Deck & EPUB3 Packaging',
    badgeText: 'ZERO-BACKEND',
    cameraTransform: {
      position: { x: 0, y: -2, z: 14 },
      rotation: { x: -0.05, y: 0, z: 0 },
      fov: 44,
    },
    deviceRotation: { x: 0, y: 0, z: 0 },
  },
];

export const DEFAULT_SLIDES: SlideData[] = [
  {
    id: 'slide-1',
    title: 'Introducing MotionStudio',
    subtitle: 'Next-Gen 3D Staging & Multi-Surface Publishing',
    content: [
      'Zero-Latency Client-Side 4K Stream Capture',
      'PiP Webcam with Draggable Circular Viewport',
      'Dual-Stream Web Audio Graph Mixer',
    ],
    deviceType: 'macbook',
    cameraPreset: 'front',
    duration: 4,
    notes: 'Introduce the core problem: modern product showcases require high fidelity 3D presentation.',
  },
  {
    id: 'slide-2',
    title: 'PBR Material Fidelity',
    subtitle: 'Real-time Ray-aligned Studio Lighting & Anisotropic Shaders',
    content: [
      'Procedural Aluminum & Titanium Finishes',
      'Soft Gaussian Contact Shadows',
      'Dynamic UV Aspect Ratio Fitting',
    ],
    deviceType: 'macbook',
    cameraPreset: 'isometric-left',
    duration: 4,
    notes: 'Highlight the spatial Three.js scene and dynamic VideoTexture pipeline.',
  },
  {
    id: 'slide-3',
    title: 'Responsive Multi-Device Staging',
    subtitle: 'iPhone 16 Pro Dynamic Island & Glassmorphism Floating Browser',
    content: [
      'Instant Seamless Device Switching',
      'Anime.js v4 Unified Spatial Interpolator',
      'Kinetic Split Typography & Cursor Trajectories',
    ],
    deviceType: 'iphone',
    cameraPreset: 'mobile-focus',
    duration: 4,
    notes: 'Demonstrate responsiveness across desktop and mobile form factors.',
  },
  {
    id: 'slide-4',
    title: 'Publish in Every Format',
    subtitle: 'Client-Side Offline Render Pump, jsPDF Deck & EPUB3 Packaging',
    content: [
      'WebM & MP4 H.264 Video Offline Capture Pump',
      '1920x1080 Landscape Multi-Page PDF Exporter',
      'Valid EPUB3 Container Packaging via JSZip',
    ],
    deviceType: 'browser',
    cameraPreset: 'front',
    duration: 4,
    notes: 'Wrap up with local-first export capabilities for all platforms.',
  },
];

export class TimelineController {
  private threeScene: ThreeSceneManager;
  private cuePoints: CuePoint[] = DEFAULT_CUE_POINTS;
  private slides: SlideData[] = DEFAULT_SLIDES;
  private totalDuration = 16; // 16 seconds total timeline
  private currentTime = 0;
  private isPlaying = false;
  private playbackRate = 1.0;
  private animationFrameId: number | null = null;
  private lastTimestamp = 0;

  private onTimeUpdateCallback?: (currentTime: number, progress: number, activeCueIndex: number) => void;
  private onSlideChangeCallback?: (slideIndex: number) => void;

  constructor(
    threeScene: ThreeSceneManager,
    onTimeUpdate?: (currentTime: number, progress: number, activeCueIndex: number) => void,
    onSlideChange?: (slideIndex: number) => void
  ) {
    this.threeScene = threeScene;
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onSlideChangeCallback = onSlideChange;
  }

  public getCuePoints(): CuePoint[] {
    return this.cuePoints;
  }

  public getSlides(): SlideData[] {
    return this.slides;
  }

  public getTotalDuration(): number {
    return this.totalDuration;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getActiveCueIndex(): number {
    for (let i = this.cuePoints.length - 1; i >= 0; i--) {
      if (this.currentTime >= this.cuePoints[i].time) {
        return i;
      }
    }
    return 0;
  }

  public getActiveSlideIndex(): number {
    const cue = this.cuePoints[this.getActiveCueIndex()];
    return cue ? cue.slideIndex : 0;
  }

  public play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this.loop();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public setPlaybackRate(rate: number): void {
    this.playbackRate = Math.max(0.25, Math.min(rate, 4.0));
  }

  public seek(time: number): void {
    this.currentTime = Math.max(0, Math.min(time, this.totalDuration));
    this.applyMotionAtTime(this.currentTime);
    this.notifyUpdate();
  }

  public seekProgress(progress: number): void {
    this.seek(progress * this.totalDuration);
  }

  public stepNextCue(): void {
    const currentIndex = this.getActiveCueIndex();
    if (currentIndex < this.cuePoints.length - 1) {
      this.seek(this.cuePoints[currentIndex + 1].time);
    } else {
      this.seek(0);
    }
  }

  public stepPrevCue(): void {
    const currentIndex = this.getActiveCueIndex();
    if (currentIndex > 0) {
      this.seek(this.cuePoints[currentIndex - 1].time);
    } else {
      this.seek(0);
    }
  }

  public jumpToSlide(slideIndex: number): void {
    const cue = this.cuePoints.find((c) => c.slideIndex === slideIndex);
    if (cue) {
      this.seek(cue.time);
    }
  }

  /**
   * Applies spatial Three.js coordinates and DOM kinematics based on current timeline time
   */
  public applyMotionAtTime(time: number): void {
    const cues = this.cuePoints;
    if (cues.length === 0) return;

    // Find segment between cues
    let prevCue = cues[0];
    let nextCue = cues[cues.length - 1];

    for (let i = 0; i < cues.length; i++) {
      if (time >= cues[i].time) {
        prevCue = cues[i];
        nextCue = cues[Math.min(i + 1, cues.length - 1)];
      }
    }

    const segmentDuration = Math.max(0.001, nextCue.time - prevCue.time);
    const rawProgress = prevCue === nextCue ? 0 : (time - prevCue.time) / segmentDuration;
    const clampedProgress = Math.max(0, Math.min(1, rawProgress));

    // Smooth cubic bezier easing
    const easedProgress = anime.bezier(0.4, 0.0, 0.2, 1.0)(clampedProgress);

    const prevCam = prevCue.cameraTransform?.position || { x: 0, y: 0, z: 16 };
    const nextCam = nextCue.cameraTransform?.position || { x: 0, y: 0, z: 16 };

    const prevRot = prevCue.deviceRotation || { x: 0, y: 0, z: 0 };
    const nextRot = nextCue.deviceRotation || { x: 0, y: 0, z: 0 };

    // Interpolate spatial camera position
    const camX = prevCam.x + (nextCam.x - prevCam.x) * easedProgress;
    const camY = prevCam.y + (nextCam.y - prevCam.y) * easedProgress;
    const camZ = prevCam.z + (nextCam.z - prevCam.z) * easedProgress;

    // Interpolate device rotation
    const rotX = prevRot.x + (nextRot.x - prevRot.x) * easedProgress;
    const rotY = prevRot.y + (nextRot.y - prevRot.y) * easedProgress;
    const rotZ = prevRot.z + (nextRot.z - prevRot.z) * easedProgress;

    const prevFov = prevCue.cameraTransform?.fov || 45;
    const nextFov = nextCue.cameraTransform?.fov || 45;
    const fov = prevFov + (nextFov - prevFov) * easedProgress;

    this.threeScene.setCameraTransform(camX, camY, camZ, 0, 0, 0, fov);
    this.threeScene.setDeviceTransform(rotX, rotY, rotZ);
  }

  private loop(): void {
    if (!this.isPlaying) return;

    const now = performance.now();
    const delta = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    this.currentTime += delta * this.playbackRate;

    if (this.currentTime >= this.totalDuration) {
      this.currentTime = 0; // Loop seamlessly
    }

    this.applyMotionAtTime(this.currentTime);
    this.notifyUpdate();

    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  private notifyUpdate(): void {
    const progress = this.totalDuration > 0 ? this.currentTime / this.totalDuration : 0;
    const activeCueIndex = this.getActiveCueIndex();
    const activeSlideIndex = this.getActiveSlideIndex();

    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentTime, progress, activeCueIndex);
    }
    if (this.onSlideChangeCallback) {
      this.onSlideChangeCallback(activeSlideIndex);
    }
  }

  public dispose(): void {
    this.pause();
  }
}
