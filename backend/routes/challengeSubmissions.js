const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  submitChallenge,
  getStudentSubmissions,
  getChallengeSubmissions,
  reviewSubmission,
  getStudentSubmissionHistory,
  getSubmissionDetails,
  saveDraftSubmission
} = require('../controllers/challengeSubmissionController');

// Validation middleware
const submissionValidation = [
  body('code')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Code must be between 10 and 10000 characters'),
  body('language')
    .isIn(['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'rust'])
    .withMessage('Valid programming language is required')
];

const reviewValidation = [
  body('score')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Feedback cannot exceed 2000 characters'),
  body('comments')
    .optional()
    .isArray()
    .withMessage('Comments must be an array'),
  body('criteria')
    .optional()
    .isArray()
    .withMessage('Criteria must be an array')
];

// All routes require authentication
router.use(authenticateToken);

// Student routes
router.post('/challenge/:challengeId/submit', submissionValidation, submitChallenge);
router.post('/challenge/:challengeId/draft', submissionValidation, saveDraftSubmission);
router.get('/challenge/:challengeId/my-submissions', getStudentSubmissions);
router.get('/my-submissions', getStudentSubmissionHistory);
router.get('/:submissionId', getSubmissionDetails);

// Admin routes
router.get('/challenge/:challengeId/all', requireAdmin, getChallengeSubmissions);
router.post('/:submissionId/review', requireAdmin, reviewValidation, reviewSubmission);

module.exports = router;

