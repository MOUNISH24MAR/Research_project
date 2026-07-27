import React, { useState, useEffect, useRef } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useMicrophone } from '../../hooks/useMicrophone';
import { useSpeech } from '../../hooks/useSpeech';
import { useRecorder } from '../../hooks/useRecorder';
import { apiService } from '../../services/api';
import { questions as defaultQuestions } from '../../data/questions';
import { BrainCircuit, Loader2, Mic, Radio, FileText, Sparkles, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

import Header from '../../components/Header/Header';
import Webcam from '../../components/Webcam/Webcam';
import QuestionPanel from '../../components/QuestionPanel/QuestionPanel';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Timer from '../../components/Timer/Timer';
import Controls from '../../components/Controls/Controls';

import './Interview.css';

export const Interview = ({ backupRecording, dynamicQuestions, matchScore, onComplete }) => {
  const activeQuestions = dynamicQuestions && dynamicQuestions.length > 0 ? dynamicQuestions : defaultQuestions;
  
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState('setup'); // 'setup', 'recording', 'submitting', 'error'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [totalTime, setTotalTime] = useState(0);
  const [isSubmittingFile, setIsSubmittingFile] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [transcript, setTranscript] = useState('');

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
  const recognitionRef = useRef(null);
  const scoresRef = useRef([]);

  const currentQuestion = activeQuestions[currentQuestionIndex];

  // Request permissions and auto-start immediately
  useEffect(() => {
    const autoInitialize = async () => {
      try {
        if (isCameraActive) await camera.startCamera();
        if (isMicActive) await microphone.startMicrophone();
        
        // After hardware is ready, instantly start the session
        await startInterviewSession();
      } catch (err) {
        console.warn("Hardware initialization error:", err);
        setApiError("Failed to initialize camera/microphone. Please allow permissions.");
      }
    };
    
    if (status === 'setup') {
      autoInitialize();
    }
    
    return () => {
      // Cleanup streams on unmount
      camera.stopCamera();
      microphone.stopMicrophone();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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

  // Auto-narration and STT initialization
  useEffect(() => {
    if (status === 'recording' && currentQuestion) {
      setTranscript(''); // Reset transcript for new question
      
      // Wait 1 second before narrating to let components settle
      const timeout = setTimeout(() => {
        speech.speak(currentQuestion.text, () => {
          // After narration ends, start listening for candidate answer
          startListening();
        });
      }, 1000);
      
      return () => {
        clearTimeout(timeout);
        stopListening();
      };
    }
  }, [status, currentQuestionIndex]);

  const startListening = () => {
    if (!isMicActive) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    // Destroy existing if any
    stopListening();
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      let currentString = '';
      for (let i = 0; i < event.results.length; i++) {
        currentString += event.results[i][0].transcript;
      }
      setTranscript(currentString);
    };
    
    recognition.onerror = (e) => console.warn("Speech recognition error:", e.error);
    
    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("Recognition start failed:", e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch(e) {}
      recognitionRef.current = null; // Destroy recognizer
    }
  };

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
      setTimeLeft(activeQuestions[0].duration || 60);
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
    if (!sessionId || !currentQuestion) return;
    
    setIsSubmittingFile(true);
    try {
      // Stop and destroy Web Speech recognition
      stopListening();

      // 1. Evaluate Transcript with backend LLM
      try {
        const scoreData = await apiService.evaluateAnswer(
          currentQuestion.id,
          currentQuestion.original_question || currentQuestion.text,
          currentQuestion.expected_answer || "",
          transcript
        );
        scoresRef.current.push({
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          transcript: transcript,
          score: scoreData.score,
          maxScore: scoreData.max_score,
          skill: currentQuestion.skill || "General",
          difficulty: currentQuestion.difficulty || "Medium",
          expectedAnswer: currentQuestion.expected_answer || ""
        });
      } catch (evalErr) {
        console.warn("Evaluation failed:", evalErr);
        // Push a fallback score if it fails so the report still generates
        scoresRef.current.push({
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          transcript: transcript,
          score: 0,
          maxScore: 10,
          skill: currentQuestion.skill || "General",
          difficulty: currentQuestion.difficulty || "Medium",
          expectedAnswer: currentQuestion.expected_answer || ""
        });
      }

      // 2. Stop video recording and retrieve Blob
      if (backupRecording) {
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
      }
    } catch (err) {
      console.error("Answer submission failed:", err);
    } finally {
      setIsSubmittingFile(false);
    }
  };

  const handleAutoAdvance = async () => {
    speech.stop();
    await uploadCurrentAnswer();
    
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < activeQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(activeQuestions[nextIndex].duration || 60);
      if (backupRecording) {
        recorder.startRecording(camera.stream, microphone.stream);
      }
    } else {
      finalizeInterview();
    }
  };

  const handleNextQuestion = async () => {
    speech.stop();
    await uploadCurrentAnswer();
    
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < activeQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(activeQuestions[nextIndex].duration || 60);
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
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
      
      // Calculate final cumulative score
      const totalScore = scoresRef.current.reduce((acc, curr) => acc + (curr.score || 0), 0);
      const totalMaxScore = scoresRef.current.reduce((acc, curr) => acc + (curr.maxScore || 10), 0);

      // Pass data to parent view
      onComplete({
        sessionId,
        totalQuestions: activeQuestions.length,
        totalTime,
        reportData: finalReport,
        matchScore,
        evaluations: scoresRef.current,
        finalScore: totalScore,
        finalMaxScore: totalMaxScore
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
      <div className="interview-page-wrapper loading-wrapper">
        <div className="loading-container glass-panel">
          <div className="loading-spinner-ring">
            <BrainCircuit size={40} className="spinner-center-icon text-accent" />
          </div>
          <h2 className="loading-title">Initializing Diagnostic Hardware...</h2>
          <p className="loading-subtext">Calibrating HD video stream and studio microphone inputs.</p>
          {matchScore !== null && (
            <div className="match-score-pill-banner">
              <Sparkles size={16} className="text-accent" />
              <div>
                <h4>Resume Alignment Score: <strong>{matchScore}%</strong></h4>
                <p>Questions have been dynamically generated based on candidate skill mapping.</p>
              </div>
            </div>
          )}
          {apiError && (
            <div className="backend-alert-box">
              <ShieldAlert size={16} />
              <span>{apiError}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === 'submitting') {
    return (
      <div className="interview-page-wrapper loading-wrapper">
        <div className="loading-container glass-panel">
          <div className="loading-spinner-ring">
            <Loader2 size={40} className="spinner-center-icon text-primary animate-spin" />
          </div>
          <h2 className="loading-title">Compiling Diagnostic Report...</h2>
          <p className="loading-subtext">Evaluating transcript semantic similarity and calculating skill proficiency.</p>
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
              total={activeQuestions.length} 
            />
          </div>

          <div className="grid-right">
            <div className="top-right-bar">
              <Timer 
                timeLeft={timeLeft} 
                duration={currentQuestion.duration || 60} 
              />
            </div>

            <QuestionPanel 
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={activeQuestions.length}
              questionText={currentQuestion.text}
              category={currentQuestion.category}
              isNarrating={speech.isNarrating}
              isPaused={speech.isPaused}
              onNarrateToggle={handleNarrateToggle}
            />
            
            {/* Live STT Transcript Display Console */}
            <div className="transcript-console-card glass-panel">
              <div className="console-header">
                <div className="console-title">
                  <Mic size={14} className="text-accent" />
                  <span>Real-time Speech Recognition Stream</span>
                </div>
                <div className="live-pulse-badge">
                  <span className="rec-pulse-dot"></span> LIVE STT
                </div>
              </div>
              <p className={transcript ? "transcript-text active" : "transcript-text placeholder"}>
                {transcript || "Listening for candidate spoken response..."}
              </p>
            </div>
          </div>
        </div>
        
        {apiError && (
          <div className="backend-alert-box floating">
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        <div className="interview-footer">
          <Controls 
            status="recording"
            isCameraActive={isCameraActive}
            isMicActive={isMicActive}
            onToggleCamera={handleToggleCamera}
            onToggleMic={handleToggleMic}
            onNextQuestion={handleNextQuestion}
            onFinishInterview={finalizeInterview}
            isLastQuestion={currentQuestionIndex === activeQuestions.length - 1}
            isSubmittingFile={isSubmittingFile}
          />
        </div>
      </main>
    </div>
  );
};

export default Interview;
