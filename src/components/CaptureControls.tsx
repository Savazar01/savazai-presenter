// CaptureControls — Media Ingestion, Web Audio Graph & PiP Settings
import React, { useState } from 'react';
import {
  Monitor,
  Camera,
  Mic,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Sparkles,
  Layout,
  Circle,
  Square,
} from 'lucide-react';
import { StreamState, AudioLevels, PipConfig, PipPlacementPreset, PipShape } from '@/types';
import { AudioVisualizer } from './AudioVisualizer';
import { CaptureEngine } from '@/core/capture/CaptureEngine';

interface CaptureControlsProps {
  streamState: StreamState;
  audioLevels: AudioLevels;
  pipConfig: PipConfig;
  captureEngine: CaptureEngine | null;
  onStartDisplayCapture: (prefer4K: boolean) => void;
  onStopDisplayCapture: () => void;
  onStartWebcamCapture: () => void;
  onStopWebcamCapture: () => void;
  onStartMicCapture: () => void;
  onStopMicCapture: () => void;
  onUpdateAudioLevels: (levels: Partial<AudioLevels>) => void;
  onUpdatePipConfig: (config: Partial<PipConfig>) => void;
}

export const CaptureControls: React.FC<CaptureControlsProps> = ({
  streamState,
  audioLevels,
  pipConfig,
  captureEngine,
  onStartDisplayCapture,
  onStopDisplayCapture,
  onStartWebcamCapture,
  onStopWebcamCapture,
  onStartMicCapture,
  onStopMicCapture,
  onUpdateAudioLevels,
  onUpdatePipConfig,
}) => {
  const [prefer4K, setPrefer4K] = useState(true);

  const handleApplyPlacementPreset = (preset: PipPlacementPreset) => {
    switch (preset) {
      case 'bottom-right':
        onUpdatePipConfig({ x: 88, y: 82, placementPreset: preset });
        break;
      case 'bottom-left':
        onUpdatePipConfig({ x: 12, y: 82, placementPreset: preset });
        break;
      case 'top-right':
        onUpdatePipConfig({ x: 88, y: 18, placementPreset: preset });
        break;
      case 'top-left':
        onUpdatePipConfig({ x: 12, y: 18, placementPreset: preset });
        break;
      case 'center':
        onUpdatePipConfig({ x: 50, y: 50, placementPreset: preset });
        break;
    }
  };

  return (
    <div className="w-84 glass-panel border-l border-slate-800/80 p-5 flex flex-col space-y-6 overflow-y-auto z-30">
      {/* 1. Screen Capture Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Monitor className="w-4 h-4 text-blue-400" />
            <span>Screen Ingestion</span>
          </div>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={prefer4K}
              onChange={(e) => setPrefer4K(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span className="font-mono font-bold text-blue-400">4K 60FPS</span>
          </label>
        </div>

        {streamState.hasDisplayStream ? (
          <div className="space-y-2">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold">Stream Connected</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                {streamState.streamResolution
                  ? `${streamState.streamResolution.width}x${streamState.streamResolution.height}`
                  : '4K Native'}
              </span>
            </div>

            <button
              onClick={onStopDisplayCapture}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700"
            >
              Disconnect Screen
            </button>
          </div>
        ) : (
          <button
            onClick={() => onStartDisplayCapture(prefer4K)}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <Radio className="w-4 h-4" />
            <span>Select Screen / Window</span>
          </button>
        )}
      </div>

      {/* 2. Webcam Picture-in-Picture & Canvas Compositor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>PiP Webcam Compositor</span>
          </div>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={pipConfig.enabled}
              onChange={(e) => onUpdatePipConfig({ enabled: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span>Enabled</span>
          </label>
        </div>

        {streamState.hasWebcamStream ? (
          <div className="space-y-3">
            {/* Avatar Shape Selector */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs text-slate-400 font-medium">Webcam Mask Shape</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['circle', 'rounded-rect', 'square'] as PipShape[]).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => onUpdatePipConfig({ shape })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                      pipConfig.shape === shape
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {shape === 'rounded-rect' ? 'Squircle' : shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Placement Presets */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs text-slate-400 font-medium">Placement Preset</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['bottom-right', 'bottom-left', 'top-right', 'top-left'] as PipPlacementPreset[]).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => handleApplyPlacementPreset(pos)}
                    className={`py-1 px-2 rounded-lg text-[11px] font-medium capitalize transition-all ${
                      pipConfig.placementPreset === pos
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pos.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Slider */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Avatar Size</span>
                <span className="font-mono text-blue-400">{pipConfig.size}px</span>
              </div>
              <input
                type="range"
                min="100"
                max="320"
                value={pipConfig.size}
                onChange={(e) => onUpdatePipConfig({ size: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <button
              onClick={onStopWebcamCapture}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700"
            >
              Turn Off Webcam
            </button>
          </div>
        ) : (
          <button
            onClick={onStartWebcamCapture}
            className="w-full py-2 px-3 rounded-xl glass-button text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center space-x-2"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Enable Front Camera</span>
          </button>
        )}
      </div>

      {/* 3. Web Audio Dual Mixer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Dual Audio Graph Mixer</span>
          </div>

          <AudioVisualizer
            captureEngine={captureEngine}
            isActive={streamState.hasMicStream || streamState.hasDisplayStream}
            width={72}
            height={20}
            mode="wave"
          />
        </div>

        {/* Microphone Toggle & Slider */}
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Mic className="w-3.5 h-3.5 text-blue-400" />
              <span>Microphone Input</span>
            </div>
            <button
              onClick={() =>
                streamState.hasMicStream ? onStopMicCapture() : onStartMicCapture()
              }
              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                streamState.hasMicStream
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {streamState.hasMicStream ? 'LIVE' : 'ENABLE'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateAudioLevels({ micMuted: !audioLevels.micMuted })}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              {audioLevels.micMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioLevels.micMuted ? 0 : audioLevels.micVolume}
              onChange={(e) => onUpdateAudioLevels({ micVolume: parseFloat(e.target.value) })}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="font-mono text-[11px] text-slate-400 w-8 text-right">
              {Math.round(audioLevels.micVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Display / System Audio Slider */}
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tab / Display Audio</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateAudioLevels({ displayMuted: !audioLevels.displayMuted })}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              {audioLevels.displayMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioLevels.displayMuted ? 0 : audioLevels.displayVolume}
              onChange={(e) => onUpdateAudioLevels({ displayVolume: parseFloat(e.target.value) })}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="font-mono text-[11px] text-slate-400 w-8 text-right">
              {Math.round(audioLevels.displayVolume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
