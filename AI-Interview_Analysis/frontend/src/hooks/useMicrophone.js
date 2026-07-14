import { useState, useCallback, useRef } from 'react';
import { microphoneService } from '../services/microphoneService';

export const useMicrophone = () => {
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading, active, denied, error
  const [error, setError] = useState(null);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  const startMicrophone = useCallback(async (constraints = {}) => {
    setStatus('loading');
    setError(null);
    try {
      const audioStream = await microphoneService.getStream(constraints);
      setStream(audioStream);
      
      // Initialize Audio Analyzer for Visualizer
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128; // Small fft for visual complexity and performance
        
        const source = audioCtx.createMediaStreamSource(audioStream);
        source.connect(analyser);
        
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
      } catch (err) {
        console.warn("Failed to initialize audio analyzer context:", err);
      }
      
      setStatus('active');
      return audioStream;
    } catch (err) {
      setError(err.message);
      setStatus('denied');
      throw err;
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    if (stream) {
      microphoneService.stopStream(stream);
      setStream(null);
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    
    audioContextRef.current = null;
    analyserRef.current = null;
    setStatus('idle');
  }, [stream]);

  return {
    stream,
    status,
    error,
    analyser: analyserRef.current,
    startMicrophone,
    stopMicrophone,
    isActive: status === 'active'
  };
};
