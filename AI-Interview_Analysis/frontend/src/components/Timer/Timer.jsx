import React from 'react';
import './Timer.css';

export const Timer = ({ timeLeft, duration }) => {
  const percentage = duration > 0 ? (timeLeft / duration) : 0;
  
  // Circle parameters for circular SVG timer
  const radius = 50;
  const stroke = 6;
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
  if (timeLeft <= 10) {
    timerClass = 'timer-danger';
  } else if (timeLeft <= 30) {
    timerClass = 'timer-warning';
  }

  return (
    <div className={`circular-timer-container glass-panel ${timerClass}`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="timer-svg"
      >
        <circle
          stroke="rgba(255,255,255,0.03)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="timer-progress-circle"
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="timer-text">
        <span className="time-val">{formatTime(timeLeft)}</span>
        <span className="time-lbl">remaining</span>
      </div>
    </div>
  );
};

export default Timer;
