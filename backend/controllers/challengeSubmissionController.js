const ChallengeSubmission = require('../models/ChallengeSubmission');
const CodingChallenge = require('../models/CodingChallenge');
const { validationResult } = require('express-validator');

// Submit a coding challenge (student only)
const submitChallenge = async (req, res) => {
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

    const { challengeId } = req.params;
    const {
      code,
      language,
      selfAssessment = {}
    } = req.body;

    // Verify challenge exists and is active
    const challenge = await CodingChallenge.findOne({
      _id: challengeId,
      isActive: true,
      status: 'active'
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Coding challenge not found or inactive'
      });
    }

    // Check if student has already submitted
    const existingSubmission = await ChallengeSubmission.findOne({
      challenge: challengeId,
      student: req.user.id,
      isLatest: true
    });

    let submission;

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.code = code;
      existingSubmission.language = language;
      existingSubmission.status = 'submitted';
      existingSubmission.submittedAt = new Date();
      existingSubmission.selfAssessment = selfAssessment;
      existingSubmission.version += 1;
      
      submission = await existingSubmission.save();
    } else {
      // Create new submission
      submission = new ChallengeSubmission({
        challenge: challengeId,
        student: req.user.id,
        code,
        language,
        status: 'submitted',
        submittedAt: new Date(),
        selfAssessment
      });

      await submission.save();
    }

    // Populate the response
    await submission.populate([
      { path: 'challenge', select: 'title description difficulty points' },
      { path: 'student', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Challenge submitted successfully',
      data: submission
    });

  } catch (error) {
    console.error('Error submitting challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit challenge',
      error: error.message
    });
  }
};

// Get student's submissions for a challenge
const getStudentSubmissions = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const submissions = await ChallengeSubmission.find({
      challenge: challengeId,
      student: req.user.id
    })
    .populate('challenge', 'title description difficulty points')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: submissions
    });

  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

// Get all submissions for a challenge (admin only)
const getChallengeSubmissions = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      reviewed
    } = req.query;

    // Build filter
    const filter = { challenge: challengeId };
    
    if (status) {
      filter.status = status;
    }
    
    if (reviewed !== undefined) {
      if (reviewed === 'true') {
        filter['review.reviewedBy'] = { $exists: true };
      } else {
        filter['review.reviewedBy'] = { $exists: false };
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await ChallengeSubmission.find(filter)
      .populate('student', 'name email')
      .populate('challenge', 'title description difficulty points')
      .populate('review.reviewedBy', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChallengeSubmission.countDocuments(filter);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalSubmissions: total,
          hasNext: skip + submissions.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching challenge submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

// Review a submission (admin only)
const reviewSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const {
      score,
      feedback,
      comments = [],
      criteria = []
    } = req.body;

    const submission = await ChallengeSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Update review
    submission.review = {
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      score,
      feedback,
      comments,
      criteria
    };
    submission.status = 'reviewed';

    await submission.save();

    // Populate the response
    await submission.populate([
      { path: 'student', select: 'name email' },
      { path: 'challenge', select: 'title description difficulty points' },
      { path: 'review.reviewedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Submission reviewed successfully',
      data: submission
    });

  } catch (error) {
    console.error('Error reviewing submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review submission',
      error: error.message
    });
  }
};

// Get student's submission history
const getStudentSubmissionHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      challenge
    } = req.query;

    // Build filter
    const filter = { student: req.user.id };
    
    if (status) {
      filter.status = status;
    }
    
    if (challenge) {
      filter.challenge = challenge;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await ChallengeSubmission.find(filter)
      .populate('challenge', 'title description difficulty points language')
      .populate('review.reviewedBy', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChallengeSubmission.countDocuments(filter);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalSubmissions: total,
          hasNext: skip + submissions.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching submission history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission history',
      error: error.message
    });
  }
};

// Get submission details
const getSubmissionDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await ChallengeSubmission.findById(submissionId)
      .populate('student', 'name email')
      .populate('challenge', 'title description difficulty points language examples constraints hints')
      .populate('review.reviewedBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if user can access this submission
    if (req.user.role === 'student' && submission.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission details',
      error: error.message
    });
  }
};

// Save draft submission
const saveDraftSubmission = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const {
      code,
      language,
      selfAssessment = {}
    } = req.body;

    // Verify challenge exists
    const challenge = await CodingChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Coding challenge not found'
      });
    }

    // Find or create draft submission
    let submission = await ChallengeSubmission.findOne({
      challenge: challengeId,
      student: req.user.id,
      status: 'draft'
    });

    if (submission) {
      // Update existing draft
      submission.code = code;
      submission.language = language;
      submission.selfAssessment = selfAssessment;
    } else {
      // Create new draft
      submission = new ChallengeSubmission({
        challenge: challengeId,
        student: req.user.id,
        code,
        language,
        status: 'draft',
        selfAssessment
      });
    }

    await submission.save();

    res.json({
      success: true,
      message: 'Draft saved successfully',
      data: submission
    });

  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save draft',
      error: error.message
    });
  }
};

module.exports = {
  submitChallenge,
  getStudentSubmissions,
  getChallengeSubmissions,
  reviewSubmission,
  getStudentSubmissionHistory,
  getSubmissionDetails,
  saveDraftSubmission
};

