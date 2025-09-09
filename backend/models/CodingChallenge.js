const mongoose = require('mongoose');

const CodingChallengeSchema = new mongoose.Schema({
  // Basic challenge information
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Challenge description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  
  // Problem statement
  problemStatement: {
    type: String,
    required: [true, 'Problem statement is required'],
    trim: true,
    maxlength: [10000, 'Problem statement cannot exceed 10000 characters']
  },
  
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  // Points for completion
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1'],
    max: [100, 'Points cannot exceed 100']
  },
  
  // Time limit (in minutes, 0 means no limit)
  timeLimit: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Sample input and output
  sampleInput: {
    type: String,
    trim: true,
    maxlength: [2000, 'Sample input cannot exceed 2000 characters']
  },
  
  sampleOutput: {
    type: String,
    trim: true,
    maxlength: [2000, 'Sample output cannot exceed 2000 characters']
  },
  
  // Expected solution (for reference, not shown to students)
  expectedSolution: {
    type: String,
    trim: true,
    maxlength: [5000, 'Expected solution cannot exceed 5000 characters']
  },
  
  // Hints for students
  hints: [{
    type: String,
    trim: true,
    maxlength: [500, 'Hint cannot exceed 500 characters']
  }],
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Category reference
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  
  // Created by (admin)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Challenge statistics
  stats: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    approvedSubmissions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageTimeSpent: {
      type: Number,
      default: 0 // in minutes
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

// Index for better query performance
CodingChallengeSchema.index({ category: 1, status: 1 });
CodingChallengeSchema.index({ difficulty: 1 });
CodingChallengeSchema.index({ createdAt: -1 });

// Virtual for approval rate
CodingChallengeSchema.virtual('approvalRate').get(function() {
  if (this.stats.totalSubmissions === 0) return 0;
  return Math.round((this.stats.approvedSubmissions / this.stats.totalSubmissions) * 100);
});

// Method to update statistics
CodingChallengeSchema.methods.updateStats = function(score, timeSpent) {
  this.stats.totalSubmissions += 1;
  if (score >= 80) {
    this.stats.approvedSubmissions += 1;
  }
  
  // Update average score
  const totalScore = this.stats.averageScore * (this.stats.totalSubmissions - 1) + score;
  this.stats.averageScore = Math.round(totalScore / this.stats.totalSubmissions);
  
  // Update average time
  const totalTime = this.stats.averageTimeSpent * (this.stats.totalSubmissions - 1) + timeSpent;
  this.stats.averageTimeSpent = Math.round(totalTime / this.stats.totalSubmissions);
  
  return this.save();
};

// Method to get formatted challenge for students
CodingChallengeSchema.methods.getStudentVersion = function() {
  const challengeObj = this.toObject();
  delete challengeObj.expectedSolution;
  delete challengeObj.stats;
  delete challengeObj.createdBy;
  return challengeObj;
};

// Update timestamp on save
CodingChallengeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CodingChallenge', CodingChallengeSchema);