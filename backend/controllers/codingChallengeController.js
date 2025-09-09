const CodingChallenge = require('../models/CodingChallenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// Get all coding challenges (with filtering and pagination)
const getCodingChallenges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      difficulty,
      language,
      category,
      status = 'active',
      search
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (language) {
      filter.language = language;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get challenges with pagination
    const challenges = await CodingChallenge.find(filter)
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await CodingChallenge.countDocuments(filter);

    res.json({
      success: true,
      data: {
        challenges,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalChallenges: total,
          hasNext: skip + challenges.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching coding challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding challenges',
      error: error.message
    });
  }
};

// Get a single coding challenge by ID
const getCodingChallenge = async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await CodingChallenge.findById(id)
      .populate('category', 'name description')
      .populate('createdBy', 'name email');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Coding challenge not found'
      });
    }

    // Check if user has already submitted
    let userSubmission = null;
    if (req.user && req.user.role === 'student') {
      userSubmission = await ChallengeSubmission.findOne({
        challenge: id,
        student: req.user.id,
        isLatest: true
      });
    }

    res.json({
      success: true,
      data: {
        challenge,
        userSubmission
      }
    });

  } catch (error) {
    console.error('Error fetching coding challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coding challenge',
      error: error.message
    });
  }
};

// Create a new coding challenge (admin only)
const createCodingChallenge = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      problemStatement,
      difficulty = 'beginner',
      category,
      language,
      timeLimit = 60,
      examples = [],
      constraints = [],
      hints = [],
      expectedApproach,
      sampleSolution,
      points = 10,
      tags = [],
      status = 'draft'
    } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Create the challenge
    const challenge = new CodingChallenge({
      title,
      description,
      problemStatement,
      difficulty,
      category,
      language,
      timeLimit,
      examples,
      constraints,
      hints,
      expectedApproach,
      sampleSolution,
      points,
      tags,
      status,
      createdBy: req.user.id
    });

    await challenge.save();

    // Populate the response
    await challenge.populate([
      { path: 'category', select: 'name description' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Coding challenge created successfully',
      data: challenge
    });

  } catch (error) {
    console.error('Error creating coding challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coding challenge',
      error: error.message
    });
  }
};

// Update a coding challenge (admin only)
const updateCodingChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Add last modified by
    updateData.lastModifiedBy = req.user.id;

    const challenge = await CodingChallenge.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'category', select: 'name description' },
      { path: 'createdBy', select: 'name email' }
    ]);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Coding challenge not found'
      });
    }

    res.json({
      success: true,
      message: 'Coding challenge updated successfully',
      data: challenge
    });

  } catch (error) {
    console.error('Error updating coding challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coding challenge',
      error: error.message
    });
  }
};

// Delete a coding challenge (admin only)
const deleteCodingChallenge = async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await CodingChallenge.findByIdAndDelete(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Coding challenge not found'
      });
    }

    // Also delete related submissions
    await ChallengeSubmission.deleteMany({ challenge: id });

    res.json({
      success: true,
      message: 'Coding challenge deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting coding challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coding challenge',
      error: error.message
    });
  }
};

// Toggle challenge status (admin only)
const toggleChallengeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await CodingChallenge.findById(id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Coding challenge not found'
      });
    }

    challenge.isActive = !challenge.isActive;
    challenge.lastModifiedBy = req.user.id;
    await challenge.save();

    res.json({
      success: true,
      message: `Coding challenge ${challenge.isActive ? 'activated' : 'deactivated'} successfully`,
      data: challenge
    });

  } catch (error) {
    console.error('Error toggling challenge status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle challenge status',
      error: error.message
    });
  }
};

// Get challenge statistics (admin only)
const getChallengeStats = async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await CodingChallenge.findById(id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Coding challenge not found'
      });
    }

    // Calculate statistics
    await challenge.calculateStats();

    // Get submission breakdown
    const submissions = await ChallengeSubmission.find({ challenge: id });
    const submissionStats = {
      total: submissions.length,
      byStatus: {
        draft: submissions.filter(s => s.status === 'draft').length,
        submitted: submissions.filter(s => s.status === 'submitted').length,
        under_review: submissions.filter(s => s.status === 'under_review').length,
        reviewed: submissions.filter(s => s.status === 'reviewed').length,
        rejected: submissions.filter(s => s.status === 'rejected').length
      },
      byScore: {
        excellent: submissions.filter(s => s.review?.score >= 90).length,
        good: submissions.filter(s => s.review?.score >= 70 && s.review?.score < 90).length,
        fair: submissions.filter(s => s.review?.score >= 50 && s.review?.score < 70).length,
        poor: submissions.filter(s => s.review?.score < 50).length
      }
    };

    res.json({
      success: true,
      data: {
        challenge,
        submissionStats
      }
    });

  } catch (error) {
    console.error('Error fetching challenge stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge statistics',
      error: error.message
    });
  }
};

module.exports = {
  getCodingChallenges,
  getCodingChallenge,
  createCodingChallenge,
  updateCodingChallenge,
  deleteCodingChallenge,
  toggleChallengeStatus,
  getChallengeStats
};

