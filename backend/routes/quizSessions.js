const express = require('express');
const { body } = require('express-validator');
const {
  startQuizSession,
  getActiveQuizSession,
  submitAnswer,
  submitQuizSession,
  getQuizResults,
  getQuizHistory,
  abandonQuizSession
} = require('../controllers/quizSessionController');
const { authenticateToken, requireStudent } = require('../middleware/auth');

const router = express.Router();

// History route requires authentication but not student role (admins can also view)
router.get('/history', authenticateToken, getQuizHistory);

// All other routes require student role
router.use(authenticateToken, requireStudent);


// Validation rules
const startQuizValidation = [
  body('categoryId')
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'mixed'])
    .withMessage('Difficulty must be easy, medium, hard, or mixed'),
  
  body('timeLimit')
    .optional()
    .isInt({ min: 300, max: 7200 })
    .withMessage('Time limit must be between 5 and 120 minutes'),
  
  body('questionCount')
    .optional()
    .isInt({ min: 5, max: 50 })
    .withMessage('Question count must be between 5 and 50')
];

const submitAnswerValidation = [
  body('questionId')
    .isMongoId()
    .withMessage('Question ID must be a valid MongoDB ObjectId'),
  
  body('selectedAnswer')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Selected answer must be between 1 and 500 characters'),
  
  body('timeSpent')
    .optional()
    .isInt({ min: 0, max: 3600 })
    .withMessage('Time spent must be between 0 and 3600 seconds')
];

// Quiz session routes
router.post('/start', startQuizValidation, startQuizSession);
router.get('/active/:categoryId', getActiveQuizSession);
router.post('/:sessionId/answer', submitAnswerValidation, submitAnswer);
router.post('/:sessionId/submit', submitQuizSession);
router.get('/:sessionId/results', getQuizResults);
router.post('/:sessionId/abandon', abandonQuizSession);

module.exports = router;

