const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  // Basic question information
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [1000, 'Question cannot be more than 1000 characters']
  },
  
  // Question type and category
  type: {
    type: String,
    enum: ['mcq', 'program', 'coding'],
    default: 'mcq'
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  
  // Difficulty and points
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1'],
    max: [100, 'Points cannot exceed 100']
  },
  
  // MCQ specific fields
  options: [{
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
      maxlength: [500, 'Option text cannot be more than 500 characters']
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  
  // Program-based question specific fields
  programQuestion: {
    // Code snippet or program logic to analyze
    codeSnippet: {
      type: String,
      trim: true,
      maxlength: [2000, 'Code snippet cannot be more than 2000 characters']
    },
    
    // Programming language
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'rust', 'pseudocode'],
      default: 'javascript'
    },
    
    // Expected output or behavior
    expectedOutput: {
      type: String,
      trim: true,
      maxlength: [1000, 'Expected output cannot be more than 1000 characters']
    },
    
    // Test cases or scenarios
    testCases: [{
      input: {
        type: String,
        trim: true,
        maxlength: [500, 'Test case input cannot be more than 500 characters']
      },
      expectedOutput: {
        type: String,
        trim: true,
        maxlength: [500, 'Test case output cannot be more than 500 characters']
      },
      description: {
        type: String,
        trim: true,
        maxlength: [200, 'Test case description cannot be more than 200 characters']
      }
    }],
    
    // Code analysis type
    analysisType: {
      type: String,
      enum: ['output', 'error', 'complexity', 'logic', 'syntax', 'behavior'],
      default: 'output'
    },
    
    // Hints for the question
    hints: [{
      type: String,
      trim: true,
      maxlength: [300, 'Hint cannot be more than 300 characters']
    }]
  },
  
  // Correct answer (for MCQ, this should match one of the options)
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    trim: true
  },
  
  // Explanation for the answer
  explanation: {
    type: String,
    trim: true,
    maxlength: [1000, 'Explanation cannot be more than 1000 characters']
  },
  
  // Question metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  
  // Status and timestamps
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  
  // Created by (admin who created the question)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Question statistics (for analytics)
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    correctAttempts: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0 // in seconds
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

// Validation: Ensure proper structure based on question type
QuestionSchema.pre('save', function(next) {
  if (this.type === 'mcq') {
    // MCQ validation
    if (this.options.length < 2) {
      return next(new Error('MCQ questions must have at least 2 options'));
    }
    
    const correctOptions = this.options.filter(option => option.isCorrect);
    if (correctOptions.length !== 1) {
      return next(new Error('MCQ questions must have exactly one correct option'));
    }
  } else if (this.type === 'program') {
    // Program-based question validation
    if (!this.programQuestion || !this.programQuestion.codeSnippet) {
      return next(new Error('Program-based questions must have a code snippet'));
    }
    
    if (!this.programQuestion.expectedOutput) {
      return next(new Error('Program-based questions must have expected output'));
    }
  }
  
  // Update timestamp
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
QuestionSchema.index({ category: 1, status: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ type: 1 });
QuestionSchema.index({ createdAt: -1 });

// Virtual for success rate
QuestionSchema.virtual('successRate').get(function() {
  if (this.stats.totalAttempts === 0) return 0;
  return Math.round((this.stats.correctAttempts / this.stats.totalAttempts) * 100);
});

// Method to update statistics
QuestionSchema.methods.updateStats = function(isCorrect, timeSpent) {
  this.stats.totalAttempts += 1;
  if (isCorrect) {
    this.stats.correctAttempts += 1;
  }
  
  // Update average time (simple moving average)
  const totalTime = this.stats.averageTime * (this.stats.totalAttempts - 1) + timeSpent;
  this.stats.averageTime = Math.round(totalTime / this.stats.totalAttempts);
  
  return this.save();
};

// Method to get formatted question for students (without correct answer)
QuestionSchema.methods.getStudentVersion = function() {
  const questionObj = this.toObject();
  delete questionObj.correctAnswer;
  delete questionObj.explanation;
  delete questionObj.stats;
  delete questionObj.createdBy;
  return questionObj;
};

module.exports = mongoose.model('Question', QuestionSchema);
