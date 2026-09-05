// App.tsx — MotionStudio Main Application Root & Global State Coordinator
import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  StageMode,
  ActiveToolTab,
  WallpaperConfig,
  MockupConfig,
  ZoomFragment,
  MaskEffectType,
} from '@/types';
import { ThreeSceneManager } from '@/core/scene/ThreeSceneManager';
import { TimelineController, DEFAULT_CUE_POINTS, DEFAULT_SLIDES } from '@/core/motion/TimelineController';
import { CaptureEngine } from '@/core/capture/CaptureEngine';
import { VideoRecorder } from '@/core/exporters/VideoRecorder';
import { ProcessedWebcamPipeline } from '@/core/capture/ProcessedWebcamPipeline';
import { DocumentPipManager } from '@/core/capture/DocumentPipManager';
import { ProjectManager, MotionStudioProject } from '@/core/projects/ProjectManager';
import { Header } from '@/components/Header';
import { StudioCanvas } from '@/components/StudioCanvas';
import { LeftToolRail } from '@/components/studio/LeftToolRail';
import { SecondaryOptionsPanel, WALLPAPER_PRESETS } from '@/components/studio/SecondaryOptionsPanel';
import { LayersPanel } from '@/components/studio/LayersPanel';
import { MultiTrackTimeline } from '@/components/studio/MultiTrackTimeline';
import { MotionStudioSetupModal } from '@/components/setup/MotionStudioSetupModal';
import { MotionStudioRecordingPill } from '@/components/setup/MotionStudioRecordingPill';
import { ProjectModal } from '@/components/ProjectModal';
import { PresentationMode } from '@/components/PresentationMode';
import { ExportModal } from '@/components/ExportModal';

export function App() {
  // Project Metadata & Local-First ID
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => `proj_${Date.now()}`);
  const [projectName, setProjectName] = useState('MotionStudio_Project_01');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Core Engine Instances
  const [threeScene, setThreeScene] = useState<ThreeSceneManager | null>(null);
  const [timeline, setTimeline] = useState<TimelineController | null>(null);
  const [captureEngine, setCaptureEngine] = useState<CaptureEngine | null>(null);
  const [videoRecorder, setVideoRecorder] = useState<VideoRecorder | null>(null);
  const [webcamPipeline, setWebcamPipeline] = useState<ProcessedWebcamPipeline | null>(null);
  const [documentPipManager, setDocumentPipManager] = useState<DocumentPipManager | null>(null);

  // Studio UI Layout State
  const [activeToolTab, setActiveToolTab] = useState<ActiveToolTab>('background');
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isRecordSetupOpen, setIsRecordSetupOpen] = useState(false);

  // Staging & Appearance State (Default to Frameless Clean Viewport)
  const [stageMode, setStageMode] = useState<StageMode>('2d-direct');
  const [deviceFinish, setDeviceFinish] = useState<DeviceFinish>('space-black');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('front');

  const [wallpaperConfig, setWallpaperConfig] = useState<WallpaperConfig>({
    type: 'wallpaper',
    presetId: 'studio-dark',
    color: '#0f172a',
    gradient: WALLPAPER_PRESETS[0].css,
    blur: 0,
    padding: 36,
    borderRadius: 16,
    shadowDepth: 70,
  });

  const [mockupConfig, setMockupConfig] = useState<MockupConfig>({
    mode: '2d',
    frame2D: 'none',
    device3D: 'frameless',
  });

  const [maskEffect, setMaskEffect] = useState<MaskEffectType>('none');

  // Video Asset & Editor State
  const [loadedVideoName, setLoadedVideoName] = useState<string>('MotionStudio_Vid_Live.webm');
  const [loadedVideoBlob, setLoadedVideoBlob] = useState<Blob | undefined>(undefined);
  const [trimRange, setTrimRange] = useState<TrimRange>({ start: 0, end: 16 });
  const [callouts, setCallouts] = useState<CalloutOverlay[]>([
    {
      id: 'callout-1',
      title: '3D Spatial Staging',
      description: 'Zero-backend WebGL device viewport compositing',
      badge: 'PRO FEATURE',
      startTime: 0.5,
      endTime: 5.5,
      x: 10,
      y: 72,
      animation: 'bounce',
      colorTheme: 'blue',
    },
  ]);

  const [zoomFragments, setZoomFragments] = useState<ZoomFragment[]>([
    {
      id: 'zoom-1',
      startTime: 2,
      endTime: 6,
      targetFocus: { x: 50, y: 50, scale: 1.4 },
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  ]);

  // PiP Config & Avatar Bubble
  const [pipConfig, setPipConfig] = useState<PipConfig>({
    enabled: true,
    x: 85,
    y: 80,
    size: 180,
    sizePercent: 18,
    shape: 'squircle',
    placementPreset: 'bottom-right',
    cornerPosition: 'bottom-right',
    mirror: true,
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadow: true,
    background: {
      type: 'none',
    },
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

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  const durationTimerRef = useRef<number | null>(null);

  // Modals
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Hidden Elements
  const displayVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Initialize Engines on mount
  useEffect(() => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.loop = true;
    displayVideoRef.current = video;

    const capture = new CaptureEngine((state) => {
      setStreamState(state);
    });
    setCaptureEngine(capture);

    const pipeline = new ProcessedWebcamPipeline(512);
    setWebcamPipeline(pipeline);

    const pipMgr = new DocumentPipManager();
    setDocumentPipManager(pipMgr);

    // Initial load from IndexedDB or create default
    ProjectManager.getAllProjects().then((projects) => {
      if (projects.length > 0) {
        loadProject(projects[0].id);
      } else {
        const def = ProjectManager.createDefaultProject('MotionStudio_Project_01');
        ProjectManager.saveProject(def).catch(() => {});
      }
    });

    return () => {
      capture.dispose();
      pipeline.dispose();
      pipMgr.close();
    };
  }, []);

  // 2. Initialize Three.js Scene and Timeline
  useEffect(() => {
    const canvasContainer = document.getElementById('three-viewport');
    if (!canvasContainer || !webcamPipeline) return;

    const sceneMgr = new ThreeSceneManager(canvasContainer);
    sceneMgr.setDevice(mockupConfig.device3D);
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
      const recorder = new VideoRecorder(sceneMgr, tl, captureEngine, webcamPipeline);
      setVideoRecorder(recorder);
    }

    return () => {
      tl.dispose();
      sceneMgr.dispose();
    };
  }, [captureEngine, webcamPipeline]);

  // Project Management Helper
  const autoSaveProject = useCallback(
    async (overrideName?: string, overrideBlob?: Blob) => {
      try {
        const projectData: MotionStudioProject = {
          id: currentProjectId,
          name: overrideName || projectName,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          duration: trimRange.end,
          videoName: loadedVideoName,
          videoBlob: overrideBlob || loadedVideoBlob,
          settings: {
            wallpaperConfig,
            mockupConfig,
            pipConfig,
            callouts,
            zoomFragments,
            maskEffect,
            audioLevels,
            trimRange,
          },
        };
        await ProjectManager.saveProject(projectData);
      } catch (err) {
        console.warn('Auto-save notice:', err);
      }
    },
    [
      currentProjectId,
      projectName,
      trimRange,
      loadedVideoName,
      loadedVideoBlob,
      wallpaperConfig,
      mockupConfig,
      pipConfig,
      callouts,
      zoomFragments,
      maskEffect,
      audioLevels,
    ]
  );

  const loadProject = async (id: string) => {
    try {
      const p = await ProjectManager.getProject(id);
      if (!p) return;

      setCurrentProjectId(p.id);
      setProjectName(p.name);
      setWallpaperConfig(p.settings.wallpaperConfig);
      setMockupConfig(p.settings.mockupConfig);
      setPipConfig(p.settings.pipConfig);
      setCallouts(p.settings.callouts || []);
      setZoomFragments(p.settings.zoomFragments || []);
      setMaskEffect(p.settings.maskEffect || 'none');
      setAudioLevels(p.settings.audioLevels);
      setTrimRange(p.settings.trimRange || { start: 0, end: p.duration || 16 });

      if (threeScene && p.settings.mockupConfig.mode === '3d') {
        threeScene.setDevice(p.settings.mockupConfig.device3D);
      }

      if (p.videoBlob && displayVideoRef.current && threeScene) {
        const url = URL.createObjectURL(p.videoBlob);
        displayVideoRef.current.srcObject = null;
        displayVideoRef.current.src = url;
        displayVideoRef.current.load();
        await displayVideoRef.current.play().catch(() => {});
        threeScene.bindVideoStream(displayVideoRef.current);
        setLoadedVideoBlob(p.videoBlob);
        setLoadedVideoName(p.videoName || 'Loaded_Project_Media.webm');
        setStreamState((prev) => ({ ...prev, isCustomMediaLoaded: true }));
      }
    } catch (err) {
      console.error('Error loading project:', err);
    }
  };

  const handleCreateNewProject = () => {
    const newProj = ProjectManager.createDefaultProject(`MotionStudio_Project_${Date.now().toString().slice(-4)}`);
    ProjectManager.saveProject(newProj).then(() => {
      loadProject(newProj.id);
      setIsRecordSetupOpen(true);
    });
  };

  // Sync Mockup Configuration with ThreeSceneManager
  const handleUpdateMockup = (config: Partial<MockupConfig>) => {
    const updated = { ...mockupConfig, ...config };
    setMockupConfig(updated);
    if (updated.mode === '3d' && threeScene) {
      threeScene.setDevice(updated.device3D);
    }
  };

  // Handle Display Stream Binding to Three.js VideoTexture & Live Recording
  const handleStartDisplayCaptureAndRecord = async () => {
    if (!captureEngine || !threeScene || !displayVideoRef.current) return;
    try {
      // 1. Launch unconstrained getDisplayMedia (Entire Screen, Window, Tab)
      const stream = await captureEngine.startDisplayCapture(true);
      const video = displayVideoRef.current;
      video.srcObject = stream;
      await video.play();
      threeScene.bindVideoStream(video);
      setStreamState((prev) => ({ ...prev, isCustomMediaLoaded: false }));

      // 2. Launch Document PiP for out-of-tab controls
      if (documentPipManager && documentPipManager.isSupported()) {
        documentPipManager.open(
          {
            onTogglePause: handleTogglePause,
            onToggleMicMute: () => handleUpdateAudioLevels({ micMuted: !audioLevels.micMuted }),
            onStopAndOpenEditor: handleStopRecording,
          },
          {
            isPaused: false,
            recordingDuration: 0,
            isMicMuted: audioLevels.micMuted,
            vuLevel: 0,
          }
        ).catch(() => {});
      }

      // 3. Start Live Recording Session
      if (videoRecorder) {
        videoRecorder.setDisplayVideoElement(video);
        videoRecorder.setStagingConfig(mockupConfig.device3D, stageMode);
        if (webcamPipeline) {
          videoRecorder.setWebcamPipeline(webcamPipeline);
        }
        videoRecorder.startLiveRecording(pipConfig);
      }

      isRecordingRef.current = true;
      isPausedRef.current = false;
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);

      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      durationTimerRef.current = window.setInterval(() => {
        if (!isPausedRef.current) {
          setRecordingDuration((prev) => {
            const next = prev + 1;
            if (documentPipManager) {
              documentPipManager.updateState({
                isPaused: isPausedRef.current,
                recordingDuration: next,
                isMicMuted: audioLevels.micMuted,
                vuLevel: 0,
              });
            }
            return next;
          });
        }
      }, 1000);
    } catch (err) {
      console.error('Display capture and recording start failed:', err);
    }
  };

  // Handle Custom Video / Photo Upload in Editor Mode
  const handleVideoUpload = async (file: File) => {
    if (!threeScene || !displayVideoRef.current) return;
    try {
      const video = displayVideoRef.current;
      const url = URL.createObjectURL(file);
      video.srcObject = null;
      video.src = url;
      video.load();
      await video.play().catch(() => {});
      threeScene.bindVideoStream(video);

      setLoadedVideoName(file.name);
      setLoadedVideoBlob(file);
      setStreamState((prev) => ({ ...prev, isCustomMediaLoaded: true }));

      video.onloadedmetadata = () => {
        if (video.duration && !isNaN(video.duration)) {
          const duration = Math.max(1, Math.round(video.duration));
          setTrimRange({ start: 0, end: duration });
        }
      };

      autoSaveProject(file.name.replace(/\.[^/.]+$/, ''), file);
    } catch (err) {
      console.error('Video asset import failed:', err);
    }
  };

  const handleUpdateAudioLevels = (newLevels: Partial<AudioLevels>) => {
    const updated = { ...audioLevels, ...newLevels };
    setAudioLevels(updated);
    if (captureEngine) {
      captureEngine.setAudioLevels(updated);
    }
  };

  // Timeline Handlers
  const handleTogglePlay = () => {
    if (!timeline) return;
    const playing = timeline.togglePlay();
    setIsPlaying(playing);

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

  const handleTogglePause = () => {
    if (!videoRecorder || !isRecordingRef.current) return;
    const nowPaused = videoRecorder.togglePauseLiveRecording();
    isPausedRef.current = nowPaused;
    setIsPaused(nowPaused);
  };

  // Stop Recording: Guaranteed Ingestion + Backup Save
  const handleStopRecording = async () => {
    if (!videoRecorder) return;
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);

    isRecordingRef.current = false;
    isPausedRef.current = false;
    setIsRecording(false);
    setIsPaused(false);

    if (documentPipManager) {
      documentPipManager.close();
    }

    try {
      const blob = await videoRecorder.stopLiveRecording();
      const recFilename = `MotionStudio_Recording_${Date.now()}.webm`;

      // 1. Trigger background safety backup download
      try {
        const backupUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = backupUrl;
        a.download = recFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.warn('Backup download notice:', err);
      }

      // 2. In-Memory Studio Ingestion
      if (displayVideoRef.current) {
        const url = URL.createObjectURL(blob);
        displayVideoRef.current.srcObject = null;
        displayVideoRef.current.src = url;
        displayVideoRef.current.load();
        await displayVideoRef.current.play().catch(() => {});
        if (threeScene) {
          threeScene.bindVideoStream(displayVideoRef.current);
        }

        setLoadedVideoName(recFilename);
        setLoadedVideoBlob(blob);
        setStreamState((prev) => ({ ...prev, isCustomMediaLoaded: true }));
        const recEnd = Math.max(1, recordingDuration);
        setTrimRange({ start: 0, end: recEnd });

        // 3. Persist to IndexedDB
        autoSaveProject(undefined, blob);
      }
    } catch (e) {
      console.error('Stop recording error:', e);
    }
  };

  // Zoom Fragments Handlers
  const handleAddZoomFragment = () => {
    const newFrag: ZoomFragment = {
      id: `zoom-${Date.now()}`,
      startTime: Math.max(0, Math.floor(currentTime)),
      endTime: Math.min(Math.floor(totalDuration), Math.floor(currentTime) + 4),
      targetFocus: { x: 50, y: 50, scale: 1.5 },
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    };
    setZoomFragments((prev) => [...prev, newFrag]);
  };

  const handleRemoveZoomFragment = (id: string) => {
    setZoomFragments((prev) => prev.filter((f) => f.id !== id));
  };

  // Callouts Handlers
  const handleAddCallout = (callout: CalloutOverlay) => {
    setCallouts((prev) => [...prev, callout]);
  };

  const handleRemoveCallout = (id: string) => {
    setCallouts((prev) => prev.filter((c) => c.id !== id));
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    <div className="w-screen h-screen flex flex-col bg-[#05070c] text-slate-100 overflow-hidden select-none font-sans">
      {/* Hidden File Input for External Media Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleVideoUpload(e.target.files[0]);
          }
        }}
        accept="video/mp4,video/webm,video/quicktime,image/*"
        className="hidden"
      />

      {/* 1. Header Navigation Bar (Hidden during active live recording) */}
      {!isRecording && (
        <Header
          streamState={streamState}
          isRecording={isRecording}
          projectName={projectName}
          onUpdateProjectName={(name) => {
            setProjectName(name);
            autoSaveProject(name);
          }}
          captureEngine={captureEngine}
          onOpenRecordSetup={() => setIsRecordSetupOpen(true)}
          onOpenPresentation={() => setIsPresentationMode(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenProjectModal={() => setIsProjectModalOpen(true)}
        />
      )}

      {/* 2. Main Studio Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Primary Tool Rail (Hidden during recording) */}
        {!isRecording && (
          <LeftToolRail
            activeTab={activeToolTab}
            onSelectTab={setActiveToolTab}
            onOpenRecordSetup={() => setIsRecordSetupOpen(true)}
            onTriggerUpload={() => fileInputRef.current?.click()}
          />
        )}

        {/* Secondary Contextual Options Drawer */}
        {!isRecording && (
          <SecondaryOptionsPanel
            activeTab={activeToolTab}
            onClose={() => setActiveToolTab(null)}
            wallpaperConfig={wallpaperConfig}
            onUpdateWallpaper={(cfg) => {
              setWallpaperConfig((prev) => ({ ...prev, ...cfg }));
            }}
            mockupConfig={mockupConfig}
            onUpdateMockup={handleUpdateMockup}
            zoomFragments={zoomFragments}
            onAddZoomFragment={handleAddZoomFragment}
            onRemoveZoomFragment={handleRemoveZoomFragment}
            callouts={callouts}
            onAddCallout={handleAddCallout}
            onRemoveCallout={handleRemoveCallout}
            playbackRate={playbackRate}
            onSetPlaybackRate={handleSetPlaybackRate}
            audioLevels={audioLevels}
            onUpdateAudioLevels={handleUpdateAudioLevels}
            totalDuration={totalDuration}
            trimRange={trimRange}
            onUpdateTrimRange={setTrimRange}
            onTriggerUpload={() => fileInputRef.current?.click()}
          />
        )}

        {/* Central Viewport Stage */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#07090e]">
          {/* Three.js 3D Viewport Canvas */}
          <div
            id="three-viewport"
            className={`absolute inset-0 z-0 w-full h-full ${
              mockupConfig.mode === '3d' ? 'block' : 'hidden'
            }`}
          />

          {/* Central Studio Canvas Layer */}
          <StudioCanvas
            threeScene={threeScene}
            activeCue={activeCue}
            webcamStream={captureEngine?.getWebcamStream() || null}
            pipConfig={pipConfig}
            stageMode={stageMode}
            hasDisplayStream={streamState.hasDisplayStream}
            callouts={callouts}
            currentTime={currentTime}
            wallpaperConfig={wallpaperConfig}
            mockupConfig={mockupConfig}
            maskEffect={maskEffect}
            onUpdatePipConfig={(c) => setPipConfig((prev) => ({ ...prev, ...c }))}
            onToggleStageMode={(mode) => {
              setStageMode(mode);
              if (threeScene) threeScene.setStageMode(mode);
            }}
            webcamVideoRef={webcamVideoRef as any}
            webcamPipeline={webcamPipeline}
            displayVideoElement={displayVideoRef.current}
          />

          {/* Right Layers Inspector Rail */}
          {!isRecording && (
            <LayersPanel
              isOpen={isLayersOpen}
              onToggleOpen={() => setIsLayersOpen((prev) => !prev)}
              pipConfig={pipConfig}
              mockupConfig={mockupConfig}
              wallpaperConfig={wallpaperConfig}
              callouts={callouts}
              onTogglePipVisibility={() => setPipConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
            />
          )}
        </div>
      </div>

      {/* 3. Bottom Multi-Track Timeline (Hidden during active live recording) */}
      {!isRecording && (
        <MultiTrackTimeline
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          trimRange={trimRange}
          callouts={callouts}
          zoomFragments={zoomFragments}
          loadedVideoName={loadedVideoName}
          maskEffect={maskEffect}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onStepPrev={handleStepPrev}
          onStepNext={handleStepNext}
          onUpdateTrimRange={setTrimRange}
          onSelectMaskEffect={setMaskEffect}
        />
      )}

      {/* 4. Minimalist Floating Recording Transport Pill (Active during recording) */}
      {isRecording && (
        <MotionStudioRecordingPill
          isRecording={isRecording}
          isPaused={isPaused}
          recordingDuration={recordingDuration}
          isMicMuted={audioLevels.micMuted}
          isPipEnabled={pipConfig.enabled}
          hasWebcamStream={streamState.hasWebcamStream}
          documentPipManager={documentPipManager}
          onTogglePause={handleTogglePause}
          onToggleMicMute={() => handleUpdateAudioLevels({ micMuted: !audioLevels.micMuted })}
          onTogglePip={() => setPipConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
          onStopAndOpenEditor={handleStopRecording}
        />
      )}

      {/* 5. Pre-Recording Setup Modal */}
      <MotionStudioSetupModal
        isOpen={isRecordSetupOpen}
        onClose={() => setIsRecordSetupOpen(false)}
        onStartShareScreen={handleStartDisplayCaptureAndRecord}
        pipConfig={pipConfig}
        onUpdatePipConfig={(cfg) => setPipConfig((prev) => ({ ...prev, ...cfg }))}
        captureEngine={captureEngine}
        audioLevels={audioLevels}
        onUpdateAudioLevels={handleUpdateAudioLevels}
        webcamStream={captureEngine?.getWebcamStream() || null}
      />

      {/* 6. Local-First Project Management Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        currentProjectId={currentProjectId}
        onClose={() => setIsProjectModalOpen(false)}
        onOpenProject={loadProject}
        onCreateNewProject={handleCreateNewProject}
      />

      {/* 7. Fullscreen Presentation Mode Modal */}
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

      {/* 8. Multi-Surface Publishing Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        slides={slides}
        cuePoints={cuePoints}
        pipConfig={pipConfig}
        callouts={callouts}
        trimRange={trimRange}
        threeScene={threeScene}
        timeline={timeline}
        videoRecorder={videoRecorder}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

export default App;
