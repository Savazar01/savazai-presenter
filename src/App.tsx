// App.tsx — MotionStudio Main Application Root & Global State Coordinator
import React, { useEffect, useRef, useState } from 'react';
import {
  DeviceType,
  DeviceFinish,
  CameraPreset,
  PipConfig,
  AudioLevels,
  StreamState,
  CuePoint,
  SlideData,
  CalloutOverlay,
  TrimRange,
} from '@/types';
import { ThreeSceneManager } from '@/core/scene/ThreeSceneManager';
import { TimelineController, DEFAULT_CUE_POINTS, DEFAULT_SLIDES } from '@/core/motion/TimelineController';
import { CaptureEngine } from '@/core/capture/CaptureEngine';
import { VideoRecorder } from '@/core/exporters/VideoRecorder';
import { Header } from '@/components/Header';
import { StudioCanvas } from '@/components/StudioCanvas';
import { TimelineBar } from '@/components/TimelineBar';
import { DeviceControls } from '@/components/DeviceControls';
import { CaptureControls } from '@/components/CaptureControls';
import { VideoEditorPanel } from '@/components/VideoEditorPanel';
import { PresentationMode } from '@/components/PresentationMode';
import { ExportModal } from '@/components/ExportModal';
import { triggerFileDownload } from '@/core/exporters/DocumentExporters';

export function App() {
  // Core Engine Instances
  const [threeScene, setThreeScene] = useState<ThreeSceneManager | null>(null);
  const [timeline, setTimeline] = useState<TimelineController | null>(null);
  const [captureEngine, setCaptureEngine] = useState<CaptureEngine | null>(null);
  const [videoRecorder, setVideoRecorder] = useState<VideoRecorder | null>(null);

  // Studio UI & Mode State
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('macbook');
  const [deviceFinish, setDeviceFinish] = useState<DeviceFinish>('space-black');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('front');

  // Video Asset & Editor State
  const [loadedVideoName, setLoadedVideoName] = useState<string | undefined>(undefined);
  const [trimRange, setTrimRange] = useState<TrimRange>({ start: 0, end: 16 });
  const [callouts, setCallouts] = useState<CalloutOverlay[]>([
    {
      id: 'callout-1',
      title: '3D Spatial Staging',
      description: 'Zero-backend WebGL device viewport compositing',
      badge: 'PRO FEATURE',
      startTime: 0.5,
      endTime: 4.5,
      x: 10,
      y: 72,
      animation: 'bounce',
      colorTheme: 'blue',
    },
  ]);

  // PiP Config
  const [pipConfig, setPipConfig] = useState<PipConfig>({
    enabled: true,
    x: 88,
    y: 82,
    size: 170,
    shape: 'circle',
    placementPreset: 'bottom-right',
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadow: true,
  });

  // Audio Levels
  const [audioLevels, setAudioLevels] = useState<AudioLevels>({
    displayVolume: 1.0,
    micVolume: 1.0,
    masterVolume: 1.0,
    displayMuted: false,
    micMuted: false,
  });

  // Media Stream State
  const [streamState, setStreamState] = useState<StreamState>({
    hasDisplayStream: false,
    hasWebcamStream: false,
    hasMicStream: false,
    isCustomMediaLoaded: false,
  });

  // Timeline & Choreography State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [activeCueIndex, setActiveCueIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [cuePoints] = useState<CuePoint[]>(DEFAULT_CUE_POINTS);
  const [slides] = useState<SlideData[]>(DEFAULT_SLIDES);

  // Modals & Modes
  const [isRecording, setIsRecording] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Hidden video element for display stream or uploaded video texture feed
  const displayVideoRef = useRef<HTMLVideoElement | null>(null);

  // 1. Initialize Engines on mount
  useEffect(() => {
    // Hidden video feed element
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.loop = true;
    displayVideoRef.current = video;

    // Capture Engine
    const capture = new CaptureEngine((state) => {
      setStreamState(state);
    });
    setCaptureEngine(capture);

    return () => {
      capture.dispose();
    };
  }, []);

  // 2. Initialize Three.js Scene and Timeline
  useEffect(() => {
    const canvasContainer = document.getElementById('three-viewport');
    if (!canvasContainer) return;

    const sceneMgr = new ThreeSceneManager(canvasContainer);
    setThreeScene(sceneMgr);

    const tl = new TimelineController(
      sceneMgr,
      (time, _progress, cueIndex) => {
        setCurrentTime(time);
        setActiveCueIndex(cueIndex);
      },
      (slideIdx) => {
        setActiveSlideIndex(slideIdx);
      }
    );
    setTimeline(tl);

    if (captureEngine) {
      const recorder = new VideoRecorder(sceneMgr, tl, captureEngine);
      setVideoRecorder(recorder);
    }

    return () => {
      tl.dispose();
      sceneMgr.dispose();
    };
  }, [captureEngine]);

  // Handle Display Stream Binding to Three.js VideoTexture
  const handleStartDisplayCapture = async (prefer4K: boolean) => {
    if (!captureEngine || !threeScene || !displayVideoRef.current) return;
    try {
      const stream = await captureEngine.startDisplayCapture(prefer4K);
      const video = displayVideoRef.current;
      video.srcObject = stream;
      await video.play();
      threeScene.bindVideoStream(video);
      setStreamState((prev) => ({ ...prev, isCustomMediaLoaded: false }));
    } catch (err) {
      console.error('Display capture failed:', err);
    }
  };

  const handleStopDisplayCapture = () => {
    if (!captureEngine || !threeScene) return;
    captureEngine.stopDisplayCapture();
    if (displayVideoRef.current) {
      displayVideoRef.current.srcObject = null;
    }
    threeScene.unbindVideoStream();
  };

  // Handle Custom Video Upload in Editor Mode
  const handleVideoUpload = async (file: File) => {
    if (!threeScene || !displayVideoRef.current) return;
    try {
      const video = displayVideoRef.current;
      const url = URL.createObjectURL(file);
      video.srcObject = null;
      video.src = url;
      video.load();
      await video.play();
      threeScene.bindVideoStream(video);

      setLoadedVideoName(file.name);
      setStreamState((prev) => ({ ...prev, isCustomMediaLoaded: true }));

      // Update total trim range based on uploaded video duration
      video.onloadedmetadata = () => {
        if (video.duration && !isNaN(video.duration)) {
          setTrimRange({ start: 0, end: Math.min(60, Math.round(video.duration)) });
        }
      };
    } catch (err) {
      console.error('Video asset import failed:', err);
    }
  };

  const handleStartWebcamCapture = async () => {
    if (!captureEngine) return;
    await captureEngine.startWebcamCapture();
  };

  const handleStopWebcamCapture = () => {
    if (!captureEngine) return;
    captureEngine.stopWebcamCapture();
  };

  const handleStartMicCapture = async () => {
    if (!captureEngine) return;
    await captureEngine.startMicrophoneCapture();
  };

  const handleStopMicCapture = () => {
    if (!captureEngine) return;
    captureEngine.stopMicrophoneCapture();
  };

  const handleUpdateAudioLevels = (newLevels: Partial<AudioLevels>) => {
    const updated = { ...audioLevels, ...newLevels };
    setAudioLevels(updated);
    if (captureEngine) {
      captureEngine.setAudioLevels(updated);
    }
  };

  // Device & Camera Handlers
  const handleSelectDevice = (dev: DeviceType) => {
    setCurrentDevice(dev);
    if (threeScene) {
      threeScene.setDevice(dev);
    }
  };

  const handleSelectFinish = (finish: DeviceFinish) => {
    setDeviceFinish(finish);
    if (threeScene) {
      threeScene.setFinish(finish);
    }
  };

  const handleSelectCameraPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    if (threeScene) {
      threeScene.setCameraPreset(preset);
    }
  };

  // Timeline Handlers
  const handleTogglePlay = () => {
    if (!timeline) return;
    const playing = timeline.togglePlay();
    setIsPlaying(playing);

    // Sync underlying video element if loaded
    if (displayVideoRef.current) {
      if (playing) {
        displayVideoRef.current.play().catch(() => {});
      } else {
        displayVideoRef.current.pause();
      }
    }
  };

  const handleSeek = (time: number) => {
    if (!timeline) return;
    timeline.seek(time);
    setCurrentTime(time);

    if (displayVideoRef.current && displayVideoRef.current.duration) {
      displayVideoRef.current.currentTime = time % displayVideoRef.current.duration;
    }
  };

  const handleStepPrev = () => {
    if (!timeline) return;
    timeline.stepPrevCue();
  };

  const handleStepNext = () => {
    if (!timeline) return;
    timeline.stepNextCue();
  };

  const handleSetPlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (timeline) {
      timeline.setPlaybackRate(rate);
    }
    if (displayVideoRef.current) {
      displayVideoRef.current.playbackRate = rate;
    }
  };

  // Callouts Management
  const handleAddCallout = (callout: CalloutOverlay) => {
    setCallouts((prev) => [...prev, callout]);
  };

  const handleRemoveCallout = (id: string) => {
    setCallouts((prev) => prev.filter((c) => c.id !== id));
  };

  // Live Studio Recording Toggle
  const handleToggleLiveRecording = async () => {
    if (!videoRecorder) return;

    if (!isRecording) {
      videoRecorder.startLiveRecording(pipConfig);
      setIsRecording(true);
    } else {
      setIsRecording(false);
      const blob = await videoRecorder.stopLiveRecording();
      triggerFileDownload(blob, `MotionStudio_Live_Recording_${Date.now()}.webm`);
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is inside an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsPresentationMode((prev) => !prev);
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setIsExportModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const activeCue = cuePoints[activeCueIndex] || cuePoints[0];
  const totalDuration = timeline?.getTotalDuration() || 16;

  return (
    <div className="w-screen h-screen flex flex-col bg-studio-bg text-slate-100 overflow-hidden select-none">
      {/* 1. Header Control Bar */}
      <Header
        streamState={streamState}
        isRecording={isRecording}
        isEditorMode={isEditorMode}
        captureEngine={captureEngine}
        onToggleLiveRecording={handleToggleLiveRecording}
        onToggleEditorMode={() => setIsEditorMode((prev) => !prev)}
        onOpenPresentation={() => setIsPresentationMode(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* 2. Main Studio Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: 3D Staging & Camera Presets */}
        <DeviceControls
          currentDevice={currentDevice}
          deviceFinish={deviceFinish}
          cameraPreset={cameraPreset}
          onSelectDevice={handleSelectDevice}
          onSelectFinish={handleSelectFinish}
          onSelectCameraPreset={handleSelectCameraPreset}
        />

        {/* Center: Three.js Viewport & 2D Motion Overlays */}
        <div id="three-viewport" className="flex-1 relative overflow-hidden flex">
          <StudioCanvas
            threeScene={threeScene}
            activeCue={activeCue}
            webcamStream={captureEngine?.getWebcamStream() || null}
            pipConfig={pipConfig}
            callouts={callouts}
            currentTime={currentTime}
            onUpdatePipConfig={(c) => setPipConfig((prev) => ({ ...prev, ...c }))}
          />
        </div>

        {/* Right Side: Switchable between CaptureControls and VideoEditorPanel */}
        {isEditorMode ? (
          <VideoEditorPanel
            loadedVideoName={loadedVideoName}
            totalDuration={totalDuration}
            trimRange={trimRange}
            callouts={callouts}
            audioLevels={audioLevels}
            onVideoUpload={handleVideoUpload}
            onUpdateTrimRange={setTrimRange}
            onAddCallout={handleAddCallout}
            onRemoveCallout={handleRemoveCallout}
            onUpdateAudioLevels={handleUpdateAudioLevels}
            onSeek={handleSeek}
          />
        ) : (
          <CaptureControls
            streamState={streamState}
            audioLevels={audioLevels}
            pipConfig={pipConfig}
            captureEngine={captureEngine}
            onStartDisplayCapture={handleStartDisplayCapture}
            onStopDisplayCapture={handleStopDisplayCapture}
            onStartWebcamCapture={handleStartWebcamCapture}
            onStopWebcamCapture={handleStopWebcamCapture}
            onStartMicCapture={handleStartMicCapture}
            onStopMicCapture={handleStopMicCapture}
            onUpdateAudioLevels={handleUpdateAudioLevels}
            onUpdatePipConfig={(c) => setPipConfig((prev) => ({ ...prev, ...c }))}
          />
        )}
      </div>

      {/* 3. Bottom Scrubbable Timeline Bar */}
      <TimelineBar
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        playbackRate={playbackRate}
        activeCueIndex={activeCueIndex}
        cuePoints={cuePoints}
        trimRange={isEditorMode ? trimRange : undefined}
        callouts={callouts}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        onStepPrev={handleStepPrev}
        onStepNext={handleStepNext}
        onSetPlaybackRate={handleSetPlaybackRate}
      />

      {/* 4. Fullscreen Presentation Mode Modal */}
      {isPresentationMode && (
        <PresentationMode
          slides={slides}
          currentSlideIndex={activeSlideIndex}
          timeline={timeline}
          threeScene={threeScene}
          onClose={() => setIsPresentationMode(false)}
          onSelectSlide={(idx) => {
            setActiveSlideIndex(idx);
            if (timeline) timeline.jumpToSlide(idx);
          }}
        />
      )}

      {/* 5. Multi-Surface Publishing Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        slides={slides}
        cuePoints={cuePoints}
        pipConfig={pipConfig}
        callouts={callouts}
        trimRange={isEditorMode ? trimRange : undefined}
        threeScene={threeScene}
        timeline={timeline}
        videoRecorder={videoRecorder}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

export default App;
