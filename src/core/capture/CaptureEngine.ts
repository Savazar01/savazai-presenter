// CaptureEngine — Media Streams & Studio-Grade Web Audio Dual-Channel Mixer
import { StreamState, AudioLevels } from '@/types';

export class CaptureEngine {
  private displayStream: MediaStream | null = null;
  private webcamStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;

  // Web Audio Graph
  private audioContext: AudioContext | null = null;
  private displaySourceNode: MediaStreamAudioSourceNode | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;
  private micHighpassFilter: BiquadFilterNode | null = null;
  private micCompressor: DynamicsCompressorNode | null = null;
  private displayGainNode: GainNode | null = null;
  private micGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private micAnalyserNode: AnalyserNode | null = null;
  private masterAnalyserNode: AnalyserNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;

  private onStreamChangeCallback?: (state: StreamState) => void;

  constructor(onStreamChange?: (state: StreamState) => void) {
    this.onStreamChangeCallback = onStreamChange;
  }

  /**
   * Initializes the Studio-Grade Web Audio mixing graph
   */
  private initAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    if (!this.masterGainNode) {
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = 1.0;
    }

    if (!this.masterAnalyserNode) {
      this.masterAnalyserNode = this.audioContext.createAnalyser();
      this.masterAnalyserNode.fftSize = 256;
      this.masterAnalyserNode.smoothingTimeConstant = 0.8;
      this.masterGainNode.connect(this.masterAnalyserNode);
    }

    if (!this.destinationNode) {
      this.destinationNode = this.audioContext.createMediaStreamDestination();
      this.masterGainNode.connect(this.destinationNode);
    }

    return this.audioContext;
  }

  /**
   * Request display capture (Screen, Window, Tab) up to 4K 60fps
   */
  public async startDisplayCapture(prefer4K = true): Promise<MediaStream> {
    const videoConstraints: MediaTrackConstraints = prefer4K
      ? {
          width: { ideal: 3840, max: 3840 },
          height: { ideal: 2160, max: 2160 },
          frameRate: { ideal: 60, max: 60 },
        }
      : {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 60, max: 60 },
        };

    try {
      const constraints: DisplayMediaStreamOptions = {
        video: {
          displaySurface: 'monitor',
          width: { ideal: prefer4K ? 3840 : 1920, max: 3840 },
          height: { ideal: prefer4K ? 2160 : 1080, max: 2160 },
          frameRate: { ideal: 60, max: 60 },
        },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

      this.displayStream = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          this.stopDisplayCapture();
        });
      }

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        this.connectDisplayAudio(new MediaStream([audioTracks[0]]));
      }

      this.notifyState();
      return stream;
    } catch (error) {
      console.error('Failed to capture display stream:', error);
      throw error;
    }
  }

  public stopDisplayCapture(): void {
    if (this.displayStream) {
      this.displayStream.getTracks().forEach((track) => track.stop());
      this.displayStream = null;
    }
    if (this.displaySourceNode) {
      try {
        this.displaySourceNode.disconnect();
      } catch (_) {}
      this.displaySourceNode = null;
    }
    this.notifyState();
  }

  public async startWebcamCapture(deviceId?: string): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user',
        },
      });

      this.webcamStream = stream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          this.stopWebcamCapture();
        });
      }

      this.notifyState();
      return stream;
    } catch (error) {
      console.error('Failed to capture webcam stream:', error);
      throw error;
    }
  }

  public stopWebcamCapture(): void {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach((track) => track.stop());
      this.webcamStream = null;
    }
    this.notifyState();
  }

  public async startMicrophoneCapture(deviceId?: string): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.micStream = stream;
      this.connectMicAudio(stream);

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.addEventListener('ended', () => {
          this.stopMicrophoneCapture();
        });
      }

      this.notifyState();
      return stream;
    } catch (error) {
      console.error('Failed to capture microphone:', error);
      throw error;
    }
  }

  public stopMicrophoneCapture(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.micSourceNode) {
      try {
        this.micSourceNode.disconnect();
      } catch (_) {}
      this.micSourceNode = null;
    }
    this.notifyState();
  }

  private connectDisplayAudio(stream: MediaStream): void {
    const ctx = this.initAudioContext();
    if (!this.displayGainNode) {
      this.displayGainNode = ctx.createGain();
      this.displayGainNode.connect(this.masterGainNode!);
    }
    if (this.displaySourceNode) {
      try {
        this.displaySourceNode.disconnect();
      } catch (_) {}
    }
    this.displaySourceNode = ctx.createMediaStreamSource(stream);
    this.displaySourceNode.connect(this.displayGainNode);
  }

  /**
   * Builds the DSP chain: Mic Source -> 80Hz Highpass -> Dynamics Compressor -> Mic Gain -> Master & Analyser
   */
  private connectMicAudio(stream: MediaStream): void {
    const ctx = this.initAudioContext();

    if (!this.micHighpassFilter) {
      this.micHighpassFilter = ctx.createBiquadFilter();
      this.micHighpassFilter.type = 'highpass';
      this.micHighpassFilter.frequency.value = 80; // Cut low rumble and plosives
      this.micHighpassFilter.Q.value = 0.707;
    }

    if (!this.micCompressor) {
      this.micCompressor = ctx.createDynamicsCompressor();
      this.micCompressor.threshold.value = -24; // dB
      this.micCompressor.knee.value = 30; // dB
      this.micCompressor.ratio.value = 12;
      this.micCompressor.attack.value = 0.003; // 3ms
      this.micCompressor.release.value = 0.25; // 250ms
    }

    if (!this.micGainNode) {
      this.micGainNode = ctx.createGain();
    }

    if (!this.micAnalyserNode) {
      this.micAnalyserNode = ctx.createAnalyser();
      this.micAnalyserNode.fftSize = 256;
      this.micAnalyserNode.smoothingTimeConstant = 0.5;
    }

    if (this.micSourceNode) {
      try {
        this.micSourceNode.disconnect();
      } catch (_) {}
    }

    // Connect DSP Chain
    this.micSourceNode = ctx.createMediaStreamSource(stream);
    this.micSourceNode.connect(this.micHighpassFilter);
    this.micHighpassFilter.connect(this.micCompressor);
    this.micCompressor.connect(this.micGainNode);

    // Split to master gain and mic-specific analyser for VU meter
    this.micGainNode.connect(this.masterGainNode!);
    this.micGainNode.connect(this.micAnalyserNode);
  }

  /**
   * Sets audio volumes with smooth click-free logarithmic interpolation
   */
  public setAudioLevels(levels: AudioLevels): void {
    const ctx = this.audioContext;
    const now = ctx ? ctx.currentTime : 0;
    const rampTime = 0.05; // 50ms smooth transition

    if (this.displayGainNode && ctx) {
      const target = levels.displayMuted ? 0 : levels.displayVolume;
      this.displayGainNode.gain.setTargetAtTime(target, now, rampTime);
    }
    if (this.micGainNode && ctx) {
      const target = levels.micMuted ? 0 : levels.micVolume;
      this.micGainNode.gain.setTargetAtTime(target, now, rampTime);
    }
    if (this.masterGainNode && ctx) {
      this.masterGainNode.gain.setTargetAtTime(levels.masterVolume, now, rampTime);
    }
  }

  /**
   * Calculates normalized real-time Microphone VU Level (0.0 to 1.0)
   */
  public getMicVULevel(): number {
    if (!this.micAnalyserNode) return 0;
    const data = new Uint8Array(this.micAnalyserNode.frequencyBinCount);
    this.micAnalyserNode.getByteFrequencyData(data);

    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    const avg = sum / data.length;
    return Math.min(1, Math.max(0, avg / 128));
  }

  public getFrequencyData(array: Uint8Array<ArrayBuffer>): void {
    if (this.masterAnalyserNode) {
      this.masterAnalyserNode.getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }

  public getTimeDomainData(array: Uint8Array<ArrayBuffer>): void {
    if (this.masterAnalyserNode) {
      this.masterAnalyserNode.getByteTimeDomainData(array);
    } else {
      array.fill(128);
    }
  }

  public getMixedAudioStream(): MediaStream | null {
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  public getDisplayStream(): MediaStream | null {
    return this.displayStream;
  }

  public getWebcamStream(): MediaStream | null {
    return this.webcamStream;
  }

  public getMicStream(): MediaStream | null {
    return this.micStream;
  }

  public getStreamState(): StreamState {
    const displayVideoTrack = this.displayStream?.getVideoTracks()[0];
    const displayAudioTrack = this.displayStream?.getAudioTracks()[0];
    const webcamVideoTrack = this.webcamStream?.getVideoTracks()[0];
    const micAudioTrack = this.micStream?.getAudioTracks()[0];

    const settings = displayVideoTrack?.getSettings();

    return {
      hasDisplayStream: !!displayVideoTrack && displayVideoTrack.readyState === 'live',
      hasWebcamStream: !!webcamVideoTrack && webcamVideoTrack.readyState === 'live',
      hasMicStream: !!micAudioTrack && micAudioTrack.readyState === 'live',
      displayVideoTrack,
      displayAudioTrack,
      webcamVideoTrack,
      micAudioTrack,
      streamResolution: settings ? { width: settings.width || 1920, height: settings.height || 1080 } : undefined,
      streamFps: settings?.frameRate || 60,
    };
  }

  private notifyState(): void {
    if (this.onStreamChangeCallback) {
      this.onStreamChangeCallback(this.getStreamState());
    }
  }

  public dispose(): void {
    this.stopDisplayCapture();
    this.stopWebcamCapture();
    this.stopMicrophoneCapture();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
