import React from 'react';
import { Clock } from 'lucide-react';
import './Timer.css';

export const Timer = ({ timeLeft, duration }) => {
  const percentage = duration > 0 ? (timeLeft / duration) : 0;
  
  // Circle parameters for circular SVG timer
  const radius = 48;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - percentage * circumference;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine state color based on time left
  let timerClass = 'timer-safe';
  let strokeColor = '#2563EB'; // Primary Blue
  
  if (timeLeft <= 10) {
    timerClass = 'timer-danger';
    strokeColor = '#EF4444'; // Danger Red
  } else if (timeLeft <= 30) {
    timerClass = 'timer-warning';
    strokeColor = '#F59E0B'; // Warning Amber
  }

  return (
    <div className={`circular-timer-card glass-panel ${timerClass}`}>
      <div className="timer-svg-wrapper">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="timer-svg"
        >
          <circle
            stroke="rgba(255,255,255,0.06)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            className="timer-progress-circle"
            stroke={strokeColor}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeWidth={stroke}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="timer-overlay">
          <Clock size={14} className="timer-icon" />
          <span className="time-val">{formatTime(timeLeft)}</span>
          <span className="time-lbl">REMAINING</span>
        </div>
      </div>
    </div>
  );
};

export default Timer;
