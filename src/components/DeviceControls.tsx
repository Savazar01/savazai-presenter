// DeviceControls — Streamlined 3D Staging, PBR Finishes & Camera Pickers
import React from 'react';
import {
  Laptop,
  Smartphone,
  Globe,
  Monitor,
  Compass,
  Sparkles,
  RotateCw,
  ChevronDown,
} from 'lucide-react';
import { DeviceType, DeviceFinish, CameraPreset } from '@/types';
import { DEVICE_FINISHES } from '@/core/scene/ThreeSceneManager';

interface DeviceControlsProps {
  currentDevice: DeviceType;
  deviceFinish: DeviceFinish;
  cameraPreset: CameraPreset;
  onSelectDevice: (device: DeviceType) => void;
  onSelectFinish: (finish: DeviceFinish) => void;
  onSelectCameraPreset: (preset: CameraPreset) => void;
}

export const DeviceControls: React.FC<DeviceControlsProps> = ({
  currentDevice,
  deviceFinish,
  cameraPreset,
  onSelectDevice,
  onSelectFinish,
  onSelectCameraPreset,
}) => {
  const devices: { id: DeviceType; label: string }[] = [
    { id: 'frameless', label: 'Frameless Clean 16:9' },
    { id: 'macbook', label: 'MacBook Pro M3' },
    { id: 'windows-desktop', label: 'Windows PC Desktop' },
    { id: 'iphone', label: 'iPhone 16 Pro' },
    { id: 'pixel-android', label: 'Google Pixel / Android' },
    { id: 'browser', label: 'Glass Browser Frame' },
  ];

  const presets: { id: CameraPreset; label: string }[] = [
    { id: 'front', label: 'Front Center (Default)' },
    { id: 'isometric-left', label: 'Isometric Left' },
    { id: 'isometric-right', label: 'Isometric Right' },
    { id: 'dramatic-tilt', label: 'Dramatic Perspective Tilt' },
    { id: 'top-down', label: 'Top-Down 90°' },
    { id: 'mobile-focus', label: 'Mobile Tight Focus' },
  ];

  const selectedFinishConfig = DEVICE_FINISHES[deviceFinish];
  const finishHex = `#${selectedFinishConfig.bodyColor.toString(16).padStart(6, '0')}`;

  return (
    <div className="w-72 glass-panel border-r border-slate-800/80 p-4 flex flex-col space-y-5 overflow-y-auto z-30 transition-all">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
        <Laptop className="w-4 h-4 text-blue-400" />
        <span>3D Stage Setup</span>
      </div>

      {/* 1. 3D Device Format Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Device Format</span>
          <span className="text-[10px] text-blue-400 font-mono">PBR 3D</span>
        </label>
        <div className="relative">
          <select
            value={currentDevice}
            onChange={(e) => onSelectDevice(e.target.value as DeviceType)}
            className="w-full appearance-none bg-slate-900/90 border border-slate-700/80 hover:border-blue-500/80 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-sm transition-all"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id} className="bg-slate-900 text-slate-200">
                {d.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 2. Device Finish Dropdown with Swatch Preview */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Chassis Finish</span>
          </span>
          <span className="flex items-center space-x-1">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/30 inline-block"
              style={{ backgroundColor: finishHex }}
            />
          </span>
        </label>
        <div className="relative">
          <select
            value={deviceFinish}
            onChange={(e) => onSelectFinish(e.target.value as DeviceFinish)}
            className="w-full appearance-none bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/80 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer shadow-sm transition-all"
          >
            {(Object.keys(DEVICE_FINISHES) as DeviceFinish[]).map((fin) => (
              <option key={fin} value={fin} className="bg-slate-900 text-slate-200">
                {DEVICE_FINISHES[fin].name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 3. Camera Angle Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>Camera Perspective</span>
        </label>
        <div className="relative">
          <select
            value={cameraPreset}
            onChange={(e) => onSelectCameraPreset(e.target.value as CameraPreset)}
            className="w-full appearance-none bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500/80 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer shadow-sm transition-all"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                {p.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Interactive 3D Note */}
      <div className="mt-auto pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
          <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live Orbit Dragging</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          Click & drag on the 3D stage anytime to orbit or tilt the device frame.
        </p>
      </div>
    </div>
  );
};
