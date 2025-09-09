const express = require('express');
const { body, validationResult, param } = require('express-validator');
const CodingSubmission = require('../models/CodingSubmission');
const CodingChallenge = require('../models/CodingChallenge');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/coding-submissions
// @desc    Submit code for a coding challenge
// @access  Private (Students)
router.post('/', [
  authenticateToken,
  body('challenge')
    .isMongoId()
    .withMessage('Valid challenge ID is required'),
  body('code')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Code must be between 1 and 10000 characters'),
  body('language')
    .isIn(['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'rust'])
    .withMessage('Valid programming language is required'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { challenge, code, language, timeSpent = 0 } = req.body;

    // Check if challenge exists and is active
    const challengeExists = await CodingChallenge.findById(challenge);
    if (!challengeExists || challengeExists.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Coding challenge not found or inactive'
      });
    }

    // Check if user already has a submission for this challenge
    const existingSubmission = await CodingSubmission.findOne({
      challenge,
      student: req.user.id
    });

    let submission;
    if (existingSubmission) {
      // Update existing submission
      existingSubmission.code = code;
      existingSubmission.language = language;
      existingSubmission.timeSpent = timeSpent;
      existingSubmission.status = 'submitted';
      existingSubmission.attemptNumber += 1;
      existingSubmission.submissionTime = new Date();
      
      // Clear previous review if any
      existingSubmission.review = {};
      
      submission = await existingSubmission.save();
    } else {
      // Create new submission
      submission = new CodingSubmission({
        challenge,
        student: req.user.id,
        code,
        language,
        timeSpent,
        status: 'submitted'
      });
      await submission.save();
    }

    await submission.populate('challenge', 'title');
    await submission.populate('student', 'name email');

    res.status(201).json({
      success: true,
      message: 'Code submitted successfully',
      data: {
        submission
      }
    });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting code'
    });
  }
});

// @route   GET /api/coding-submissions/my-submissions
// @desc    Get current user's coding submissions
// @access  Private (Students)
router.get('/my-submissions', authenticateToken, async (req, res) => {
  try {
    const { status, sortBy = 'submissionTime', sortOrder = 'desc' } = req.query;
    
    let query = { student: req.user.id };
    
    // Filter by status if provided
    if (status && ['submitted', 'under_review', 'approved', 'rejected', 'needs_revision'].includes(status)) {
      query.status = status;
    }
    
    // Sort options
    const sortOptions = {};
    if (sortBy === 'submissionTime') {
      sortOptions.submissionTime = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'status') {
      sortOptions.status = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.submissionTime = sortOrder === 'desc' ? -1 : 1;
    }
    
    const submissions = await CodingSubmission.find(query)
      .sort(sortOptions)
      .populate('challenge', 'title difficulty points')
      .populate('review.reviewedBy', 'name');
    
    res.json({
      success: true,
      data: {
        submissions,
        total: submissions.length
      }
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    });
  }
});

// @route   GET /api/coding-submissions/:id
// @desc    Get single coding submission
// @access  Private (Student who submitted or Admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const submission = await CodingSubmission.findById(req.params.id)
      .populate('challenge', 'title problemStatement sampleInput sampleOutput')
      .populate('student', 'name email')
      .populate('review.reviewedBy', 'name');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Check if user has access to this submission
    const isAdmin = req.user.role === 'admin';
    const isOwner = submission.student._id.toString() === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        submission
      }
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submission'
    });
  }
});

// @route   PUT /api/coding-submissions/:id/review
// @desc    Review a coding submission (Admin only)
// @access  Private (Admin)
router.put('/:id/review', [
  authenticateToken,
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid submission ID'),
  body('score')
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('feedback')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Feedback must be between 1 and 2000 characters'),
  body('comments')
    .optional()
    .isArray()
    .withMessage('Comments must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { score, feedback, comments = [] } = req.body;

    const submission = await CodingSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Add review
    await submission.addReview(req.user.id, score, feedback, comments);
    
    // Update challenge statistics
    const challenge = await CodingChallenge.findById(submission.challenge);
    if (challenge) {
      await challenge.updateStats(score, submission.timeSpent);
    }

    await submission.populate('challenge', 'title');
    await submission.populate('student', 'name email');
    await submission.populate('review.reviewedBy', 'name');

    res.json({
      success: true,
      message: 'Submission reviewed successfully',
      data: {
        submission
      }
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reviewing submission'
    });
  }
});

// @route   GET /api/coding-submissions
// @desc    Get all coding submissions (Admin only)
// @access  Private (Admin)
router.get('/', [
  authenticateToken,
  requireAdmin
], async (req, res) => {
  try {
    const { status, challenge, student, sortBy = 'submissionTime', sortOrder = 'desc' } = req.query;
    
    let query = {};
    
    // Filter by status if provided
    if (status && ['submitted', 'under_review', 'approved', 'rejected', 'needs_revision'].includes(status)) {
      query.status = status;
    }
    
    // Filter by challenge if provided
    if (challenge) {
      query.challenge = challenge;
    }
    
    // Filter by student if provided
    if (student) {
      query.student = student;
    }
    
    // Sort options
    const sortOptions = {};
    if (sortBy === 'submissionTime') {
      sortOptions.submissionTime = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'status') {
      sortOptions.status = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.submissionTime = sortOrder === 'desc' ? -1 : 1;
    }
    
    const submissions = await CodingSubmission.find(query)
      .sort(sortOptions)
      .populate('challenge', 'title difficulty')
      .populate('student', 'name email')
      .populate('review.reviewedBy', 'name');
    
    res.json({
      success: true,
      data: {
        submissions,
        total: submissions.length
      }
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    });
  }
});

module.exports = router;
