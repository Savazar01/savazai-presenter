// ExportModal — Multi-Surface Publishing Hub (Video, PDF, EPUB, JSON)
import React, { useState, useRef } from 'react';
import {
  X,
  Video,
  FileText,
  BookOpen,
  Code,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ExportFormat, ExportProgress, SlideData, CuePoint, PipConfig, CalloutOverlay, TrimRange } from '@/types';
import { ThreeSceneManager } from '@/core/scene/ThreeSceneManager';
import { TimelineController } from '@/core/motion/TimelineController';
import { VideoRecorder } from '@/core/exporters/VideoRecorder';
import { exportDeckToPdf, exportToEpub, triggerFileDownload } from '@/core/exporters/DocumentExporters';

interface ExportModalProps {
  isOpen: boolean;
  slides: SlideData[];
  cuePoints: CuePoint[];
  pipConfig: PipConfig;
  callouts?: CalloutOverlay[];
  trimRange?: TrimRange;
  threeScene: ThreeSceneManager | null;
  timeline: TimelineController | null;
  videoRecorder: VideoRecorder | null;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  slides,
  cuePoints,
  pipConfig,
  callouts = [],
  trimRange,
  threeScene,
  timeline,
  videoRecorder,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ExportFormat>('video-webm');
  const [progress, setProgress] = useState<ExportProgress>({
    stage: 'idle',
    progress: 0,
    message: '',
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const isExporting = progress.stage !== 'idle' && progress.stage !== 'complete' && progress.stage !== 'error';

  const handleCancelExport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setProgress({
      stage: 'idle',
      progress: 0,
      message: '',
    });
    if (!isExporting) {
      onClose();
    }
  };

  const handleExport = async () => {
    if (!threeScene || !timeline) return;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      if (activeTab === 'video-webm' || activeTab === 'video-mp4') {
        if (!videoRecorder) return;
        const mime = activeTab === 'video-mp4' ? 'video/mp4' : 'video/webm;codecs=vp9';
        const blob = await videoRecorder.exportTimelineVideo(
          pipConfig,
          callouts,
          trimRange,
          60,
          mime,
          setProgress,
          abortController.signal
        );
        const ext = activeTab === 'video-mp4' ? 'mp4' : 'webm';
        triggerFileDownload(blob, `MotionStudio_Showcase_${Date.now()}.${ext}`);
      } else if (activeTab === 'pdf-deck') {
        const blob = await exportDeckToPdf(slides, cuePoints, threeScene, timeline, setProgress);
        triggerFileDownload(blob, `MotionStudio_Presentation_${Date.now()}.pdf`);
      } else if (activeTab === 'epub-book') {
        const blob = await exportToEpub(
          slides,
          cuePoints,
          'MotionStudio Visual Showcase',
          threeScene,
          timeline,
          setProgress
        );
        triggerFileDownload(blob, `MotionStudio_Showcase_${Date.now()}.epub`);
      } else if (activeTab === 'deck-json') {
        setProgress({ stage: 'preparing', progress: 50, message: 'Serializing slide deck metadata...' });
        const data = JSON.stringify({ slides, cuePoints, callouts, trimRange, timestamp: new Date().toISOString() }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        triggerFileDownload(blob, `MotionStudio_Project_${Date.now()}.json`);
        setProgress({ stage: 'complete', progress: 100, message: 'JSON backup generated successfully!' });
      }
    } catch (error) {
      if (abortController.signal.aborted) {
        console.log('Export cleanly aborted by user');
        setProgress({
          stage: 'idle',
          progress: 0,
          message: '',
        });
        return;
      }
      console.error('Export failed:', error);
      setProgress({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Unknown export failure occurred',
      });
    } finally {
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-panel rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Multi-Surface Publishing Hub</h2>
              <p className="text-xs text-slate-400">100% Client-Side High-Res Media Exporters</p>
            </div>
          </div>

          <button
            onClick={isExporting ? handleCancelExport : onClose}
            className="p-1.5 rounded-xl glass-button text-slate-400 hover:text-white"
            title={isExporting ? 'Cancel Export' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Surface Selection Tabs */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-slate-900/50 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('video-webm')}
            className={`p-3 rounded-2xl flex flex-col items-center space-y-2 text-xs font-semibold transition-all ${
              activeTab === 'video-webm' || activeTab === 'video-mp4'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'glass-button text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-5 h-5" />
            <span>4K Video</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf-deck')}
            className={`p-3 rounded-2xl flex flex-col items-center space-y-2 text-xs font-semibold transition-all ${
              activeTab === 'pdf-deck'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'glass-button text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>PDF Slide Deck</span>
          </button>

          <button
            onClick={() => setActiveTab('epub-book')}
            className={`p-3 rounded-2xl flex flex-col items-center space-y-2 text-xs font-semibold transition-all ${
              activeTab === 'epub-book'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'glass-button text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>EPUB3 e-Book</span>
          </button>

          <button
            onClick={() => setActiveTab('deck-json')}
            className={`p-3 rounded-2xl flex flex-col items-center space-y-2 text-xs font-semibold transition-all ${
              activeTab === 'deck-json'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'glass-button text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-5 h-5" />
            <span>JSON Backup</span>
          </button>
        </div>

        {/* Tab Detail Pane */}
        <div className="p-6 space-y-5">
          {(activeTab === 'video-webm' || activeTab === 'video-mp4') && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-white">Deterministic 60 FPS Video Composite Export</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Synchronously composites 3D device staging, live/uploaded video, PiP webcam avatar, and animated text callouts directly into WebCodecs/MediaRecorder with zero dropped frames.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveTab('video-webm')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border ${
                    activeTab === 'video-webm'
                      ? 'bg-slate-800 border-blue-500 text-blue-400'
                      : 'border-slate-800 text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  WebM (VP9 + Opus)
                </button>
                <button
                  onClick={() => setActiveTab('video-mp4')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border ${
                    activeTab === 'video-mp4'
                      ? 'bg-slate-800 border-blue-500 text-blue-400'
                      : 'border-slate-800 text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  MP4 (H.264 / AAC)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pdf-deck' && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-white">1920x1080 Landscape Vector PDF Deck</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates a multi-page PDF presentation containing high-resolution 3D canvas snapshots for each slide, vector typography, bullet points, and speaker notes.
              </p>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono">
                Format: 1920x1080 Landscape • Resolution: 300 DPI High-Density • Pages: {slides.length}
              </div>
            </div>
          )}

          {activeTab === 'epub-book' && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-white">Standards-Compliant EPUB3 Publication Container</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Packages an EPUB3 archive using JSZip containing structured XHTML chapters, embedded high-res slide imagery, table of contents (NCX + Nav), and complete Dublin Core metadata.
              </p>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono">
                Container: EPUB 3.0 • Chapters: {slides.length} • Compatible with Apple Books & Kindle
              </div>
            </div>
          )}

          {activeTab === 'deck-json' && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-white">Raw Project Slides & Cue Point Manifest</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Export all slide contents, timing cue points, camera coordinates, callouts, and device presets to a portable JSON file.
              </p>
            </div>
          )}

          {/* Progress & Status Display */}
          {progress.stage !== 'idle' && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300 flex items-center space-x-2">
                  {isExporting && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
                  {progress.stage === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {progress.stage === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                  <span>{progress.message}</span>
                </span>
                <span className="font-mono text-blue-400">{progress.progress}%</span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    progress.stage === 'error'
                      ? 'bg-rose-500'
                      : progress.stage === 'complete'
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-900/70 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            onClick={isExporting ? handleCancelExport : onClose}
            className={`px-4 py-2 rounded-xl glass-button text-xs font-semibold ${
              isExporting ? 'text-rose-400 border-rose-500/40 hover:bg-rose-500/10' : 'text-slate-300 hover:text-white'
            }`}
          >
            {isExporting ? 'Cancel Export' : 'Cancel'}
          </button>

          <button
            disabled={isExporting}
            onClick={handleExport}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center space-x-2 disabled:opacity-40"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Output...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Start Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
