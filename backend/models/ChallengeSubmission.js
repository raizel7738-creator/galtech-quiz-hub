const mongoose = require('mongoose');

const ChallengeSubmissionSchema = new mongoose.Schema({
  // Reference to the challenge
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingChallenge',
    required: [true, 'Challenge reference is required']
  },

  // Student who submitted
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },

  // Submission details
  code: {
    type: String,
    required: [true, 'Code submission is required'],
    trim: true,
    maxlength: [10000, 'Code cannot be more than 10000 characters']
  },

  language: {
    type: String,
    required: [true, 'Programming language is required'],
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'rust']
  },

  // Submission status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'reviewed', 'rejected'],
    default: 'draft'
  },

  // Review details (for manual review)
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, 'Feedback cannot be more than 2000 characters']
    },
    comments: [{
      line: {
        type: Number,
        min: 1
      },
      comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Comment cannot be more than 500 characters']
      },
      type: {
        type: String,
        enum: ['suggestion', 'error', 'praise', 'question'],
        default: 'suggestion'
      }
    }],
    criteria: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      maxScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      feedback: {
        type: String,
        trim: true,
        maxlength: [500, 'Criteria feedback cannot be more than 500 characters']
      }
    }]
  },

  // Time tracking
  timeSpent: {
    type: Number, // in minutes
    default: 0,
    min: 0
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  submittedAt: {
    type: Date
  },

  // Additional metadata
  version: {
    type: Number,
    default: 1
  },

  isLatest: {
    type: Boolean,
    default: true
  },

  // Student's self-assessment
  selfAssessment: {
    confidence: {
      type: Number,
      min: 1,
      max: 5
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5
    },
    timeEstimate: {
      type: Number, // in minutes
      min: 0
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Self-assessment notes cannot be more than 1000 characters']
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
ChallengeSubmissionSchema.index({ challenge: 1, student: 1 });
ChallengeSubmissionSchema.index({ student: 1, status: 1 });
ChallengeSubmissionSchema.index({ challenge: 1, status: 1 });
ChallengeSubmissionSchema.index({ 'review.reviewedBy': 1 });
ChallengeSubmissionSchema.index({ submittedAt: -1 });
ChallengeSubmissionSchema.index({ isLatest: 1 });

// Virtual for formatted time spent
ChallengeSubmissionSchema.virtual('formattedTimeSpent').get(function() {
  const hours = Math.floor(this.timeSpent / 60);
  const minutes = this.timeSpent % 60;
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
});

// Virtual for review status
ChallengeSubmissionSchema.virtual('reviewStatus').get(function() {
  if (!this.review || !this.review.reviewedBy) {
    return 'pending';
  }
  
  if (this.review.score !== null && this.review.score !== undefined) {
    return 'completed';
  }
  
  return 'in_progress';
});

// Method to calculate total score from criteria
ChallengeSubmissionSchema.methods.calculateTotalScore = function() {
  if (!this.review || !this.review.criteria || this.review.criteria.length === 0) {
    return this.review?.score || 0;
  }
  
  const totalScore = this.review.criteria.reduce((sum, criteria) => sum + criteria.score, 0);
  const maxScore = this.review.criteria.reduce((sum, criteria) => sum + criteria.maxScore, 0);
  
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
};

// Method to get grade based on score
ChallengeSubmissionSchema.methods.getGrade = function() {
  const score = this.calculateTotalScore();
  
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

// Pre-save middleware to handle submission
ChallengeSubmissionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = new Date();
  }
  
  // Calculate time spent if not already set
  if (this.isModified('submittedAt') && this.submittedAt && this.startedAt) {
    this.timeSpent = Math.round((this.submittedAt - this.startedAt) / (1000 * 60)); // Convert to minutes
  }
  
  next();
});

// Ensure virtual fields are serialized
ChallengeSubmissionSchema.set('toJSON', { virtuals: true });
ChallengeSubmissionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ChallengeSubmission', ChallengeSubmissionSchema);

