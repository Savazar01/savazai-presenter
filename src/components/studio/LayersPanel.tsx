// LayersPanel.tsx — MotionStudio Scene Graph & Layers Inspector
import React from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronRight,
  ChevronDown,
  Monitor,
  Camera,
  Image,
  Type,
  Maximize2,
} from 'lucide-react';
import { PipConfig, MockupConfig, WallpaperConfig, CalloutOverlay } from '@/types';

interface LayersPanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  pipConfig: PipConfig;
  mockupConfig: MockupConfig;
  wallpaperConfig: WallpaperConfig;
  callouts: CalloutOverlay[];
  onTogglePipVisibility: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  isOpen,
  onToggleOpen,
  pipConfig,
  mockupConfig,
  wallpaperConfig,
  callouts,
  onTogglePipVisibility,
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="absolute right-3 top-4 z-20 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white shadow-lg transition-all"
        title="Open Layers Inspector"
      >
        <Layers className="w-4 h-4" />
      </button>
    );
  }

  const layers = [
    {
      id: 'text-annotations',
      name: `Callouts & Text (${callouts.length})`,
      icon: Type,
      visible: true,
      locked: false,
    },
    {
      id: 'webcam-avatar',
      name: 'Webcam Avatar Bubble',
      icon: Camera,
      visible: pipConfig.enabled,
      locked: false,
      toggle: onTogglePipVisibility,
    },
    {
      id: 'screen-video',
      name: 'Screen Video Stream',
      icon: Monitor,
      visible: true,
      locked: true,
    },
    {
      id: 'device-mockup',
      name: `Mockup (${mockupConfig.mode === '3d' ? mockupConfig.device3D : mockupConfig.frame2D})`,
      icon: Maximize2,
      visible: true,
      locked: true,
    },
    {
      id: 'backdrop',
      name: `Background (${wallpaperConfig.presetId})`,
      icon: Image,
      visible: true,
      locked: true,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800/90 flex flex-col z-20 select-none text-xs text-slate-300 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            Scene Layers
          </span>
        </div>
        <button
          onClick={onToggleOpen}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {layers.map((layer) => {
          const Icon = layer.icon;
          return (
            <div
              key={layer.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800/60 transition-colors group"
            >
              <div className="flex items-center space-x-2 overflow-hidden">
                <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 flex-shrink-0" />
                <span className="truncate font-medium text-slate-200">{layer.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                {layer.toggle ? (
                  <button
                    onClick={layer.toggle}
                    className="p-1 text-slate-400 hover:text-white rounded"
                  >
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </button>
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                )}
                {layer.locked ? (
                  <Lock className="w-3 h-3 text-slate-600" />
                ) : (
                  <Unlock className="w-3 h-3 text-slate-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
