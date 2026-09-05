// RecordingBoothOverlay — 5-Second Countdown & Document PiP / Floating Transport Control
import React, { useEffect, useRef, useState } from 'react';
import {
  Square,
  Pause,
  Play,
  RotateCcw,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Move,
  Sparkles,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { CaptureEngine } from '@/core/capture/CaptureEngine';
import { DocumentPipManager } from '@/core/capture/DocumentPipManager';

interface RecordingBoothOverlayProps {
  isRecording: boolean;
  isCountingDown: boolean;
  countdownNumber: number;
  isPaused: boolean;
  recordingDuration: number;
  captureEngine: CaptureEngine | null;
  documentPipManager?: DocumentPipManager | null;
  hasWebcamStream: boolean;
  isPipEnabled: boolean;
  isMicMuted: boolean;
  onCancelCountdown: () => void;
  onTogglePause: () => void;
  onRestartRecording: () => void;
  onTogglePip: () => void;
  onToggleMicMute: () => void;
  onStopAndOpenEditor: () => void;
}

export const RecordingBoothOverlay: React.FC<RecordingBoothOverlayProps> = ({
  isRecording,
  isCountingDown,
  countdownNumber,
  isPaused,
  recordingDuration,
  captureEngine,
  documentPipManager,
  hasWebcamStream,
  isPipEnabled,
  isMicMuted,
  onCancelCountdown,
  onTogglePause,
  onRestartRecording,
  onTogglePip,
  onToggleMicMute,
  onStopAndOpenEditor,
}) => {
  // Draggable Floating Pill State
  const [pillPos, setPillPos] = useState({ x: 50, y: 88 }); // % of screen
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 50, startY: 88 });
  const [vuLevel, setVuLevel] = useState(0);
  const [isDocPipActive, setIsDocPipActive] = useState(false);

  // Monitor live VU meter level and sync state to Document PiP
  useEffect(() => {
    let animId: number;
    const updateVU = () => {
      let currentVu = 0;
      if (captureEngine && isRecording && !isMicMuted) {
        currentVu = captureEngine.getMicVULevel();
        setVuLevel(currentVu);
      } else {
        setVuLevel(0);
      }

      if (documentPipManager && isDocPipActive) {
        documentPipManager.updateState({
          isPaused,
          recordingDuration,
          isMicMuted,
          vuLevel: currentVu,
        });
      }

      animId = requestAnimationFrame(updateVU);
    };

    animId = requestAnimationFrame(updateVU);
    return () => cancelAnimationFrame(animId);
  }, [captureEngine, isRecording, isMicMuted, documentPipManager, isDocPipActive, isPaused, recordingDuration]);

  // Request Document PiP Window when recording starts
  useEffect(() => {
    if (isRecording && !isCountingDown && documentPipManager && documentPipManager.isSupported()) {
      documentPipManager
        .open(
          {
            onTogglePause,
            onToggleMicMute,
            onStopAndOpenEditor,
            onClose: () => setIsDocPipActive(false),
          },
          {
            isPaused,
            recordingDuration,
            isMicMuted,
            vuLevel: 0,
          }
        )
        .then((opened) => {
          setIsDocPipActive(opened);
        });
    } else if (!isRecording && documentPipManager) {
      documentPipManager.close();
      setIsDocPipActive(false);
    }
  }, [isRecording, isCountingDown, documentPipManager]);

  const handleLaunchDocPip = async () => {
    if (documentPipManager) {
      const opened = await documentPipManager.open(
        {
          onTogglePause,
          onToggleMicMute,
          onStopAndOpenEditor,
          onClose: () => setIsDocPipActive(false),
        },
        {
          isPaused,
          recordingDuration,
          isMicMuted,
          vuLevel,
        }
      );
      setIsDocPipActive(opened);
    }
  };

  // Format recording seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Dragging logic for floating pill
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: pillPos.x,
      startY: pillPos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaXPercent = ((e.clientX - dragStartRef.current.mouseX) / window.innerWidth) * 100;
      const deltaYPercent = ((e.clientY - dragStartRef.current.mouseY) / window.innerHeight) * 100;

      const nextX = Math.max(10, Math.min(90, dragStartRef.current.startX + deltaXPercent));
      const nextY = Math.max(10, Math.min(92, dragStartRef.current.startY + deltaYPercent));

      setPillPos({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Sticky floating pill collapse state
  const [isPillCollapsed, setIsPillCollapsed] = useState(false);

  return (
    <>
      {/* 1. 5-Second Countdown Screen Overlay */}
      {isCountingDown && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex flex-col items-center justify-center select-none animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            {/* Pulsating Glowing Rings */}
            <div className="absolute w-64 h-64 rounded-full border-2 border-blue-500/40 animate-ping" />
            <div className="absolute w-80 h-80 rounded-full border border-indigo-500/20 animate-pulse" />

            <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-blue-600/30 via-indigo-600/40 to-slate-900/90 border-2 border-blue-400/60 shadow-[0_0_60px_rgba(59,130,246,0.6)] flex items-center justify-center">
              <span className="text-8xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-bounce">
                {countdownNumber > 0 ? countdownNumber : 'GO!'}
              </span>
            </div>
          </div>

          {/* Helper Badges & Presenter Guidance */}
          <div className="mt-8 flex flex-col items-center space-y-3 max-w-md text-center">
            <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-semibold shadow-lg">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Switch to your demo tab or application now</span>
            </div>
            <p className="text-slate-300 text-sm font-medium leading-relaxed">
              Recording begins in <span className="text-blue-400 font-bold">{countdownNumber}s</span>. MotionStudio is actively capturing screen and webcam audio in 60 FPS!
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={onCancelCountdown}
                className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Draggable / Sticky Control Pill (Visible when Recording is Active) */}
      {isRecording && !isCountingDown && (
        <div
          style={{
            left: `${pillPos.x}%`,
            top: `${pillPos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className={`fixed z-50 select-none bg-slate-900/92 backdrop-blur-2xl border border-slate-700/80 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex items-center transition-all ${
            isPillCollapsed ? 'px-2.5 py-1.5 space-x-1.5' : 'px-4 py-2.5 space-x-3'
          } ${isDragging ? 'ring-2 ring-blue-500/80 cursor-grabbing' : 'cursor-default'}`}
        >
          {/* Drag Handle */}
          <div
            onMouseDown={handleMouseDown}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-slate-300 transition-colors"
            title="Drag control pill anywhere on screen"
          >
            <Move className="w-3.5 h-3.5" />
          </div>

          {/* REC Status Indicator & Timer */}
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center justify-center">
              <span
                className={`w-3 h-3 rounded-full ${
                  isPaused ? 'bg-amber-400' : 'bg-rose-500 animate-ping'
                }`}
              />
              <span
                className={`absolute w-2 h-2 rounded-full ${
                  isPaused ? 'bg-amber-400' : 'bg-rose-500'
                }`}
              />
            </div>
            {!isPillCollapsed && (
              <div className="flex flex-col">
                <span className="font-mono text-xs font-extrabold text-white tracking-wider">
                  {formatTime(recordingDuration)}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400">
                  {isPaused ? 'PAUSED' : 'LIVE REC'}
                </span>
              </div>
            )}
          </div>

          {!isPillCollapsed && (
            <>
              <div className="h-5 w-px bg-slate-800" />

              {/* Live Mic VU Meter */}
              <div className="flex items-center space-x-1.5" title="Live Microphone Audio Level">
                <button
                  onClick={onToggleMicMute}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isMicMuted
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
                <div className="w-12 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center p-0.5 border border-slate-700/50">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      vuLevel > 0.8
                        ? 'bg-rose-500'
                        : vuLevel > 0.5
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.max(4, vuLevel * 100)}%` }}
                  />
                </div>
              </div>

              {/* Webcam Toggle */}
              {hasWebcamStream && (
                <button
                  onClick={onTogglePip}
                  className={`p-1.5 rounded-lg transition-colors ${
                    !isPipEnabled
                      ? 'bg-slate-800 text-slate-500'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                  title={isPipEnabled ? 'Hide webcam avatar' : 'Show webcam avatar'}
                >
                  {isPipEnabled ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
                </button>
              )}

              <div className="h-5 w-px bg-slate-800" />

              {/* Transport Controls: Pause/Resume & Restart */}
              <button
                onClick={onTogglePause}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold"
                title={isPaused ? 'Resume recording' : 'Pause recording'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onRestartRecording}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
                title="Restart recording from 00:00"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Document PiP Popout Button (If supported and not currently active) */}
              {documentPipManager?.isSupported() && !isDocPipActive && (
                <button
                  onClick={handleLaunchDocPip}
                  className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white transition-all text-xs flex items-center space-x-1"
                  title="Pop out into floating Always-On-Top PiP window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="h-5 w-px bg-slate-800" />

              {/* Primary Action: Stop & Open in Video Editor */}
              <button
                onClick={onStopAndOpenEditor}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center space-x-1.5 group"
              >
                <Square className="w-3 h-3 fill-white" />
                <span>Finish</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* Minimize / Expand Toggle Chevron */}
          <button
            onClick={() => setIsPillCollapsed((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title={isPillCollapsed ? 'Expand Floating Controls' : 'Collapse into Tiny Pill'}
          >
            {isPillCollapsed ? '➕' : '➖'}
          </button>
        </div>
      )}
    </>
  );
};
