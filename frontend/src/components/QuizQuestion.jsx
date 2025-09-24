import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Circle } from 'lucide-react';
import '../styles/QuizQuestion.css';

const QuizQuestion = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerSelect, 
  timeRemaining,
  isSubmitted = false 
}) => {
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState(selectedAnswer || '');

  useEffect(() => {
    setLocalSelectedAnswer(selectedAnswer || '');
  }, [selectedAnswer]);

  const handleAnswerSelect = (answer) => {
    if (!isSubmitted) {
      setLocalSelectedAnswer(answer);
      onAnswerSelect(answer);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };



  if (!question) {
    return (
      <div className="quiz-question-container">
        <div className="quiz-loading">
          <div className="quiz-loading-spinner"></div>
          <p className="quiz-loading-text">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-question-container">
      {/* Question Header */}
      <div className="quiz-question-header">
        <div className="quiz-question-meta">
          <div className="quiz-question-badges">
            <span className={`quiz-difficulty-badge quiz-difficulty-${question.difficulty}`}>
              {question.difficulty?.toUpperCase()}
            </span>
            <span className="quiz-points-badge">
              <Star size={14} />
              {question.points} point{question.points !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <h2 className="quiz-question-text">
          {question.question || question.questionText || question.text || "Question text not available"}
        </h2>
      </div>

      {/* Program code snippet (if present) */}
      {question.programQuestion?.codeSnippet && (
        <div className="quiz-code-container">
          <pre className="quiz-code-block"><code>{question.programQuestion.codeSnippet}</code></pre>
        </div>
      )}

      {/* Options */}
      <div className="quiz-options-container">
        {question.options && question.options.length > 0 ? (
          question.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index);
            const isSelected = localSelectedAnswer === option.text;
            const isCorrect = option.isCorrect;
            const showCorrect = isSubmitted && isCorrect;
            const showIncorrect = isSubmitted && isSelected && !isCorrect;

            let buttonClass = 'quiz-option-button';
            if (isSelected) buttonClass += ' selected';
            if (showCorrect) buttonClass += ' correct';
            if (showIncorrect) buttonClass += ' incorrect';

            return (
              <button
                key={index}
                type="button"
                className={buttonClass}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isSubmitted) {
                    handleAnswerSelect(option.text);
                  }
                }}
                disabled={isSubmitted}
              >
                <div className="quiz-option-letter">
                  {optionLetter}
                </div>
                
                <div className="quiz-option-text">
                  <p>{option.text}</p>
                </div>
                
                {/* Status Icons */}
                {isSubmitted && (
                  <div className="quiz-option-status">
                    {showCorrect && (
                      <div className="quiz-status-icon quiz-status-correct">
                        <CheckCircle size={20} />
                      </div>
                    )}
                    {showIncorrect && (
                      <div className="quiz-status-icon quiz-status-incorrect">
                        <Circle size={20} />
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })
        ) : (
          <div className="quiz-loading">
            <p>No options available for this question.</p>
          </div>
        )}
      </div>

      {/* Explanation (shown after submission) */}
      {isSubmitted && question.explanation && (
        <div className="quiz-explanation">
          <h4>Explanation:</h4>
          <p>{question.explanation}</p>
        </div>
      )}

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="quiz-tags">
          <div className="quiz-tags-container">
            {question.tags.map((tag, index) => (
              <span key={index} className="quiz-tag">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;