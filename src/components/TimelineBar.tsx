// TimelineBar — Scrubbable Master Timeline, Trim Region & Cue Choreography Bar
import React, { useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Clock,
  Bookmark,
  FastForward,
  Layers,
} from 'lucide-react';
import { CuePoint, TrimRange, CalloutOverlay } from '@/types';

interface TimelineBarProps {
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  playbackRate: number;
  activeCueIndex: number;
  cuePoints: CuePoint[];
  trimRange?: TrimRange;
  callouts?: CalloutOverlay[];
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onStepPrev: () => void;
  onStepNext: () => void;
  onSetPlaybackRate: (rate: number) => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  currentTime,
  totalDuration,
  isPlaying,
  playbackRate,
  activeCueIndex,
  cuePoints,
  trimRange,
  callouts = [],
  onTogglePlay,
  onSeek,
  onStepPrev,
  onStepNext,
  onSetPlaybackRate,
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const formatTimecode = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percent * totalDuration);
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const trimStartPercent = trimRange && totalDuration > 0 ? (trimRange.start / totalDuration) * 100 : 0;
  const trimEndPercent = trimRange && totalDuration > 0 ? (trimRange.end / totalDuration) * 100 : 100;

  return (
    <div className="h-20 px-6 glass-panel border-t border-slate-800/80 flex flex-col justify-center space-y-2 z-40 relative">
      {/* Upper Controls Row */}
      <div className="flex items-center justify-between">
        {/* Playback Transport Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSeek(trimRange ? trimRange.start : 0)}
            className="p-1.5 rounded-lg glass-button text-slate-400 hover:text-white"
            title="Reset to Start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onStepPrev}
            className="p-1.5 rounded-lg glass-button text-slate-300 hover:text-white"
            title="Step to Previous Cue Point"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all transform active:scale-95"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          <button
            onClick={onStepNext}
            className="p-1.5 rounded-lg glass-button text-slate-300 hover:text-white"
            title="Step to Next Cue Point"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Active Cue Point Title */}
        <div className="flex items-center space-x-2 text-xs">
          <Bookmark className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Current Cue:</span>
          <span className="font-semibold text-white">
            {cuePoints[activeCueIndex]?.title || 'Intro Staging'}
          </span>
        </div>

        {/* Timecode & Speed Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 font-mono text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-blue-400 font-bold">{formatTimecode(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span>{formatTimecode(totalDuration)}</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 text-xs">
            <FastForward className="w-3 h-3 text-slate-400" />
            {[0.5, 1.0, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => onSetPlaybackRate(rate)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  playbackRate === rate
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrubbable Timeline Track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative w-full h-4 bg-slate-900/90 rounded-full cursor-pointer group border border-slate-800/80 flex items-center overflow-hidden"
      >
        {/* Trim Active Zone Highlight */}
        {trimRange && (
          <div
            className="absolute top-0 bottom-0 bg-emerald-500/15 border-x border-emerald-500/40 pointer-events-none"
            style={{
              left: `${trimStartPercent}%`,
              width: `${Math.max(0, trimEndPercent - trimStartPercent)}%`,
            }}
          />
        )}

        {/* Elapsed Progress Bar */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full pointer-events-none"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Callout Marker Indicators */}
        {callouts.map((callout) => {
          const cStart = (callout.startTime / totalDuration) * 100;
          return (
            <div
              key={callout.id}
              style={{ left: `${cStart}%` }}
              className="absolute top-0 bottom-0 w-1 bg-indigo-400/80 pointer-events-none z-10"
              title={`Callout: ${callout.title}`}
            />
          );
        })}

        {/* Cue Point Markers */}
        {cuePoints.map((cue, index) => {
          const cuePercent = (cue.time / totalDuration) * 100;
          const isActive = index === activeCueIndex;

          return (
            <div
              key={cue.id}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(cue.time);
              }}
              style={{ left: `${cuePercent}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 group/cue"
            >
              <div
                className={`w-3 h-3 rounded-full border-2 transition-all ${
                  isActive
                    ? 'bg-white border-blue-400 ring-4 ring-blue-500/40 scale-125'
                    : 'bg-slate-700 border-slate-400 hover:bg-cyan-400 hover:scale-110'
                }`}
              />

              {/* Tooltip on Hover */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover/cue:flex flex-col items-center pointer-events-none z-30">
                <div className="bg-slate-900 border border-slate-700 text-white text-[11px] px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap">
                  <span className="font-semibold text-blue-400">{cue.title}</span>
                  <span className="text-slate-400 ml-1 font-mono">({formatTimecode(cue.time)})</span>
                </div>
                <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45 -mt-1" />
              </div>
            </div>
          );
        })}

        {/* Draggable Scrubber Thumb */}
        <div
          style={{ left: `${progressPercent}%` }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(59,130,246,0.9)] border-2 border-blue-500 pointer-events-none z-30 transition-transform group-hover:scale-125"
        />
      </div>
    </div>
  );
};
