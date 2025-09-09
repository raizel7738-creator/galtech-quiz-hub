const QuizSession = require('../models/QuizSession');
const Question = require('../models/Question');
const Category = require('../models/Category');
const AttemptHistory = require('../models/AttemptHistory');
const { validationResult } = require('express-validator');

// @desc    Start a new quiz session
// @route   POST /api/quiz-sessions/start
// @access  Private (Student)
const startQuizSession = async (req, res) => {
  try {
    const { categoryId, difficulty, timeLimit = 1800, questionCount = 10 } = req.body;
    
    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if user has an active quiz session for this category
    const existingSession = await QuizSession.findOne({
      user: req.user.id,
      category: categoryId,
      status: 'in_progress'
    });
    
    if (existingSession) {
      // Check if existing session is expired
      if (existingSession.isExpired()) {
        existingSession.status = 'expired';
        await existingSession.save();
      } else {
        return res.status(400).json({
          success: false,
          message: 'You already have an active quiz session for this category',
          data: {
            sessionId: existingSession.sessionId,
            timeRemaining: existingSession.getTimeRemaining()
          }
        });
      }
    }
    
    // Build query for questions
    const query = {
      category: categoryId,
      status: 'active',
      type: 'mcq'
    };
    
    if (difficulty && difficulty !== 'mixed') {
      query.difficulty = difficulty;
    }
    
    // Get questions
    const allQuestions = await Question.find(query)
      .sort({ createdAt: -1 })
      .limit(questionCount * 2); // Get more questions to allow for shuffling
    
    if (allQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions available for this category'
      });
    }
    
    // Shuffle and select questions
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(questionCount, allQuestions.length));
    
    // Prepare questions for the session (include all necessary data)
    const sessionQuestions = selectedQuestions.map(q => ({
      questionId: q._id,
      questionText: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      points: q.points || 1
    }));
    
    // Create new quiz session
    const sessionId = QuizSession.generateSessionId();
    const newSession = new QuizSession({
      user: req.user.id,
      category: categoryId,
      sessionId,
      questions: sessionQuestions,
      timeLimit,
      timeRemaining: timeLimit,
      difficulty: difficulty || 'mixed',
      settings: {
        shuffleQuestions: true,
        showExplanation: true,
        allowReview: true
      }
    });
    
    await newSession.save();
    
    // Populate the response
    await newSession.populate('category', 'name description');
    await newSession.populate('user', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Quiz session started successfully',
      data: {
        sessionId: newSession.sessionId,
        category: newSession.category,
        totalQuestions: newSession.questions.length,
        timeLimit: newSession.timeLimit,
        timeRemaining: newSession.timeRemaining,
        startedAt: newSession.startedAt,
        questions: newSession.questions.map(q => ({
          questionId: q.questionId,
          questionText: q.questionText,
          options: q.options,
          difficulty: q.difficulty,
          points: q.points
        }))
      }
    });
  } catch (error) {
    console.error('Error starting quiz session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting quiz session'
    });
  }
};

// @desc    Get active quiz session
// @route   GET /api/quiz-sessions/active/:categoryId
// @access  Private (Student)
const getActiveQuizSession = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const session = await QuizSession.findOne({
      user: req.user.id,
      category: categoryId,
      status: 'in_progress'
    }).populate('category', 'name description');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active quiz session found'
      });
    }
    
    // Check if session is expired
    if (session.isExpired()) {
      session.status = 'expired';
      await session.save();
      return res.status(410).json({
        success: false,
        message: 'Quiz session has expired',
        data: {
          sessionId: session.sessionId,
          expiredAt: new Date()
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        category: session.category,
        totalQuestions: session.questions.length,
        timeLimit: session.timeLimit,
        timeRemaining: session.getTimeRemaining(),
        startedAt: session.startedAt,
        answers: session.answers,
        questions: session.questions.map(q => ({
          questionId: q.questionId,
          questionText: q.questionText,
          options: q.options,
          difficulty: q.difficulty,
          points: q.points
        }))
      }
    });
  } catch (error) {
    console.error('Error getting active quiz session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting quiz session'
    });
  }
};

// @desc    Submit answer for a question
// @route   POST /api/quiz-sessions/:sessionId/answer
// @access  Private (Student)
const submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, selectedAnswer, timeSpent = 0 } = req.body;
    
    // Find the quiz session
    const session = await QuizSession.findOne({
      sessionId,
      user: req.user.id,
      status: 'in_progress'
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Quiz session not found or not active'
      });
    }
    
    // Check if session is expired
    if (session.isExpired()) {
      session.status = 'expired';
      await session.save();
      return res.status(410).json({
        success: false,
        message: 'Quiz session has expired'
      });
    }
    
    // Submit the answer
    const answer = session.submitAnswer(questionId, selectedAnswer, timeSpent);
    await session.save();
    
    // Find the question for response
    const question = session.questions.find(q => q.questionId.toString() === questionId.toString());
    
    res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        questionId,
        selectedAnswer,
        isCorrect: answer.isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        timeSpent: answer.timeSpent,
        score: session.score
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting answer'
    });
  }
};

// @desc    Submit quiz session (complete the quiz)
// @route   POST /api/quiz-sessions/:sessionId/submit
// @access  Private (Student)
const submitQuizSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find the quiz session
    const session = await QuizSession.findOne({
      sessionId,
      user: req.user.id,
      status: 'in_progress'
    }).populate('category', 'name description');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Quiz session not found or not active'
      });
    }
    
    // Complete the quiz
    session.completeQuiz();
    await session.save();
    
    // Update question statistics
    for (const answer of session.answers) {
      await Question.findByIdAndUpdate(
        answer.questionId,
        {
          $inc: {
            'stats.totalAttempts': 1,
            'stats.correctAttempts': answer.isCorrect ? 1 : 0
          }
        }
      );
    }
    
    // Create attempt history
    try {
      const questionAnalysis = session.questions.map(question => {
        const answer = session.answers.find(a => 
          a.questionId.toString() === question.questionId.toString()
        );
        
        return {
          questionId: question.questionId,
          questionText: question.questionText,
          difficulty: question.difficulty,
          points: question.points,
          selectedAnswer: answer ? answer.selectedAnswer : null,
          correctAnswer: question.correctAnswer,
          isCorrect: answer ? answer.isCorrect : false,
          timeSpent: answer ? answer.timeSpent : 0,
          wasSkipped: !answer
        };
      });
      
      const attemptHistory = new AttemptHistory({
        user: req.user.id,
        quizSession: session._id,
        category: session.category._id,
        sessionId: session.sessionId,
        completedAt: session.completedAt,
        duration: session.duration,
        status: session.status,
        score: session.score,
        questionAnalysis
      });
      
      attemptHistory.calculatePerformanceMetrics();
      await attemptHistory.save();
    } catch (historyError) {
      console.error('Error creating attempt history:', historyError);
      // Don't fail the quiz submission if history creation fails
    }
    
    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        sessionId: session.sessionId,
        category: session.category,
        score: session.score,
        duration: session.duration,
        completedAt: session.completedAt,
        answers: session.answers.map(answer => {
          const question = session.questions.find(q => q.questionId.toString() === answer.questionId.toString());
          return {
            questionId: answer.questionId,
            questionText: question.questionText,
            selectedAnswer: answer.selectedAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect: answer.isCorrect,
            explanation: question.explanation,
            timeSpent: answer.timeSpent,
            points: question.points
          };
        })
      }
    });
  } catch (error) {
    console.error('Error submitting quiz session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting quiz session'
    });
  }
};

// @desc    Get quiz session results
// @route   GET /api/quiz-sessions/:sessionId/results
// @access  Private (Student)
const getQuizResults = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await QuizSession.findOne({
      sessionId,
      user: req.user.id,
      status: { $in: ['completed', 'abandoned', 'expired'] }
    }).populate('category', 'name description');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Quiz session not found or not completed'
      });
    }
    
    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        category: session.category,
        score: session.score,
        duration: session.duration,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        status: session.status,
        answers: session.answers.map(answer => {
          const question = session.questions.find(q => q.questionId.toString() === answer.questionId.toString());
          return {
            questionId: answer.questionId,
            questionText: question.questionText,
            options: question.options,
            selectedAnswer: answer.selectedAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect: answer.isCorrect,
            explanation: question.explanation,
            timeSpent: answer.timeSpent,
            points: question.points,
            difficulty: question.difficulty
          };
        })
      }
    });
  } catch (error) {
    console.error('Error getting quiz results:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting quiz results'
    });
  }
};

// @desc    Get user's quiz history
// @route   GET /api/quiz-sessions/history
// @access  Private (Student)
const getQuizHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status } = req.query;
    
    // Build query
    const query = {
      user: req.user.id,
      status: { $in: ['completed', 'abandoned', 'expired'] }
    };
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get quiz sessions
    const sessions = await QuizSession.find(query)
      .populate('category', 'name description')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const totalSessions = await QuizSession.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          sessionId: session.sessionId,
          category: session.category,
          score: session.score,
          duration: session.duration,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          status: session.status
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSessions / parseInt(limit)),
          totalSessions,
          hasNext: skip + sessions.length < totalSessions,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting quiz history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting quiz history'
    });
  }
};

// @desc    Abandon quiz session
// @route   POST /api/quiz-sessions/:sessionId/abandon
// @access  Private (Student)
const abandonQuizSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await QuizSession.findOne({
      sessionId,
      user: req.user.id,
      status: 'in_progress'
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Quiz session not found or not active'
      });
    }
    
    session.abandonQuiz();
    await session.save();
    
    res.json({
      success: true,
      message: 'Quiz session abandoned',
      data: {
        sessionId: session.sessionId,
        score: session.score,
        duration: session.duration
      }
    });
  } catch (error) {
    console.error('Error abandoning quiz session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while abandoning quiz session'
    });
  }
};

module.exports = {
  startQuizSession,
  getActiveQuizSession,
  submitAnswer,
  submitQuizSession,
  getQuizResults,
  getQuizHistory,
  abandonQuizSession
};
