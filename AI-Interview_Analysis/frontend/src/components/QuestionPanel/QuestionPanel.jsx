import React from 'react';
import { Volume2, Pause, Play, Tag, Sparkles, HelpCircle } from 'lucide-react';
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
        <div className="category-tag-wrapper">
          <Tag size={13} className="tag-icon" />
          <span className="category-badge">{category || "Technical Evaluation"}</span>
        </div>
        
        <div className="question-counter-badge">
          <HelpCircle size={13} className="counter-icon" />
          <span>Question <strong>{questionNumber}</strong> of <strong>{totalQuestions}</strong></span>
        </div>
      </div>
      
      <div className="question-body">
        <div className="ai-eval-indicator">
          <Sparkles size={14} className="sparkle-anim" /> AI Generated Diagnostic Question
        </div>
        <h2 className="question-text">{questionText}</h2>
      </div>

      <div className="narration-controls">
        <button 
          onClick={onNarrateToggle}
          className={`narrate-btn ${isNarrating && !isPaused ? 'playing' : ''}`}
          title={isNarrating && !isPaused ? "Pause Audio Narration" : "Play Speech Synthesis"}
        >
          <span className="narrate-icon-wrapper">
            {isNarrating && !isPaused ? <Pause size={15} /> : <Volume2 size={15} />}
          </span>
          <span className="narrate-label">
            {isNarrating && !isPaused ? 'Pause AI Narration' : (isPaused ? 'Resume Narration' : 'Read Out Loud')}
          </span>
        </button>
      </div>
    </div>
  );
};

export default QuestionPanel;
