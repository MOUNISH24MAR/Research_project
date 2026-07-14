import { useState, useCallback, useEffect } from 'react';
import { speechService } from '../services/speechService';

export const useSpeech = () => {
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);

  const stop = useCallback(() => {
    speechService.stop();
    setIsNarrating(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    speechService.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    speechService.resume();
    setIsPaused(false);
  }, []);

  const speak = useCallback((text, onEndCallback = null) => {
    setError(null);
    setIsNarrating(true);
    setIsPaused(false);

    speechService.speak(
      text,
      // onStart
      () => {
        setIsNarrating(true);
        setIsPaused(false);
      },
      // onEnd
      () => {
        setIsNarrating(false);
        setIsPaused(false);
        if (onEndCallback) onEndCallback();
      },
      // onError
      (err) => {
        setIsNarrating(false);
        setIsPaused(false);
        setError(err);
        console.error("Narration error:", err);
      }
    );
  }, []);

  // Make sure we stop narrating if the hook unmounts
  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  return {
    isNarrating,
    isPaused,
    error,
    speak,
    stop,
    pause,
    resume
  };
};
