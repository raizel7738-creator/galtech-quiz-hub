const mongoose = require('mongoose');

const AttemptHistorySchema = new mongoose.Schema({
  // User who took the quiz
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // Quiz session reference
  quizSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizSession',
    required: [true, 'Quiz session is required']
  },
  
  // Category of the quiz
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  
  // Session details
  sessionId: {
    type: String,
    required: true
  },
  
  // Quiz completion details
  completedAt: {
    type: Date,
    required: true
  },
  
  duration: {
    type: Number, // in seconds
    required: true
  },
  
  status: {
    type: String,
    enum: ['completed', 'abandoned', 'expired'],
    required: true
  },
  
  // Detailed scoring information
  score: {
    totalQuestions: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      required: true
    },
    incorrectAnswers: {
      type: Number,
      required: true
    },
    unansweredQuestions: {
      type: Number,
      required: true
    },
    totalPoints: {
      type: Number,
      required: true
    },
    earnedPoints: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    }
  },
  
  // Performance metrics
  performance: {
    averageTimePerQuestion: {
      type: Number, // in seconds
      default: 0
    },
    fastestQuestion: {
      type: Number, // in seconds
      default: 0
    },
    slowestQuestion: {
      type: Number, // in seconds
      default: 0
    },
    difficultyBreakdown: {
      easy: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      },
      medium: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      },
      hard: {
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 }
      }
    }
  },
  
  // Question-wise analysis
  questionAnalysis: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    questionText: String,
    difficulty: String,
    points: Number,
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number, // in seconds
    wasSkipped: {
      type: Boolean,
      default: false
    }
  }],
  
  // Improvement tracking
  improvement: {
    comparedToPrevious: {
      scoreChange: Number, // percentage point change
      timeChange: Number, // seconds change
      rankChange: Number // position change among all attempts
    },
    personalBest: {
      isPersonalBest: Boolean,
      previousBest: Number
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
AttemptHistorySchema.index({ user: 1, completedAt: -1 });
AttemptHistorySchema.index({ category: 1, completedAt: -1 });
AttemptHistorySchema.index({ user: 1, category: 1 });
AttemptHistorySchema.index({ sessionId: 1 });

// Virtual for performance grade
AttemptHistorySchema.virtual('performanceGrade').get(function() {
  const percentage = this.score.percentage;
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D+';
  if (percentage >= 40) return 'D';
  return 'F';
});

// Virtual for time efficiency
AttemptHistorySchema.virtual('timeEfficiency').get(function() {
  const avgTimePerQuestion = this.performance.averageTimePerQuestion;
  if (avgTimePerQuestion <= 30) return 'Excellent';
  if (avgTimePerQuestion <= 60) return 'Good';
  if (avgTimePerQuestion <= 90) return 'Average';
  if (avgTimePerQuestion <= 120) return 'Slow';
  return 'Very Slow';
});

// Method to calculate performance metrics
AttemptHistorySchema.methods.calculatePerformanceMetrics = function() {
  if (this.questionAnalysis.length === 0) return;
  
  const times = this.questionAnalysis.map(q => q.timeSpent).filter(t => t > 0);
  const difficulties = { easy: 0, medium: 0, hard: 0 };
  const difficultyCorrect = { easy: 0, medium: 0, hard: 0 };
  
  this.questionAnalysis.forEach(q => {
    if (q.difficulty && difficulties.hasOwnProperty(q.difficulty)) {
      difficulties[q.difficulty]++;
      if (q.isCorrect) {
        difficultyCorrect[q.difficulty]++;
      }
    }
  });
  
  this.performance = {
    averageTimePerQuestion: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
    fastestQuestion: times.length > 0 ? Math.min(...times) : 0,
    slowestQuestion: times.length > 0 ? Math.max(...times) : 0,
    difficultyBreakdown: {
      easy: { attempted: difficulties.easy, correct: difficultyCorrect.easy },
      medium: { attempted: difficulties.medium, correct: difficultyCorrect.medium },
      hard: { attempted: difficulties.hard, correct: difficultyCorrect.hard }
    }
  };
};

// Static method to get user statistics
AttemptHistorySchema.statics.getUserStats = async function(userId, categoryId = null) {
  const matchStage = { user: new mongoose.Types.ObjectId(userId) };
  if (categoryId) {
    matchStage.category = new mongoose.Types.ObjectId(categoryId);
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score.percentage' },
        bestScore: { $max: '$score.percentage' },
        worstScore: { $min: '$score.percentage' },
        totalTimeSpent: { $sum: '$duration' },
        averageTimePerAttempt: { $avg: '$duration' },
        completedAttempts: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        abandonedAttempts: {
          $sum: { $cond: [{ $eq: ['$status', 'abandoned'] }, 1, 0] }
        },
        expiredAttempts: {
          $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    worstScore: 0,
    totalTimeSpent: 0,
    averageTimePerAttempt: 0,
    completedAttempts: 0,
    abandonedAttempts: 0,
    expiredAttempts: 0
  };
};

// Static method to get category statistics
AttemptHistorySchema.statics.getCategoryStats = async function(categoryId) {
  const stats = await this.aggregate([
    { $match: { category: new mongoose.Types.ObjectId(categoryId) } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        uniqueUsers: { $addToSet: '$user' },
        averageScore: { $avg: '$score.percentage' },
        bestScore: { $max: '$score.percentage' },
        averageTime: { $avg: '$duration' }
      }
    },
    {
      $project: {
        totalAttempts: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        averageScore: { $round: ['$averageScore', 2] },
        bestScore: 1,
        averageTime: { $round: ['$averageTime', 0] }
      }
    }
  ]);
  
  return stats[0] || {
    totalAttempts: 0,
    uniqueUsers: 0,
    averageScore: 0,
    bestScore: 0,
    averageTime: 0
  };
};

// Static method to get recent attempts
AttemptHistorySchema.statics.getRecentAttempts = async function(userId, limit = 10) {
  return this.find({ user: userId })
    .populate('category', 'name description')
    .sort({ completedAt: -1 })
    .limit(limit);
};

// Static method to get performance trends
AttemptHistorySchema.statics.getPerformanceTrends = async function(userId, categoryId = null, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const matchStage = {
    user: new mongoose.Types.ObjectId(userId),
    completedAt: { $gte: startDate }
  };
  
  if (categoryId) {
    matchStage.category = new mongoose.Types.ObjectId(categoryId);
  }
  
  return this.aggregate([
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
};

module.exports = mongoose.model('AttemptHistory', AttemptHistorySchema);

