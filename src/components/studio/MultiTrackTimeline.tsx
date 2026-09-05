// MultiTrackTimeline.tsx — MotionStudio Multi-Track Timeline & Transport Suite
import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Crop,
  ShieldAlert,
  Scissors,
  Eye,
  Sliders,
  Sparkles,
  ChevronUp,
} from 'lucide-react';
import { TrimRange, CalloutOverlay, ZoomFragment, MaskEffectType } from '@/types';

interface MultiTrackTimelineProps {
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  trimRange: TrimRange;
  callouts: CalloutOverlay[];
  zoomFragments: ZoomFragment[];
  loadedVideoName?: string;
  maskEffect: MaskEffectType;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onStepPrev: () => void;
  onStepNext: () => void;
  onUpdateTrimRange: (range: TrimRange) => void;
  onSelectMaskEffect: (mask: MaskEffectType) => void;
}

export const MultiTrackTimeline: React.FC<MultiTrackTimelineProps> = ({
  currentTime,
  totalDuration,
  isPlaying,
  trimRange,
  callouts,
  zoomFragments,
  loadedVideoName = 'MotionStudio_Vid_Live.webm',
  maskEffect,
  onTogglePlay,
  onSeek,
  onStepPrev,
  onStepNext,
  onUpdateTrimRange,
  onSelectMaskEffect,
}) => {
  const [isMaskFlyoutOpen, setIsMaskFlyoutOpen] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const timelineTrackRef = useRef<HTMLDivElement | null>(null);

  const formatTimecode = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}.${ms}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineTrackRef.current) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * Math.max(1, totalDuration);
    onSeek(targetTime);
  };

  const safeDuration = Math.max(0.1, totalDuration);
  const playheadPercent = (currentTime / safeDuration) * 100;

  const maskOptions: { id: MaskEffectType; label: string }[] = [
    { id: 'none', label: 'No Mask' },
    { id: 'fade-top', label: 'Fade Top' },
    { id: 'fade-bottom', label: 'Fade Bottom' },
    { id: 'fade-sides', label: 'Fade Sides' },
    { id: 'vignette', label: 'Vignette' },
    { id: 'diagonal-45', label: 'Diagonal 45°' },
  ];

  return (
    <div className="bg-slate-950 border-t border-slate-800 flex flex-col z-30 select-none shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
      {/* 1. Floating Transport Control Bar */}
      <div className="h-11 px-6 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
        {/* Left: Play/Pause, Step Prev/Next & Precision Timecode */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={onStepPrev}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Step to Previous Marker"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onTogglePlay}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 transition-transform active:scale-95"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={onStepNext}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Step to Next Marker"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Precision Timecode Display */}
          <div className="flex items-center space-x-1.5 font-mono text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="font-bold text-white">{formatTimecode(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{formatTimecode(totalDuration)}</span>
          </div>
        </div>

        {/* Right: Loop, Mask Effects Flyout Popover & Crop */}
        <div className="flex items-center space-x-2">
          {/* Mask Popover */}
          <div className="relative">
            <button
              onClick={() => setIsMaskFlyoutOpen((prev) => !prev)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                maskEffect !== 'none'
                  ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="capitalize">Mask: {maskEffect.replace('-', ' ')}</span>
              <ChevronUp className={`w-3 h-3 transition-transform ${isMaskFlyoutOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMaskFlyoutOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-0.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Viewport Edge Masks
                </div>
                {maskOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSelectMaskEffect(opt.id);
                      setIsMaskFlyoutOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      maskEffect === opt.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsLooping((prev) => !prev)}
            className={`p-1.5 rounded-lg border transition-all ${
              isLooping
                ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Loop Playback"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Multi-Track Timeline Canvas */}
      <div className="p-4 flex flex-col space-y-2 relative">
        {/* Track Headers & Lanes Grid */}
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Track 1: VIDEO */}
          <div className="col-span-2 flex items-center space-x-1.5 text-xs font-bold text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>VIDEO</span>
          </div>
          <div
            ref={timelineTrackRef}
            onClick={handleTimelineClick}
            className="col-span-10 h-7 bg-slate-900/80 rounded-lg border border-slate-800 relative cursor-pointer overflow-hidden flex items-center p-1"
          >
            {/* Green Video Clip Block */}
            <div
              style={{
                left: `${(trimRange.start / safeDuration) * 100}%`,
                width: `${Math.max(4, ((trimRange.end - trimRange.start) / safeDuration) * 100)}%`,
              }}
              className="absolute h-5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded text-[10px] font-mono font-bold text-white px-2 flex items-center justify-between shadow-sm"
            >
              <span className="truncate">{loadedVideoName}</span>
              <Scissors className="w-3 h-3 text-emerald-200 ml-1 opacity-70" />
            </div>

            {/* Playhead Indicator */}
            <div
              style={{ left: `${playheadPercent}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 shadow-[0_0_8px_rgba(244,63,94,0.9)]"
            >
              <div className="w-2.5 h-2.5 -ml-1 -top-1 absolute bg-rose-500 rounded-full" />
            </div>
          </div>

          {/* Track 2: ZOOM */}
          <div className="col-span-2 flex items-center space-x-1.5 text-xs font-bold text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>ZOOM</span>
          </div>
          <div
            onClick={handleTimelineClick}
            className="col-span-10 h-6 bg-slate-900/50 rounded-lg border border-slate-800/60 relative cursor-pointer overflow-hidden flex items-center p-1"
          >
            {zoomFragments.map((frag) => (
              <div
                key={frag.id}
                style={{
                  left: `${(frag.startTime / safeDuration) * 100}%`,
                  width: `${Math.max(3, ((frag.endTime - frag.startTime) / safeDuration) * 100)}%`,
                }}
                className="absolute h-4 bg-blue-600/80 hover:bg-blue-500 rounded text-[9px] font-mono text-white px-1.5 flex items-center font-bold"
              >
                Zoom {frag.targetFocus.scale}x
              </div>
            ))}
            {/* Playhead Line */}
            <div
              style={{ left: `${playheadPercent}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30"
            />
          </div>

          {/* Track 3: TEXT / CALLOUTS */}
          <div className="col-span-2 flex items-center space-x-1.5 text-xs font-bold text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>CALLOUTS</span>
          </div>
          <div
            onClick={handleTimelineClick}
            className="col-span-10 h-6 bg-slate-900/50 rounded-lg border border-slate-800/60 relative cursor-pointer overflow-hidden flex items-center p-1"
          >
            {callouts.map((c) => (
              <div
                key={c.id}
                style={{
                  left: `${(c.startTime / safeDuration) * 100}%`,
                  width: `${Math.max(3, ((c.endTime - c.startTime) / safeDuration) * 100)}%`,
                }}
                className="absolute h-4 bg-amber-600/80 hover:bg-amber-500 rounded text-[9px] font-mono text-white px-1.5 flex items-center font-bold truncate"
              >
                {c.title}
              </div>
            ))}
            {/* Playhead Line */}
            <div
              style={{ left: `${playheadPercent}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
