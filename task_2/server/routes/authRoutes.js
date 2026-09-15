const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateAuth } = require('../middleware/validate');

// Public route: Admin Login
router.post('/login', validateAuth, login);

// Protected route: Check current session
router.get('/me', verifyToken, getMe);

module.exports = router;
