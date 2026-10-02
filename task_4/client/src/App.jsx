import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Sidebar from './components/Chat/Sidebar';
import ChatWindow from './components/Chat/ChatWindow';

function MainApp() {
  const { user, token, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTarget, setActiveTarget] = useState(null); // { type: 'room'|'dm', data: room|user }

  // Set default target to General room on initial login
  useEffect(() => {
    if (user && token && !activeTarget) {
      fetch('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.rooms && data.rooms.length > 0) {
            setActiveTarget({ type: 'room', data: data.rooms[0] });
          }
        })
        .catch(err => console.error('Failed to set default room:', err));
    }
  }, [user, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Loading PulseChat...</p>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <SocketProvider>
      <div className="h-screen w-screen flex bg-slate-950 text-slate-100 overflow-hidden">
        <Sidebar
          activeTarget={activeTarget}
          onSelectTarget={target => setActiveTarget(target)}
        />
        <ChatWindow target={activeTarget} />
      </div>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
