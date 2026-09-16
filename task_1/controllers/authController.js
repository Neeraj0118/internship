const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new user
 */
async function register(req, res) {
  try {
    const { username, email, password, role } = req.body;

    // 1. Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required fields.'
      });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long.'
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const assignedRole = (role && role.toLowerCase() === 'admin') ? 'admin' : 'user';

    // 2. Check for duplicate email or username
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim());
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken. Please choose another.'
      });
    }

    // 3. Password Hashing
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Database insertion
    const stmt = db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
    const result = stmt.run(username.trim(), email.toLowerCase().trim(), passwordHash, assignedRole);

    const userId = Number(result.lastInsertRowid);

    // 5. Generate JWT token
    const tokenPayload = {
      id: userId,
      username: username.trim(),
      email: email.toLowerCase().trim(),
      role: assignedRole
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '2h' });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: tokenPayload
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred during registration.'
    });
  }
}

/**
 * Authenticate user and issue JWT
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/username and password are required.'
      });
    }

    const queryInput = email.trim().toLowerCase();

    // Find user by email or username
    const user = db.prepare('SELECT * FROM users WHERE email = ? OR LOWER(username) = ?').get(queryInput, queryInput);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.'
      });
    }

    // Verify hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.'
      });
    }

    // Generate token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '2h' });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: tokenPayload
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred during login.'
    });
  }
}

/**
 * Get profile of current authenticated user
 */
function getProfile(req, res) {
  try {
    const user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile data.'
    });
  }
}

/**
 * Protected User Dashboard Data
 */
function getDashboard(req, res) {
  return res.status(200).json({
    success: true,
    message: `Welcome to your protected user dashboard, ${req.user.username}!`,
    dashboardData: {
      accountStatus: 'Active & Verified',
      securityLevel: 'High (JWT Session Enforced)',
      userRole: req.user.role,
      serverTime: new Date().toISOString()
    }
  });
}

/**
 * Admin Panel: Get list of all registered users (RBAC Protected)
 */
function getAllUsers(req, res) {
  try {
    const users = db.prepare('SELECT id, username, email, role, created_at FROM users ORDER BY id DESC').all();

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user list.'
    });
  }
}

/**
 * Admin Panel: Delete a user (RBAC Protected)
 */
function deleteUser(req, res) {
  try {
    const targetId = Number(req.params.id);

    if (targetId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot delete their own account.'
      });
    }

    const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(targetId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(targetId);

    return res.status(200).json({
      success: true,
      message: `User #${targetId} deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user.'
    });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  getDashboard,
  getAllUsers,
  deleteUser
};
