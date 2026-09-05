// LeftToolRail.tsx — MotionStudio Left Primary Tool Rail
import React from 'react';
import {
  Image,
  Monitor,
  Activity,
  ZoomIn,
  Video,
  Shapes,
  Music,
  Disc,
  Upload,
} from 'lucide-react';
import { ActiveToolTab } from '@/types';

interface LeftToolRailProps {
  activeTab: ActiveToolTab;
  onSelectTab: (tab: ActiveToolTab) => void;
  onOpenRecordSetup: () => void;
  onTriggerUpload: () => void;
}

export const LeftToolRail: React.FC<LeftToolRailProps> = ({
  activeTab,
  onSelectTab,
  onOpenRecordSetup,
  onTriggerUpload,
}) => {
  const tools = [
    { id: 'background', label: 'Background', icon: Image },
    { id: 'mockup', label: 'Mockup', icon: Monitor },
    { id: 'motion', label: 'Motion', icon: Activity },
    { id: 'zoom', label: 'Zoom', icon: ZoomIn },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'elements', label: 'Elements', icon: Shapes },
    { id: 'audio', label: 'Audio', icon: Music },
  ];

  return (
    <aside className="w-16 bg-slate-950 border-r border-slate-800/90 flex flex-col items-center py-3 z-30 select-none justify-between">
      {/* Top Primary Tool Icons */}
      <div className="flex flex-col items-center space-y-1.5 w-full px-2">
        {tools.map((tool) => {
          const isActive = activeTab === tool.id;
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTab(isActive ? null : (tool.id as ActiveToolTab))}
              className={`group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title={tool.label}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-blue-400' : ''}`} />
              <span className="text-[9px] font-medium mt-0.5 tracking-tighter">
                {tool.label}
              </span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Action Triggers: Record & Upload */}
      <div className="flex flex-col items-center space-y-2 w-full px-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={onOpenRecordSetup}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 border border-rose-500/20 transition-all duration-150"
          title="Start a new recording session"
        >
          <Disc className="w-5 h-5 text-rose-500 animate-pulse" />
          <span className="text-[9px] font-bold mt-0.5 tracking-tighter">Record</span>
        </button>

        <button
          onClick={onTriggerUpload}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-all duration-150"
          title="Upload external video file (MP4, WebM, MOV)"
        >
          <Upload className="w-4 h-4" />
          <span className="text-[9px] font-medium mt-0.5 tracking-tighter">Upload</span>
        </button>
      </div>
    </aside>
  );
};
