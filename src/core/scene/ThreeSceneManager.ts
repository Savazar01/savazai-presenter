// ThreeSceneManager — 3D Spatial Device Staging & Dynamic VideoTexture Compositor
import * as THREE from 'three';
import { DeviceType, DeviceFinish, CameraPreset, DeviceFinishConfig } from '@/types';

export const DEVICE_FINISHES: Record<DeviceFinish, DeviceFinishConfig> = {
  'space-black': {
    name: 'Space Black',
    bodyColor: 0x18191c,
    bodyRoughness: 0.35,
    bodyMetalness: 0.88,
    bezelColor: 0x08080a,
    accentColor: 0x2e3038,
  },
  'silver': {
    name: 'Silver Anodized',
    bodyColor: 0xd9dde4,
    bodyRoughness: 0.28,
    bodyMetalness: 0.92,
    bezelColor: 0x111114,
    accentColor: 0xe8ecf2,
  },
  'titanium-natural': {
    name: 'Natural Titanium',
    bodyColor: 0x8a8782,
    bodyRoughness: 0.42,
    bodyMetalness: 0.78,
    bezelColor: 0x0c0c0e,
    accentColor: 0xa39f98,
  },
  'midnight': {
    name: 'Midnight Navy',
    bodyColor: 0x121a28,
    bodyRoughness: 0.32,
    bodyMetalness: 0.85,
    bezelColor: 0x070b12,
    accentColor: 0x1d2c44,
  },
  'deep-purple': {
    name: 'Deep Purple',
    bodyColor: 0x2b1c38,
    bodyRoughness: 0.36,
    bodyMetalness: 0.82,
    bezelColor: 0x0e0914,
    accentColor: 0x462e5b,
  },
};

export class ThreeSceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;

  // Scene Objects
  private deviceGroup: THREE.Group;
  private activeDeviceMesh: THREE.Group | null = null;
  private screenMesh: THREE.Mesh | null = null;
  private shadowPlane: THREE.Mesh | null = null;

  // Materials & Textures
  private currentFinish: DeviceFinish = 'space-black';
  private videoTexture: THREE.VideoTexture | THREE.CanvasTexture | null = null;
  private placeholderTexture: THREE.CanvasTexture | null = null;
  private screenMaterial: THREE.MeshBasicMaterial | null = null;

  // Lighting
  private keyLight!: THREE.DirectionalLight;
  private fillLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;

  // Camera Target
  private targetCameraPos = new THREE.Vector3(0, 0, 16);
  private targetCameraLookAt = new THREE.Vector3(0, 0, 0);
  private currentCameraLookAt = new THREE.Vector3(0, 0, 0);

  // Device Transform Targets for smooth manual interaction
  private targetDeviceRot = new THREE.Euler(0, 0, 0);
  private isPointerDown = false;
  private previousPointerPos = { x: 0, y: 0 };

  constructor(container: HTMLElement) {
    this.container = container;

    // Initialize Three.js Core
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent to allow CSS dark studio background

    const width = container.clientWidth || 1280;
    const height = container.clientHeight || 720;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 16);
    this.currentCameraLookAt.set(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // Crucial for video & PDF frame capture
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    this.deviceGroup = new THREE.Group();
    this.scene.add(this.deviceGroup);

    this.setupLighting();
    this.setupShadowPlane();
    this.createPlaceholderTexture();
    this.setupEventListeners();

    // Default setup
    this.setDevice('macbook');
    this.startRenderLoop();
  }

  private setupLighting(): void {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(this.ambientLight);

    // Studio 3-point lighting rig
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(8, 12, 10);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 35;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0xa5c4f2, 1.0);
    this.fillLight.position.set(-10, 4, 8);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0x60a5fa, 1.8);
    this.rimLight.position.set(0, -6, -10);
    this.scene.add(this.rimLight);
  }

  private setupShadowPlane(): void {
    const shadowGeo = new THREE.PlaneGeometry(35, 35);
    // Soft shadow material
    const shadowMat = new THREE.ShadowMaterial({
      opacity: 0.45,
    });
    this.shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = -4.5;
    this.shadowPlane.receiveShadow = true;
    this.scene.add(this.shadowPlane);
  }

  private createPlaceholderTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;

    // Rich gradient background
    const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Grid lines
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.lineWidth = 2;
    for (let x = 0; x < 1920; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1080);
      ctx.stroke();
    }
    for (let y = 0; y < 1080; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1920, y);
      ctx.stroke();
    }

    // Modern MotionStudio branding watermark
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MotionStudio 3D Canvas', 1920 / 2, 1080 / 2 - 20);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '28px "JetBrains Mono", monospace';
    ctx.fillText('Ready for 4K Screen Stream or Presentation Deck', 1920 / 2, 1080 / 2 + 45);

    // Glowing badge pill
    ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.beginPath();
    ctx.roundRect(1920 / 2 - 160, 1080 / 2 + 90, 320, 48, 24);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#60a5fa';
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('● 60 FPS ZERO-LATENCY PIPELINE', 1920 / 2, 1080 / 2 + 122);

    this.placeholderTexture = new THREE.CanvasTexture(canvas);
    this.placeholderTexture.colorSpace = THREE.SRGBColorSpace;
  }

  /**
   * Binds an active video element or dynamic canvas to the 3D screen texture
   */
  public bindVideoStream(video: HTMLVideoElement | HTMLCanvasElement): void {
    if (this.videoTexture) {
      this.videoTexture.dispose();
    }

    if (video instanceof HTMLVideoElement) {
      this.videoTexture = new THREE.VideoTexture(video);
    } else {
      this.videoTexture = new THREE.CanvasTexture(video);
    }

    this.videoTexture.colorSpace = THREE.SRGBColorSpace;
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
    this.videoTexture.generateMipmaps = false;

    if (this.screenMaterial) {
      this.screenMaterial.map = this.videoTexture;
      this.screenMaterial.needsUpdate = true;
    }
  }

  /**
   * Unbinds video stream and restores the studio placeholder texture
   */
  public unbindVideoStream(): void {
    if (this.screenMaterial && this.placeholderTexture) {
      this.screenMaterial.map = this.placeholderTexture;
      this.screenMaterial.needsUpdate = true;
    }
    if (this.videoTexture) {
      this.videoTexture.dispose();
      this.videoTexture = null;
    }
  }

  /**
   * Builds procedural 3D device staging mesh
   */
  public setDevice(type: DeviceType): void {
    // Clean up old mesh
    if (this.activeDeviceMesh) {
      this.deviceGroup.remove(this.activeDeviceMesh);
      this.activeDeviceMesh.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      this.activeDeviceMesh = null;
    }

    if (type === 'none') {
      return;
    }

    const finish = DEVICE_FINISHES[this.currentFinish];

    const bodyMat = new THREE.MeshStandardMaterial({
      color: finish.bodyColor,
      roughness: finish.bodyRoughness,
      metalness: finish.bodyMetalness,
      envMapIntensity: 1.2,
    });

    const bezelMat = new THREE.MeshStandardMaterial({
      color: finish.bezelColor,
      roughness: 0.15,
      metalness: 0.2,
    });

    const darkAccentMat = new THREE.MeshStandardMaterial({
      color: 0x111116,
      roughness: 0.6,
      metalness: 0.1,
    });

    const textureToUse = this.videoTexture || this.placeholderTexture;
    this.screenMaterial = new THREE.MeshBasicMaterial({
      map: textureToUse,
    });

    const group = new THREE.Group();

    if (type === 'macbook') {
      // 1. Base enclosure
      const baseGeo = new THREE.BoxGeometry(14, 0.45, 9.4);
      const baseMesh = new THREE.Mesh(baseGeo, bodyMat);
      baseMesh.position.set(0, -2.5, 2.5);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Keyboard recess
      const kbWellGeo = new THREE.BoxGeometry(11.2, 0.05, 4.4);
      const kbWell = new THREE.Mesh(kbWellGeo, darkAccentMat);
      kbWell.position.set(0, -2.25, 1.4);
      group.add(kbWell);

      // Glass trackpad
      const trackpadGeo = new THREE.BoxGeometry(4.8, 0.04, 3.2);
      const trackpadMat = new THREE.MeshStandardMaterial({
        color: finish.bodyColor,
        roughness: 0.12,
        metalness: 0.4,
      });
      const trackpad = new THREE.Mesh(trackpadGeo, trackpadMat);
      trackpad.position.set(0, -2.25, 5.6);
      group.add(trackpad);

      // 2. Display Lid (Tilted at ~106 degrees)
      const lidGroup = new THREE.Group();
      lidGroup.position.set(0, -2.25, -2.2);
      lidGroup.rotation.x = -Math.PI / 18; // Sleek open posture

      const lidBackGeo = new THREE.BoxGeometry(14, 9.2, 0.35);
      const lidBack = new THREE.Mesh(lidBackGeo, bodyMat);
      lidBack.position.set(0, 4.6, 0);
      lidBack.castShadow = true;
      lidGroup.add(lidBack);

      // Glass front bezel
      const bezelGeo = new THREE.BoxGeometry(13.8, 9.0, 0.02);
      const bezel = new THREE.Mesh(bezelGeo, bezelMat);
      bezel.position.set(0, 4.6, 0.18);
      lidGroup.add(bezel);

      // Display Notch cutout pill
      const notchGeo = new THREE.BoxGeometry(1.4, 0.35, 0.04);
      const notch = new THREE.Mesh(notchGeo, bezelMat);
      notch.position.set(0, 8.85, 0.2);
      lidGroup.add(notch);

      // Screen plane (16:10 ratio)
      const screenGeo = new THREE.PlaneGeometry(13.2, 8.25);
      this.screenMesh = new THREE.Mesh(screenGeo, this.screenMaterial);
      this.screenMesh.position.set(0, 4.5, 0.2);
      lidGroup.add(this.screenMesh);

      group.add(lidGroup);
      group.position.set(0, -0.5, 0);
    } else if (type === 'iphone') {
      // iPhone 16 Pro — Curved Titanium chassis & Dynamic Island
      const phoneWidth = 6.4;
      const phoneHeight = 13.2;
      const phoneDepth = 0.75;

      const bodyGeo = new THREE.BoxGeometry(phoneWidth, phoneHeight, phoneDepth);
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.castShadow = true;
      group.add(bodyMesh);

      // Back camera plateau
      const camPlateauGeo = new THREE.BoxGeometry(3.0, 3.2, 0.3);
      const camPlateau = new THREE.Mesh(camPlateauGeo, bodyMat);
      camPlateau.position.set(-1.4, 4.6, -0.45);
      group.add(camPlateau);

      // Triple Camera Lenses
      const lensGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.2, 32);
      const lensMat = new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.1, metalness: 0.95 });

      const lens1 = new THREE.Mesh(lensGeo, lensMat);
      lens1.rotation.x = Math.PI / 2;
      lens1.position.set(-1.4, 5.3, -0.65);
      group.add(lens1);

      const lens2 = new THREE.Mesh(lensGeo, lensMat);
      lens2.rotation.x = Math.PI / 2;
      lens2.position.set(-1.4, 3.9, -0.65);
      group.add(lens2);

      const lens3 = new THREE.Mesh(lensGeo, lensMat);
      lens3.rotation.x = Math.PI / 2;
      lens3.position.set(-0.3, 4.6, -0.65);
      group.add(lens3);

      // Front Bezel Frame
      const frontBezelGeo = new THREE.PlaneGeometry(phoneWidth - 0.2, phoneHeight - 0.2);
      const frontBezel = new THREE.Mesh(frontBezelGeo, bezelMat);
      frontBezel.position.set(0, 0, 0.38);
      group.add(frontBezel);

      // OLED Screen plane (19.5:9 mobile ratio)
      const screenGeo = new THREE.PlaneGeometry(phoneWidth - 0.45, phoneHeight - 0.6);
      this.screenMesh = new THREE.Mesh(screenGeo, this.screenMaterial);
      this.screenMesh.position.set(0, 0, 0.39);
      group.add(this.screenMesh);

      // Dynamic Island cutout pill
      const islandGeo = new THREE.BoxGeometry(1.6, 0.4, 0.05);
      const island = new THREE.Mesh(islandGeo, bezelMat);
      island.position.set(0, 5.8, 0.41);
      group.add(island);

      group.position.set(0, 0, 0);
    } else if (type === 'browser') {
      // Floating Glassmorphism Browser
      const browserWidth = 15;
      const browserHeight = 9.5;

      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        roughness: 0.15,
        transmission: 0.85,
        thickness: 0.8,
        ior: 1.52,
        transparent: true,
        opacity: 0.92,
        metalness: 0.1,
      });

      const frameGeo = new THREE.BoxGeometry(browserWidth, browserHeight, 0.3);
      const frame = new THREE.Mesh(frameGeo, glassMat);
      frame.castShadow = true;
      group.add(frame);

      // Traffic light buttons
      const btnGeo = new THREE.CircleGeometry(0.16, 24);
      const redBtn = new THREE.Mesh(btnGeo, new THREE.MeshBasicMaterial({ color: 0xff5f56 }));
      redBtn.position.set(-browserWidth / 2 + 0.6, browserHeight / 2 - 0.5, 0.16);
      group.add(redBtn);

      const yellowBtn = new THREE.Mesh(btnGeo, new THREE.MeshBasicMaterial({ color: 0xffbd2e }));
      yellowBtn.position.set(-browserWidth / 2 + 1.1, browserHeight / 2 - 0.5, 0.16);
      group.add(yellowBtn);

      const greenBtn = new THREE.Mesh(btnGeo, new THREE.MeshBasicMaterial({ color: 0x27c93f }));
      greenBtn.position.set(-browserWidth / 2 + 1.6, browserHeight / 2 - 0.5, 0.16);
      group.add(greenBtn);

      // Address Bar Pill
      const barGeo = new THREE.PlaneGeometry(6.5, 0.45);
      const barMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, browserHeight / 2 - 0.5, 0.16);
      group.add(bar);

      // Screen plane inside browser viewport
      const screenGeo = new THREE.PlaneGeometry(browserWidth - 0.6, browserHeight - 1.3);
      this.screenMesh = new THREE.Mesh(screenGeo, this.screenMaterial);
      this.screenMesh.position.set(0, -0.4, 0.16);
      group.add(this.screenMesh);

      group.position.set(0, 0, 0);
    }

    this.activeDeviceMesh = group;
    this.deviceGroup.add(group);
  }

  public setFinish(finish: DeviceFinish): void {
    this.currentFinish = finish;
    // Rebuild current device to apply new PBR finish
    if (this.activeDeviceMesh) {
      const type = this.getCurrentDeviceType();
      this.setDevice(type);
    }
  }

  private getCurrentDeviceType(): DeviceType {
    if (!this.activeDeviceMesh) return 'none';
    if (this.activeDeviceMesh.children.length > 5) return 'iphone';
    if (this.activeDeviceMesh.children.some((c) => c instanceof THREE.Group)) return 'macbook';
    return 'browser';
  }

  /**
   * Smoothly moves camera to predefined camera presets
   */
  public setCameraPreset(preset: CameraPreset): void {
    switch (preset) {
      case 'front':
        this.targetCameraPos.set(0, 0, 16);
        this.targetCameraLookAt.set(0, 0, 0);
        this.targetDeviceRot.set(0, 0, 0);
        break;
      case 'isometric-left':
        this.targetCameraPos.set(-10, 8, 14);
        this.targetCameraLookAt.set(0, 0, 0);
        this.targetDeviceRot.set(0.15, -0.35, 0);
        break;
      case 'isometric-right':
        this.targetCameraPos.set(10, 8, 14);
        this.targetCameraLookAt.set(0, 0, 0);
        this.targetDeviceRot.set(0.15, 0.35, 0);
        break;
      case 'top-down':
        this.targetCameraPos.set(0, 18, 5);
        this.targetCameraLookAt.set(0, 0, 0);
        this.targetDeviceRot.set(0, 0, 0);
        break;
      case 'dramatic-tilt':
        this.targetCameraPos.set(-7, -3, 13);
        this.targetCameraLookAt.set(0, 1, 0);
        this.targetDeviceRot.set(-0.2, -0.4, 0.1);
        break;
      case 'mobile-focus':
        this.targetCameraPos.set(0, 0, 11.5);
        this.targetCameraLookAt.set(0, 0, 0);
        this.targetDeviceRot.set(0, 0, 0);
        break;
    }
  }

  /**
   * Direct spatial transform overrides for Anime.js timeline orchestrator
   */
  public setCameraTransform(x: number, y: number, z: number, lookX = 0, lookY = 0, lookZ = 0, fov?: number): void {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(lookX, lookY, lookZ);
    this.currentCameraLookAt.set(lookX, lookY, lookZ);
    if (fov && this.camera.fov !== fov) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }

  public setDeviceTransform(rx: number, ry: number, rz: number, px = 0, py = 0, pz = 0): void {
    if (this.activeDeviceMesh) {
      this.activeDeviceMesh.rotation.set(rx, ry, rz);
      this.activeDeviceMesh.position.set(px, py, pz);
    }
  }

  public getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  private setupEventListeners(): void {
    const el = this.renderer.domElement;

    el.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.previousPointerPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown || !this.activeDeviceMesh) return;
      const deltaX = e.clientX - this.previousPointerPos.x;
      const deltaY = e.clientY - this.previousPointerPos.y;

      this.activeDeviceMesh.rotation.y += deltaX * 0.006;
      this.activeDeviceMesh.rotation.x += deltaY * 0.006;

      this.previousPointerPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onWindowResize(): void {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private startRenderLoop(): void {
    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);

      // Smooth camera dampening when not under explicit timeline override
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      this.currentCameraLookAt.lerp(this.targetCameraLookAt, 0.06);
      this.camera.lookAt(this.currentCameraLookAt);

      if (!this.isPointerDown && this.activeDeviceMesh) {
        this.activeDeviceMesh.rotation.x = THREE.MathUtils.lerp(this.activeDeviceMesh.rotation.x, this.targetDeviceRot.x, 0.05);
        this.activeDeviceMesh.rotation.y = THREE.MathUtils.lerp(this.activeDeviceMesh.rotation.y, this.targetDeviceRot.y, 0.05);
        this.activeDeviceMesh.rotation.z = THREE.MathUtils.lerp(this.activeDeviceMesh.rotation.z, this.targetDeviceRot.z, 0.05);
      }

      this.renderer.render(this.scene, this.camera);
    };

    render();
  }

  public renderDirect(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
