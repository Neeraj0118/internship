import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const QUICK_EMOJIS = ['😊', '👍', '🎉', '❤️', '🔥', '🚀', '💻', '💡', '📁', '⚡'];

export default function MessageInput({ onSendMessage, onTypingStart, onTypingStop }) {
  const { token } = useAuth();
  const [text, setText] = useState('');
  const [fileAttachment, setFileAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);

    // Trigger typing event
    onTypingStart();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
    }, 2000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'File upload failed');
      setFileAttachment(data.file);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !fileAttachment) return;

    onSendMessage({
      content: text.trim(),
      fileData: fileAttachment || {}
    });

    setText('');
    setFileAttachment(null);
    setShowEmojiPicker(false);
    onTypingStop();
  };

  const addEmoji = (emoji) => {
    setText(prev => prev + emoji);
  };

  return (
    <div className="p-4 bg-slate-900 border-t border-slate-800 relative">
      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 bg-slate-800 border border-slate-700 rounded-2xl p-3 shadow-2xl z-20 flex gap-2">
          {QUICK_EMOJIS.map((emoji, i) => (
            <button
              key={i}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="text-xl hover:scale-125 transition-transform p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Uploaded File Preview Pill */}
      {fileAttachment && (
        <div className="mb-3 flex items-center justify-between p-2.5 bg-slate-800 border border-indigo-500/40 rounded-xl text-xs text-slate-200">
          <div className="flex items-center gap-2 truncate">
            {fileAttachment.type === 'image' ? (
              <ImageIcon className="w-4 h-4 text-cyan-400" />
            ) : (
              <FileText className="w-4 h-4 text-indigo-400" />
            )}
            <span className="truncate font-medium">{fileAttachment.filename}</span>
          </div>
          <button
            onClick={() => setFileAttachment(null)}
            className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-3 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          title="Attach file or media"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-3 text-slate-400 hover:text-yellow-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title="Add Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
        />

        <button
          type="submit"
          disabled={!text.trim() && !fileAttachment}
          className="p-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition-all cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
