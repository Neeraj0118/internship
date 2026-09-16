const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// User Protected Routes (Accessible by logged-in users with any role)
router.get('/user/profile', authenticateToken, authController.getProfile);
router.get('/user/dashboard', authenticateToken, authController.getDashboard);

// Admin Protected Routes (Role-Based Access Control: Admin only)
router.get('/admin/users', authenticateToken, requireRole('admin'), authController.getAllUsers);
router.delete('/admin/users/:id', authenticateToken, requireRole('admin'), authController.deleteUser);

module.exports = router;
