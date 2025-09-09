const express = require('express');
const { body, query } = require('express-validator');
const {
  createAttemptHistory,
  getAttemptHistory,
  getAttemptDetails,
  getUserStats,
  getCategoryStats,
  getPerformanceAnalytics,
  exportAttemptHistory
} = require('../controllers/attemptHistoryController');
const { authenticateToken, requireStudent, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const createHistoryValidation = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
];

const getHistoryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),
  
  query('status')
    .optional()
    .isIn(['completed', 'abandoned', 'expired'])
    .withMessage('Status must be completed, abandoned, or expired'),
  
  query('sortBy')
    .optional()
    .isIn(['completedAt', 'score.percentage', 'duration'])
    .withMessage('Sort by must be completedAt, score.percentage, or duration'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
];

const analyticsValidation = [
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),
  
  query('period')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Period must be between 1 and 365 days')
];

const exportValidation = [
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv'),
  
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
];

// Student routes
router.post('/create', requireStudent, createHistoryValidation, createAttemptHistory);
router.get('/', requireStudent, getHistoryValidation, getAttemptHistory);
router.get('/stats', requireStudent, getUserStats);
router.get('/analytics', requireStudent, analyticsValidation, getPerformanceAnalytics);
router.get('/export', requireStudent, exportValidation, exportAttemptHistory);
router.get('/:id', requireStudent, getAttemptDetails);

// Admin routes
router.get('/category-stats/:categoryId', requireAdmin, getCategoryStats);

module.exports = router;

