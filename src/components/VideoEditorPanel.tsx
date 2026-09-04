// VideoEditorPanel — Video Upload, Trimming, Audio Layering & Animated Callout Studio
import React, { useState } from 'react';
import {
  Upload,
  Scissors,
  Layers,
  Plus,
  Trash2,
  FileVideo,
  Volume2,
  VolumeX,
  Laptop,
  Smartphone,
  Globe,
  Monitor,
  Camera,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import { CalloutOverlay, TrimRange, AudioLevels, DeviceType, DeviceFinish, CameraPreset } from '@/types';
import { DEVICE_FINISHES } from '@/core/scene/ThreeSceneManager';

interface VideoEditorPanelProps {
  loadedVideoName?: string;
  totalDuration: number;
  trimRange: TrimRange;
  callouts: CalloutOverlay[];
  audioLevels: AudioLevels;
  currentDevice: DeviceType;
  deviceFinish: DeviceFinish;
  cameraPreset: CameraPreset;
  onVideoUpload: (file: File) => void;
  onUpdateTrimRange: (range: TrimRange) => void;
  onAddCallout: (callout: CalloutOverlay) => void;
  onRemoveCallout: (id: string) => void;
  onUpdateAudioLevels: (levels: Partial<AudioLevels>) => void;
  onSelectDevice: (dev: DeviceType) => void;
  onSelectFinish: (finish: DeviceFinish) => void;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  onSeek: (time: number) => void;
}

export const VideoEditorPanel: React.FC<VideoEditorPanelProps> = ({
  loadedVideoName,
  totalDuration,
  trimRange,
  callouts,
  audioLevels,
  currentDevice,
  deviceFinish,
  cameraPreset,
  onVideoUpload,
  onUpdateTrimRange,
  onAddCallout,
  onRemoveCallout,
  onUpdateAudioLevels,
  onSelectDevice,
  onSelectFinish,
  onSelectCameraPreset,
  onSeek,
}) => {
  const [activeTab, setActiveTab] = useState<'trim' | 'callouts' | 'staging'>('trim');

  // Callout Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBadge, setNewBadge] = useState('STEP 1');
  const [newDesc, setNewDesc] = useState('');
  const [newStart, setNewStart] = useState(1);
  const [newEnd, setNewEnd] = useState(5);
  const [newAnim, setNewAnim] = useState<'fade' | 'bounce' | 'typewriter'>('bounce');
  const [newTheme, setNewTheme] = useState<'blue' | 'indigo' | 'emerald' | 'rose'>('blue');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onVideoUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onVideoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCreateCallout = () => {
    if (!newTitle.trim()) return;

    const callout: CalloutOverlay = {
      id: `callout-${Date.now()}`,
      title: newTitle,
      description: newDesc || undefined,
      badge: newBadge || undefined,
      startTime: Number(newStart),
      endTime: Number(newEnd),
      x: 10,
      y: 70,
      animation: newAnim,
      colorTheme: newTheme,
    };

    onAddCallout(callout);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="w-96 glass-panel border-l border-slate-800/80 flex flex-col h-full overflow-hidden z-30">
      {/* 1. Header & Asset Import */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Video Editor Studio</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {loadedVideoName ? 'Loaded' : 'Ready'}
          </span>
        </div>

        {/* Video Upload Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border border-dashed border-slate-700 hover:border-indigo-500/70 rounded-xl p-3 text-center cursor-pointer transition-colors bg-slate-900/60 group relative"
        >
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/mkv"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <div className="flex items-center justify-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
                {loadedVideoName || 'Import MP4 / WebM Video'}
              </p>
              <p className="text-[10px] text-slate-400">Click or drag file to stage</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 3-Tab Selector */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-slate-900/70 border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('trim')}
          className={`py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1 transition-all ${
            activeTab === 'trim'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Trim & Audio</span>
        </button>

        <button
          onClick={() => setActiveTab('callouts')}
          className={`py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1 transition-all ${
            activeTab === 'callouts'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Callouts</span>
        </button>

        <button
          onClick={() => setActiveTab('staging')}
          className={`py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1 transition-all ${
            activeTab === 'staging'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>3D Stage</span>
        </button>
      </div>

      {/* 3. Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Tab 1: Trimming & Audio */}
        {activeTab === 'trim' && (
          <div className="space-y-4">
            {/* Trim Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold flex items-center space-x-1.5">
                  <Scissors className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Timeline Trim Range</span>
                </span>
                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {trimRange.start.toFixed(1)}s - {trimRange.end.toFixed(1)}s
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>In-Point (Start)</span>
                    <span className="font-mono text-white">{trimRange.start.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(1, trimRange.end - 0.5)}
                    step="0.1"
                    value={trimRange.start}
                    onChange={(e) => onUpdateTrimRange({ ...trimRange, start: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Out-Point (End)</span>
                    <span className="font-mono text-white">{trimRange.end.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={trimRange.start + 0.5}
                    max={totalDuration}
                    step="0.1"
                    value={trimRange.end}
                    onChange={(e) => onUpdateTrimRange({ ...trimRange, end: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Audio Channels Section */}
            <div className="space-y-3">
              <span className="font-semibold text-xs text-slate-300 flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Audio Mixer & Gain</span>
              </span>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-3">
                {/* Master Volume */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Master Output</span>
                    <span className="font-mono text-white">{Math.round(audioLevels.masterVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={audioLevels.masterVolume}
                    onChange={(e) => onUpdateAudioLevels({ masterVolume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Display Audio Gain */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Video / Display Audio</span>
                    <span className="font-mono text-white">{Math.round(audioLevels.displayVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={audioLevels.displayVolume}
                    onChange={(e) => onUpdateAudioLevels({ displayVolume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Mic Gain */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Microphone Voiceover</span>
                    <span className="font-mono text-white">{Math.round(audioLevels.micVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={audioLevels.micVolume}
                    onChange={(e) => onUpdateAudioLevels({ micVolume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Text & Callouts */}
        {activeTab === 'callouts' && (
          <div className="space-y-4">
            {/* Existing Callouts List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">Active Callouts ({callouts.length})</span>
              </div>

              {callouts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSeek(c.startTime)}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {c.badge && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {c.badge}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-white">{c.title}</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400">
                      {c.startTime}s - {c.endTime}s • {c.animation}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCallout(c.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Callout Form */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Create Text Callout</span>
              </span>

              <input
                type="text"
                placeholder="Callout Title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <input
                type="text"
                placeholder="Description (Optional)..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Badge Text</label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Theme</label>
                  <select
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value as any)}
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="blue">Blue Cyber</option>
                    <option value="indigo">Indigo Studio</option>
                    <option value="emerald">Emerald Pro</option>
                    <option value="rose">Rose Flare</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Start (s)</label>
                  <input
                    type="number"
                    min="0"
                    max={totalDuration}
                    value={newStart}
                    onChange={(e) => setNewStart(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">End (s)</label>
                  <input
                    type="number"
                    min="0"
                    max={totalDuration}
                    value={newEnd}
                    onChange={(e) => setNewEnd(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Animation Style</label>
                <select
                  value={newAnim}
                  onChange={(e) => setNewAnim(e.target.value as any)}
                  className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="bounce">Spring Bounce</option>
                  <option value="fade">Smooth Fade</option>
                  <option value="typewriter">Kinetic Split-Word</option>
                </select>
              </div>

              <button
                onClick={handleCreateCallout}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center space-x-1.5 mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Callout to Timeline</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: 3D Staging & Finish */}
        {activeTab === 'staging' && (
          <div className="space-y-4">
            {/* Device Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Device Model</span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'macbook', name: 'MacBook Pro M3', icon: Laptop },
                  { id: 'windows-desktop', name: 'Windows PC Desktop', icon: Monitor },
                  { id: 'iphone', name: 'iPhone 16 Pro', icon: Smartphone },
                  { id: 'pixel-android', name: 'Google Pixel / Android', icon: Smartphone },
                  { id: 'browser', name: 'Glass Browser Frame', icon: Globe },
                ].map((d) => {
                  const Icon = d.icon;
                  const isSelected = currentDevice === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => onSelectDevice(d.id as DeviceType)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-indigo-400" />
                        <span>{d.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Material Finish */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Material Finish</span>
              <div className="grid grid-cols-1 gap-1.5">
                {(Object.keys(DEVICE_FINISHES) as DeviceFinish[]).map((fin) => {
                  const isSelected = deviceFinish === fin;
                  return (
                    <button
                      key={fin}
                      onClick={() => onSelectFinish(fin)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-indigo-500 text-white'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{DEVICE_FINISHES[fin].name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Camera Angles */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Camera Angle</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'front', label: 'Front Center' },
                  { id: 'isometric-left', label: 'Isometric Left' },
                  { id: 'isometric-right', label: 'Isometric Right' },
                  { id: 'top-down', label: 'Top Down' },
                  { id: 'dramatic-tilt', label: 'Dramatic Tilt' },
                  { id: 'mobile-focus', label: 'Mobile Focus' },
                ].map((preset) => {
                  const isSelected = cameraPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => onSelectCameraPreset(preset.id as CameraPreset)}
                      className={`p-2 rounded-lg border text-center text-xs transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
