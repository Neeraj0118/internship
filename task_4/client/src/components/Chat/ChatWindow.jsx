import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Hash, User, MessageSquare, Info, Shield, Circle } from 'lucide-react';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';

export default function ChatWindow({ target }) {
  const { token, user } = useAuth();
  const {
    socket,
    onlineUsers,
    typingMap,
    joinRoom,
    sendRoomMessage,
    sendDirectMessage,
    startTyping,
    stopTyping,
    playNotificationSound
  } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const isRoom = target?.type === 'room';
  const targetId = target?.data?.id;

  // Key for typing map lookup
  const typingKey = isRoom ? `room_${targetId}` : `dm_${targetId}`;
  const typingUser = typingMap[typingKey];

  // Fetch Message History
  useEffect(() => {
    if (!targetId || !token) return;

    setLoading(true);
    const endpoint = isRoom
      ? `/api/messages/room/${targetId}`
      : `/api/messages/direct/${targetId}`;

    fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMessages(data.messages || []);
      })
      .catch(err => console.error('Failed to fetch messages:', err))
      .finally(() => setLoading(false));

    if (isRoom) {
      joinRoom(targetId);
    }
  }, [target, token]);

  // Real-time Socket Listener for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleRoomMsg = (newMsg) => {
      if (isRoom && newMsg.room_id === targetId) {
        setMessages(prev => [...prev, newMsg]);
        if (newMsg.sender_id !== user?.id) {
          playNotificationSound();
        }
      }
    };

    const handleDirectMsg = (newMsg) => {
      if (!isRoom) {
        const isCurrentDM =
          (newMsg.sender_id === user?.id && newMsg.recipient_id === targetId) ||
          (newMsg.sender_id === targetId && newMsg.recipient_id === user?.id);

        if (isCurrentDM) {
          setMessages(prev => [...prev, newMsg]);
          if (newMsg.sender_id !== user?.id) {
            playNotificationSound();
          }
        }
      }
    };

    socket.on('new_room_message', handleRoomMsg);
    socket.on('new_direct_message', handleDirectMsg);

    return () => {
      socket.off('new_room_message', handleRoomMsg);
      socket.off('new_direct_message', handleDirectMsg);
    };
  }, [socket, isRoom, targetId, user?.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleSendMessage = ({ content, fileData }) => {
    if (isRoom) {
      sendRoomMessage(targetId, content, fileData.type || 'text', fileData);
    } else {
      sendDirectMessage(targetId, content, fileData.type || 'text', fileData);
    }
  };

  const handleTypingStart = () => {
    if (isRoom) startTyping(targetId, null);
    else startTyping(null, targetId);
  };

  const handleTypingStop = () => {
    if (isRoom) stopTyping(targetId, null);
    else stopTyping(null, targetId);
  };

  if (!target) {
    return (
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center text-center p-8 select-none">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Chat Selected</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Select a channel or direct message from the sidebar to start real-time messaging.
        </p>
      </div>
    );
  }

  const targetName = isRoom ? target.data.name : target.data.username;
  const isOnline = !isRoom && (onlineUsers.has(target.data.id) || target.data.status === 'online');

  return (
    <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {isRoom ? (
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-cyan-400">
              <Hash className="w-5 h-5" />
            </div>
          ) : (
            <div className="relative">
              <img src={target.data.avatar} alt={targetName} className="w-10 h-10 rounded-xl bg-slate-800 object-cover" />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                isOnline ? 'bg-emerald-500' : 'bg-slate-600'
              }`} />
            </div>
          )}

          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {targetName}
              {isRoom && target.data.is_private ? (
                <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded-full text-slate-400 border border-slate-700">Private</span>
              ) : null}
            </h2>
            <p className="text-xs text-slate-400">
              {isRoom
                ? target.data.description || `${target.data.memberCount || 1} members`
                : isOnline ? 'Online now' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Loading chat history...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 mb-3">
              {isRoom ? <Hash className="w-8 h-8 text-indigo-400" /> : <User className="w-8 h-8 text-cyan-400" />}
            </div>
            <p className="text-sm font-medium text-slate-300">This is the start of your conversation with {targetName}</p>
            <p className="text-xs text-slate-500 mt-1">Send a message to break the ice!</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageItem key={msg.id} message={msg} />
          ))
        )}

        {/* Real-time Typing Indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic px-2 py-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {typingUser} is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />
    </div>
  );
}
