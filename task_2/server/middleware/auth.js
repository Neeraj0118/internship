const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'emp_mgmt_super_secret_key_2026';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
};

module.exports = {
  verifyToken,
  JWT_SECRET
};
