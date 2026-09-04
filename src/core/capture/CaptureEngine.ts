// CaptureEngine — Media Streams & Web Audio Dual-Channel Mixer
import { StreamState, AudioLevels } from '@/types';

export class CaptureEngine {
  private displayStream: MediaStream | null = null;
  private webcamStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;

  // Web Audio Graph
  private audioContext: AudioContext | null = null;
  private displaySourceNode: MediaStreamAudioSourceNode | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;
  private displayGainNode: GainNode | null = null;
  private micGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;

  private onStreamChangeCallback?: (state: StreamState) => void;

  constructor(onStreamChange?: (state: StreamState) => void) {
    this.onStreamChangeCallback = onStreamChange;
  }

  /**
   * Initializes the Web Audio mixing graph
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

    if (!this.analyserNode) {
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;
      this.masterGainNode.connect(this.analyserNode);
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
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: videoConstraints,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.displayStream = stream;

      // Handle stream end event (e.g. user clicked browser stop share button)
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          this.stopDisplayCapture();
        });
      }

      // Mix display audio if present
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

  /**
   * Stops display capture and releases tracks
   */
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

  /**
   * Starts webcam video capture (getUserMedia)
   */
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

  /**
   * Stops webcam capture
   */
  public stopWebcamCapture(): void {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach((track) => track.stop());
      this.webcamStream = null;
    }
    this.notifyState();
  }

  /**
   * Starts microphone audio capture
   */
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

  /**
   * Stops microphone capture
   */
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

  private connectMicAudio(stream: MediaStream): void {
    const ctx = this.initAudioContext();
    if (!this.micGainNode) {
      this.micGainNode = ctx.createGain();
      this.micGainNode.connect(this.masterGainNode!);
    }
    if (this.micSourceNode) {
      try {
        this.micSourceNode.disconnect();
      } catch (_) {}
    }
    this.micSourceNode = ctx.createMediaStreamSource(stream);
    this.micSourceNode.connect(this.micGainNode);
  }

  public setAudioLevels(levels: AudioLevels): void {
    if (this.displayGainNode) {
      this.displayGainNode.gain.value = levels.displayMuted ? 0 : levels.displayVolume;
    }
    if (this.micGainNode) {
      this.micGainNode.gain.value = levels.micMuted ? 0 : levels.micVolume;
    }
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = levels.masterVolume;
    }
  }

  /**
   * Get real-time audio visualizer frequency data (0-255)
   */
  public getFrequencyData(array: Uint8Array<ArrayBuffer>): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }

  /**
   * Get real-time audio waveform time-domain data (0-255)
   */
  public getTimeDomainData(array: Uint8Array<ArrayBuffer>): void {
    if (this.analyserNode) {
      this.analyserNode.getByteTimeDomainData(array);
    } else {
      array.fill(128);
    }
  }

  /**
   * Returns mixed audio destination stream for recording pipeline
   */
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
