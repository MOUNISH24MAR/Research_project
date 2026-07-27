import React from 'react';
import { ListChecks, CheckCircle2 } from 'lucide-react';
import './ProgressBar.css';

export const ProgressBar = ({ currentIndex, total }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((currentIndex / total) * 100)) : 0;

  return (
    <div className="progress-bar-card glass-panel">
      <div className="progress-info-row">
        <div className="progress-title-group">
          <ListChecks size={14} className="title-icon" />
          <span className="progress-label">Diagnostic Progression</span>
        </div>
        <span className="progress-percentage-pill">{percentage}% Completed</span>
      </div>
      
      <div className="progress-track-wrapper">
        <div 
          className="progress-fill-line" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="progress-steps-row">
        {Array.from({ length: total }).map((_, idx) => (
          <div 
            key={idx} 
            className={`step-dot ${idx < currentIndex ? 'completed' : ''} ${idx === currentIndex ? 'active' : ''}`}
            title={`Question ${idx + 1}`}
          >
            {idx < currentIndex && <CheckCircle2 size={10} className="dot-check" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
