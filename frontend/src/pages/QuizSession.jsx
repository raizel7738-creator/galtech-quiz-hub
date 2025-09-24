import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizSessionAPI, categoriesAPI, questionsAPI } from '../services/api';
import QuizQuestion from '../components/QuizQuestion';
import ProgramQuestion from '../components/ProgramQuestion';
import LanguageSelector from '../components/LanguageSelector';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Award,
  Trophy,
  Target,
  Timer
} from 'lucide-react';

const QuizSession = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  const timerRef = useRef(null);
  const questionStartTimeRef = useRef(null);

  useEffect(() => {
    initializeQuiz();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [categoryId]);

  useEffect(() => {
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizStarted, quizCompleted, timeRemaining]);

  const initializeQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Initializing quiz for category:', categoryId);

      // Fetch category details
      const categoryResponse = await categoriesAPI.getCategory(categoryId);
      console.log('📡 Category API Response:', categoryResponse);
      
      if (!categoryResponse.success) {
        throw new Error('Category not found');
      }
      setCategory(categoryResponse.data.category);

      // Check for existing active session
      try {
        const activeSessionResponse = await quizSessionAPI.getActiveQuizSession(categoryId);
        if (activeSessionResponse.success) {
          setSession(activeSessionResponse.data);
          setQuizStarted(true);
          setTimeRemaining(activeSessionResponse.data.timeRemaining);
          setCurrentQuestionIndex(activeSessionResponse.data.answers.length);
        }
      } catch (activeSessionError) {
        // No active session found, this is expected for new quizzes
        console.log('No active session found, ready to start new quiz');
      }

    } catch (error) {
      console.error('Error initializing quiz:', error);
      setError(error.message || 'Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    // Check if this is Program-Based Questions and show language selector
    if (category.name === 'Program-Based Questions' && !selectedLanguage) {
      setShowLanguageSelector(true);
      return;
    }

    try {
      setSubmitting(true);
      
      // First try to start a quiz session
      try {
        const sessionData = {
          categoryId,
          difficulty: 'mixed',
          timeLimit: 1800, // 30 minutes
          questionCount: 10
        };

        const response = await quizSessionAPI.startQuizSession(sessionData);
        if (response.success) {
          setSession(response.data);
          setQuizStarted(true);
          setTimeRemaining(response.data.timeLimit);
          questionStartTimeRef.current = Date.now();
          return;
        }
      } catch (sessionError) {
        console.log('Quiz session creation failed, falling back to direct questions API:', sessionError);
      }

      // Determine question type based on category name
      const questionType = category.name === 'Program-Based Questions' ? 'program' : 'mcq';
      
      // Fallback: fetch questions directly and create a local session
      let questionsResponse = await questionsAPI.getQuestionsByCategory(categoryId, {
        limit: 10,
        type: questionType,
        language: selectedLanguage // Filter by selected language for program questions
      });

      if (!questionsResponse.success) {
        throw new Error('Failed to fetch questions');
      }

      let questions = questionsResponse.data.questions;
      
      // If no questions found with language filter, try without language filter
      let languageFallbackUsed = false;
      if (questions.length === 0 && selectedLanguage && questionType === 'program') {
        console.log(`No questions found for language: ${selectedLanguage}, trying without language filter`);
        questionsResponse = await questionsAPI.getQuestionsByCategory(categoryId, {
          limit: 10,
          type: questionType
        });
        
        if (questionsResponse.success) {
          questions = questionsResponse.data.questions;
          languageFallbackUsed = true;
        }
      }
      
      if (questions.length === 0) {
        throw new Error('No questions available for this category');
      }

      // Create a local session object
      console.log('Creating local session with questions:', questions);
      const mappedQuestions = questions.map(q => ({
        questionId: q._id,
        questionText: q.question,
        options: q.options,
        difficulty: q.difficulty,
        points: q.points || 1,
        correctAnswer: q.correctAnswer,
        // ensure type and code snippet available for renderer
        type: q.type || (questionType),
        programQuestion: q.programQuestion
      }));
      console.log('Mapped questions:', mappedQuestions);
      
      const localSession = {
        sessionId: `local_${Date.now()}`,
        questions: mappedQuestions,
        timeLimit: 1800,
        timeRemaining: 1800,
        answers: [],
        languageFallbackUsed: languageFallbackUsed,
        selectedLanguage: selectedLanguage
      };

      setSession(localSession);
      setQuizStarted(true);
      setTimeRemaining(localSession.timeLimit);
      questionStartTimeRef.current = Date.now();

    } catch (error) {
      console.error('Error starting quiz:', error);
      setError(error.message || 'Failed to start quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };

  const handleStartQuizWithLanguage = async (language) => {
    setSelectedLanguage(language);
    setShowLanguageSelector(false);
    await startQuiz();
  };

  const handleAnswerSelect = async (answer) => {
    if (!session || quizCompleted) return;

    try {
      const timeSpent = questionStartTimeRef.current ? 
        Math.floor((Date.now() - questionStartTimeRef.current) / 1000) : 0;

      const answerData = {
        questionId: session.questions[currentQuestionIndex].questionId,
        selectedAnswer: answer,
        timeSpent
      };

      // Check if this is a local session (fallback mode)
      if (session.sessionId.startsWith('local_')) {
        // Handle local session - check if answer is correct
        const currentQuestion = session.questions[currentQuestionIndex];
        console.log('Answer comparison:', {
          selectedAnswer: answer,
          correctAnswer: currentQuestion.correctAnswer,
          isEqual: answer === currentQuestion.correctAnswer
        });
        const isCorrect = answer === currentQuestion.correctAnswer;
        const points = isCorrect ? (currentQuestion.points || 1) : 0;
        
        const newAnswer = {
          ...answerData,
          isCorrect,
          score: points
        };
        
        setSession(prev => {
          const updatedSession = {
            ...prev,
            answers: [...prev.answers, newAnswer]
          };
          console.log('Updated session with new answer:', updatedSession);
          return updatedSession;
        });
        
        // Move to next question
        if (currentQuestionIndex < session.questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          questionStartTimeRef.current = Date.now();
        } else {
          // Last question answered, submit quiz
          handleQuizSubmit();
        }
      } else {
        // Handle real session - call the API
        const response = await quizSessionAPI.submitAnswer(session.sessionId, answerData);
        if (response.success) {
          // Update session with new answer
          setSession(prev => ({
            ...prev,
            answers: [...prev.answers, response.data],
            score: response.data.score
          }));
          
          // Move to next question
          if (currentQuestionIndex < session.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            questionStartTimeRef.current = Date.now();
          } else {
            // Last question answered, submit quiz
            handleQuizSubmit();
          }
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError(error.message || 'Failed to submit answer. Please try again.');
    }
  };

  const handleQuizSubmit = async () => {
    if (!session || quizCompleted) return;

    try {
      setSubmitting(true);
      
      // Check if this is a local session (fallback mode)
      if (session.sessionId.startsWith('local_')) {
        // Handle local session - calculate results locally
        console.log('Calculating local results for session:', session.sessionId);
        console.log('Session questions:', session.questions);
        console.log('Session answers:', session.answers);
        
        const totalQuestions = session.questions.length;
        const answeredQuestions = session.answers.length;
        const correctAnswers = session.answers.filter(answer => answer.isCorrect).length;
        const totalPoints = session.questions.reduce((sum, q) => sum + (q.points || 1), 0);
        const earnedPoints = session.answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        console.log('Results calculation:', {
          totalQuestions,
          answeredQuestions,
          correctAnswers,
          totalPoints,
          earnedPoints,
          score
        });
        
        const localResults = {
          sessionId: session.sessionId,
          totalQuestions,
          answeredQuestions,
          correctAnswers,
          totalPoints,
          earnedPoints,
          percentage: score,
          timeSpent: session.timeLimit - timeRemaining,
          completedAt: new Date().toISOString(),
          questions: session.questions.map((q, index) => ({
            questionId: q.questionId,
            questionText: q.questionText,
            selectedAnswer: session.answers[index]?.selectedAnswer || null,
            isCorrect: session.answers[index]?.isCorrect || false,
            timeSpent: session.answers[index]?.timeSpent || 0
          }))
        };
        
        // Wrap in score object to match UI expectations
        setResults({ score: localResults });
        setQuizCompleted(true);
        setShowResults(true);
        setTimeRemaining(0);
        
        // Save to localStorage for dashboard tracking
        const quizAttempt = {
          id: localResults.sessionId,
          category: category.name,
          score: localResults.percentage,
          points: localResults.earnedPoints,
          totalPoints: localResults.totalPoints,
          correctAnswers: localResults.correctAnswers,
          totalQuestions: localResults.totalQuestions,
          timeSpent: localResults.timeSpent,
          completedAt: localResults.completedAt
        };
        
        const existingAttempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
        existingAttempts.push(quizAttempt);
        localStorage.setItem('quizAttempts', JSON.stringify(existingAttempts));
        
        console.log('💾 Saved quiz attempt to localStorage:', quizAttempt);
      } else {
        // Handle real session - call the API
        const response = await quizSessionAPI.submitQuizSession(session.sessionId);
        if (response.success) {
          setResults(response.data);
          setQuizCompleted(true);
          setShowResults(true);
          setTimeRemaining(0);
        } else {
          throw new Error(response.message || 'Failed to submit quiz');
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError(error.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    questionStartTimeRef.current = Date.now();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great job! Well done!';
    if (percentage >= 70) return 'Good work! Keep it up!';
    if (percentage >= 60) return 'Not bad! Room for improvement.';
    return 'Keep practicing! You can do better!';
  };

  const getScoreIcon = (percentage) => {
    if (percentage >= 90) return <Trophy className="text-yellow-500" size={48} />;
    if (percentage >= 80) return <Award className="text-green-500" size={48} />;
    if (percentage >= 60) return <Target className="text-blue-500" size={48} />;
    return <AlertCircle className="text-red-500" size={48} />;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-4xl mt-10">
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-blue-600" size={48} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-4xl mt-10">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/categories')}
            className="btn btn-primary"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  // Show language selector for Program-Based Questions
  if (showLanguageSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="container mx-auto px-4">
          <LanguageSelector
            onLanguageSelect={handleLanguageSelect}
            onStartQuiz={handleStartQuizWithLanguage}
          />
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-4xl mt-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {category?.name} Quiz
          </h1>
          <p className="text-gray-600 mb-6">{category?.description}</p>
          
          {selectedLanguage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-800">
                <CheckCircle size={20} />
                <span className="font-medium">Selected Language: {selectedLanguage.toUpperCase()}</span>
              </div>
            </div>
          )}
          
          {session?.languageFallbackUsed && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-yellow-800">
                <AlertCircle size={20} />
                <span className="font-medium">
                  Limited {selectedLanguage?.toUpperCase()} questions available. 
                  Quiz includes questions from other programming languages.
                </span>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">10</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">30:00</div>
                <div className="text-sm text-gray-600">Time Limit</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">10</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-yellow-800">
              <Timer size={20} />
              <span className="font-medium">Quiz Rules:</span>
            </div>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• You have 30 minutes to complete the quiz</li>
              <li>• Each question has only one correct answer</li>
              <li>• You can navigate between questions freely</li>
              <li>• Your progress is saved automatically</li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={startQuiz}
              disabled={submitting}
              className="btn btn-primary text-lg px-8 py-3 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Starting Quiz...
                </>
              ) : (
                'Start Quiz'
              )}
            </button>
            <div>
              <button
                onClick={() => navigate('/categories')}
                className="btn btn-secondary"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Categories
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    // Handle both local session results and API results
    const score = results.score || results;
    const percentage = score.percentage || 0;
    const correctAnswers = score.correctAnswers || 0;
    const totalQuestions = score.totalQuestions || 0;
    const earnedPoints = score.earnedPoints || 0;
    const totalPoints = score.totalPoints || 0;
    const timeSpent = score.timeSpent || results.duration || 0;
    
    return (
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-4xl mt-10">
        <div className="text-center">
          {getScoreIcon(percentage)}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
          <p className="text-gray-600 mb-6">{getScoreMessage(percentage)}</p>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6 border border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                  {percentage}%
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {correctAnswers}/{totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {earnedPoints}/{totalPoints}
                </div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(timeSpent)}
                </div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/categories')}
              className="btn btn-primary"
            >
              Take Another Quiz
            </button>
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !session.questions) {
    return (
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-4xl mt-10">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Quiz Session</h2>
          <p className="text-gray-600 mb-4">Unable to load quiz session. Please try again.</p>
          <button
            onClick={() => navigate('/categories')}
            className="btn btn-primary"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const currentAnswer = session.answers.find(a => 
    a.questionId.toString() === currentQuestion.questionId.toString()
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl mt-10">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{category?.name} Quiz</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {session.questions.length}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-lg font-mono">
              <Clock size={20} className="mr-2" />
              <span className={timeRemaining <= 60 ? 'text-red-600 font-bold' : 'text-gray-600'}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            <button
              onClick={handleQuizSubmit}
              disabled={submitting}
              className="btn btn-primary disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {session.questions.map((_, index) => {
            const isAnswered = session.answers.some(a => 
              a.questionId.toString() === session.questions[index].questionId.toString()
            );
            return (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : isAnswered
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question */}
      {/** If the question has options, render standard MCQ component even for program type */}
      {(currentQuestion.options && currentQuestion.options.length > 0) ? (
        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={session.questions.length}
          selectedAnswer={currentAnswer?.selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          timeRemaining={timeRemaining}
          isSubmitted={false}
        />
      ) : (
        <ProgramQuestion
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={session.questions.length}
          selectedAnswer={currentAnswer?.selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          timeRemaining={timeRemaining}
          isSubmitted={false}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={goToPreviousQuestion}
          disabled={isFirstQuestion}
          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={20} className="mr-2" />
          Previous
        </button>
        
        <button
          onClick={isLastQuestion ? handleQuizSubmit : goToNextQuestion}
          disabled={submitting}
          className="btn btn-primary disabled:opacity-50"
        >
          {isLastQuestion ? (
            <>
              {submitting ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Quiz
                  <CheckCircle size={20} className="ml-2" />
                </>
              )}
            </>
          ) : (
            <>
              Next
              <ArrowRight size={20} className="ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizSession;
