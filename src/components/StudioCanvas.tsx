// StudioCanvas — Three.js Viewport Container & 2D Motion Overlays
import React, { useEffect, useRef, useState } from 'react';
import { ThreeSceneManager } from '@/core/scene/ThreeSceneManager';
import { CuePoint, PipConfig } from '@/types';
import { MousePointer, Move } from 'lucide-react';

interface StudioCanvasProps {
  threeScene: ThreeSceneManager | null;
  activeCue: CuePoint;
  webcamStream: MediaStream | null;
  pipConfig: PipConfig;
  onUpdatePipConfig: (config: Partial<PipConfig>) => void;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  threeScene,
  activeCue,
  webcamStream,
  pipConfig,
  onUpdatePipConfig,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);

  // PiP Dragging State
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const dragStartPos = useRef({ mouseX: 0, mouseY: 0, startPipX: 0, startPipY: 0 });

  // Connect webcam stream to video element
  useEffect(() => {
    if (webcamVideoRef.current) {
      if (webcamStream) {
        webcamVideoRef.current.srcObject = webcamStream;
        webcamVideoRef.current.play().catch((e) => console.log('Webcam play notice:', e));
      } else {
        webcamVideoRef.current.srcObject = null;
      }
    }
  }, [webcamStream]);

  // Handle PiP dragging
  const handlePipMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingPip(true);
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startPipX: pipConfig.x,
      startPipY: pipConfig.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingPip || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStartPos.current.mouseX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStartPos.current.mouseY) / rect.height) * 100;

      const newX = Math.max(5, Math.min(95, dragStartPos.current.startPipX + deltaXPercent));
      const newY = Math.max(5, Math.min(95, dragStartPos.current.startPipY + deltaYPercent));

      onUpdatePipConfig({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDraggingPip(false);
    };

    if (isDraggingPip) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPip, onUpdatePipConfig]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex-1 bg-gradient-to-b from-[#07090e] via-[#0b0f19] to-[#07090e] overflow-hidden select-none"
    >
      {/* 3D WebGL Canvas will be injected into this container by ThreeSceneManager */}

      {/* 2D Motion Choreography Kinetic Text Overlay */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none max-w-xl transition-all duration-700 ease-out">
        {activeCue.badgeText && (
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[11px] font-bold tracking-widest uppercase mb-3 backdrop-blur-md animate-pulse-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>{activeCue.badgeText}</span>
          </div>
        )}

        {activeCue.headlineText && (
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md leading-tight transition-all">
            {activeCue.headlineText}
          </h2>
        )}

        {activeCue.subText && (
          <p className="text-sm lg:text-base text-slate-300 font-medium mt-2 drop-shadow-sm leading-relaxed max-w-md">
            {activeCue.subText}
          </p>
        )}
      </div>

      {/* Simulated Cursor Choreography (Driven by Timeline Cue Target) */}
      {activeCue.cursorTarget && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-1000 ease-out"
          style={{
            left: `${activeCue.cursorTarget.x}%`,
            top: `${activeCue.cursorTarget.y}%`,
          }}
        >
          <div className="relative">
            <MousePointer className="w-6 h-6 text-cyan-400 fill-cyan-400/30 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transform -rotate-12" />
            {activeCue.cursorTarget.click && (
              <span className="absolute -top-2 -left-2 w-10 h-10 rounded-full border-2 border-cyan-400/80 animate-ping" />
            )}
          </div>
        </div>
      )}

      {/* Draggable Circular Picture-in-Picture Webcam Stream */}
      {webcamStream && pipConfig.enabled && (
        <div
          onMouseDown={handlePipMouseDown}
          style={{
            left: `${pipConfig.x}%`,
            top: `${pipConfig.y}%`,
            width: `${pipConfig.size}px`,
            height: `${pipConfig.size}px`,
            transform: 'translate(-50%, -50%)',
          }}
          className={`absolute z-30 cursor-grab active:cursor-grabbing rounded-full overflow-hidden border-2 border-blue-400/80 shadow-[0_0_25px_rgba(59,130,246,0.5)] group transition-transform hover:scale-105 ${
            isDraggingPip ? 'ring-4 ring-blue-500/50' : ''
          }`}
          title="Drag webcam to reposition on canvas"
        >
          <video
            ref={webcamVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]" // Mirror front camera
          />

          {/* Hover Overlay with Drag Icon */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Move className="w-5 h-5 text-white drop-shadow" />
          </div>
        </div>
      )}
    </div>
  );
};
