// MotionStudio Core Type Definitions

export type DeviceType = 'macbook' | 'iphone' | 'browser' | 'windows-desktop' | 'pixel-android' | 'frameless' | 'none';

export type StageMode = '3d-stage' | '2d-direct';

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
export type PipShape = 'circle' | 'squircle' | 'square' | 'rounded-rect';
export type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type VirtualBgType =
  | 'none'
  | 'blur-low'
  | 'blur-medium'
  | 'blur-high'
  | 'preset-office'
  | 'preset-studio'
  | 'preset-scenic'
  | 'custom-image';

export interface WebcamBackgroundConfig {
  type: VirtualBgType;
  blurAmount?: number;
  customImageUrl?: string;
}

export interface PipConfig {
  enabled: boolean;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  size: number; // pixels
  sizePercent?: number; // 10 - 40 (%)
  shape: PipShape;
  borderWidth: number;
  borderColor: string;
  shadow: boolean;
  placementPreset: PipPlacementPreset;
  cornerPosition?: CornerPosition;
  mirror?: boolean;
  background?: WebcamBackgroundConfig;
}

export type ActiveToolTab =
  | 'background'
  | 'mockup'
  | 'motion'
  | 'zoom'
  | 'video'
  | 'elements'
  | 'audio'
  | 'record'
  | 'upload'
  | null;

export type Frame2DType =
  | 'none'
  | 'outline'
  | 'macos-light'
  | 'macos-dark'
  | 'macos-glass'
  | 'brave'
  | 'chrome';

export interface WallpaperConfig {
  type: 'wallpaper' | 'color' | 'gradient';
  presetId: string;
  customUrl?: string;
  color: string;
  gradient: string;
  blur: number;
  padding: number;
  borderRadius: number;
  shadowDepth: number;
}

export interface MockupConfig {
  mode: '3d' | '2d';
  frame2D: Frame2DType;
  device3D: DeviceType;
}

export interface ZoomFragment {
  id: string;
  startTime: number;
  endTime: number;
  targetFocus: { x: number; y: number; scale: number };
  ease: string;
}

export type MaskEffectType =
  | 'none'
  | 'fade-top'
  | 'fade-bottom'
  | 'fade-sides'
  | 'vignette'
  | 'diagonal-45';

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

export interface RecordingBoothState {
  isRecording: boolean;
  isCountingDown: boolean;
  countdownNumber: number;
  isPaused: boolean;
  recordingDuration: number;
  isBoothActive: boolean;
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
