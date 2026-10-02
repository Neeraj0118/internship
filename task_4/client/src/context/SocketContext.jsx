import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

// Simple Web Audio API sound synthesizer for message notifications
function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (err) {
    // Ignore audio autoplay restrictions
  }
}

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingMap, setTypingMap] = useState({}); // key -> username
  const soundEnabledRef = useRef(true);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to Socket.IO backend server
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id);
    });

    newSocket.on('user_status_changed', ({ userId, status }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        if (status === 'online') {
          updated.add(Number(userId));
        } else {
          updated.delete(Number(userId));
        }
        return updated;
      });
    });

    newSocket.on('user_typing_start', ({ userId, username, roomId, recipientId }) => {
      const key = roomId ? `room_${roomId}` : `dm_${userId}`;
      setTypingMap(prev => ({ ...prev, [key]: username }));
    });

    newSocket.on('user_typing_stop', ({ userId, roomId, recipientId }) => {
      const key = roomId ? `room_${roomId}` : `dm_${userId}`;
      setTypingMap(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', { roomId });
    }
  };

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leave_room', { roomId });
    }
  };

  const sendRoomMessage = (roomId, content, type = 'text', fileData = {}) => {
    if (socket) {
      socket.emit('send_room_message', {
        roomId,
        content,
        type,
        file_url: fileData.url,
        file_name: fileData.filename,
        file_size: fileData.size
      });
    }
  };

  const sendDirectMessage = (recipientId, content, type = 'text', fileData = {}) => {
    if (socket) {
      socket.emit('send_direct_message', {
        recipientId,
        content,
        type,
        file_url: fileData.url,
        file_name: fileData.filename,
        file_size: fileData.size
      });
    }
  };

  const startTyping = (roomId, recipientId) => {
    if (socket) {
      socket.emit('typing_start', { roomId, recipientId });
    }
  };

  const stopTyping = (roomId, recipientId) => {
    if (socket) {
      socket.emit('typing_stop', { roomId, recipientId });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      typingMap,
      joinRoom,
      leaveRoom,
      sendRoomMessage,
      sendDirectMessage,
      startTyping,
      stopTyping,
      playNotificationSound
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
