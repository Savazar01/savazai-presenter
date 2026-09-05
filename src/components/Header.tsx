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
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  captureEngine: CaptureEngine | null;
  onOpenRecordSetup: () => void;
  onOpenPresentation: () => void;
  onOpenExportModal: () => void;
  onOpenProjectModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  streamState,
  isRecording,
  projectName,
  onUpdateProjectName,
  captureEngine,
  onOpenRecordSetup,
  onOpenPresentation,
  onOpenExportModal,
  onOpenProjectModal,
}) => {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(projectName);

  React.useEffect(() => {
    setTitleInput(projectName);
  }, [projectName]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateProjectName(titleInput.trim());
    }
  };

  return (
    <header className="h-14 px-5 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between z-40 relative select-none">
      {/* Brand, Projects & Project Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/25">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-extrabold text-white tracking-tight">MotionStudio</span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              PRO
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* Projects Modal Trigger Button */}
        <button
          onClick={onOpenProjectModal}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
          title="Open Project Manager"
        >
          <span>📁 Projects</span>
        </button>

        {/* Editable Project Title */}
        <div className="flex items-center space-x-1.5">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              autoFocus
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="bg-slate-900 border border-blue-500 text-white text-xs px-2 py-0.5 rounded font-medium focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-semibold text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-900 transition-colors flex items-center space-x-1.5 group"
            >
              <span>{projectName}</span>
              <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
            </button>
          )}
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
        {/* Record Studio Button (Triggers Setup Modal) */}
        <button
          onClick={onOpenRecordSetup}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 shadow-sm transition-all"
        >
          <Video className="w-3.5 h-3.5 text-rose-400" />
          <span>RECORD STUDIO</span>
        </button>

        {/* Presentation Fullscreen Mode */}
        <button
          onClick={onOpenPresentation}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Fullscreen Interactive Presentation Deck (Press F)"
        >
          <PlaySquare className="w-3.5 h-3.5 text-blue-400" />
          <span>PRESENT (F)</span>
        </button>

        {/* Export Multi-Surface Hub */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          title="Export Video, PDF, EPUB, & JSON (Press E)"
        >
          <DownloadCloud className="w-3.5 h-3.5" />
          <span>EXPORT</span>
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
