// MotionStudio Core Type Definitions

export type DeviceType = 'macbook' | 'iphone' | 'browser' | 'none';

export type DeviceFinish = 'space-black' | 'silver' | 'titanium-natural' | 'midnight' | 'deep-purple';

export interface DeviceFinishConfig {
  name: string;
  bodyColor: number;
  bodyRoughness: number;
  bodyMetalness: number;
  bezelColor: number;
  accentColor: number;
}

export type CameraPreset = 'front' | 'isometric-left' | 'isometric-right' | 'top-down' | 'dramatic-tilt' | 'mobile-focus';

export interface Transform3D {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  fov?: number;
}

export interface CuePoint {
  id: string;
  time: number; // in seconds
  title: string;
  description: string;
  slideIndex: number;
  cameraTransform?: Transform3D;
  deviceRotation?: { x: number; y: number; z: number };
  headlineText?: string;
  subText?: string;
  badgeText?: string;
  cursorTarget?: { x: number; y: number; click?: boolean };
}

export interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
  deviceType: DeviceType;
  cameraPreset: CameraPreset;
  duration: number; // seconds
  notes?: string;
}

export interface StreamState {
  hasDisplayStream: boolean;
  hasWebcamStream: boolean;
  hasMicStream: boolean;
  displayVideoTrack?: MediaStreamTrack;
  displayAudioTrack?: MediaStreamTrack;
  webcamVideoTrack?: MediaStreamTrack;
  micAudioTrack?: MediaStreamTrack;
  streamResolution?: { width: number; height: number };
  streamFps?: number;
}

export interface AudioLevels {
  displayVolume: number;
  micVolume: number;
  masterVolume: number;
  displayMuted: boolean;
  micMuted: boolean;
}

export interface PipConfig {
  enabled: boolean;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  size: number; // pixels
  shape: 'circle' | 'rounded-rect';
  borderWidth: number;
  borderColor: string;
  shadow: boolean;
}

export interface StudioState {
  currentDevice: DeviceType;
  deviceFinish: DeviceFinish;
  cameraPreset: CameraPreset;
  pipConfig: PipConfig;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  playbackRate: number;
  activeCueIndex: number;
  activeSlideIndex: number;
  isRecording: boolean;
  isPresentationMode: boolean;
  isExportModalOpen: boolean;
  audioLevels: AudioLevels;
}

export interface ExportProgress {
  stage: 'idle' | 'preparing' | 'rendering' | 'encoding' | 'packaging' | 'complete' | 'error';
  progress: number; // 0 - 100
  message: string;
}

export type ExportFormat = 'video-webm' | 'video-mp4' | 'pdf-deck' | 'epub-book' | 'deck-json';
