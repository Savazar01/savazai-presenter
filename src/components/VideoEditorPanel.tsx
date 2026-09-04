// VideoEditorPanel — Video Upload, Trimming, Audio Layering & Animated Callout Studio
import React, { useState } from 'react';
import {
  Upload,
  Scissors,
  Layers,
  Music,
  Plus,
  Trash2,
  Sparkles,
  Play,
  FileVideo,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CalloutOverlay, TrimRange, AudioLevels } from '@/types';

interface VideoEditorPanelProps {
  loadedVideoName?: string;
  totalDuration: number;
  trimRange: TrimRange;
  callouts: CalloutOverlay[];
  audioLevels: AudioLevels;
  onVideoUpload: (file: File) => void;
  onUpdateTrimRange: (range: TrimRange) => void;
  onAddCallout: (callout: CalloutOverlay) => void;
  onRemoveCallout: (id: string) => void;
  onUpdateAudioLevels: (levels: Partial<AudioLevels>) => void;
  onSeek: (time: number) => void;
}

export const VideoEditorPanel: React.FC<VideoEditorPanelProps> = ({
  loadedVideoName,
  totalDuration,
  trimRange,
  callouts,
  audioLevels,
  onVideoUpload,
  onUpdateTrimRange,
  onAddCallout,
  onRemoveCallout,
  onUpdateAudioLevels,
  onSeek,
}) => {
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
    <div className="w-88 glass-panel border-l border-slate-800/80 p-5 flex flex-col space-y-6 overflow-y-auto z-30">
      {/* 1. Video Asset Uploader / Drag-and-Drop */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Upload className="w-4 h-4 text-blue-400" />
          <span>Import Video Asset</span>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-700 hover:border-blue-500/70 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-900/40 group relative"
        >
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/mkv"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileVideo className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                {loadedVideoName ? loadedVideoName : 'Click or Drag Video Here'}
              </p>
              <p className="text-[10px] text-slate-400">MP4, WebM, or MOV up to 4K</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Timeline In / Out Trim Handles */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Scissors className="w-4 h-4 text-emerald-400" />
          <span>Timeline Trimming</span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>In-Point: <strong className="font-mono text-emerald-400">{trimRange.start.toFixed(1)}s</strong></span>
            <span>Out-Point: <strong className="font-mono text-emerald-400">{trimRange.end.toFixed(1)}s</strong></span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">Start Time (s)</label>
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

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">End Time (s)</label>
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

      {/* 3. Animated Callout & Text Overlays */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Callout & Text Overlays</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {callouts.length} Active
          </span>
        </div>

        {/* Existing Callouts List */}
        <div className="space-y-2">
          {callouts.map((c) => (
            <div
              key={c.id}
              onClick={() => onSeek(c.startTime)}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer flex items-center justify-between transition-all group"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  {c.badge && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
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
          <input
            type="text"
            placeholder="Callout Title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="Description (Optional)..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400">Animation</label>
              <select
                value={newAnim}
                onChange={(e) => setNewAnim(e.target.value as 'fade' | 'bounce' | 'typewriter')}
                className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
              >
                <option value="bounce">Spring Bounce</option>
                <option value="fade">Smooth Fade</option>
                <option value="typewriter">Typewriter</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400">Color Theme</label>
              <select
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value as 'blue' | 'indigo' | 'emerald' | 'rose')}
                className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
              >
                <option value="blue">Blue Cyber</option>
                <option value="emerald">Emerald Pro</option>
                <option value="indigo">Indigo Studio</option>
                <option value="rose">Rose Flare</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCreateCallout}
            className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Callout to Timeline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
