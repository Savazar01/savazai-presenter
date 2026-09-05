// CaptureControls — Streamlined Media Ingestion, Virtual Backgrounds & Calibration Hub
import React, { useState, useRef, useEffect } from 'react';
import {
  Monitor,
  Camera,
  Mic,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Sparkles,
  Layers,
  ChevronDown,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import {
  StreamState,
  AudioLevels,
  PipConfig,
  PipPlacementPreset,
  PipShape,
  VirtualBgType,
} from '@/types';
import { AudioVisualizer } from './AudioVisualizer';
import { CaptureEngine } from '@/core/capture/CaptureEngine';
import { ProcessedWebcamPipeline } from '@/core/capture/ProcessedWebcamPipeline';

interface CaptureControlsProps {
  streamState: StreamState;
  audioLevels: AudioLevels;
  pipConfig: PipConfig;
  captureEngine: CaptureEngine | null;
  webcamPipeline?: ProcessedWebcamPipeline | null;
  onStartDisplayCapture: (prefer4K: boolean) => void;
  onStopDisplayCapture: () => void;
  onStartWebcamCapture: () => void;
  onStopWebcamCapture: () => void;
  onStartMicCapture: () => void;
  onStopMicCapture: () => void;
  onUpdateAudioLevels: (levels: Partial<AudioLevels>) => void;
  onUpdatePipConfig: (config: Partial<PipConfig>) => void;
  onSetVirtualBackground?: (type: VirtualBgType, customImageUrl?: string) => void;
}

export const CaptureControls: React.FC<CaptureControlsProps> = ({
  streamState,
  audioLevels,
  pipConfig,
  captureEngine,
  webcamPipeline,
  onStartDisplayCapture,
  onStopDisplayCapture,
  onStartWebcamCapture,
  onStopWebcamCapture,
  onStartMicCapture,
  onStopMicCapture,
  onUpdateAudioLevels,
  onUpdatePipConfig,
  onSetVirtualBackground,
}) => {
  const [prefer4K, setPrefer4K] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const backgroundGroups: {
    category: string;
    options: { id: VirtualBgType; label: string; desc: string; icon: string }[];
  }[] = [
    {
      category: 'Curated 3D Studio Environments',
      options: [
        { id: 'preset-office', label: 'Modern Office', desc: 'Executive Glass & Skyline Bokeh', icon: '🏢' },
        { id: 'preset-studio', label: 'Creator Studio', desc: 'Cyber Neon RGB Lighting', icon: '🎙️' },
        { id: 'preset-scenic', label: 'Sunset Penthouse', desc: 'Golden Hour Architectural View', icon: '🌅' },
      ],
    },
    {
      category: 'Optics & Direct Feed',
      options: [
        { id: 'blur-medium', label: 'Bokeh Blur', desc: '16px Soft Depth of Field', icon: '🌫️' },
        { id: 'none', label: 'Clean Camera', desc: 'Direct 1:1 Unfiltered Feed', icon: '📹' },
      ],
    },
    {
      category: 'Custom Brand Identity',
      options: [
        { id: 'custom-image', label: 'Custom Image...', desc: 'Upload JPG / PNG / SVG backdrop', icon: '🖼️' },
      ],
    },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Live Real-Time Calibration Hub Loop
  useEffect(() => {
    let animId: number;
    const renderPreview = () => {
      if (streamState.hasWebcamStream && webcamPipeline && previewCanvasRef.current) {
        const ctx = previewCanvasRef.current.getContext('2d');
        const sourceCanvas = webcamPipeline.getCanvas();
        if (ctx && sourceCanvas && sourceCanvas.width > 0) {
          const w = previewCanvasRef.current.width;
          const h = previewCanvasRef.current.height;
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(sourceCanvas, 0, 0, w, h);
        }
      }
      animId = requestAnimationFrame(renderPreview);
    };

    animId = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(animId);
  }, [streamState.hasWebcamStream, webcamPipeline]);

  const handleSelectBg = (type: VirtualBgType) => {
    setIsDropdownOpen(false);
    if (type === 'custom-image') {
      fileInputRef.current?.click();
    } else {
      if (onSetVirtualBackground) {
        onSetVirtualBackground(type);
      }
      onUpdatePipConfig({
        background: { type },
      });
    }
  };

  const handleCustomImageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (onSetVirtualBackground) {
        onSetVirtualBackground('custom-image', url);
      }
      onUpdatePipConfig({
        background: { type: 'custom-image', customImageUrl: url },
      });
    }
  };

  const currentBgType = pipConfig.background?.type || 'preset-office';

  const getCurrentOption = () => {
    for (const group of backgroundGroups) {
      const match = group.options.find((o) => o.id === currentBgType);
      if (match) return match;
    }
    return backgroundGroups[0].options[0];
  };

  const currentOption = getCurrentOption();

  const getShapeClass = () => {
    if (pipConfig.shape === 'circle') return 'rounded-full';
    if (pipConfig.shape === 'rounded-rect') return 'rounded-3xl';
    return 'rounded-xl';
  };

  return (
    <div className="w-80 glass-panel border-l border-slate-800/80 p-4 flex flex-col space-y-5 overflow-y-auto z-30">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
        <Sliders className="w-4 h-4 text-emerald-400" />
        <span>Media & Avatar Ingestion</span>
      </div>

      {/* 1. Screen Ingestion Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span>Screen Feed</span>
          </span>
          <label className="flex items-center space-x-1 cursor-pointer text-[11px] text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={prefer4K}
              onChange={(e) => setPrefer4K(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span className="font-mono text-blue-400 font-bold">4K 60FPS</span>
          </label>
        </div>

        {streamState.hasDisplayStream ? (
          <div className="space-y-1.5">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-emerald-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Feed Ingested</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                {streamState.streamResolution
                  ? `${streamState.streamResolution.width}x${streamState.streamResolution.height}`
                  : '60 FPS'}
              </span>
            </div>
            <button
              onClick={onStopDisplayCapture}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
            >
              Disconnect Screen
            </button>
          </div>
        ) : (
          <button
            onClick={() => onStartDisplayCapture(prefer4K)}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <Radio className="w-4 h-4" />
            <span>Share Screen or Window</span>
          </button>
        )}
      </div>

      {/* 2. Webcam Picture-in-Picture & Pre-Recording Calibration Hub */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Webcam Avatar Hub</span>
          </span>
          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={pipConfig.enabled}
              onChange={(e) => onUpdatePipConfig({ enabled: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span>Show</span>
          </label>
        </div>

        {streamState.hasWebcamStream ? (
          <div className="space-y-3">
            {/* Real-time Camera & Virtual Background Calibration Card */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 flex flex-col items-center space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between w-full text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Live Calibration Preview</span>
                </span>
                <span className="text-[10px] text-purple-400 font-mono">60 FPS EMA</span>
              </div>

              {/* Live 180px Interactive Calibration Circle / Squircle */}
              <div
                className={`w-44 h-44 overflow-hidden border-2 border-blue-500/80 shadow-[0_0_25px_rgba(59,130,246,0.3)] bg-slate-950 flex items-center justify-center transition-all ${getShapeClass()}`}
              >
                <canvas
                  ref={previewCanvasRef}
                  width={220}
                  height={220}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-[10px] text-slate-400 text-center font-medium">
                Verified real-time background extraction before recording
              </span>
            </div>

            {/* Curated Categorized Virtual Backdrop Dropdown Picker */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Virtual Backdrop</span>
                </span>
                <span className="text-[10px] text-purple-400 font-mono">STUDIO DSP</span>
              </label>

              {/* Active Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-purple-500/50 flex items-center justify-between text-left transition-all shadow-md group"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <span className="text-xl flex-shrink-0">{currentOption.icon}</span>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {currentOption.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {currentOption.desc}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200 flex-shrink-0 ${
                    isDropdownOpen ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {/* Categorized Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900/98 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-2 shadow-2xl space-y-2 max-h-72 overflow-y-auto">
                  {backgroundGroups.map((group, gIdx) => (
                    <div key={group.category} className={gIdx > 0 ? 'pt-1.5 border-t border-slate-800/80' : ''}>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        {group.category}
                      </div>
                      <div className="space-y-1 mt-0.5">
                        {group.options.map((opt) => {
                          const isSelected = currentBgType === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleSelectBg(opt.id)}
                              className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-purple-600/30 border border-purple-500/80 text-white shadow-sm'
                                  : 'hover:bg-slate-800/70 text-slate-300 hover:text-white border border-transparent'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 truncate">
                                <span className="text-base flex-shrink-0">{opt.icon}</span>
                                <div className="truncate">
                                  <div className="text-xs font-semibold truncate">{opt.label}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{opt.desc}</div>
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomImageUploaded}
                className="hidden"
              />
            </div>

            {/* Avatar Shape Segmented Pill */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Mask Shape</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                {(['circle', 'rounded-rect', 'square'] as PipShape[]).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => onUpdatePipConfig({ shape })}
                    className={`py-1 text-xs font-semibold capitalize rounded-lg transition-all ${
                      pipConfig.shape === shape
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {shape === 'rounded-rect' ? 'Squircle' : shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Size Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Avatar Diameter</span>
                <span className="font-mono text-blue-400 font-bold">{pipConfig.size}px</span>
              </div>
              <input
                type="range"
                min="120"
                max="320"
                value={pipConfig.size}
                onChange={(e) => onUpdatePipConfig({ size: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <button
              onClick={onStopWebcamCapture}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700 transition-all"
            >
              Turn Off Camera
            </button>
          </div>
        ) : (
          <button
            onClick={onStartWebcamCapture}
            className="w-full py-2 px-3 rounded-xl glass-button text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center space-x-2"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Enable Camera Avatar</span>
          </button>
        )}
      </div>

      {/* 3. Studio Web Audio Mixer */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audio Mix</span>
          </span>
          <AudioVisualizer
            captureEngine={captureEngine}
            isActive={streamState.hasMicStream || streamState.hasDisplayStream}
            width={60}
            height={16}
            mode="wave"
          />
        </div>

        {/* Microphone Slider */}
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Microphone (80Hz DSP)</span>
            <button
              onClick={() => (streamState.hasMicStream ? onStopMicCapture() : onStartMicCapture())}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                streamState.hasMicStream
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {streamState.hasMicStream ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateAudioLevels({ micMuted: !audioLevels.micMuted })}
              className="text-slate-400 hover:text-white"
            >
              {audioLevels.micMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioLevels.micMuted ? 0 : audioLevels.micVolume}
              onChange={(e) => onUpdateAudioLevels({ micVolume: parseFloat(e.target.value) })}
              className="flex-1 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
