const jwt = require('jsonwebtoken');
const db = require('./db');
const { JWT_SECRET } = require('./middleware/auth');

// Map of userId -> Set of socketId
const activeSockets = new Map();

function setupSocketIO(io) {
  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    jwt.verify(cleanToken, JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`User connected: ${socket.user.username} (ID: ${userId}) [Socket: ${socket.id}]`);

    // Track active user sockets
    if (!activeSockets.has(userId)) {
      activeSockets.set(userId, new Set());
    }
    activeSockets.get(userId).add(socket.id);

    // Update status to online and broadcast
    db.updateUserStatus(userId, 'online');
    io.emit('user_status_changed', { userId, status: 'online' });

    // Join room event
    socket.on('join_room', ({ roomId }) => {
      const roomChannel = `room_${roomId}`;
      socket.join(roomChannel);
      db.joinRoom(roomId, userId);
      console.log(`User ${socket.user.username} joined channel ${roomChannel}`);
    });

    // Leave room event
    socket.on('leave_room', ({ roomId }) => {
      const roomChannel = `room_${roomId}`;
      socket.leave(roomChannel);
      console.log(`User ${socket.user.username} left channel ${roomChannel}`);
    });

    // Send room message
    socket.on('send_room_message', ({ roomId, content, type, file_url, file_name, file_size }) => {
      try {
        const message = db.saveMessage({
          sender_id: userId,
          room_id: roomId,
          content,
          type: type || 'text',
          file_url: file_url || null,
          file_name: file_name || null,
          file_size: file_size || null
        });

        // Broadcast to room channel including sender
        io.to(`room_${roomId}`).emit('new_room_message', message);
      } catch (err) {
        console.error('Error sending room message:', err);
        socket.emit('error', { message: 'Failed to send room message' });
      }
    });

    // Send direct message
    socket.on('send_direct_message', ({ recipientId, content, type, file_url, file_name, file_size }) => {
      try {
        const message = db.saveMessage({
          sender_id: userId,
          recipient_id: recipientId,
          content,
          type: type || 'text',
          file_url: file_url || null,
          file_name: file_name || null,
          file_size: file_size || null
        });

        // Emit to sender sockets
        const senderSockets = activeSockets.get(userId);
        if (senderSockets) {
          senderSockets.forEach(sId => {
            io.to(sId).emit('new_direct_message', message);
          });
        }

        // Emit to recipient sockets
        const recipientSockets = activeSockets.get(Number(recipientId));
        if (recipientSockets) {
          recipientSockets.forEach(sId => {
            io.to(sId).emit('new_direct_message', message);
          });
        }
      } catch (err) {
        console.error('Error sending direct message:', err);
        socket.emit('error', { message: 'Failed to send direct message' });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ roomId, recipientId }) => {
      if (roomId) {
        socket.to(`room_${roomId}`).emit('user_typing_start', {
          userId,
          username: socket.user.username,
          roomId
        });
      } else if (recipientId) {
        const recipientSockets = activeSockets.get(Number(recipientId));
        if (recipientSockets) {
          recipientSockets.forEach(sId => {
            io.to(sId).emit('user_typing_start', {
              userId,
              username: socket.user.username,
              recipientId: userId // For recipient, typing user is the sender
            });
          });
        }
      }
    });

    socket.on('typing_stop', ({ roomId, recipientId }) => {
      if (roomId) {
        socket.to(`room_${roomId}`).emit('user_typing_stop', {
          userId,
          roomId
        });
      } else if (recipientId) {
        const recipientSockets = activeSockets.get(Number(recipientId));
        if (recipientSockets) {
          recipientSockets.forEach(sId => {
            io.to(sId).emit('user_typing_stop', {
              userId,
              recipientId: userId
            });
          });
        }
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username} [Socket: ${socket.id}]`);
      const userSockets = activeSockets.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeSockets.delete(userId);
          db.updateUserStatus(userId, 'offline');
          io.emit('user_status_changed', { userId, status: 'offline' });
        }
      }
    });
  });
}

module.exports = setupSocketIO;
