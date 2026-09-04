// AudioVisualizer — Real-Time Oscilloscope & Frequency Spectrum Canvas
import React, { useEffect, useRef } from 'react';
import { CaptureEngine } from '@/core/capture/CaptureEngine';

interface AudioVisualizerProps {
  captureEngine: CaptureEngine | null;
  isActive: boolean;
  width?: number;
  height?: number;
  mode?: 'bars' | 'wave';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  captureEngine,
  isActive,
  width = 160,
  height = 36,
  mode = 'bars',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(64);

    const render = () => {
      animationRef.current = requestAnimationFrame(render);

      ctx.clearRect(0, 0, width, height);

      if (!isActive || !captureEngine) {
        // Idle ambient pulse
        ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
        const barW = width / 16;
        for (let i = 0; i < 16; i++) {
          const h = 4 + Math.sin(Date.now() * 0.003 + i * 0.4) * 2;
          ctx.fillRect(i * (barW + 2), (height - h) / 2, barW - 2, h);
        }
        return;
      }

      if (mode === 'bars') {
        captureEngine.getFrequencyData(dataArray);

        const barCount = 18;
        const barWidth = (width / barCount) - 2;

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * 2] || 0;
          const barHeight = Math.max(3, (val / 255) * height);

          // Gradient from blue to cyan
          const grad = ctx.createLinearGradient(0, height, 0, 0);
          grad.addColorStop(0, '#3b82f6');
          grad.addColorStop(1, '#60a5fa');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else {
        captureEngine.getTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#60a5fa';
        ctx.beginPath();

        const sliceWidth = width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
      }
    };

    render();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [captureEngine, isActive, width, height, mode]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-md bg-slate-900/60 border border-slate-800/80"
    />
  );
};
