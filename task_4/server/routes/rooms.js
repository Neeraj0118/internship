const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all rooms
router.get('/', authenticateToken, (req, res) => {
  const rooms = db.getRooms();
  res.json({ rooms });
});

// Create room
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, description, is_private } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const room = db.createRoom({
      name: name.trim(),
      description: description || '',
      is_private: is_private ? 1 : 0,
      created_by: req.user.id
    });

    res.status(201).json({ room });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create room' });
  }
});

// Join room
router.post('/:id/join', authenticateToken, (req, res) => {
  try {
    const roomId = req.params.id;
    db.joinRoom(roomId, req.user.id);
    res.json({ message: 'Successfully joined room' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
