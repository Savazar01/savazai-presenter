// Header Component — Top Navigation, Mode Switcher & Studio Control Bar
import React from 'react';
import {
  Layers,
  Video,
  StopCircle,
  PlaySquare,
  DownloadCloud,
  Github,
  Monitor,
  Camera,
  Mic,
  Sliders,
  Edit3,
} from 'lucide-react';
import { StreamState } from '@/types';
import { AudioVisualizer } from './AudioVisualizer';
import { CaptureEngine } from '@/core/capture/CaptureEngine';

interface HeaderProps {
  streamState: StreamState;
  isRecording: boolean;
  isEditorMode: boolean;
  captureEngine: CaptureEngine | null;
  onToggleLiveRecording: () => void;
  onToggleEditorMode: () => void;
  onOpenPresentation: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  streamState,
  isRecording,
  isEditorMode,
  captureEngine,
  onToggleLiveRecording,
  onToggleEditorMode,
  onOpenPresentation,
  onOpenExportModal,
}) => {
  return (
    <header className="h-16 px-6 glass-panel border-b border-slate-800/80 flex items-center justify-between z-40 relative">
      {/* Brand & Mode Switcher */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">MotionStudio</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                v1.1 Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">3D Spatial Staging & Video Editor</p>
          </div>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => isEditorMode && onToggleEditorMode()}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              !isEditorMode
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Studio Live</span>
          </button>

          <button
            onClick={() => !isEditorMode && onToggleEditorMode()}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              isEditorMode
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Video Editor</span>
          </button>
        </div>
      </div>

      {/* Live Stream Status & Audio Waveform */}
      <div className="hidden lg:flex items-center space-x-4 bg-slate-900/70 px-4 py-1.5 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2 text-xs">
          <Monitor className={`w-3.5 h-3.5 ${streamState.hasDisplayStream || streamState.isCustomMediaLoaded ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className={streamState.hasDisplayStream || streamState.isCustomMediaLoaded ? 'text-emerald-300 font-medium' : 'text-slate-400'}>
            {streamState.isCustomMediaLoaded ? 'Custom Video Loaded' : streamState.hasDisplayStream ? '4K Screen Live' : 'No Input Feed'}
          </span>
        </div>

        <div className="w-px h-4 bg-slate-700/60" />

        <div className="flex items-center space-x-2 text-xs">
          <Camera className={`w-3.5 h-3.5 ${streamState.hasWebcamStream ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className={streamState.hasWebcamStream ? 'text-emerald-300 font-medium' : 'text-slate-400'}>
            {streamState.hasWebcamStream ? 'Webcam Mixed' : 'Webcam Off'}
          </span>
        </div>

        <div className="w-px h-4 bg-slate-700/60" />

        <div className="flex items-center space-x-2 text-xs">
          <Mic className={`w-3.5 h-3.5 ${streamState.hasMicStream ? 'text-emerald-400' : 'text-slate-500'}`} />
          <AudioVisualizer
            captureEngine={captureEngine}
            isActive={streamState.hasMicStream || streamState.hasDisplayStream || !!streamState.isCustomMediaLoaded}
            width={84}
            height={22}
            mode="bars"
          />
        </div>
      </div>

      {/* Main Studio Action Buttons */}
      <div className="flex items-center space-x-3">
        {/* Live Recording Button */}
        <button
          onClick={onToggleLiveRecording}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md ${
            isRecording
              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/30'
              : 'glass-button text-slate-200 hover:text-white hover:border-blue-500/50'
          }`}
        >
          {isRecording ? (
            <>
              <StopCircle className="w-4 h-4 text-white" />
              <span>STOP RECORDING</span>
            </>
          ) : (
            <>
              <Video className="w-4 h-4 text-rose-400" />
              <span>RECORD STUDIO</span>
            </>
          )}
        </button>

        {/* Presentation Fullscreen Mode */}
        <button
          onClick={onOpenPresentation}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide glass-button text-slate-200 hover:text-white"
          title="Fullscreen Interactive Presentation Deck (Press F)"
        >
          <PlaySquare className="w-4 h-4 text-blue-400" />
          <span>PRESENT (F)</span>
        </button>

        {/* Export Multi-Surface Hub */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25"
          title="Export Video, PDF, EPUB, & JSON (Press E)"
        >
          <DownloadCloud className="w-4 h-4" />
          <span>EXPORT HUB</span>
        </button>

        <div className="w-px h-6 bg-slate-800" />

        {/* GitHub Link */}
        <a
          href="https://github.com/Savazar01/savazai-presenter"
          target="_blank"
          rel="noreferrer"
          className="p-2.5 rounded-xl glass-button text-slate-400 hover:text-white"
          title="View GitHub Repository"
        >
          <Github className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
