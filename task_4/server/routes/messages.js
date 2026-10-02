const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get room messages history
router.get('/room/:roomId', authenticateToken, (req, res) => {
  const roomId = req.params.roomId;
  const messages = db.getRoomMessages(roomId);
  res.json({ messages });
});

// Get direct messages history between current user and target user
router.get('/direct/:userId', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = req.params.userId;
  const messages = db.getDirectMessages(currentUserId, targetUserId);
  res.json({ messages });
});

// Search messages
router.get('/search', authenticateToken, (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json({ messages: [] });
  }
  const messages = db.searchMessages(q, req.user.id);
  res.json({ messages });
});

module.exports = router;
