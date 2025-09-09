const mongoose = require('mongoose');

const QuizSessionSchema = new mongoose.Schema({
  // User who took the quiz
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // Category of the quiz
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  
  // Quiz session details
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Questions in this quiz session
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    questionText: String,
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,
    explanation: String,
    difficulty: String,
    points: Number
  }],
  
  // User's answers
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    selectedAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number, // in seconds
    answeredAt: Date
  }],
  
  // Quiz session status
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned', 'expired'],
    default: 'in_progress'
  },
  
  // Timing information
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: {
    type: Date
  },
  
  timeLimit: {
    type: Number,
    default: 1800 // 30 minutes in seconds
  },
  
  timeRemaining: {
    type: Number,
    default: 1800
  },
  
  // Scoring information
  score: {
    totalQuestions: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    incorrectAnswers: {
      type: Number,
      default: 0
    },
    unansweredQuestions: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    earnedPoints: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  
  // Additional metadata
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  
  // Session settings
  settings: {
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    showExplanation: {
      type: Boolean,
      default: true
    },
    allowReview: {
      type: Boolean,
      default: true
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update timestamps
QuizSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
QuizSessionSchema.index({ user: 1, status: 1 });
QuizSessionSchema.index({ category: 1, status: 1 });
QuizSessionSchema.index({ startedAt: -1 });

// Virtual for duration
QuizSessionSchema.virtual('duration').get(function() {
  if (this.completedAt && this.startedAt) {
    return Math.floor((this.completedAt - this.startedAt) / 1000); // in seconds
  }
  return null;
});

// Method to calculate score
QuizSessionSchema.methods.calculateScore = function() {
  const totalQuestions = this.questions.length;
  const correctAnswers = this.answers.filter(answer => answer.isCorrect).length;
  const incorrectAnswers = this.answers.filter(answer => !answer.isCorrect).length;
  const unansweredQuestions = totalQuestions - this.answers.length;
  
  const totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  const earnedPoints = this.answers
    .filter(answer => answer.isCorrect)
    .reduce((sum, answer) => {
      const question = this.questions.find(q => q.questionId.toString() === answer.questionId.toString());
      return sum + (question ? question.points || 1 : 0);
    }, 0);
  
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  this.score = {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    totalPoints,
    earnedPoints,
    percentage
  };
  
  return this.score;
};

// Method to check if session is expired
QuizSessionSchema.methods.isExpired = function() {
  const now = new Date();
  const elapsed = (now - this.startedAt) / 1000; // in seconds
  return elapsed > this.timeLimit;
};

// Method to get time remaining
QuizSessionSchema.methods.getTimeRemaining = function() {
  const now = new Date();
  const elapsed = (now - this.startedAt) / 1000; // in seconds
  const remaining = this.timeLimit - elapsed;
  return Math.max(0, Math.floor(remaining));
};

// Method to submit answer
QuizSessionSchema.methods.submitAnswer = function(questionId, selectedAnswer, timeSpent = 0) {
  // Find the question
  const question = this.questions.find(q => q.questionId.toString() === questionId.toString());
  if (!question) {
    throw new Error('Question not found in this quiz session');
  }
  
  // Check if already answered
  const existingAnswer = this.answers.find(a => a.questionId.toString() === questionId.toString());
  if (existingAnswer) {
    // Update existing answer
    existingAnswer.selectedAnswer = selectedAnswer;
    existingAnswer.isCorrect = selectedAnswer === question.correctAnswer;
    existingAnswer.timeSpent = timeSpent;
    existingAnswer.answeredAt = new Date();
  } else {
    // Add new answer
    this.answers.push({
      questionId,
      selectedAnswer,
      isCorrect: selectedAnswer === question.correctAnswer,
      timeSpent,
      answeredAt: new Date()
    });
  }
  
  // Recalculate score
  this.calculateScore();
  
  return this.answers.find(a => a.questionId.toString() === questionId.toString());
};

// Method to complete the quiz
QuizSessionSchema.methods.completeQuiz = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.timeRemaining = this.getTimeRemaining();
  this.calculateScore();
  return this;
};

// Method to abandon the quiz
QuizSessionSchema.methods.abandonQuiz = function() {
  this.status = 'abandoned';
  this.completedAt = new Date();
  this.timeRemaining = this.getTimeRemaining();
  this.calculateScore();
  return this;
};

// Static method to generate session ID
QuizSessionSchema.statics.generateSessionId = function() {
  return 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

module.exports = mongoose.model('QuizSession', QuizSessionSchema);
