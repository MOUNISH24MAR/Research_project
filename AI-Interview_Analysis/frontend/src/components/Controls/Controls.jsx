import React from 'react';
import { Camera, CameraOff, Mic, MicOff, ArrowRight, CheckSquare, Rocket, AlertTriangle, Loader2 } from 'lucide-react';
import './Controls.css';

export const Controls = ({
  status, // 'setup', 'recording', 'submitting'
  isCameraActive,
  isMicActive,
  onToggleCamera,
  onToggleMic,
  onStartInterview,
  onNextQuestion,
  onFinishInterview,
  isLastQuestion,
  isSubmittingFile
}) => {
  if (status === 'setup') {
    return (
      <div className="controls-panel glass-panel setup-controls">
        <button 
          onClick={onStartInterview}
          className="start-session-btn primary-action-btn"
          disabled={!isCameraActive || !isMicActive}
        >
          <Rocket size={18} />
          <span>Launch AI Interview Session</span>
        </button>
        {(!isCameraActive || !isMicActive) && (
          <p className="controls-warning">
            <AlertTriangle size={14} className="warning-icon" />
            <span>Please enable both camera and microphone hardware permissions to proceed.</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="controls-panel glass-panel active-controls">
      <div className="device-toggles-group">
        <button 
          onClick={onToggleCamera} 
          className={`device-toggle-btn ${isCameraActive ? 'active' : 'disabled'}`}
          title={isCameraActive ? "Disable Camera Stream" : "Enable Camera Stream"}
        >
          {isCameraActive ? <Camera size={16} /> : <CameraOff size={16} />}
          <span>{isCameraActive ? 'Camera Active' : 'Camera Off'}</span>
        </button>
        
        <button 
          onClick={onToggleMic} 
          className={`device-toggle-btn ${isMicActive ? 'active' : 'disabled'}`}
          title={isMicActive ? "Mute Microphone Stream" : "Unmute Microphone Stream"}
        >
          {isMicActive ? <Mic size={16} /> : <MicOff size={16} />}
          <span>{isMicActive ? 'Mic Active' : 'Mic Muted'}</span>
        </button>
      </div>

      <div className="action-buttons-group">
        <button 
          onClick={onFinishInterview} 
          className="finish-session-btn"
          disabled={isSubmittingFile}
        >
          <CheckSquare size={16} />
          <span>Finish Session</span>
        </button>

        <button 
          onClick={onNextQuestion} 
          className="next-question-btn primary-action-btn"
          disabled={isSubmittingFile}
        >
          {isSubmittingFile ? (
            <>
              <Loader2 size={16} className="spinner-icon" />
              <span>Evaluating Response...</span>
            </>
          ) : (
            <>
              <span>{isLastQuestion ? 'Complete Interview' : 'Next Question'}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Controls;
