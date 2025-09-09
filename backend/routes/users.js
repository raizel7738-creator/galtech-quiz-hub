const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require('../controllers/userController');

// All routes require authentication and admin privileges
router.use(authenticateToken, requireAdmin);

// Get all users with pagination and filtering
router.get('/', getUsers);

// Get user by ID
router.get('/:id', getUser);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

// Toggle user status
router.patch('/:id/toggle-status', toggleUserStatus);

module.exports = router;

