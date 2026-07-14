import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import './Header.css';

export const Header = ({ sessionId, activePageIndex, totalTime }) => {
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Ping backend health
  useEffect(() => {
    const checkStatus = async () => {
      const isOnline = await apiService.checkBackendStatus();
      setIsBackendOnline(isOnline);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check health every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTotalTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="app-header glass-panel">
      <div className="header-logo">
        <div className="logo-icon"></div>
        <h1>Antigravity AI Interviewer</h1>
      </div>
      
      <div className="header-meta">
        {sessionId && (
          <div className="session-tag">
            <span className="label">Session ID:</span>
            <span className="value">{sessionId.substring(0, 8)}...</span>
          </div>
        )}
        
        {activePageIndex === 'interview' && (
          <div className="timer-tag">
            <span className="timer-icon">⏱</span>
            <span className="value">{formatTotalTime(totalTime)}</span>
          </div>
        )}

        <div className={`status-badge ${isBackendOnline ? 'online' : 'offline'}`}>
          <span className="status-dot"></span>
          <span className="status-text">{isBackendOnline ? 'Flask Connected' : 'Flask Offline'}</span>
        </div>
      </div>
    </header>
  );
};
export default Header;
