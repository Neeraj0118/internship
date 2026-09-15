import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 p-4 rounded-xl shadow-2xl border bg-white animate-in slide-in-from-bottom duration-300">
      <div className={`p-1.5 rounded-lg ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
        {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      </div>

      <div className="text-xs font-semibold text-slate-800 pr-2">
        {message}
      </div>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
