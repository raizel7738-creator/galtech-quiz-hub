import React, { useState } from 'react';
import { 
  Code, 
  Play, 
  Eye, 
  EyeOff, 
  Lightbulb, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const ProgramQuestion = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerSelect, 
  timeRemaining,
  isSubmitted = false 
}) => {
  const [showHints, setShowHints] = useState(false);
  const [showExpectedOutput, setShowExpectedOutput] = useState(false);
  const [userAnswer, setUserAnswer] = useState(selectedAnswer || '');

  const handleAnswerChange = (e) => {
    const answer = e.target.value;
    setUserAnswer(answer);
    onAnswerSelect(answer);
  };

  const getLanguageDisplayName = (language) => {
    const languageMap = {
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'php': 'PHP',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'pseudocode': 'Pseudocode'
    };
    return languageMap[language] || language;
  };

  const getAnalysisTypeDisplayName = (type) => {
    const typeMap = {
      'output': 'What will be the output?',
      'error': 'What error will occur?',
      'complexity': 'What is the time complexity?',
      'logic': 'What is the logic flow?',
      'syntax': 'What is the syntax issue?',
      'behavior': 'What will be the behavior?'
    };
    return typeMap[type] || type;
  };

  const formatCode = (code) => {
    return code.split('\n').map((line, index) => (
      <div key={index} className="flex">
        <span className="text-gray-500 text-sm w-8 text-right mr-4 select-none">
          {index + 1}
        </span>
        <span className="text-gray-800 font-mono text-sm">{line}</span>
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      {/* Question Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Code size={20} />
              <span className="font-semibold">Program Question</span>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {getLanguageDisplayName(question.programQuestion?.language || 'javascript')}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Question {questionNumber} of {totalQuestions}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {question.question}
          </p>
        </div>
        
        <div className="flex items-center text-lg font-mono ml-4">
          <Clock size={20} className="mr-2 text-gray-500" />
          <span className={timeRemaining <= 60 ? 'text-red-600 font-bold' : 'text-gray-600'}>
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Analysis Type */}
      <div className="mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle size={16} />
            <span className="font-medium">Analysis Required:</span>
          </div>
          <p className="text-yellow-700 mt-1">
            {getAnalysisTypeDisplayName(question.programQuestion?.analysisType || 'output')}
          </p>
        </div>
      </div>

      {/* Code Snippet */}
      <div className="mb-6">
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <div className="text-gray-300 text-sm font-mono">
            {formatCode(question.programQuestion?.codeSnippet || '')}
          </div>
        </div>
      </div>

      {/* Test Cases (if available) */}
      {question.programQuestion?.testCases && question.programQuestion.testCases.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Test Cases</h3>
          <div className="space-y-3">
            {question.programQuestion.testCases.map((testCase, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Test Case {index + 1}: {testCase.description}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Input:</span>
                    <div className="bg-white rounded p-2 mt-1 font-mono text-sm">
                      {testCase.input}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Expected Output:</span>
                    <div className="bg-white rounded p-2 mt-1 font-mono text-sm">
                      {testCase.expectedOutput}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hints */}
      {question.programQuestion?.hints && question.programQuestion.hints.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Lightbulb size={16} />
            <span className="font-medium">
              {showHints ? 'Hide Hints' : 'Show Hints'} ({question.programQuestion.hints.length})
            </span>
          </button>
          
          {showHints && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2">
                {question.programQuestion.hints.map((hint, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 font-medium text-sm mt-0.5">
                      {index + 1}.
                    </span>
                    <span className="text-blue-800 text-sm">{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expected Output (for reference) */}
      {question.programQuestion?.expectedOutput && (
        <div className="mb-6">
          <button
            onClick={() => setShowExpectedOutput(!showExpectedOutput)}
            className="flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors"
          >
            <Eye size={16} />
            <span className="font-medium">
              {showExpectedOutput ? 'Hide Expected Output' : 'Show Expected Output'}
            </span>
          </button>
          
          {showExpectedOutput && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-800">
                <span className="font-medium">Expected Output:</span>
                <div className="mt-2 bg-white rounded p-3 font-mono text-sm">
                  {question.programQuestion.expectedOutput}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Answer Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Answer:
        </label>
        <textarea
          value={userAnswer}
          onChange={handleAnswerChange}
          placeholder="Enter your answer here..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={4}
          disabled={isSubmitted}
        />
        <div className="mt-2 text-sm text-gray-500">
          Provide a clear and concise answer based on your analysis of the code.
        </div>
      </div>

      {/* Answer Status (if submitted) */}
      {isSubmitted && (
        <div className="mt-4 p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            {selectedAnswer === question.correctAnswer ? (
              <CheckCircle className="text-green-600" size={20} />
            ) : (
              <XCircle className="text-red-600" size={20} />
            )}
            <span className={`font-medium ${
              selectedAnswer === question.correctAnswer ? 'text-green-600' : 'text-red-600'
            }`}>
              {selectedAnswer === question.correctAnswer ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">Your Answer:</span>
              <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                {selectedAnswer || 'No answer provided'}
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Correct Answer:</span>
              <div className="mt-1 p-2 bg-green-100 rounded text-sm">
                {question.correctAnswer}
              </div>
            </div>
            
            {question.explanation && (
              <div>
                <span className="text-sm font-medium text-gray-600">Explanation:</span>
                <div className="mt-1 p-2 bg-blue-100 rounded text-sm">
                  {question.explanation}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Points */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Points: <span className="font-medium text-gray-700">{question.points}</span>
        </div>
        <div className="text-sm text-gray-500">
          {question.tags && question.tags.length > 0 && (
            <div className="flex gap-1">
              {question.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramQuestion;

