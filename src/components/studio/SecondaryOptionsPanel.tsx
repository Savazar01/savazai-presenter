// SecondaryOptionsPanel.tsx — MotionStudio Contextual Secondary Drawer Panel
import React, { useState } from 'react';
import {
  ActiveToolTab,
  WallpaperConfig,
  MockupConfig,
  DeviceType,
  Frame2DType,
  ZoomFragment,
  CalloutOverlay,
  AudioLevels,
  TrimRange,
} from '@/types';
import {
  X,
  Sliders,
  Image,
  Palette,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Play,
  RotateCw,
  Upload,
  Volume2,
  Type,
  Square,
  Circle,
  HelpCircle,
} from 'lucide-react';

interface SecondaryOptionsPanelProps {
  activeTab: ActiveToolTab;
  onClose: () => void;
  wallpaperConfig: WallpaperConfig;
  onUpdateWallpaper: (config: Partial<WallpaperConfig>) => void;
  mockupConfig: MockupConfig;
  onUpdateMockup: (config: Partial<MockupConfig>) => void;
  zoomFragments: ZoomFragment[];
  onAddZoomFragment: () => void;
  onRemoveZoomFragment: (id: string) => void;
  callouts: CalloutOverlay[];
  onAddCallout: (callout: CalloutOverlay) => void;
  onRemoveCallout: (id: string) => void;
  playbackRate: number;
  onSetPlaybackRate: (rate: number) => void;
  audioLevels: AudioLevels;
  onUpdateAudioLevels: (levels: Partial<AudioLevels>) => void;
  totalDuration: number;
  trimRange: TrimRange;
  onUpdateTrimRange: (range: TrimRange) => void;
  onTriggerUpload: () => void;
}

export const WALLPAPER_PRESETS = [
  {
    id: 'studio-dark',
    name: 'Studio Dark',
    preview: 'bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950',
    css: 'linear-gradient(135deg, #0f172a 0%, #020617 50%, #082f49 100%)',
  },
  {
    id: 'aurora-glow',
    name: 'Aurora Glow',
    preview: 'bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-800',
    css: 'linear-gradient(135deg, #312e81 0%, #581c87 50%, #831843 100%)',
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    preview: 'bg-gradient-to-br from-amber-800 via-orange-900 to-rose-950',
    css: 'linear-gradient(135deg, #92400e 0%, #7c2d12 50%, #4c0519 100%)',
  },
  {
    id: 'executive-office',
    name: 'Modern Minimal',
    preview: 'bg-gradient-to-r from-zinc-900 via-slate-800 to-neutral-900',
    css: 'linear-gradient(135deg, #18181b 0%, #1e293b 50%, #171717 100%)',
  },
  {
    id: 'cyan-cyber',
    name: 'Cyber Mesh',
    preview: 'bg-gradient-to-bl from-teal-900 via-slate-900 to-cyan-950',
    css: 'linear-gradient(135deg, #134e4a 0%, #0f172a 50%, #083344 100%)',
  },
];

export const SecondaryOptionsPanel: React.FC<SecondaryOptionsPanelProps> = ({
  activeTab,
  onClose,
  wallpaperConfig,
  onUpdateWallpaper,
  mockupConfig,
  onUpdateMockup,
  zoomFragments,
  onAddZoomFragment,
  onRemoveZoomFragment,
  callouts,
  onAddCallout,
  onRemoveCallout,
  playbackRate,
  onSetPlaybackRate,
  audioLevels,
  onUpdateAudioLevels,
  totalDuration,
  trimRange,
  onUpdateTrimRange,
  onTriggerUpload,
}) => {
  const [bgTab, setBgTab] = useState<'wallpaper' | 'color'>('wallpaper');
  const [elemTab, setElemTab] = useState<'elements' | 'text'>('text');

  if (!activeTab || activeTab === 'record' || activeTab === 'upload') return null;

  return (
    <aside className="w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col z-20 select-none animate-in slide-in-from-left-4 duration-200 shadow-2xl">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>{activeTab}</span>
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs text-slate-300">
        {/* 1. BACKGROUND DRAWER */}
        {activeTab === 'background' && (
          <div className="space-y-5">
            {/* Sub-Tabs: Wallpaper vs Color */}
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setBgTab('wallpaper')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  bgTab === 'wallpaper' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Wallpaper
              </button>
              <button
                onClick={() => setBgTab('color')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  bgTab === 'color' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Solid / Gradient
              </button>
            </div>

            {bgTab === 'wallpaper' ? (
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-slate-400 block">Preset Backdrops</label>
                <div className="grid grid-cols-2 gap-2">
                  {WALLPAPER_PRESETS.map((preset) => {
                    const isSel = wallpaperConfig.presetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() =>
                          onUpdateWallpaper({
                            type: 'wallpaper',
                            presetId: preset.id,
                            gradient: preset.css,
                          })
                        }
                        className={`h-16 rounded-xl border p-2 flex flex-col justify-end transition-all ${preset.preview} ${
                          isSel ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-slate-700/50 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-white drop-shadow-md">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-slate-400 block">Solid Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={wallpaperConfig.color}
                    onChange={(e) =>
                      onUpdateWallpaper({
                        type: 'color',
                        color: e.target.value,
                        gradient: e.target.value,
                      })
                    }
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                  />
                  <input
                    type="text"
                    value={wallpaperConfig.color}
                    onChange={(e) =>
                      onUpdateWallpaper({
                        type: 'color',
                        color: e.target.value,
                        gradient: e.target.value,
                      })
                    }
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 font-mono text-white text-xs"
                  />
                </div>
              </div>
            )}

            {/* Sliders: Blur, Padding, Rounded corners, Shadow */}
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Background Blur</span>
                  <span className="font-mono text-slate-400">{wallpaperConfig.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={wallpaperConfig.blur}
                  onChange={(e) => onUpdateWallpaper({ blur: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Canvas Padding</span>
                  <span className="font-mono text-slate-400">{wallpaperConfig.padding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={wallpaperConfig.padding}
                  onChange={(e) => onUpdateWallpaper({ padding: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Corner Radius</span>
                  <span className="font-mono text-slate-400">{wallpaperConfig.borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={wallpaperConfig.borderRadius}
                  onChange={(e) => onUpdateWallpaper({ borderRadius: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Drop Shadow Depth</span>
                  <span className="font-mono text-slate-400">{wallpaperConfig.shadowDepth}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={wallpaperConfig.shadowDepth}
                  onChange={(e) => onUpdateWallpaper({ shadowDepth: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. MOCKUP DRAWER */}
        {activeTab === 'mockup' && (
          <div className="space-y-5">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-2">2D Window Frames</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'macos-dark', label: 'macOS Dark' },
                  { id: 'macos-light', label: 'macOS Light' },
                  { id: 'macos-glass', label: 'macOS Glass' },
                  { id: 'outline', label: 'Minimal Outline' },
                  { id: 'brave', label: 'Brave Tab' },
                  { id: 'chrome', label: 'Chrome Tab' },
                  { id: 'none', label: 'Frameless' },
                ].map((frame) => {
                  const isSel = mockupConfig.mode === '2d' && mockupConfig.frame2D === frame.id;
                  return (
                    <button
                      key={frame.id}
                      onClick={() =>
                        onUpdateMockup({
                          mode: '2d',
                          frame2D: frame.id as Frame2DType,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                        isSel
                          ? 'border-blue-500 bg-blue-600/20 text-white ring-1 ring-blue-500'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {frame.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 block mb-2">3D Spatial Devices (Three.js)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'macbook', label: 'MacBook Pro M3' },
                  { id: 'iphone', label: 'iPhone 16 Pro' },
                  { id: 'windows-desktop', label: 'Windows PC' },
                  { id: 'pixel-android', label: 'Pixel Android' },
                  { id: 'frameless', label: '3D Floating Screen' },
                ].map((dev) => {
                  const isSel = mockupConfig.mode === '3d' && mockupConfig.device3D === dev.id;
                  return (
                    <button
                      key={dev.id}
                      onClick={() =>
                        onUpdateMockup({
                          mode: '3d',
                          device3D: dev.id as DeviceType,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                        isSel
                          ? 'border-indigo-500 bg-indigo-600/20 text-white ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {dev.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. MOTION DRAWER */}
        {activeTab === 'motion' && (
          <div className="space-y-4">
            <label className="text-[11px] font-semibold text-slate-400 block">Entrance Animations (Anime.js v4)</label>
            <div className="space-y-2">
              {[
                { name: 'Progressive Focus', desc: 'Smooth camera zoom from depth with aperture blur' },
                { name: 'Depth Emergence', desc: 'Device floats forward with dramatic isometric drop' },
                { name: '3D Spin Reveal', desc: 'Kinematic 360-degree rotation into resting position' },
                { name: 'Isometric Lift', desc: 'Elevates along Y-axis with contact shadow expansion' },
              ].map((motion, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white group-hover:text-blue-400">{motion.name}</span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <p className="text-[10px] text-slate-400">{motion.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. ZOOM DRAWER */}
        {activeTab === 'zoom' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-400">Zoom Fragments</label>
              <button
                onClick={onAddZoomFragment}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Fragment</span>
              </button>
            </div>

            <div className="space-y-2">
              {zoomFragments.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-slate-500">
                  No zoom keyframes added. Click &quot;Add Fragment&quot; to highlight screen areas.
                </div>
              ) : (
                zoomFragments.map((frag, idx) => (
                  <div
                    key={frag.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white">Zoom Point #{idx + 1}</div>
                      <div className="text-[10px] font-mono text-blue-400">
                        00:{frag.startTime.toString().padStart(2, '0')} - 00:{frag.endTime.toString().padStart(2, '0')} (Scale: {frag.targetFocus.scale}x)
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveZoomFragment(frag.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. ELEMENTS & TEXT DRAWER */}
        {activeTab === 'elements' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setElemTab('text')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  elemTab === 'text' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Text & Titles
              </button>
              <button
                onClick={() => setElemTab('elements')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  elemTab === 'elements' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Shapes & Badges
              </button>
            </div>

            {elemTab === 'text' ? (
              <div className="space-y-2">
                {[
                  { title: 'Headline Callout', desc: 'Large bold typography with kinetic anime pop-in' },
                  { title: 'Feature Step Badge', desc: 'Numbered step pill with glowing border' },
                  { title: 'Speaker Annotation', desc: 'Compact subtitle text box at viewport bottom' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      onAddCallout({
                        id: `callout-${Date.now()}`,
                        title: item.title,
                        description: 'Editable description text',
                        badge: 'MOTION',
                        startTime: 1,
                        endTime: 5,
                        x: 12,
                        y: 75,
                        animation: 'bounce',
                        colorTheme: 'blue',
                      })
                    }
                    className="w-full p-3 text-left bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/60 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-blue-400">{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </div>
                    <Plus className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {['App Store Badge', 'Product Hunt', 'GitHub Star', 'Arrow Indicator'].map((shape, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center font-bold text-white hover:border-blue-500/50 cursor-pointer"
                  >
                    {shape}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. VIDEO DRAWER */}
        {activeTab === 'video' && (
          <div className="space-y-5">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-2">Playback Speed</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => onSetPlaybackRate(rate)}
                    className={`py-1.5 rounded-lg font-bold font-mono transition-all ${
                      playbackRate === rate
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 block mb-2">Media File</label>
              <button
                onClick={onTriggerUpload}
                className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white font-bold flex items-center justify-center space-x-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace Video Asset</span>
              </button>
            </div>
          </div>
        )}

        {/* 7. AUDIO DRAWER */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Microphone Gain</span>
                <span className="font-mono text-slate-400">{Math.round(audioLevels.micVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={audioLevels.micVolume}
                onChange={(e) => onUpdateAudioLevels({ micVolume: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Display / System Audio</span>
                <span className="font-mono text-slate-400">{Math.round(audioLevels.displayVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={audioLevels.displayVolume}
                onChange={(e) => onUpdateAudioLevels({ displayVolume: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
