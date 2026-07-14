import React from 'react';
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
          className="start-interview-btn"
          disabled={!isCameraActive || !isMicActive}
        >
          🚀 Start Interview Session
        </button>
        {(!isCameraActive || !isMicActive) && (
          <p className="controls-warning">
            ⚠️ Please enable camera and microphone permissions to begin.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="controls-panel glass-panel active-controls">
      <div className="device-toggles">
        <button 
          onClick={onToggleCamera} 
          className={`device-btn ${isCameraActive ? 'active' : 'disabled'}`}
          title={isCameraActive ? "Disable Camera" : "Enable Camera"}
        >
          {isCameraActive ? '📷 Camera On' : '🚫 Camera Off'}
        </button>
        
        <button 
          onClick={onToggleMic} 
          className={`device-btn ${isMicActive ? 'active' : 'disabled'}`}
          title={isMicActive ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicActive ? '🎤 Mic On' : '🔇 Mic Off'}
        </button>
      </div>

      <div className="action-buttons">
        <button 
          onClick={onFinishInterview} 
          className="finish-btn"
          disabled={isSubmittingFile}
        >
          🏁 Finish Interview
        </button>

        <button 
          onClick={onNextQuestion} 
          className="next-btn"
          disabled={isSubmittingFile}
        >
          {isSubmittingFile ? (
            <span className="loader-inline">Saving response...</span>
          ) : (
            isLastQuestion ? 'Complete Interview ➡️' : 'Next Question ➡️'
          )}
        </button>
      </div>
    </div>
  );
};

export default Controls;
