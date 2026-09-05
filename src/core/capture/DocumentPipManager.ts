// DocumentPipManager — Native Chromium Document Picture-in-Picture Floating Controller
export interface DocumentPipCallbacks {
  onTogglePause: () => void;
  onToggleMicMute: () => void;
  onStopAndOpenEditor: () => void;
  onClose?: () => void;
}

export interface DocumentPipState {
  isPaused: boolean;
  recordingDuration: number;
  isMicMuted: boolean;
  vuLevel: number;
  isCountingDown?: boolean;
  countdownNumber?: number;
}

export class DocumentPipManager {
  private pipWindow: Window | null = null;
  private callbacks: DocumentPipCallbacks | null = null;
  private timerEl: HTMLElement | null = null;
  private statusBadgeEl: HTMLElement | null = null;
  private vuBarEl: HTMLElement | null = null;
  private pauseBtnEl: HTMLButtonElement | null = null;
  private micBtnEl: HTMLButtonElement | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'documentPictureInPicture' in window;
  }

  public isOpen(): boolean {
    return this.pipWindow !== null && !this.pipWindow.closed;
  }

  public async open(callbacks: DocumentPipCallbacks, initialState: DocumentPipState): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      this.callbacks = callbacks;

      // Close previous instance if open
      if (this.pipWindow && !this.pipWindow.closed) {
        this.pipWindow.close();
      }

      const pip = (window as unknown as { documentPictureInPicture: { requestWindow: (options: { width: number; height: number }) => Promise<Window> } }).documentPictureInPicture;
      this.pipWindow = await pip.requestWindow({
        width: 340,
        height: 96,
      });

      if (!this.pipWindow) return false;

      // Copy stylesheets from main window
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          if (styleSheet.href && this.pipWindow) {
            const link = this.pipWindow.document.createElement('link');
            link.rel = 'stylesheet';
            link.type = styleSheet.type;
            link.media = styleSheet.media.mediaText;
            link.href = styleSheet.href;
            this.pipWindow.document.head.appendChild(link);
          } else if (styleSheet.cssRules && this.pipWindow) {
            const style = this.pipWindow.document.createElement('style');
            style.textContent = Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join('\n');
            this.pipWindow.document.head.appendChild(style);
          }
        } catch (_) {}
      });

      // Build Floating Mini-Controller UI inside PiP Window
      const doc = this.pipWindow.document;
      doc.body.style.margin = '0';
      doc.body.style.padding = '6px';
      doc.body.style.background = '#07090e';
      doc.body.style.color = '#f8fafc';
      doc.body.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      doc.body.style.userSelect = 'none';
      doc.body.style.overflow = 'hidden';

      let isGhostMode = false;

      const root = doc.createElement('div');
      root.style.display = 'flex';
      root.style.alignItems = 'center';
      root.style.justifyContent = 'space-between';
      root.style.gap = '8px';
      root.style.background = 'rgba(15, 23, 42, 0.95)';
      root.style.border = '1px solid rgba(51, 65, 85, 0.8)';
      root.style.borderRadius = '14px';
      root.style.padding = '6px 10px';
      root.style.boxShadow = '0 10px 25px rgba(0,0,0,0.6)';
      root.style.transition = 'all 150ms ease';

      // 1. REC Status Indicator & Timer
      const recGroup = doc.createElement('div');
      recGroup.style.display = 'flex';
      recGroup.style.alignItems = 'center';
      recGroup.style.gap = '6px';

      const recDot = doc.createElement('div');
      recDot.style.width = '10px';
      recDot.style.height = '10px';
      recDot.style.borderRadius = '50%';
      recDot.style.background = '#ef4444';
      recDot.style.boxShadow = '0 0 8px #ef4444';

      const timerBox = doc.createElement('div');
      timerBox.style.display = 'flex';
      timerBox.style.flexDirection = 'column';

      this.timerEl = doc.createElement('span');
      this.timerEl.style.fontFamily = 'monospace';
      this.timerEl.style.fontSize = '13px';
      this.timerEl.style.fontWeight = '800';
      this.timerEl.style.letterSpacing = '0.5px';
      this.timerEl.textContent = this.formatTime(initialState.recordingDuration);

      this.statusBadgeEl = doc.createElement('span');
      this.statusBadgeEl.style.fontSize = '8px';
      this.statusBadgeEl.style.fontWeight = '700';
      this.statusBadgeEl.style.textTransform = 'uppercase';
      this.statusBadgeEl.style.color = '#f87171';
      this.statusBadgeEl.textContent = initialState.isPaused ? 'PAUSED' : 'REC LIVE';

      timerBox.appendChild(this.timerEl);
      timerBox.appendChild(this.statusBadgeEl);
      recGroup.appendChild(recDot);
      recGroup.appendChild(timerBox);

      // 2. Audio Meter
      const audioGroup = doc.createElement('div');
      audioGroup.style.display = 'flex';
      audioGroup.style.alignItems = 'center';
      audioGroup.style.gap = '4px';

      this.micBtnEl = doc.createElement('button');
      this.micBtnEl.style.background = 'transparent';
      this.micBtnEl.style.border = 'none';
      this.micBtnEl.style.cursor = 'pointer';
      this.micBtnEl.style.fontSize = '13px';
      this.micBtnEl.textContent = initialState.isMicMuted ? '🔇' : '🎙️';
      this.micBtnEl.onclick = () => this.callbacks?.onToggleMicMute();

      const vuContainer = doc.createElement('div');
      vuContainer.style.width = '28px';
      vuContainer.style.height = '5px';
      vuContainer.style.background = '#1e293b';
      vuContainer.style.borderRadius = '3px';
      vuContainer.style.overflow = 'hidden';
      vuContainer.style.padding = '1px';

      this.vuBarEl = doc.createElement('div');
      this.vuBarEl.style.height = '100%';
      this.vuBarEl.style.width = '10%';
      this.vuBarEl.style.background = '#10b981';
      this.vuBarEl.style.borderRadius = '2px';
      this.vuBarEl.style.transition = 'width 75ms ease';

      vuContainer.appendChild(this.vuBarEl);
      audioGroup.appendChild(this.micBtnEl);
      audioGroup.appendChild(vuContainer);

      // 3. Transport Controls (Pause, Stop, Minimize)
      const controlsGroup = doc.createElement('div');
      controlsGroup.style.display = 'flex';
      controlsGroup.style.alignItems = 'center';
      controlsGroup.style.gap = '4px';

      this.pauseBtnEl = doc.createElement('button');
      this.pauseBtnEl.style.background = '#1e293b';
      this.pauseBtnEl.style.border = '1px solid #334155';
      this.pauseBtnEl.style.color = '#f8fafc';
      this.pauseBtnEl.style.borderRadius = '6px';
      this.pauseBtnEl.style.padding = '4px 8px';
      this.pauseBtnEl.style.cursor = 'pointer';
      this.pauseBtnEl.style.fontSize = '11px';
      this.pauseBtnEl.style.fontWeight = '600';
      this.pauseBtnEl.textContent = initialState.isPaused ? '▶️ Resume' : '⏸️ Pause';
      this.pauseBtnEl.onclick = () => this.callbacks?.onTogglePause();

      const stopBtn = doc.createElement('button');
      stopBtn.style.background = 'linear-gradient(135deg, #2563eb, #4f46e5)';
      stopBtn.style.border = 'none';
      stopBtn.style.color = '#ffffff';
      stopBtn.style.borderRadius = '6px';
      stopBtn.style.padding = '4px 9px';
      stopBtn.style.cursor = 'pointer';
      stopBtn.style.fontSize = '11px';
      stopBtn.style.fontWeight = '700';
      stopBtn.style.boxShadow = '0 2px 10px rgba(37, 99, 235, 0.4)';
      stopBtn.textContent = '⏹️ Finish';
      stopBtn.onclick = () => {
        try {
          window.focus();
        } catch (_) {}
        this.callbacks?.onStopAndOpenEditor();
        this.close();
      };

      // Ghost Pill Minimize / Expand Toggle
      const minBtn = doc.createElement('button');
      minBtn.style.background = 'transparent';
      minBtn.style.border = '1px solid rgba(71, 85, 105, 0.5)';
      minBtn.style.color = '#94a3b8';
      minBtn.style.borderRadius = '6px';
      minBtn.style.padding = '4px 6px';
      minBtn.style.cursor = 'pointer';
      minBtn.style.fontSize = '10px';
      minBtn.style.fontWeight = 'bold';
      minBtn.title = 'Minimize to Ghost Pill';
      minBtn.textContent = '➖';

      minBtn.onclick = () => {
        isGhostMode = !isGhostMode;
        if (isGhostMode) {
          timerBox.style.display = 'none';
          audioGroup.style.display = 'none';
          this.pauseBtnEl!.style.display = 'none';
          stopBtn.style.display = 'none';
          minBtn.textContent = '➕';
          minBtn.title = 'Expand Controls';
          root.style.padding = '4px 8px';
        } else {
          timerBox.style.display = 'flex';
          audioGroup.style.display = 'flex';
          this.pauseBtnEl!.style.display = 'inline-block';
          stopBtn.style.display = 'inline-block';
          minBtn.textContent = '➖';
          minBtn.title = 'Minimize to Ghost Pill';
          root.style.padding = '6px 10px';
        }
      };

      controlsGroup.appendChild(this.pauseBtnEl);
      controlsGroup.appendChild(stopBtn);
      controlsGroup.appendChild(minBtn);

      root.appendChild(recGroup);
      root.appendChild(audioGroup);
      root.appendChild(controlsGroup);
      doc.body.appendChild(root);

      this.pipWindow.addEventListener('pagehide', () => {
        this.callbacks?.onClose?.();
        this.pipWindow = null;
      });

      return true;
    } catch (err) {
      console.warn('Document Picture-in-Picture request notice:', err);
      this.pipWindow = null;
      return false;
    }
  }

  public updateState(state: DocumentPipState): void {
    if (!this.isOpen()) return;

    if (state.isCountingDown) {
      if (this.timerEl) {
        this.timerEl.textContent = `00:0${state.countdownNumber ?? 5}`;
      }
      if (this.statusBadgeEl) {
        this.statusBadgeEl.textContent = 'STARTING...';
        this.statusBadgeEl.style.color = '#38bdf8';
      }
    } else {
      if (this.timerEl) {
        this.timerEl.textContent = this.formatTime(state.recordingDuration);
      }
      if (this.statusBadgeEl) {
        this.statusBadgeEl.textContent = state.isPaused ? 'PAUSED' : 'REC LIVE';
        this.statusBadgeEl.style.color = state.isPaused ? '#f59e0b' : '#f87171';
      }
    }

    if (this.pauseBtnEl) {
      this.pauseBtnEl.textContent = state.isPaused ? '▶️ Resume' : '⏸️ Pause';
    }
    if (this.micBtnEl) {
      this.micBtnEl.textContent = state.isMicMuted ? '🔇' : '🎙️';
    }
    if (this.vuBarEl) {
      const pct = Math.min(100, Math.max(5, state.vuLevel * 100));
      this.vuBarEl.style.width = `${pct}%`;
      this.vuBarEl.style.background = state.vuLevel > 0.8 ? '#ef4444' : state.vuLevel > 0.5 ? '#f59e0b' : '#10b981';
    }
  }

  public close(): void {
    if (this.pipWindow && !this.pipWindow.closed) {
      this.pipWindow.close();
      this.pipWindow = null;
    }
  }

  private formatTime(secs: number): string {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  }
}
