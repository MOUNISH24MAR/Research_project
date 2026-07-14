import React from 'react';
import './ProgressBar.css';

export const ProgressBar = ({ currentIndex, total }) => {
  const percentage = total > 0 ? (currentIndex / total) * 100 : 0;

  return (
    <div className="progress-bar-container glass-panel">
      <div className="progress-info">
        <span className="progress-label">Interview Progress</span>
        <span className="progress-val">{Math.round(percentage)}% Complete</span>
      </div>
      
      <div className="progress-track">
        <div 
          className="progress-fill shimmer-bg" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="progress-steps">
        {Array.from({ length: total }).map((_, idx) => (
          <div 
            key={idx} 
            className={`progress-step-dot ${idx < currentIndex ? 'completed' : ''} ${idx === currentIndex ? 'active' : ''}`}
            title={`Question ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
