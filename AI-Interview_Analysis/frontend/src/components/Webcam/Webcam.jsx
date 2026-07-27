import React, { useEffect, useRef } from 'react';
import { Camera, CameraOff, Mic, MicOff, Radio, Video } from 'lucide-react';
import './Webcam.css';

export const Webcam = ({ stream, analyser, isRecording, isCameraActive, isMicActive }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Hook stream to video element
  useEffect(() => {
    if (videoRef.current) {
      if (stream && isCameraActive) {
        videoRef.current.srcObject = stream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream, isCameraActive]);

  // Audio Visualizer Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth || 400;
      canvas.height = 64; // Compact height
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let bufferLength = 0;
    let dataArray = new Uint8Array(0);

    if (analyser && isMicActive) {
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      const width = canvas.width;
      const height = canvas.height;

      // Clear with transparency
      ctx.clearRect(0, 0, width, height);

      if (analyser && isMicActive) {
        analyser.getByteFrequencyData(dataArray);

        // Draw frequency wave using Cyan / Accent color
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#06B6D4'; // Accent Cyan
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#06B6D4';
        
        ctx.beginPath();
        
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i] / 255.0; // Normalized between 0-1
          const y = height / 2 + (value * (height / 2) * Math.sin(i * 0.1) * (Math.random() * 0.2 + 0.9));
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
      } else {
        // Draw clean idle wave line
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(107, 114, 128, 0.4)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        
        const time = Date.now() * 0.003;
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.01 + time) * 2;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isMicActive]);

  return (
    <div className="webcam-container glass-panel">
      {isRecording && (
        <div className="recording-badge">
          <span className="rec-pulse-dot rec-dot"></span>
          <Radio size={12} className="rec-icon" />
          <span className="rec-text">LIVE RECORDING</span>
        </div>
      )}

      {isCameraActive && stream ? (
        <video
          ref={videoRef}
          className="webcam-feed"
          autoPlay
          playsInline
          muted
        />
      ) : (
        <div className="webcam-placeholder">
          <div className="placeholder-icon-wrapper">
            <CameraOff size={32} className="placeholder-icon" />
          </div>
          <p className="placeholder-text">
            {isCameraActive ? 'Initializing HD Video Feed...' : 'Camera Input Suspended'}
          </p>
          <span className="placeholder-subtext">Click camera control below to toggle stream</span>
        </div>
      )}

      <div className="audio-visualizer-container">
        <canvas ref={canvasRef} className="audio-canvas" />
        <div className={`mic-status-pill ${isMicActive ? 'active' : 'muted'}`}>
          {isMicActive ? <Mic size={14} /> : <MicOff size={14} />}
          <span className="mic-status-label">{isMicActive ? 'Audio Stream Active' : 'Muted'}</span>
        </div>
      </div>
    </div>
  );
};

export default Webcam;
