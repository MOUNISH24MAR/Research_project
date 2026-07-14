import React, { useEffect, useRef } from 'react';
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
      canvas.height = 80; // Compact height
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

        // Draw frequency wave
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00f0ff'; // Neon Cyan
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f0ff';
        
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
        // Draw standard clean idle line
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(157, 78, 221, 0.4)'; // Dim purple
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        
        // Draw a slow undulating sine wave
        const time = Date.now() * 0.003;
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.01 + time) * 3;
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
        <div className="recording-indicator">
          <span className="rec-dot"></span>
          <span className="rec-text">REC</span>
        </div>
      )}

      {isCameraActive && stream ? (
        <video
          ref={videoRef}
          className="webcam-feed"
          autoPlay
          playsInline
          muted // ALWAYS mute local output to avoid audio feedback!
        />
      ) : (
        <div className="webcam-placeholder">
          <div className="placeholder-icon">📷</div>
          <p className="placeholder-text">
            {isCameraActive ? 'Initializing Webcam...' : 'Camera Disabled'}
          </p>
        </div>
      )}

      <div className="audio-visualizer-container">
        <canvas ref={canvasRef} className="audio-canvas" />
        <div className="mic-status-icon">
          {isMicActive ? '🎤' : '🔇'}
        </div>
      </div>
    </div>
  );
};

export default Webcam;
