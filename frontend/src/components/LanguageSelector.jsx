import React, { useState } from 'react';
import { Code, CheckCircle, ArrowRight } from 'lucide-react';
import '../styles/LanguageSelector.css';

const LanguageSelector = ({ onLanguageSelect, onStartQuiz }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const languages = [
    {
      id: 'python',
      name: 'Python',
      description: 'Easy to learn, great for beginners',
      icon: '🐍',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },
    {
      id: 'java',
      name: 'Java',
      description: 'Object-oriented programming',
      icon: '☕',
      color: 'bg-orange-100 border-orange-300 text-orange-800'
    },
    {
      id: 'cpp',
      name: 'C++',
      description: 'High-performance programming',
      icon: '⚡',
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      description: 'Web development and more',
      icon: '🟨',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    }
  ];

  const handleLanguageSelect = (languageId) => {
    setSelectedLanguage(languageId);
    onLanguageSelect(languageId);
  };

  const handleStartQuiz = () => {
    if (selectedLanguage) {
      onStartQuiz(selectedLanguage);
    }
  };

  return (
    <div className="language-selector-container">
      <div className="language-selector-header">
        <div className="language-selector-icon">
          <Code size={32} />
        </div>
        <h2 className="language-selector-title">Choose Your Programming Language</h2>
        <p className="language-selector-description">
          Select the programming language you'd like to practice with. 
          The quiz will show questions specific to your chosen language.
        </p>
      </div>

      <div className="language-grid">
        {languages.map((language) => (
          <div
            key={language.id}
            className={`language-card ${selectedLanguage === language.id ? 'language-card-selected' : ''}`}
            onClick={() => handleLanguageSelect(language.id)}
          >
            <div className="language-card-header">
              <div className="language-icon">{language.icon}</div>
              <div className="language-info">
                <h3 className="language-name">{language.name}</h3>
                <p className="language-description">{language.description}</p>
              </div>
              {selectedLanguage === language.id && (
                <div className="language-selected-icon">
                  <CheckCircle size={20} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="language-selector-actions">
        <button
          onClick={handleStartQuiz}
          disabled={!selectedLanguage}
          className={`start-quiz-button ${selectedLanguage ? 'start-quiz-button-enabled' : 'start-quiz-button-disabled'}`}
        >
          <span>Start Quiz</span>
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="language-selector-tip">
        <p className="tip-text">
          💡 <strong>Tip:</strong> Don't worry if you're not familiar with all languages. 
          Choose the one you know best or want to learn!
        </p>
      </div>
    </div>
  );
};

export default LanguageSelector;
