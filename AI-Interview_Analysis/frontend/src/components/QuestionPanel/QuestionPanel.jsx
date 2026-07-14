import React from 'react';
import './QuestionPanel.css';

export const QuestionPanel = ({
  questionNumber,
  totalQuestions,
  questionText,
  category,
  isNarrating,
  isPaused,
  onNarrateToggle
}) => {
  return (
    <div className="question-panel glass-panel">
      <div className="question-header">
        <span className="category-badge">{category}</span>
        <span className="question-counter">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>
      
      <div className="question-body">
        <h2 className="question-text">{questionText}</h2>
      </div>

      <div className="narration-controls">
        <button 
          onClick={onNarrateToggle}
          className={`narrate-btn ${isNarrating && !isPaused ? 'playing' : ''}`}
          title={isNarrating && !isPaused ? "Pause Narration" : "Read Question"}
        >
          <span className="narrate-icon">
            {isNarrating && !isPaused ? '⏸' : '🔊'}
          </span>
          <span className="narrate-label">
            {isNarrating && !isPaused ? 'Pause Narration' : (isPaused ? 'Resume Narration' : 'Read Aloud')}
          </span>
        </button>
      </div>
    </div>
  );
};

export default QuestionPanel;
