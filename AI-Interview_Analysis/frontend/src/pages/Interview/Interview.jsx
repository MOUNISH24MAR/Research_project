import React, { useState, useEffect, useRef } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useMicrophone } from '../../hooks/useMicrophone';
import { useSpeech } from '../../hooks/useSpeech';
import { useRecorder } from '../../hooks/useRecorder';
import { apiService } from '../../services/api';
import { questions } from '../../data/questions';

import Header from '../../components/Header/Header';
import Webcam from '../../components/Webcam/Webcam';
import QuestionPanel from '../../components/QuestionPanel/QuestionPanel';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Timer from '../../components/Timer/Timer';
import Controls from '../../components/Controls/Controls';

import './Interview.css';

export const Interview = ({ backupRecording, onComplete }) => {
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState('setup'); // 'setup', 'recording', 'submitting', 'error'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [totalTime, setTotalTime] = useState(0);
  const [isSubmittingFile, setIsSubmittingFile] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Hardware switches (UI toggles)
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isMicActive, setIsMicActive] = useState(true);

  // Custom Hooks
  const camera = useCamera();
  const microphone = useMicrophone();
  const speech = useSpeech();
  const recorder = useRecorder();

  const overallTimerRef = useRef(null);
  const questionTimerRef = useRef(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Request permissions in setup phase
  useEffect(() => {
    if (status === 'setup') {
      const initPermissions = async () => {
        try {
          if (isCameraActive) await camera.startCamera();
          if (isMicActive) await microphone.startMicrophone();
        } catch (err) {
          console.warn("Hardware initialization error during setup:", err);
        }
      };
      initPermissions();
    }
    
    return () => {
      // Cleanup streams on unmount
      camera.stopCamera();
      microphone.stopMicrophone();
    };
  }, [status]);

  // Overall timer ticking
  useEffect(() => {
    if (status === 'recording') {
      overallTimerRef.current = setInterval(() => {
        setTotalTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (overallTimerRef.current) clearInterval(overallTimerRef.current);
    }
    return () => {
      if (overallTimerRef.current) clearInterval(overallTimerRef.current);
    };
  }, [status]);

  // Individual question timer ticking
  useEffect(() => {
    if (status === 'recording' && !isSubmittingFile) {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      
      questionTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(questionTimerRef.current);
            // Time run out: trigger auto-advance!
            handleAutoAdvance();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    }
    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [status, currentQuestionIndex, isSubmittingFile]);

  // Auto-narration of the active question
  useEffect(() => {
    if (status === 'recording' && currentQuestion) {
      // Wait 1 second before narrating to let components settle
      const timeout = setTimeout(() => {
        speech.speak(currentQuestion.text);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [status, currentQuestionIndex]);

  const handleToggleCamera = () => {
    if (isCameraActive) {
      camera.stopCamera();
      setIsCameraActive(false);
    } else {
      setIsCameraActive(true);
      camera.startCamera().catch(console.error);
    }
  };

  const handleToggleMic = () => {
    if (isMicActive) {
      microphone.stopMicrophone();
      setIsMicActive(false);
    } else {
      setIsMicActive(true);
      microphone.startMicrophone().catch(console.error);
    }
  };

  const startInterviewSession = async () => {
    setApiError(null);
    try {
      // 1. Check Flask server connection & start session
      const session = await apiService.startInterview();
      setSessionId(session.session_id);
      
      // 2. Initialize timer values
      setTimeLeft(questions[0].duration);
      setTotalTime(0);
      
      // 3. Switch status
      setStatus('recording');
      
      // 4. Start MediaRecorder (if enabled)
      if (backupRecording) {
        recorder.startRecording(camera.stream, microphone.stream);
      }
    } catch (err) {
      setApiError("Failed to start session. Please make sure the backend Flask app is running at port 5000.");
      console.error(err);
    }
  };

  const uploadCurrentAnswer = async () => {
    if (!backupRecording) return; // Skip recording and uploading if backup recording is disabled
    if (!sessionId || !currentQuestion) return;
    
    setIsSubmittingFile(true);
    try {
      // Stop recording and retrieve Blob
      const blob = await recorder.stopRecording();
      
      if (blob) {
        // Upload compiled WebM recording to backend
        await apiService.uploadRecording(
          sessionId, 
          currentQuestion.id, 
          blob, 
          'video'
        );
      }
    } catch (err) {
      console.error("Recording upload failed:", err);
      // We log but proceed so candidate isn't stuck
    } finally {
      setIsSubmittingFile(false);
    }
  };

  const handleAutoAdvance = async () => {
    speech.stop();
    await uploadCurrentAnswer();
    
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(questions[nextIndex].duration);
      // Restart recording for next question if enabled
      if (backupRecording) {
        recorder.startRecording(camera.stream, microphone.stream);
      }
    } else {
      // Finished all questions
      finalizeInterview();
    }
  };

  const handleNextQuestion = async () => {
    speech.stop();
    await uploadCurrentAnswer();
    
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(questions[nextIndex].duration);
      if (backupRecording) {
        recorder.startRecording(camera.stream, microphone.stream);
      }
    } else {
      finalizeInterview();
    }
  };

  const finalizeInterview = async () => {
    setStatus('submitting');
    speech.stop();
    try {
      // End session on backend
      const finalReport = await apiService.endInterview(sessionId);
      
      // Clean up hardware
      camera.stopCamera();
      microphone.stopMicrophone();
      
      // Pass data to parent view
      onComplete({
        sessionId,
        totalQuestions: questions.length,
        totalTime,
        reportData: finalReport
      });
    } catch (err) {
      console.error("Failed to finalize session:", err);
      setStatus('error');
      setApiError("Failed to finalize session on backend.");
    }
  };

  const handleNarrateToggle = () => {
    if (speech.isNarrating && !speech.isPaused) {
      speech.pause();
    } else if (speech.isPaused) {
      speech.resume();
    } else {
      speech.speak(currentQuestion.text);
    }
  };

  // Rendering logic
  if (status === 'setup') {
    return (
      <div className="interview-page-wrapper">
        <Header activePageIndex="setup" />
        
        <div className="setup-container glass-panel">
          <h2 className="setup-title">System Hardware Diagnostics</h2>
          <p className="setup-desc">Please grant permission and adjust your settings before beginning.</p>
          
          <div className="setup-grid">
            <div className="setup-hardware-card camera-card">
              <div className="setup-preview">
                {camera.isActive ? (
                  <video
                    ref={(el) => {
                      if (el && camera.stream) el.srcObject = camera.stream;
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="setup-video-feed"
                  />
                ) : (
                  <div className="setup-placeholder">📷</div>
                )}
              </div>
              <button 
                className={`setup-toggle-btn ${isCameraActive ? 'active' : ''}`}
                onClick={handleToggleCamera}
              >
                {isCameraActive ? 'Disable Camera' : 'Enable Camera'}
              </button>
              {camera.error && <span className="hw-error">{camera.error}</span>}
            </div>

            <div className="setup-hardware-card mic-card">
              <div className="setup-preview">
                <div className="mic-meter-container">
                  <div className={`mic-indicator-dot ${microphone.isActive ? 'active' : ''}`}>🎤</div>
                  {microphone.isActive && <p className="mic-test-msg">Microphone Active & Connected</p>}
                </div>
              </div>
              <button 
                className={`setup-toggle-btn ${isMicActive ? 'active' : ''}`}
                onClick={handleToggleMic}
              >
                {isMicActive ? 'Mute Microphone' : 'Enable Microphone'}
              </button>
              {microphone.error && <span className="hw-error">{microphone.error}</span>}
            </div>
          </div>

          {apiError && <p className="backend-alert">{apiError}</p>}

          <Controls 
            status="setup"
            isCameraActive={camera.isActive}
            isMicActive={microphone.isActive}
            onStartInterview={startInterviewSession}
          />
        </div>
      </div>
    );
  }

  if (status === 'submitting') {
    return (
      <div className="interview-page-wrapper loading-wrapper">
        <div className="loading-container glass-panel">
          <div className="loading-spinner shimmer-bg"></div>
          <h2>Completing Interview...</h2>
          <p>We are securing your session and building your dashboard. Please do not close this tab.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-page-wrapper">
      <Header 
        sessionId={sessionId} 
        activePageIndex="interview" 
        totalTime={totalTime} 
      />

      <main className="interview-main-content">
        <div className="interview-grid">
          <div className="grid-left">
            <Webcam 
              stream={camera.stream} 
              analyser={microphone.analyser}
              isRecording={recorder.isRecording}
              isCameraActive={isCameraActive}
              isMicActive={isMicActive}
            />
            <ProgressBar 
              currentIndex={currentQuestionIndex} 
              total={questions.length} 
            />
          </div>

          <div className="grid-right">
            <Timer 
              timeLeft={timeLeft} 
              duration={currentQuestion.duration} 
            />
            <QuestionPanel 
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              questionText={currentQuestion.text}
              category={currentQuestion.category}
              isNarrating={speech.isNarrating}
              isPaused={speech.isPaused}
              onNarrateToggle={handleNarrateToggle}
            />
          </div>
        </div>
        
        {apiError && <p className="backend-alert">{apiError}</p>}

        <div className="interview-footer">
          <Controls 
            status="recording"
            isCameraActive={isCameraActive}
            isMicActive={isMicActive}
            onToggleCamera={handleToggleCamera}
            onToggleMic={handleToggleMic}
            onNextQuestion={handleNextQuestion}
            onFinishInterview={finalizeInterview}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
            isSubmittingFile={isSubmittingFile}
          />
        </div>
      </main>
    </div>
  );
};

export default Interview;
