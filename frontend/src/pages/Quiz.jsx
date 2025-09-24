import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, CheckCircle, AlertCircle, Loader, Play, Trophy, Target, Zap, Star, BookOpen } from 'lucide-react';
import { questionsAPI, categoriesAPI } from '../services/api';
import QuizQuestion from '../components/QuizQuestion';
import '../styles/Quiz.css';

const Quiz = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, [categoryId]);

  useEffect(() => {
    let timer;
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, timeRemaining]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoryResponse = await categoriesAPI.getCategoryById(categoryId);
      if (!categoryResponse.success) {
        throw new Error(categoryResponse.message || 'Failed to fetch category');
      }
      setCategory(categoryResponse.data);

      const questionsResponse = await questionsAPI.getQuestionsByCategory(categoryId);
      if (!questionsResponse.success) {
        throw new Error(questionsResponse.message || 'Failed to fetch questions');
      }

      const fetchedQuestions = questionsResponse.data || [];
      if (fetchedQuestions.length === 0) {
        throw new Error('No questions available for this category');
      }

      setQuestions(fetchedQuestions);
      const duration = fetchedQuestions.length * 90;
      setTimeRemaining(duration);
      setTotalTime(duration);

    } catch (error) {
      console.error('Error fetching quiz data:', error);
      setError(error.message || 'Failed to load quiz data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const handleQuizSubmit = async () => {
    setQuizCompleted(true);
    
    let correctAnswers = 0;
    const totalQuestions = questions.length;
    
    questions.forEach(question => {
      const userAnswer = answers[question._id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const timeTaken = totalTime - timeRemaining;

    const quizResults = {
      correctAnswers,
      totalQuestions,
      percentage,
      timeTaken,
      category: category.name
    };

    setResults(quizResults);
    setShowResults(true);

    const quizAttempt = {
      sessionId: Date.now().toString(),
      category,
      score: { percentage, correct: correctAnswers, total: totalQuestions },
      timeTaken,
      completedAt: new Date().toISOString()
    };

    const existingAttempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
    existingAttempts.push(quizAttempt);
    localStorage.setItem('quizAttempts', JSON.stringify(existingAttempts));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="modern-quiz-page">
        <div className="quiz-hero">
          <div className="hero-background">
            <div className="hero-shapes">
              <div className="hero-shape hero-shape-1"></div>
              <div className="hero-shape hero-shape-2"></div>
            </div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">Loading Quiz</h1>
            <p className="hero-subtitle">Preparing your learning experience...</p>
          </div>
        </div>
        <div className="quiz-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-quiz-page">
        <div className="quiz-hero">
          <div className="hero-background">
            <div className="hero-shapes">
              <div className="hero-shape hero-shape-1"></div>
              <div className="hero-shape hero-shape-2"></div>
            </div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">Quiz Error</h1>
            <p className="hero-subtitle">Something went wrong loading your quiz</p>
          </div>
        </div>
        <div className="quiz-container">
          <div className="error-state">
            <div className="error-icon">
              <AlertCircle size={64} />
            </div>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={() => navigate('/categories')} className="primary-btn">
                <ArrowLeft size={20} />
                Back to Categories
              </button>
              <button onClick={fetchQuizData} className="secondary-btn">
                <Target size={20} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="modern-quiz-page">
        <div className="quiz-hero">
          <div className="hero-background">
            <div className="hero-shapes">
              <div className="hero-shape hero-shape-1"></div>
              <div className="hero-shape hero-shape-2"></div>
              <div className="hero-shape hero-shape-3"></div>
            </div>
          </div>
          <div className="hero-content">
            <div className="quiz-badge">
              <BookOpen size={20} />
              <span>Ready to Learn?</span>
            </div>
            <h1 className="hero-title">{category?.name} Quiz</h1>
            <p className="hero-subtitle">{category?.description}</p>
          </div>
        </div>

        <div className="quiz-container">
          <div className="quiz-start-card">
            <div className="quiz-stats-grid">
              <div className="stat-item">
                <div className="stat-icon questions-icon">
                  <Target size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{questions.length}</div>
                  <div className="stat-label">Questions</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon time-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{formatTime(totalTime)}</div>
                  <div className="stat-label">Duration</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon difficulty-icon">
                  <Zap size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{category?.difficulty || 'Medium'}</div>
                  <div className="stat-label">Difficulty</div>
                </div>
              </div>
            </div>

            <div className="quiz-actions">
              <button onClick={() => navigate('/categories')} className="back-btn">
                <ArrowLeft size={20} />
                Back to Categories
              </button>
              <button onClick={handleStartQuiz} className="start-quiz-btn">
                <Play size={20} />
                Start Quiz
                <Zap size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="modern-quiz-page">
        <div className="quiz-hero">
          <div className="hero-background">
            <div className="hero-shapes">
              <div className="hero-shape hero-shape-1"></div>
              <div className="hero-shape hero-shape-2"></div>
            </div>
          </div>
          <div className="hero-content">
            <div className="quiz-badge">
              <Trophy size={20} />
              <span>Quiz Complete!</span>
            </div>
            <h1 className="hero-title">Great Job!</h1>
            <p className="hero-subtitle">You've completed the {category?.name} quiz</p>
          </div>
        </div>

        <div className="quiz-container">
          <div className="quiz-start-card">
            <div className="quiz-stats-grid">
              <div className="stat-item">
                <div className="stat-icon questions-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{results?.percentage}%</div>
                  <div className="stat-label">Score</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon time-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{formatTime(results?.timeTaken || 0)}</div>
                  <div className="stat-label">Time Taken</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon difficulty-icon">
                  <Target size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{results?.correctAnswers}/{results?.totalQuestions}</div>
                  <div className="stat-label">Correct</div>
                </div>
              </div>
            </div>

            <div className="quiz-actions">
              <button onClick={() => navigate('/categories')} className="back-btn">
                <ArrowLeft size={20} />
                More Quizzes
              </button>
              <button onClick={() => window.location.reload()} className="start-quiz-btn">
                <Target size={20} />
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="modern-quiz-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="quiz-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          
          <div className="quiz-timer">
            <Clock size={20} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <QuizQuestion
          question={currentQuestion}
          selectedAnswer={answers[currentQuestion?._id]}
          onAnswerSelect={(answer) => handleAnswerSelect(currentQuestion._id, answer)}
        />

        <div className="quiz-navigation">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="nav-btn prev-btn"
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button onClick={handleQuizSubmit} className="nav-btn submit-btn">
              <CheckCircle size={20} />
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="nav-btn next-btn"
            >
              Next
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;