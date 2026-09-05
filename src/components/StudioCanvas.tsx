// StudioCanvas.tsx — MotionStudio Central Viewport & Multi-Surface Stage Compositor
import React, { useEffect, useRef, useState } from 'react';
import { ThreeSceneManager } from '@/core/scene/ThreeSceneManager';
import {
  CuePoint,
  PipConfig,
  CalloutOverlay,
  StageMode,
  WallpaperConfig,
  MockupConfig,
  MaskEffectType,
} from '@/types';
import { ProcessedWebcamPipeline } from '@/core/capture/ProcessedWebcamPipeline';
import { MousePointer, Move, Laptop, Monitor } from 'lucide-react';

interface StudioCanvasProps {
  threeScene: ThreeSceneManager | null;
  activeCue: CuePoint;
  webcamStream: MediaStream | null;
  pipConfig: PipConfig;
  stageMode?: StageMode;
  hasDisplayStream?: boolean;
  callouts?: CalloutOverlay[];
  currentTime?: number;
  wallpaperConfig?: WallpaperConfig;
  mockupConfig?: MockupConfig;
  maskEffect?: MaskEffectType;
  onUpdatePipConfig: (config: Partial<PipConfig>) => void;
  onToggleStageMode?: (mode: StageMode) => void;
  webcamVideoRef?: React.RefObject<HTMLVideoElement>;
  webcamPipeline?: ProcessedWebcamPipeline | null;
  displayVideoElement?: HTMLVideoElement | null;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  threeScene,
  activeCue,
  webcamStream,
  pipConfig,
  stageMode = '3d-stage',
  hasDisplayStream = false,
  callouts = [],
  currentTime = 0,
  wallpaperConfig = {
    type: 'wallpaper',
    presetId: 'studio-dark',
    color: '#0f172a',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #020617 50%, #082f49 100%)',
    blur: 0,
    padding: 32,
    borderRadius: 16,
    shadowDepth: 60,
  },
  mockupConfig = {
    mode: '3d',
    frame2D: 'macos-dark',
    device3D: 'frameless',
  },
  maskEffect = 'none',
  onUpdatePipConfig,
  onToggleStageMode,
  webcamVideoRef: externalVideoRef,
  webcamPipeline,
  displayVideoElement,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const local2DVideoRef = useRef<HTMLVideoElement>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement>(null);
  const webcamVideoRef = externalVideoRef || internalVideoRef;

  // PiP Dragging State
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const dragStartPos = useRef({ mouseX: 0, mouseY: 0, startPipX: 0, startPipY: 0 });

  // Sync 2D Video Display
  useEffect(() => {
    if (!local2DVideoRef.current || !displayVideoElement) return;
    const targetEl = local2DVideoRef.current;

    if (displayVideoElement.srcObject) {
      if (targetEl.srcObject !== displayVideoElement.srcObject) {
        targetEl.srcObject = displayVideoElement.srcObject;
      }
    } else if (displayVideoElement.src) {
      if (targetEl.src !== displayVideoElement.src) {
        targetEl.srcObject = null;
        targetEl.src = displayVideoElement.src;
      }
    }

    targetEl.play().catch(() => {});
  }, [displayVideoElement, displayVideoElement?.src, displayVideoElement?.srcObject]);

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
  }, [webcamStream, webcamVideoRef]);

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

      onUpdatePipConfig({ x: newX, y: newY, placementPreset: 'custom' });
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

  // Live Canvas Rendering Loop for Virtual Background
  useEffect(() => {
    let animId: number;
    const renderLoop = () => {
      if (
        pipConfig.enabled &&
        pipConfig.background &&
        pipConfig.background.type !== 'none' &&
        webcamPipeline &&
        liveCanvasRef.current
      ) {
        const targetCtx = liveCanvasRef.current.getContext('2d');
        const sourceCanvas = webcamPipeline.getCanvas();
        if (targetCtx && sourceCanvas && sourceCanvas.width > 0) {
          if (liveCanvasRef.current.width !== sourceCanvas.width) {
            liveCanvasRef.current.width = sourceCanvas.width;
            liveCanvasRef.current.height = sourceCanvas.height;
          }
          targetCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
          targetCtx.drawImage(sourceCanvas, 0, 0);
        }
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [pipConfig, webcamPipeline]);

  // Active callouts
  const activeCallouts = callouts.filter(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime
  );

  const getShapeClass = () => {
    if (pipConfig.shape === 'circle') return 'rounded-full';
    if (pipConfig.shape === 'squircle') return 'rounded-[28%]';
    if (pipConfig.shape === 'rounded-rect') return 'rounded-3xl';
    return 'rounded-xl';
  };

  // Mask CSS overlay filter
  const getMaskStyle = (): React.CSSProperties => {
    if (maskEffect === 'fade-top') {
      return { maskImage: 'linear-gradient(to bottom, transparent, black 25%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%)' };
    }
    if (maskEffect === 'fade-bottom') {
      return { maskImage: 'linear-gradient(to top, transparent, black 25%)', WebkitMaskImage: 'linear-gradient(to top, transparent, black 25%)' };
    }
    if (maskEffect === 'fade-sides') {
      return { maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' };
    }
    if (maskEffect === 'vignette') {
      return { maskImage: 'radial-gradient(circle, black 60%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 100%)' };
    }
    if (maskEffect === 'diagonal-45') {
      return { maskImage: 'linear-gradient(45deg, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(45deg, black 70%, transparent 100%)' };
    }
    return {};
  };

  const is2D = mockupConfig.mode === '2d';

  return (
    <div
      ref={containerRef}
      style={{
        background: wallpaperConfig.gradient || wallpaperConfig.color,
      }}
      className="absolute inset-0 z-10 overflow-hidden select-none flex items-center justify-center transition-colors duration-300"
    >
      {/* Background Blur Overlay */}
      {wallpaperConfig.blur > 0 && (
        <div
          style={{ backdropFilter: `blur(${wallpaperConfig.blur}px)` }}
          className="absolute inset-0 z-0 pointer-events-none"
        />
      )}

      {/* 2D Direct View Mockup Staging */}
      {is2D && (
        <div
          style={{
            padding: `${wallpaperConfig.padding}px`,
            ...getMaskStyle(),
          }}
          className="relative z-10 w-full h-full flex items-center justify-center transition-all duration-200"
        >
          <div
            style={{
              borderRadius: `${wallpaperConfig.borderRadius}px`,
              boxShadow: `0 20px 50px rgba(0,0,0,${(wallpaperConfig.shadowDepth / 100) * 0.8})`,
            }}
            className="w-full max-w-5xl aspect-video bg-black/90 border border-slate-700/80 overflow-hidden flex flex-col transition-all duration-200"
          >
            {/* 2D Window Frame Titlebar */}
            {mockupConfig.frame2D !== 'none' && mockupConfig.frame2D !== 'outline' && (
              <div
                className={`h-7 px-3 flex items-center justify-between border-b ${
                  mockupConfig.frame2D === 'macos-light'
                    ? 'bg-slate-200 border-slate-300 text-slate-700'
                    : mockupConfig.frame2D === 'macos-glass'
                    ? 'bg-slate-900/40 backdrop-blur-md border-white/10 text-white'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[10px] font-mono opacity-60">MotionStudio Live Display</span>
                <div className="w-8" />
              </div>
            )}

            {/* Video Canvas Container */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={local2DVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Callouts Overlays in Viewport */}
      {activeCallouts.map((callout) => (
        <div
          key={callout.id}
          style={{ left: `${callout.x}%`, top: `${callout.y}%` }}
          className={`absolute z-30 p-4 rounded-2xl glass-panel border max-w-xs transition-all pointer-events-none ${
            callout.colorTheme === 'emerald'
              ? 'border-emerald-500/50 shadow-emerald-500/10'
              : callout.colorTheme === 'indigo'
              ? 'border-indigo-500/50 shadow-indigo-500/10'
              : callout.colorTheme === 'rose'
              ? 'border-rose-500/50 shadow-rose-500/10'
              : 'border-blue-500/50 shadow-blue-500/10'
          } ${callout.animation === 'bounce' ? 'animate-bounce' : 'animate-in fade-in duration-300'}`}
        >
          {callout.badge && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-2 inline-block">
              {callout.badge}
            </span>
          )}
          <h4 className="text-sm font-bold text-white tracking-tight">{callout.title}</h4>
          {callout.description && <p className="text-xs text-slate-300 mt-1">{callout.description}</p>}
        </div>
      ))}

      {/* Simulated Cursor Choreography */}
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

      {/* Draggable Picture-in-Picture Webcam Stream */}
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
          className={`absolute z-40 pointer-events-auto cursor-grab active:cursor-grabbing overflow-hidden border-2 border-blue-400/80 shadow-[0_0_25px_rgba(59,130,246,0.5)] group transition-transform hover:scale-105 aspect-square ${getShapeClass()} ${
            isDraggingPip ? 'ring-4 ring-blue-500/50' : ''
          }`}
          title="Drag webcam to reposition on canvas"
        >
          {pipConfig.background && pipConfig.background.type !== 'none' ? (
            <canvas
              ref={liveCanvasRef}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={webcamVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                transform: pipConfig.mirror !== false ? 'scaleX(-1)' : 'none',
              }}
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Move className="w-5 h-5 text-white drop-shadow" />
          </div>
        </div>
      )}
    </div>
  );
};
