// DeviceControls — 3D Staging, PBR Finishes & Camera Choreography Presets
import React from 'react';
import {
  Laptop,
  Smartphone,
  Globe,
  Compass,
  Sparkles,
  Sliders,
  RotateCw,
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
  const devices: { id: DeviceType; label: string; icon: React.ReactNode }[] = [
    { id: 'macbook', label: 'MacBook Pro', icon: <Laptop className="w-4 h-4" /> },
    { id: 'iphone', label: 'iPhone 16 Pro', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'browser', label: 'Glass Browser', icon: <Globe className="w-4 h-4" /> },
  ];

  const presets: { id: CameraPreset; label: string }[] = [
    { id: 'front', label: 'Front Center' },
    { id: 'isometric-left', label: 'Isometric Left' },
    { id: 'isometric-right', label: 'Isometric Right' },
    { id: 'top-down', label: 'Top-Down 90°' },
    { id: 'dramatic-tilt', label: 'Dramatic Tilt' },
    { id: 'mobile-focus', label: 'Mobile Focus' },
  ];

  return (
    <div className="w-80 glass-panel border-r border-slate-800/80 p-5 flex flex-col space-y-6 overflow-y-auto z-30">
      {/* 3D Device Staging Model Selector */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Laptop className="w-4 h-4 text-blue-400" />
          <span>3D Device Staging</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {devices.map((dev) => (
            <button
              key={dev.id}
              onClick={() => onSelectDevice(dev.id)}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                currentDevice === dev.id
                  ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/30 border border-blue-400/50'
                  : 'glass-button text-slate-300 hover:text-white'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-slate-800/80">{dev.icon}</div>
              <span className="flex-1 text-left font-semibold">{dev.label}</span>
              {currentDevice === dev.id && <span className="w-2 h-2 rounded-full bg-cyan-300" />}
            </button>
          ))}
        </div>
      </div>

      {/* PBR Material Finish Customizer */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Material & Finish</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(DEVICE_FINISHES) as DeviceFinish[]).map((key) => {
            const finish = DEVICE_FINISHES[key];
            const isSelected = deviceFinish === key;
            const colorHex = `#${finish.bodyColor.toString(16).padStart(6, '0')}`;

            return (
              <button
                key={key}
                onClick={() => onSelectFinish(key)}
                className={`flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-blue-500/60 shadow-sm'
                    : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                  style={{ backgroundColor: colorHex }}
                />
                <span className="font-medium flex-1 text-left">{finish.name}</span>
                {isSelected && <span className="text-[10px] text-blue-400 font-mono">ACTIVE</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Camera Choreography Presets */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Camera Presets</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectCameraPreset(preset.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                cameraPreset === preset.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'glass-button text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Orbit Instructions Note */}
      <div className="mt-auto pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
          <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive 3D Viewport</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Click and drag directly on the 3D canvas to pitch and roll the device frame interactively.
        </p>
      </div>
    </div>
  );
};
