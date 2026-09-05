// MotionStudioRecordingPill.tsx — Minimalist Floating Recording Transport Pill
import React, { useEffect, useState } from 'react';
import { Square, Pause, Play, Move, Mic, MicOff, Camera, CameraOff, ExternalLink } from 'lucide-react';
import { DocumentPipManager } from '@/core/capture/DocumentPipManager';

interface MotionStudioRecordingPillProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  isMicMuted: boolean;
  isPipEnabled: boolean;
  hasWebcamStream: boolean;
  documentPipManager: DocumentPipManager | null;
  onTogglePause: () => void;
  onToggleMicMute: () => void;
  onTogglePip: () => void;
  onStopAndOpenEditor: () => void;
}

export const MotionStudioRecordingPill: React.FC<MotionStudioRecordingPillProps> = ({
  isRecording,
  isPaused,
  recordingDuration,
  isMicMuted,
  isPipEnabled,
  hasWebcamStream,
  documentPipManager,
  onTogglePause,
  onToggleMicMute,
  onTogglePip,
  onStopAndOpenEditor,
}) => {
  const [docPipOpen, setDocPipOpen] = useState(documentPipManager ? documentPipManager.isOpen() : false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (documentPipManager) {
        setDocPipOpen(documentPipManager.isOpen());
      }
    }, 250);
    return () => clearInterval(interval);
  }, [documentPipManager]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  // Global Alt+D Hotkey Listener
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        onStopAndOpenEditor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, onStopAndOpenEditor]);

  // If recording is not active OR Document PiP is open in an external floating window, don't duplicate on page
  if (!isRecording || docPipOpen) return null;

  const handleLaunchDocPip = async () => {
    if (!documentPipManager || !documentPipManager.isSupported()) return;
    try {
      await documentPipManager.open(
        {
          onTogglePause,
          onToggleMicMute,
          onStopAndOpenEditor,
        },
        {
          isPaused,
          recordingDuration,
          isMicMuted,
          vuLevel: 0,
        }
      );
    } catch (err) {
      console.warn('Doc PiP error:', err);
    }
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 select-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center space-x-3 px-4 py-2 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
        {/* Pulsing Recording Indicator Dot & Status */}
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPaused ? 'bg-amber-400' : 'bg-rose-500 animate-ping'
              }`}
            />
            <span
              className={`absolute w-2 h-2 rounded-full ${
                isPaused ? 'bg-amber-400' : 'bg-rose-500'
              }`}
            />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400">
            {isPaused ? 'PAUSED' : 'RECORDING'}
          </span>
          <span className="font-mono text-xs font-bold text-white tracking-wider">
            {formatTime(recordingDuration)}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* Secondary Transport & Mute Buttons */}
        {!isCollapsed && (
          <div className="flex items-center space-x-1">
            <button
              onClick={onTogglePause}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs"
              title={isPaused ? 'Resume recording' : 'Pause recording'}
            >
              {isPaused ? (
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={onToggleMicMute}
              className={`p-1.5 rounded-lg transition-colors ${
                isMicMuted
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            {hasWebcamStream && (
              <button
                onClick={onTogglePip}
                className={`p-1.5 rounded-lg transition-colors ${
                  !isPipEnabled
                    ? 'text-slate-500 hover:text-slate-300'
                    : 'text-blue-400 hover:bg-blue-500/20'
                }`}
                title={isPipEnabled ? 'Hide webcam bubble' : 'Show webcam bubble'}
              >
                {isPipEnabled ? (
                  <Camera className="w-3.5 h-3.5" />
                ) : (
                  <CameraOff className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {documentPipManager?.isSupported() && !docPipOpen && (
              <button
                onClick={handleLaunchDocPip}
                className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                title="Pop out into floating Always-On-Top PiP window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="h-4 w-px bg-slate-800" />

        {/* High-Contrast Primary Stop Button with Alt+D badge */}
        <button
          onClick={onStopAndOpenEditor}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all transform hover:scale-[1.03] active:scale-[0.98]"
        >
          <Square className="w-3 h-3 fill-white" />
          <span>Stop</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 bg-black/40 text-[9px] font-mono rounded text-rose-200 border border-white/20">
            Alt+D
          </kbd>
        </button>
      </div>
    </div>
  );
};
