import { useState, useCallback } from 'react';
import { cameraService } from '../services/cameraService';

export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading, active, denied, error
  const [error, setError] = useState(null);

  const startCamera = useCallback(async (constraints = {}) => {
    setStatus('loading');
    setError(null);
    try {
      const videoStream = await cameraService.getStream(constraints);
      setStream(videoStream);
      setStatus('active');
      return videoStream;
    } catch (err) {
      setError(err.message);
      setStatus('denied');
      throw err;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      cameraService.stopStream(stream);
      setStream(null);
    }
    setStatus('idle');
  }, [stream]);

  return {
    stream,
    status,
    error,
    startCamera,
    stopCamera,
    isActive: status === 'active'
  };
};
