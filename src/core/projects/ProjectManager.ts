// ProjectManager.ts — Local-First IndexedDB Project Storage Engine
import {
  WallpaperConfig,
  MockupConfig,
  PipConfig,
  CalloutOverlay,
  ZoomFragment,
  MaskEffectType,
  AudioLevels,
  TrimRange,
} from '@/types';

export interface MotionStudioProjectSettings {
  wallpaperConfig: WallpaperConfig;
  mockupConfig: MockupConfig;
  pipConfig: PipConfig;
  callouts: CalloutOverlay[];
  zoomFragments: ZoomFragment[];
  maskEffect: MaskEffectType;
  audioLevels: AudioLevels;
  trimRange: TrimRange;
}

export interface MotionStudioProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  duration: number;
  thumbnail?: string;
  videoBlob?: Blob;
  videoName?: string;
  settings: MotionStudioProjectSettings;
}

export interface MotionStudioProjectSummary {
  id: string;
  name: string;
  updatedAt: number;
  duration: number;
  thumbnail?: string;
  hasVideo: boolean;
}

const DB_NAME = 'MotionStudioDB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';

export class ProjectManager {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          const store = db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  public static async saveProject(project: MotionStudioProject): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      const dataToSave = {
        ...project,
        updatedAt: Date.now(),
      };
      const request = store.put(dataToSave);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public static async getProject(id: string): Promise<MotionStudioProject | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const request = store.get(id);
      request.onsuccess = () => {
        resolve((request.result as MotionStudioProject) || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  public static async getAllProjects(): Promise<MotionStudioProjectSummary[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const request = store.getAll();
      request.onsuccess = () => {
        const projects = (request.result as MotionStudioProject[]) || [];
        const summaries: MotionStudioProjectSummary[] = projects
          .map((p) => ({
            id: p.id,
            name: p.name,
            updatedAt: p.updatedAt,
            duration: p.duration,
            thumbnail: p.thumbnail,
            hasVideo: !!p.videoBlob,
          }))
          .sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(summaries);
      };
      request.onerror = () => reject(request.error);
    });
  }

  public static async deleteProject(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public static createDefaultProject(name = 'MotionStudio_Project_01'): MotionStudioProject {
    return {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      duration: 16,
      videoName: 'MotionStudio_Live_Asset.webm',
      settings: {
        wallpaperConfig: {
          type: 'wallpaper',
          presetId: 'studio-dark',
          color: '#0f172a',
          gradient: 'linear-gradient(135deg, #0f172a 0%, #020617 50%, #082f49 100%)',
          blur: 0,
          padding: 36,
          borderRadius: 16,
          shadowDepth: 70,
        },
        mockupConfig: {
          mode: '2d',
          frame2D: 'none',
          device3D: 'frameless',
        },
        pipConfig: {
          enabled: true,
          x: 85,
          y: 80,
          size: 180,
          sizePercent: 18,
          shape: 'squircle',
          placementPreset: 'bottom-right',
          cornerPosition: 'bottom-right',
          mirror: true,
          borderWidth: 2,
          borderColor: '#3b82f6',
          shadow: true,
          background: { type: 'none' },
        },
        callouts: [
          {
            id: 'callout-1',
            title: '3D Spatial Staging',
            description: 'Zero-backend WebGL device viewport compositing',
            badge: 'PRO FEATURE',
            startTime: 0.5,
            endTime: 5.5,
            x: 10,
            y: 72,
            animation: 'bounce',
            colorTheme: 'blue',
          },
        ],
        zoomFragments: [
          {
            id: 'zoom-1',
            startTime: 2,
            endTime: 6,
            targetFocus: { x: 50, y: 50, scale: 1.4 },
            ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
          },
        ],
        maskEffect: 'none',
        audioLevels: {
          displayVolume: 1.0,
          micVolume: 1.0,
          masterVolume: 1.0,
          displayMuted: false,
          micMuted: false,
        },
        trimRange: { start: 0, end: 16 },
      },
    };
  }
}
