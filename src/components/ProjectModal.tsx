// ProjectModal.tsx — MotionStudio Local-First Project Management Modal
import React, { useEffect, useState } from 'react';
import {
  Folder,
  Plus,
  Trash2,
  Clock,
  Video,
  X,
  Check,
  Edit2,
  FolderOpen,
} from 'lucide-react';
import { ProjectManager, MotionStudioProjectSummary } from '@/core/projects/ProjectManager';

interface ProjectModalProps {
  isOpen: boolean;
  currentProjectId: string;
  onClose: () => void;
  onOpenProject: (id: string) => void;
  onCreateNewProject: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  currentProjectId,
  onClose,
  onOpenProject,
  onCreateNewProject,
}) => {
  const [projects, setProjects] = useState<MotionStudioProjectSummary[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const loadProjects = async () => {
    try {
      const list = await ProjectManager.getAllProjects();
      setProjects(list);
    } catch (err) {
      console.warn('Error loading projects:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      await ProjectManager.deleteProject(id);
      loadProjects();
    }
  };

  const handleStartRename = (e: React.MouseEvent, p: MotionStudioProjectSummary) => {
    e.stopPropagation();
    setEditingId(p.id);
    setEditName(p.name);
  };

  const handleSaveRename = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editName.trim()) {
      const full = await ProjectManager.getProject(id);
      if (full) {
        full.name = editName.trim();
        await ProjectManager.saveProject(full);
        setEditingId(null);
        loadProjects();
      }
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">MotionStudio Projects</h2>
              <p className="text-xs text-slate-400">Manage and switch between your local-first video projects</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onCreateNewProject();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {projects.length === 0 ? (
            <div className="p-12 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
              <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No saved projects found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Start by creating a new project or recording a session. All work is saved locally in your browser.
              </p>
              <button
                onClick={() => {
                  onCreateNewProject();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center space-x-2 shadow-lg shadow-blue-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => {
                const isActive = p.id === currentProjectId;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onOpenProject(p.id);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                      isActive
                        ? 'border-blue-500 bg-blue-600/15 ring-1 ring-blue-500/50'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        {editingId === p.id ? (
                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-slate-900 border border-blue-500 text-white text-xs px-2 py-1 rounded w-full font-medium"
                              autoFocus
                            />
                            <button
                              onClick={(e) => handleSaveRename(e, p.id)}
                              className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400">
                              {p.name}
                            </h3>
                            {isActive && (
                              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-500/20 border border-blue-500/30">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-slate-400">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{formatDate(p.updatedAt)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Video className="w-3 h-3 text-slate-500" />
                            <span>{p.duration}s</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => handleStartRename(e, p)}
                          className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800"
                          title="Rename Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, p.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        {p.hasVideo ? 'Video recording attached' : 'Staging project'}
                      </span>
                      <span className="text-blue-400 font-semibold group-hover:underline">
                        {isActive ? 'Currently open' : 'Open project →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
