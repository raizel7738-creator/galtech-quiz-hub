const mongoose = require('mongoose');

const CodingSubmissionSchema = new mongoose.Schema({
  // Challenge reference
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingChallenge',
    required: [true, 'Challenge is required']
  },
  
  // Student who submitted
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  
  // Submitted code
  code: {
    type: String,
    required: [true, 'Code submission is required'],
    trim: true,
    maxlength: [10000, 'Code cannot exceed 10000 characters']
  },
  
  // Programming language used
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'rust'],
    required: [true, 'Programming language is required']
  },
  
  // Submission status
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'needs_revision'],
    default: 'submitted'
  },
  
  // Admin review details
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
      maxlength: [2000, 'Feedback cannot exceed 2000 characters']
    },
    comments: [{
      lineNumber: {
        type: Number,
        min: 1
      },
      comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
      },
      type: {
        type: String,
        enum: ['suggestion', 'error', 'praise', 'question'],
        default: 'suggestion'
      }
    }]
  },
  
  // Submission metadata
  submissionTime: {
    type: Date,
    default: Date.now
  },
  
  // Time spent on the challenge (in minutes)
  timeSpent: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Number of attempts before this submission
  attemptNumber: {
    type: Number,
    min: 1,
    default: 1
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
CodingSubmissionSchema.index({ challenge: 1, student: 1 });
CodingSubmissionSchema.index({ status: 1 });
CodingSubmissionSchema.index({ createdAt: -1 });

// Virtual for review status
CodingSubmissionSchema.virtual('isReviewed').get(function() {
  return this.status !== 'submitted' && this.status !== 'under_review';
});

// Method to update review
CodingSubmissionSchema.methods.addReview = function(reviewerId, score, feedback, comments = []) {
  this.review.reviewedBy = reviewerId;
  this.review.reviewedAt = new Date();
  this.review.score = score;
  this.review.feedback = feedback;
  this.review.comments = comments;
  
  // Update status based on score
  if (score >= 80) {
    this.status = 'approved';
  } else if (score >= 60) {
    this.status = 'needs_revision';
  } else {
    this.status = 'rejected';
  }
  
  this.updatedAt = new Date();
  return this.save();
};

// Method to get formatted submission for student view
CodingSubmissionSchema.methods.getStudentVersion = function() {
  const submissionObj = this.toObject();
  // Don't expose reviewer details to students
  if (submissionObj.review) {
    delete submissionObj.review.reviewedBy;
  }
  return submissionObj;
};

// Update timestamp on save
CodingSubmissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CodingSubmission', CodingSubmissionSchema);
