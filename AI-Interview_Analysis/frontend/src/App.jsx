import React, { useState } from 'react';
import ROUTES from './routes';
import Interview from './pages/Interview/Interview';
import Report from './pages/Report/Report';
import './App.css';
import './styles/global.css';

export const App = () => {
  const [view, setView] = useState(ROUTES.WELCOME);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [backupRecording, setBackupRecording] = useState(false);

  const handleStart = () => {
    setView(ROUTES.INTERVIEW);
  };

  const handleInterviewComplete = (summary) => {
    setSessionSummary(summary);
    setView(ROUTES.REPORT);
  };

  const handleRestart = () => {
    setSessionSummary(null);
    setView(ROUTES.WELCOME);
  };

  return (
    <div className="app-container">
      {view === ROUTES.WELCOME && (
        <div className="welcome-screen-wrapper">
          <div className="welcome-card glass-panel">
            <div className="welcome-logo">
              <div className="welcome-logo-icon"></div>
            </div>
            
            <h1 className="welcome-title">AI-Powered Technical Interview Analysis</h1>
            
            <p className="welcome-subtitle">
              Secure an interactive, natural-sounding technical interview. This system runs a 20-question, automated diagnostic evaluation across systems, development, and data security.
            </p>

            <div className="feature-grid">
              <div className="feature-item">
                <span className="feature-icon">🎥</span>
                <div className="feature-text">
                  <h3>Real-time Input</h3>
                  <p>Ensures synchronized HD webcam and studio microphone configurations.</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon">🔊</span>
                <div className="feature-text">
                  <h3>Natural TTS Narration</h3>
                  <p>Narrates questions out loud using speech engines to simulate human dialogue.</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon">⏳</span>
                <div className="feature-text">
                  <h3>Countdown Gauges</h3>
                  <p>Paces questions using circular countdowns and automatic progressions.</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <div className="feature-text">
                  <h3>Behavioral Report</h3>
                  <p>Compiles secure recordings and visualizes analytical frameworks for Phase 2.</p>
                </div>
              </div>
            </div>

            <div className="recording-toggle-container glass-panel">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={backupRecording} 
                  onChange={(e) => setBackupRecording(e.target.checked)}
                  className="toggle-checkbox"
                />
                <span className="toggle-switch"></span>
                <span className="toggle-text">Enable Backup Recording (Development Mode)</span>
              </label>
              <p className="toggle-subtext">
                If disabled, the application runs purely in live-diagnostics mode without recording or uploading audio/video to Flask storage.
              </p>
            </div>

            <button className="begin-btn shimmer-bg" onClick={handleStart}>
              Begin Diagnosis & Setup ➡️
            </button>
          </div>
        </div>
      )}

      {view === ROUTES.INTERVIEW && (
        <Interview 
          backupRecording={backupRecording} 
          onComplete={handleInterviewComplete} 
        />
      )}

      {view === ROUTES.REPORT && (
        <Report 
          sessionSummary={sessionSummary} 
          onRestart={handleRestart} 
        />
      )}
    </div>
  );
};

export default App;
