const express = require('express');
const { body } = require('express-validator');
const {
  getQuestionsByCategory,
  getAllQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleQuestionStatus,
  getQuestionStats
} = require('../controllers/questionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const questionValidation = [
  body('question')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Question must be between 10 and 1000 characters'),
  
  body('type')
    .optional()
    .isIn(['mcq', 'program', 'coding'])
    .withMessage('Type must be mcq, program, or coding'),
  
  body('category')
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  
  body('points')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Points must be between 1 and 100'),
  
  body('options')
    .optional()
    .isArray({ min: 2 })
    .withMessage('Options must be an array with at least 2 items'),
  
  body('options.*.text')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Option text must be between 1 and 500 characters'),
  
  body('options.*.isCorrect')
    .optional()
    .isBoolean()
    .withMessage('isCorrect must be a boolean'),
  
  body('correctAnswer')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Correct answer must be between 1 and 500 characters'),
  
  body('explanation')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Explanation cannot exceed 1000 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be active, inactive, or draft')
];

const updateQuestionValidation = [
  body('question')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Question must be between 10 and 1000 characters'),
  
  body('type')
    .optional()
    .isIn(['mcq', 'program', 'coding'])
    .withMessage('Type must be mcq, program, or coding'),
  
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  
  body('points')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Points must be between 1 and 100'),
  
  body('options')
    .optional()
    .isArray({ min: 2 })
    .withMessage('Options must be an array with at least 2 items'),
  
  body('options.*.text')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Option text must be between 1 and 500 characters'),
  
  body('options.*.isCorrect')
    .optional()
    .isBoolean()
    .withMessage('isCorrect must be a boolean'),
  
  body('correctAnswer')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Correct answer must be between 1 and 500 characters'),
  
  body('explanation')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Explanation cannot exceed 1000 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be active, inactive, or draft')
];

// Public routes (for students)
router.get('/category/:categoryId', getQuestionsByCategory);

// Protected routes (admin only)
router.use(authenticateToken, requireAdmin);

// Question management routes
router.get('/', getAllQuestions);
router.get('/stats', getQuestionStats);
router.get('/:id', getQuestion);
router.post('/', questionValidation, createQuestion);
router.put('/:id', updateQuestionValidation, updateQuestion);
router.delete('/:id', deleteQuestion);
router.patch('/:id/toggle-status', toggleQuestionStatus);

module.exports = router;
