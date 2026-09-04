// MotionStudio Core Type Definitions

export type DeviceType = 'macbook' | 'iphone' | 'browser' | 'windows-desktop' | 'pixel-android' | 'none';

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

export type PipPlacementPreset = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'custom';
export type PipShape = 'circle' | 'rounded-rect' | 'square';

export interface PipConfig {
  enabled: boolean;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  size: number; // pixels
  shape: PipShape;
  borderWidth: number;
  borderColor: string;
  shadow: boolean;
  placementPreset: PipPlacementPreset;
}

export interface CalloutOverlay {
  id: string;
  startTime: number;
  endTime: number;
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  title: string;
  description?: string;
  badge?: string;
  arrowDirection?: 'up' | 'down' | 'left' | 'right' | 'none';
  animation: 'fade' | 'bounce' | 'typewriter';
  colorTheme: 'blue' | 'indigo' | 'emerald' | 'rose' | 'amber';
}

export interface TrimRange {
  start: number; // in seconds
  end: number; // in seconds
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
  isCustomMediaLoaded?: boolean;
  customMediaName?: string;
}

export interface AudioLevels {
  displayVolume: number;
  micVolume: number;
  backgroundMusicVolume?: number;
  masterVolume: number;
  displayMuted: boolean;
  micMuted: boolean;
}

export interface StudioState {
  currentDevice: DeviceType;
  deviceFinish: DeviceFinish;
  cameraPreset: CameraPreset;
  pipConfig: PipConfig;
  currentTime: number;
  totalDuration: number;
  trimRange: TrimRange;
  callouts: CalloutOverlay[];
  isPlaying: boolean;
  playbackRate: number;
  activeCueIndex: number;
  activeSlideIndex: number;
  isRecording: boolean;
  isPresentationMode: boolean;
  isExportModalOpen: boolean;
  isEditorMode: boolean;
  audioLevels: AudioLevels;
}

export interface ExportProgress {
  stage: 'idle' | 'preparing' | 'rendering' | 'encoding' | 'packaging' | 'complete' | 'error';
  progress: number; // 0 - 100
  message: string;
}

export type ExportFormat = 'video-webm' | 'video-mp4' | 'pdf-deck' | 'epub-book' | 'deck-json';
