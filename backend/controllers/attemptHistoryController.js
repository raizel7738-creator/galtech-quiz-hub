const AttemptHistory = require('../models/AttemptHistory');
const QuizSession = require('../models/QuizSession');
const Category = require('../models/Category');
const User = require('../models/User');

// @desc    Create attempt history from quiz session
// @route   POST /api/attempt-history/create
// @access  Private (Student)
const createAttemptHistory = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // Find the completed quiz session
    const quizSession = await QuizSession.findOne({
      sessionId,
      user: req.user.id,
      status: { $in: ['completed', 'abandoned', 'expired'] }
    }).populate('category', 'name description');
    
    if (!quizSession) {
      return res.status(404).json({
        success: false,
        message: 'Quiz session not found or not completed'
      });
    }
    
    // Check if attempt history already exists
    const existingHistory = await AttemptHistory.findOne({ sessionId });
    if (existingHistory) {
      return res.status(400).json({
        success: false,
        message: 'Attempt history already exists for this session'
      });
    }
    
    // Create detailed question analysis
    const questionAnalysis = quizSession.questions.map(question => {
      const answer = quizSession.answers.find(a => 
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
    
    // Create attempt history
    const attemptHistory = new AttemptHistory({
      user: req.user.id,
      quizSession: quizSession._id,
      category: quizSession.category._id,
      sessionId: quizSession.sessionId,
      completedAt: quizSession.completedAt,
      duration: quizSession.duration,
      status: quizSession.status,
      score: quizSession.score,
      questionAnalysis
    });
    
    // Calculate performance metrics
    attemptHistory.calculatePerformanceMetrics();
    
    // Calculate improvement metrics
    const previousAttempts = await AttemptHistory.find({
      user: req.user.id,
      category: quizSession.category._id,
      completedAt: { $lt: quizSession.completedAt }
    }).sort({ completedAt: -1 }).limit(1);
    
    if (previousAttempts.length > 0) {
      const previous = previousAttempts[0];
      attemptHistory.improvement = {
        comparedToPrevious: {
          scoreChange: attemptHistory.score.percentage - previous.score.percentage,
          timeChange: attemptHistory.duration - previous.duration,
          rankChange: 0 // Will be calculated separately
        },
        personalBest: {
          isPersonalBest: attemptHistory.score.percentage > previous.score.percentage,
          previousBest: previous.score.percentage
        }
      };
    } else {
      attemptHistory.improvement = {
        comparedToPrevious: {
          scoreChange: 0,
          timeChange: 0,
          rankChange: 0
        },
        personalBest: {
          isPersonalBest: true,
          previousBest: 0
        }
      };
    }
    
    await attemptHistory.save();
    
    res.status(201).json({
      success: true,
      message: 'Attempt history created successfully',
      data: attemptHistory
    });
  } catch (error) {
    console.error('Error creating attempt history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating attempt history'
    });
  }
};

// @desc    Get user's attempt history with analytics
// @route   GET /api/attempt-history
// @access  Private (Student)
const getAttemptHistory = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status, 
      sortBy = 'completedAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get attempt history
    const attempts = await AttemptHistory.find(query)
      .populate('category', 'name description')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const totalAttempts = await AttemptHistory.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAttempts / parseInt(limit)),
          totalAttempts,
          hasNext: skip + attempts.length < totalAttempts,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting attempt history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting attempt history'
    });
  }
};

// @desc    Get detailed attempt history by ID
// @route   GET /api/attempt-history/:id
// @access  Private (Student)
const getAttemptDetails = async (req, res) => {
  try {
    const attempt = await AttemptHistory.findById(req.params.id)
      .populate('category', 'name description')
      .populate('user', 'name email');
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt history not found'
      });
    }
    
    // Check if user owns this attempt
    if (attempt.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Error getting attempt details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting attempt details'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/attempt-history/stats
// @access  Private (Student)
const getUserStats = async (req, res) => {
  try {
    const { category } = req.query;
    
    const stats = await AttemptHistory.getUserStats(req.user.id, category);
    
    // Get performance trends for the last 30 days
    const trends = await AttemptHistory.getPerformanceTrends(req.user.id, category, 30);
    
    // Get recent attempts
    const recentAttempts = await AttemptHistory.getRecentAttempts(req.user.id, 5);
    
    res.json({
      success: true,
      data: {
        stats,
        trends,
        recentAttempts
      }
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting user statistics'
    });
  }
};

// @desc    Get category statistics (admin only)
// @route   GET /api/attempt-history/category-stats/:categoryId
// @access  Private (Admin)
const getCategoryStats = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const stats = await AttemptHistory.getCategoryStats(categoryId);
    
    // Get top performers
    const topPerformers = await AttemptHistory.aggregate([
      { $match: { category: new mongoose.Types.ObjectId(categoryId) } },
      {
        $group: {
          _id: '$user',
          averageScore: { $avg: '$score.percentage' },
          totalAttempts: { $sum: 1 },
          bestScore: { $max: '$score.percentage' }
        }
      },
      { $sort: { averageScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          user: { name: 1, email: 1 },
          averageScore: { $round: ['$averageScore', 2] },
          totalAttempts: 1,
          bestScore: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        category: {
          _id: category._id,
          name: category.name,
          description: category.description
        },
        stats,
        topPerformers
      }
    });
  } catch (error) {
    console.error('Error getting category stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting category statistics'
    });
  }
};

// @desc    Get performance analytics
// @route   GET /api/attempt-history/analytics
// @access  Private (Student)
const getPerformanceAnalytics = async (req, res) => {
  try {
    const { category, period = '30' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const matchStage = {
      user: new mongoose.Types.ObjectId(req.user.id),
      completedAt: { $gte: startDate }
    };
    
    if (category) {
      matchStage.category = new mongoose.Types.ObjectId(category);
    }
    
    // Get performance trends
    const trends = await AttemptHistory.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' },
            day: { $dayOfMonth: '$completedAt' }
          },
          averageScore: { $avg: '$score.percentage' },
          attemptCount: { $sum: 1 },
          averageTime: { $avg: '$duration' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get difficulty analysis
    const difficultyAnalysis = await AttemptHistory.aggregate([
      { $match: matchStage },
      { $unwind: '$questionAnalysis' },
      {
        $group: {
          _id: '$questionAnalysis.difficulty',
          totalQuestions: { $sum: 1 },
          correctAnswers: {
            $sum: { $cond: ['$questionAnalysis.isCorrect', 1, 0] }
          },
          averageTime: { $avg: '$questionAnalysis.timeSpent' }
        }
      }
    ]);
    
    // Get time analysis
    const timeAnalysis = await AttemptHistory.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          averageTimePerAttempt: { $avg: '$duration' },
          fastestAttempt: { $min: '$duration' },
          slowestAttempt: { $max: '$duration' },
          averageTimePerQuestion: { $avg: '$performance.averageTimePerQuestion' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        trends,
        difficultyAnalysis,
        timeAnalysis: timeAnalysis[0] || {}
      }
    });
  } catch (error) {
    console.error('Error getting performance analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting performance analytics'
    });
  }
};

// @desc    Export attempt history
// @route   GET /api/attempt-history/export
// @access  Private (Student)
const exportAttemptHistory = async (req, res) => {
  try {
    const { format = 'json', category, startDate, endDate } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    if (category) {
      query.category = category;
    }
    
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }
    
    const attempts = await AttemptHistory.find(query)
      .populate('category', 'name description')
      .sort({ completedAt: -1 });
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = attempts.map(attempt => ({
        'Date': attempt.completedAt.toISOString().split('T')[0],
        'Category': attempt.category.name,
        'Score': `${attempt.score.percentage}%`,
        'Correct': `${attempt.score.correctAnswers}/${attempt.score.totalQuestions}`,
        'Duration': `${Math.floor(attempt.duration / 60)}:${(attempt.duration % 60).toString().padStart(2, '0')}`,
        'Status': attempt.status,
        'Performance Grade': attempt.performanceGrade
      }));
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="quiz-attempts.csv"');
      
      // Simple CSV conversion
      const headers = Object.keys(csvData[0] || {}).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      res.send(csv);
    } else {
      // Return JSON format
      res.json({
        success: true,
        data: {
          attempts,
          exportDate: new Date().toISOString(),
          totalAttempts: attempts.length
        }
      });
    }
  } catch (error) {
    console.error('Error exporting attempt history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting attempt history'
    });
  }
};

module.exports = {
  createAttemptHistory,
  getAttemptHistory,
  getAttemptDetails,
  getUserStats,
  getCategoryStats,
  getPerformanceAnalytics,
  exportAttemptHistory
};

