import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { BrainCircuit, Clock, ShieldCheck, Cpu, Sparkles, Activity } from 'lucide-react';
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
      <div className="header-brand">
        <div className="brand-logo-wrapper">
          <BrainCircuit className="brand-icon" size={24} />
        </div>
        <div className="brand-titles">
          <div className="brand-name-row">
            <h1 className="brand-title">Interview Intelligence</h1>
            <span className="enterprise-badge">
              <Sparkles size={11} className="badge-sparkle" /> Enterprise AI
            </span>
          </div>
          <p className="brand-subtitle">Automated Behavioral & Technical Diagnostics</p>
        </div>
      </div>
      
      <div className="header-meta">
        {sessionId && (
          <div className="meta-pill session-pill">
            <Cpu size={14} className="pill-icon text-accent" />
            <span className="pill-label">Session:</span>
            <span className="pill-val mono">{sessionId.substring(0, 8)}...</span>
          </div>
        )}
        
        {activePageIndex === 'interview' && (
          <div className="meta-pill timer-pill">
            <Clock size={14} className="pill-icon text-cyan" />
            <span className="pill-label">Elapsed:</span>
            <span className="pill-val mono highlight">{formatTotalTime(totalTime)}</span>
          </div>
        )}

        <div className={`status-badge ${isBackendOnline ? 'online' : 'offline'}`}>
          <span className="status-dot"></span>
          <Activity size={13} className="status-icon" />
          <span className="status-text">{isBackendOnline ? 'AI Core Active' : 'Offline / Reconnecting'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
