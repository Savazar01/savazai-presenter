// PresentationMode — Fullscreen Interactive Slide Deck Viewer
import React, { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Pointer,
  Sparkles,
} from 'lucide-react';
import { SlideData } from '@/types';
import { TimelineController } from '@/core/motion/TimelineController';
import { ThreeSceneManager } from '@/core/scene/ThreeSceneManager';

interface PresentationModeProps {
  slides: SlideData[];
  currentSlideIndex: number;
  timeline: TimelineController | null;
  threeScene: ThreeSceneManager | null;
  onClose: () => void;
  onSelectSlide: (index: number) => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  slides,
  currentSlideIndex,
  timeline,
  threeScene,
  onClose,
  onSelectSlide,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [laserPointer, setLaserPointer] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });

  const activeSlide = slides[currentSlideIndex] || slides[0];

  // Sync camera preset & device on slide change
  useEffect(() => {
    if (threeScene && activeSlide) {
      threeScene.setCameraPreset(activeSlide.cameraPreset);
      threeScene.setDevice(activeSlide.deviceType);
    }
    if (timeline) {
      timeline.jumpToSlide(currentSlideIndex);
    }
  }, [currentSlideIndex, activeSlide, threeScene, timeline]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        if (currentSlideIndex < slides.length - 1) {
          onSelectSlide(currentSlideIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentSlideIndex > 0) {
          onSelectSlide(currentSlideIndex - 1);
        }
      } else if (e.key === 'Escape' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes((prev) => !prev);
      } else if (e.key === 'l' || e.key === 'L') {
        setLaserPointer((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, onSelectSlide, onClose]);

  // Laser Pointer Mouse Tracker
  const handleMouseMove = (e: React.MouseEvent) => {
    if (laserPointer) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-[#07090e] flex flex-col justify-between p-8 select-none overflow-hidden"
    >
      {/* Laser Pointer */}
      {laserPointer && (
        <div
          style={{ left: laserPos.x, top: laserPos.y }}
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_16px_rgba(244,63,94,1)] animate-ping"
        />
      )}

      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-30">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
          <span className="text-slate-400 text-xs font-mono">
            {activeSlide.cameraPreset.toUpperCase()} • {activeSlide.deviceType.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setLaserPointer((p) => !p)}
            className={`p-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
              laserPointer
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'glass-button text-slate-300 hover:text-white'
            }`}
            title="Toggle Laser Pointer (L)"
          >
            <Pointer className="w-4 h-4" />
            <span>Laser (L)</span>
          </button>

          <button
            onClick={() => setShowNotes((p) => !p)}
            className={`p-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
              showNotes
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'glass-button text-slate-300 hover:text-white'
            }`}
            title="Toggle Presenter Notes (N)"
          >
            <FileText className="w-4 h-4" />
            <span>Notes (N)</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-button text-slate-300 hover:text-white hover:border-rose-500/50"
            title="Exit Presentation (Esc)"
          >
            <X className="w-5 h-5 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Center Presentation Stage Content Overlay */}
      <div className="flex-1 flex items-center justify-between my-4 relative z-20 pointer-events-none">
        {/* Left Typography Card */}
        <div className="max-w-xl p-8 rounded-2xl glass-panel border border-slate-700/60 shadow-2xl backdrop-blur-xl pointer-events-auto transition-all animate-float">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Staging</span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
            {activeSlide.title}
          </h1>

          <p className="text-lg text-blue-400 font-medium mb-6 leading-snug">
            {activeSlide.subtitle}
          </p>

          <ul className="space-y-3">
            {activeSlide.content.map((point, i) => (
              <li key={i} className="flex items-start space-x-3 text-slate-200 text-base">
                <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Presenter Notes Drawer (Right Side) */}
        {showNotes && (
          <div className="w-80 p-6 rounded-2xl glass-panel border border-indigo-500/40 shadow-2xl pointer-events-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FileText className="w-4 h-4" />
              <span>Presenter Speaker Notes</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              {activeSlide.notes || 'No specific speaker notes configured for this slide.'}
            </p>
          </div>
        )}
      </div>

      {/* Floating Bottom Navigation Pill */}
      <div className="flex items-center justify-center z-30">
        <div className="glass-panel px-6 py-3 rounded-full flex items-center space-x-6 border border-slate-700/80 shadow-2xl backdrop-blur-2xl">
          <button
            disabled={currentSlideIndex === 0}
            onClick={() => onSelectSlide(currentSlideIndex - 1)}
            className="p-1.5 rounded-full glass-button text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlideIndex
                    ? 'w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            disabled={currentSlideIndex === slides.length - 1}
            onClick={() => onSelectSlide(currentSlideIndex + 1)}
            className="p-1.5 rounded-full glass-button text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
