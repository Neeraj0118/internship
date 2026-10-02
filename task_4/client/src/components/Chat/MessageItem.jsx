import React from 'react';
import { FileText, Download, Music, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MessageItem({ message }) {
  const { user } = useAuth();
  const isMe = message.sender_id === user?.id;

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={`flex gap-3 mb-4 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Sender Avatar */}
      <img
        src={message.sender_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${message.sender_username}`}
        alt={message.sender_username}
        className="w-8 h-8 rounded-lg bg-slate-800 object-cover flex-shrink-0 mt-0.5"
      />

      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Header (Username & Time) */}
        <div className={`flex items-center gap-2 mb-1 px-1 text-[11px] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="font-semibold text-slate-300">{message.sender_username}</span>
          <span className="text-slate-500">{formatTime(message.created_at)}</span>
        </div>

        {/* Message Bubble Content */}
        <div
          className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
              : 'bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/60 shadow-sm'
          }`}
        >
          {/* Text Content */}
          {message.content && (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Media Attachments */}
          {message.file_url && (
            <div className={`${message.content ? 'mt-3 pt-2 border-t border-white/10' : ''}`}>
              {message.type === 'image' ? (
                <div className="rounded-xl overflow-hidden max-w-sm border border-black/20">
                  <a href={message.file_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={message.file_url}
                      alt={message.file_name || 'Attachment'}
                      className="w-full h-auto object-cover max-h-72 hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                </div>
              ) : message.type === 'audio' ? (
                <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/10">
                  <Music className="w-5 h-5 text-cyan-400" />
                  <audio controls src={message.file_url} className="h-8 max-w-full" />
                </div>
              ) : (
                <a
                  href={message.file_url}
                  download={message.file_name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-black/20 hover:bg-black/30 rounded-xl border border-white/10 transition-colors group/file"
                >
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300 group-hover/file:text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden flex-1 text-left">
                    <div className="text-xs font-semibold truncate text-white">{message.file_name || 'Download File'}</div>
                    <div className="text-[10px] text-slate-400">{formatFileSize(message.file_size)}</div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover/file:text-white transition-colors" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
