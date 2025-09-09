const express = require('express');
const { body, validationResult, param } = require('express-validator');
const CodingChallenge = require('../models/CodingChallenge');
const CodingSubmission = require('../models/CodingSubmission');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/coding-challenges
// @desc    Get all active coding challenges
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { difficulty, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = { status: 'active' };
    
    // Filter by difficulty if provided
    if (difficulty && ['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      query.difficulty = difficulty;
    }
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Sort options
    const sortOptions = {};
    if (sortBy === 'title') {
      sortOptions.title = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'difficulty') {
      const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
      sortOptions.difficulty = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'points') {
      sortOptions.points = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
    }
    
    const challenges = await CodingChallenge.find(query)
      .select('-expectedSolution -createdBy')
      .sort(sortOptions)
      .populate('category', 'name')
      .populate('createdBy', 'name');
    
    res.json({
      success: true,
      data: {
        challenges,
        total: challenges.length
      }
    });
  } catch (error) {
    console.error('Get coding challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching coding challenges'
    });
  }
});

// @route   GET /api/coding-challenges/:id
// @desc    Get single coding challenge by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const challenge = await CodingChallenge.findById(req.params.id)
      .select('-expectedSolution -createdBy')
      .populate('category', 'name')
      .populate('createdBy', 'name');
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Coding challenge not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        challenge
      }
    });
  } catch (error) {
    console.error('Get coding challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching coding challenge'
    });
  }
});

// @route   POST /api/coding-challenges
// @desc    Create new coding challenge
// @access  Private (Admin)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description must be between 1 and 5000 characters'),
  body('problemStatement')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Problem statement must be between 1 and 10000 characters'),
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('points')
    .isInt({ min: 1, max: 100 })
    .withMessage('Points must be between 1 and 100'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required')
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

    const challengeData = {
      ...req.body,
      createdBy: req.user.id
    };

    const challenge = new CodingChallenge(challengeData);
    await challenge.save();
    await challenge.populate('category', 'name');
    await challenge.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Coding challenge created successfully',
      data: {
        challenge
      }
    });
  } catch (error) {
    console.error('Create coding challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating coding challenge'
    });
  }
});

// @route   PUT /api/coding-challenges/:id
// @desc    Update coding challenge
// @access  Private (Admin)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid challenge ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description must be between 1 and 5000 characters'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('points')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Points must be between 1 and 100')
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

    const challenge = await CodingChallenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Coding challenge not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        challenge[key] = req.body[key];
      }
    });

    await challenge.save();
    await challenge.populate('category', 'name');
    await challenge.populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Coding challenge updated successfully',
      data: {
        challenge
      }
    });
  } catch (error) {
    console.error('Update coding challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating coding challenge'
    });
  }
});

// @route   DELETE /api/coding-challenges/:id
// @desc    Delete coding challenge
// @access  Private (Admin)
router.delete('/:id', [
  authenticateToken,
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid challenge ID')
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

    const challenge = await CodingChallenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Coding challenge not found'
      });
    }

    // Also delete all submissions for this challenge
    await CodingSubmission.deleteMany({ challenge: req.params.id });
    await CodingChallenge.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Coding challenge deleted successfully'
    });
  } catch (error) {
    console.error('Delete coding challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting coding challenge'
    });
  }
});

// @route   GET /api/coding-challenges/:id/submissions
// @desc    Get submissions for a coding challenge (Admin only)
// @access  Private (Admin)
router.get('/:id/submissions', [
  authenticateToken,
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid challenge ID')
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

    const { status, sortBy = 'submissionTime', sortOrder = 'desc' } = req.query;
    
    let query = { challenge: req.params.id };
    
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
      .populate('student', 'name email')
      .populate('challenge', 'title')
      .populate('review.reviewedBy', 'name');
    
    res.json({
      success: true,
      data: {
        submissions,
        total: submissions.length
      }
    });
  } catch (error) {
    console.error('Get challenge submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    });
  }
});

module.exports = router;