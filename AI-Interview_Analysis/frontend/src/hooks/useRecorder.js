import { useState, useCallback, useRef, useEffect } from 'react';
import { recorderService } from '../services/recorderService';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const combinedStreamRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = useCallback((cameraStream, micStream) => {
    if (!cameraStream && !micStream) {
      throw new Error("Cannot start recording: No video or audio streams available.");
    }

    // Combine tracks
    const tracks = [];
    if (cameraStream) {
      tracks.push(...cameraStream.getVideoTracks());
    }
    if (micStream) {
      tracks.push(...micStream.getAudioTracks());
    }

    const combinedStream = new MediaStream(tracks);
    combinedStreamRef.current = combinedStream;

    // Start recorder service
    recorderService.start(combinedStream);
    
    setIsRecording(true);
    setIsPaused(false);
    setRecordedBlob(null);
    setRecordingTime(0);

    // Duration timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);

    console.log("Recording started with combined audio-video stream.");
  }, []);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);

    try {
      const blob = await recorderService.stop();
      setRecordedBlob(blob);
      
      // Clean up local combined stream reference (don't stop parent stream tracks,
      // as camera/mic streams might be reused for the next question!)
      combinedStreamRef.current = null;
      
      return blob;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      combinedStreamRef.current = null;
      throw error;
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (isRecording && !isPaused) {
      recorderService.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (isRecording && isPaused) {
      recorderService.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }
  }, [isRecording, isPaused]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    isPaused,
    recordedBlob,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  };
};
