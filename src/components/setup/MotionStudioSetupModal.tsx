// MotionStudioSetupModal.tsx — MotionStudio Pre-Recording Configuration Modal
import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Share2,
  X,
  Circle,
  Square,
  Sparkles,
  Monitor,
  LayoutGrid,
  Check,
} from 'lucide-react';
import { PipConfig, PipShape, CornerPosition, AudioLevels } from '@/types';
import { CaptureEngine } from '@/core/capture/CaptureEngine';

interface MotionStudioSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartShareScreen: () => void;
  pipConfig: PipConfig;
  onUpdatePipConfig: (config: Partial<PipConfig>) => void;
  captureEngine: CaptureEngine | null;
  audioLevels: AudioLevels;
  onUpdateAudioLevels: (levels: Partial<AudioLevels>) => void;
  webcamStream: MediaStream | null;
}

export const MotionStudioSetupModal: React.FC<MotionStudioSetupModalProps> = ({
  isOpen,
  onClose,
  onStartShareScreen,
  pipConfig,
  onUpdatePipConfig,
  captureEngine,
  audioLevels,
  onUpdateAudioLevels,
  webcamStream,
}) => {
  // Device Enumeration
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedAudioId, setSelectedAudioId] = useState<string>('');

  // Toggles
  const [isCameraEnabled, setIsCameraEnabled] = useState(pipConfig.enabled);
  const [isMicEnabled, setIsMicEnabled] = useState(!audioLevels.micMuted);
  const [isSystemAudioEnabled, setIsSystemAudioEnabled] = useState(!audioLevels.displayMuted);
  const [isMirrored, setIsMirrored] = useState(pipConfig.mirror ?? true);
  const [sizePercent, setSizePercent] = useState(pipConfig.sizePercent ?? 18);
  const [selectedCorner, setSelectedCorner] = useState<CornerPosition>(
    pipConfig.cornerPosition ?? 'bottom-right'
  );
  const [selectedShape, setSelectedShape] = useState<PipShape>(pipConfig.shape ?? 'squircle');

  // Live Audio VU Level
  const [vuLevel, setVuLevel] = useState(0);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Enumerate input devices on mount with physical hardware priority
  useEffect(() => {
    if (!isOpen) return;

    const isVirtual = (label: string) => {
      const l = (label || '').toLowerCase();
      return (
        l.includes('virtual') ||
        l.includes('noise') ||
        l.includes('steam') ||
        l.includes('utility') ||
        l.includes('ai ') ||
        l.includes('cable') ||
        l.includes('soundflower')
      );
    };

    const enumerate = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const vDevs = devices.filter((d) => d.kind === 'videoinput');
        const rawAudio = devices.filter((d) => d.kind === 'audioinput');
        const sortedAudio = [...rawAudio].sort((a, b) => {
          const aVirt = isVirtual(a.label);
          const bVirt = isVirtual(b.label);
          if (!aVirt && bVirt) return -1;
          if (aVirt && !bVirt) return 1;
          return 0;
        });

        setVideoDevices(vDevs);
        setAudioDevices(sortedAudio);

        const targetAudioId = selectedAudioId || sortedAudio[0]?.deviceId || '';
        if (sortedAudio.length > 0 && !selectedAudioId) {
          setSelectedAudioId(targetAudioId);
        }
        if (vDevs.length > 0 && !selectedVideoId) {
          setSelectedVideoId(vDevs[0].deviceId);
        }

        // Initialize mic capture if not already streaming so VU meter has live signal
        if (isMicEnabled && captureEngine && !captureEngine.getMicStream()) {
          captureEngine.startMicrophoneCapture(targetAudioId || undefined).catch(() => {});
        }
      } catch (err) {
        console.warn('Device enumeration notice:', err);
      }
    };

    enumerate();
  }, [isOpen]);

  // Connect live webcam stream to video element
  useEffect(() => {
    if (videoPreviewRef.current && webcamStream) {
      videoPreviewRef.current.srcObject = webcamStream;
      videoPreviewRef.current.play().catch(() => {});
    }
  }, [webcamStream, isCameraEnabled]);

  // Audio VU Level Meter Poll
  useEffect(() => {
    if (!isOpen || !isMicEnabled || !captureEngine) return;
    const interval = window.setInterval(() => {
      const val = captureEngine.getMicVULevel();
      setVuLevel(val);
    }, 60);
    return () => clearInterval(interval);
  }, [isOpen, isMicEnabled, captureEngine]);

  if (!isOpen) return null;

  // Handle Corner Placement Selection
  const handleSelectCorner = (corner: CornerPosition) => {
    setSelectedCorner(corner);
    let x = 85;
    let y = 80;
    if (corner === 'top-left') {
      x = 15;
      y = 20;
    } else if (corner === 'top-right') {
      x = 85;
      y = 20;
    } else if (corner === 'bottom-left') {
      x = 15;
      y = 80;
    } else if (corner === 'bottom-right') {
      x = 85;
      y = 80;
    }

    onUpdatePipConfig({
      cornerPosition: corner,
      x,
      y,
      placementPreset: corner,
    });
  };

  const handleShapeChange = (shape: PipShape) => {
    setSelectedShape(shape);
    onUpdatePipConfig({ shape });
  };

  const handleSizeChange = (val: number) => {
    setSizePercent(val);
    const sizePx = Math.round((val / 100) * 1000);
    onUpdatePipConfig({ sizePercent: val, size: sizePx });
  };

  const handleMirrorToggle = () => {
    const next = !isMirrored;
    setIsMirrored(next);
    onUpdatePipConfig({ mirror: next });
  };

  const handleCameraToggle = async () => {
    const next = !isCameraEnabled;
    setIsCameraEnabled(next);
    onUpdatePipConfig({ enabled: next });
    if (next && captureEngine && !webcamStream) {
      await captureEngine.startWebcamCapture();
    }
  };

  const handleMicToggle = async () => {
    const next = !isMicEnabled;
    setIsMicEnabled(next);
    onUpdateAudioLevels({ micMuted: !next });
    if (next && captureEngine && !captureEngine.getMicStream()) {
      await captureEngine.startMicrophoneCapture();
    }
  };

  const handleSystemAudioToggle = () => {
    const next = !isSystemAudioEnabled;
    setIsSystemAudioEnabled(next);
    onUpdateAudioLevels({ displayMuted: !next });
  };

  const handleShareScreenSubmit = () => {
    onClose();
    onStartShareScreen();
  };

  // Border radius style helper for shape
  const getShapeStyle = () => {
    if (selectedShape === 'circle') return 'rounded-full';
    if (selectedShape === 'squircle') return 'rounded-[28%]';
    return 'rounded-xl';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-500 font-black tracking-wider text-xs uppercase px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                MotionStudio
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">Recording Setup</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose your camera, microphone, and how you want your bubble to look.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Column: Live Interactive Preview Stage (7 cols) */}
          <div className="md:col-span-7 p-6 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/30 flex flex-col justify-between space-y-5">
            {/* Scaled Preview Frame */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span className="flex items-center space-x-1.5">
                  <Monitor className="w-3.5 h-3.5 text-blue-400" />
                  <span>Interactive Stage Preview</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500">16:9 Desktop View</span>
              </div>

              <div className="relative w-full aspect-video bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-xl border border-slate-800 shadow-inner overflow-hidden flex items-center justify-center p-4">
                {/* Desktop Mockup Gridlines */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

                {/* Simulated App Card */}
                <div className="w-[88%] h-[82%] rounded-lg border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm shadow-md flex flex-col overflow-hidden pointer-events-none">
                  <div className="h-6 bg-slate-900/80 border-b border-slate-700/60 px-3 flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500/80" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-[9px] font-mono text-slate-500">target-screen-presentation</span>
                  </div>
                  <div className="flex-1 p-3 flex flex-col justify-center items-center text-slate-600">
                    <Monitor className="w-8 h-8 stroke-1 text-slate-700 mb-1" />
                    <span className="text-[11px] font-medium text-slate-500">Target Application / Browser Display</span>
                  </div>
                </div>

                {/* Live Webcam Avatar Bubble Preview */}
                {isCameraEnabled && (
                  <div
                    style={{
                      left: selectedCorner.includes('left') ? '8%' : 'auto',
                      right: selectedCorner.includes('right') ? '8%' : 'auto',
                      top: selectedCorner.includes('top') ? '12%' : 'auto',
                      bottom: selectedCorner.includes('bottom') ? '12%' : 'auto',
                      width: `${Math.max(48, Math.min(120, (sizePercent / 18) * 72))}px`,
                      height: `${Math.max(48, Math.min(120, (sizePercent / 18) * 72))}px`,
                    }}
                    className={`absolute z-20 ${getShapeStyle()} overflow-hidden border-2 border-blue-500 shadow-xl bg-slate-900 flex items-center justify-center transition-all duration-200`}
                  >
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        transform: isMirrored ? 'scaleX(-1)' : 'none',
                      }}
                      className="w-full h-full object-cover"
                    />
                    {!webcamStream && (
                      <div className="flex flex-col items-center justify-center p-1 text-center">
                        <Camera className="w-4 h-4 text-blue-400" />
                        <span className="text-[8px] font-bold text-slate-400 mt-0.5">Live Cam</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Initial Position: 4-Corner Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block flex items-center justify-between">
                <span>Initial Position</span>
                <span className="text-[11px] font-normal text-slate-400 capitalize">
                  {selectedCorner.replace('-', ' ')}
                </span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'top-left', label: 'Top-Left', dotPos: 'top-1.5 left-1.5' },
                  { id: 'top-right', label: 'Top-Right', dotPos: 'top-1.5 right-1.5' },
                  { id: 'bottom-left', label: 'Bottom-Left', dotPos: 'bottom-1.5 left-1.5' },
                  { id: 'bottom-right', label: 'Bottom-Right', dotPos: 'bottom-1.5 right-1.5' },
                ].map((corner) => {
                  const isSelected = selectedCorner === corner.id;
                  return (
                    <button
                      key={corner.id}
                      onClick={() => handleSelectCorner(corner.id as CornerPosition)}
                      className={`relative h-16 rounded-xl border p-2 flex flex-col justify-end transition-all text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600/15 text-white ring-1 ring-blue-500'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="absolute inset-2 border border-slate-700/40 rounded-lg pointer-events-none" />
                      <div
                        className={`absolute w-3 h-3 rounded-full ${corner.dotPos} ${
                          isSelected ? 'bg-blue-400 ring-2 ring-blue-500/50' : 'bg-slate-600'
                        }`}
                      />
                      <span className="text-[10px] font-semibold tracking-tight relative z-10">
                        {corner.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Hardware & Media Configuration (5 cols) */}
          <div className="md:col-span-5 p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* 1. Camera Toggle & Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                    {isCameraEnabled ? (
                      <Camera className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <CameraOff className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>Camera</span>
                  </label>
                  <button
                    onClick={handleCameraToggle}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isCameraEnabled ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isCameraEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {isCameraEnabled && (
                  <select
                    value={selectedVideoId}
                    onChange={(e) => setSelectedVideoId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {videoDevices.length > 0 ? (
                      videoDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Camera ${d.deviceId.slice(0, 5)}...`}
                        </option>
                      ))
                    ) : (
                      <option value="">Default Web Camera</option>
                    )}
                  </select>
                )}
              </div>

              {/* 2. Shape Segmented Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-200 mb-1.5 block">
                  Bubble Shape
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[
                    { id: 'squircle', label: 'Squircle', icon: Sparkles },
                    { id: 'circle', label: 'Circle', icon: Circle },
                    { id: 'square', label: 'Square', icon: Square },
                  ].map((shape) => {
                    const isSel = selectedShape === shape.id;
                    const Icon = shape.icon;
                    return (
                      <button
                        key={shape.id}
                        onClick={() => handleShapeChange(shape.id as PipShape)}
                        className={`flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSel
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{shape.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Size Percentage Slider */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-semibold text-slate-200">Size</span>
                  <span className="font-mono text-slate-400">{sizePercent}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="1"
                  value={sizePercent}
                  onChange={(e) => handleSizeChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* 4. Mirror Horizontally Toggle */}
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-semibold text-slate-200">Mirror Horizontally</span>
                <button
                  onClick={handleMirrorToggle}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isMirrored ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isMirrored ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="h-px bg-slate-800" />

              {/* 5. Microphone Toggle, Dropdown & Live VU Meter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                    {isMicEnabled ? (
                      <Mic className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>Microphone</span>
                  </label>
                  <button
                    onClick={handleMicToggle}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isMicEnabled ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isMicEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {isMicEnabled && (
                  <div className="space-y-2">
                    <select
                      value={selectedAudioId}
                      onChange={async (e) => {
                        const newId = e.target.value;
                        setSelectedAudioId(newId);
                        if (isMicEnabled && captureEngine) {
                          await captureEngine.startMicrophoneCapture(newId);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      {audioDevices.length > 0 ? (
                        audioDevices.map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `Microphone ${d.deviceId.slice(0, 5)}...`}
                          </option>
                        ))
                      ) : (
                        <option value="">Default Microphone</option>
                      )}
                    </select>

                    {/* Animated VU Meter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Input Level</span>
                        <span className="font-mono">{Math.round(vuLevel * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-75 ${
                            vuLevel > 0.8
                              ? 'bg-rose-500'
                              : vuLevel > 0.4
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${Math.max(4, vuLevel * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. System Audio Toggle */}
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                  {isSystemAudioEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>System Audio</span>
                </span>
                <button
                  onClick={handleSystemAudioToggle}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isSystemAudioEnabled ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isSystemAudioEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShareScreenSubmit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share screen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
