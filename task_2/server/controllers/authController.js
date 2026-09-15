const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// Admin Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await dbGet(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// Get current logged-in user profile
const getMe = async (req, res) => {
  try {
    const user = await dbGet(`SELECT id, name, email, role, created_at FROM users WHERE id = ?`, [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error retrieving user info.' });
  }
};

module.exports = {
  login,
  getMe
};
