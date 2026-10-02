import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Hash, MessageSquare, Plus, LogOut, Search, Users, Circle, Sparkles } from 'lucide-react';
import CreateRoomModal from './CreateRoomModal';

export default function Sidebar({ activeTarget, onSelectTarget }) {
  const { user, token, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('channels'); // 'channels' | 'dms'

  // Fetch rooms and user list
  const fetchData = async () => {
    try {
      const [roomsRes, usersRes] = await Promise.all([
        fetch('/api/rooms', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/auth/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const roomsData = await roomsRes.json();
      const usersData = await usersRes.json();
      if (roomsData.rooms) setRooms(roomsData.rooms);
      if (usersData.users) setUsers(usersData.users.filter(u => u.id !== user?.id));
    } catch (err) {
      console.error('Error fetching sidebar data:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [...prev, newRoom]);
    onSelectTarget({ type: 'room', data: newRoom });
  };

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* App Branding & Current User */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20">
            <img src={user?.avatar} alt={user?.username} className="w-full h-full rounded-[10px] bg-slate-900 object-cover" />
          </div>
          <div className="overflow-hidden">
            <div className="font-semibold text-white text-sm truncate flex items-center gap-1.5">
              {user?.username}
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search channels or people..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-3 pb-2 flex gap-1 border-b border-slate-800/60">
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'channels'
              ? 'bg-slate-800 text-cyan-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          Channels ({rooms.length})
        </button>

        <button
          onClick={() => setActiveTab('dms')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'dms'
              ? 'bg-slate-800 text-cyan-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Direct ({users.length})
        </button>
      </div>

      {/* Channel / Direct Message Content List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {activeTab === 'channels' ? (
          <div>
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Public Channels</span>
              <button
                onClick={() => setIsModalOpen(true)}
                title="Create Room"
                className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {filteredRooms.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">No rooms found</div>
            ) : (
              filteredRooms.map(room => {
                const isSelected = activeTarget?.type === 'room' && activeTarget.data.id === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => onSelectTarget({ type: 'room', data: room })}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-600/20 border border-indigo-500/40 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Hash className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className="text-xs font-medium truncate">{room.name}</span>
                    </div>
                    {room.memberCount > 0 && (
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-800/80 rounded-full border border-slate-700/50">
                        {room.memberCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div>
            <div className="px-2 py-1 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Direct Messages
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">No contacts found</div>
            ) : (
              filteredUsers.map(u => {
                const isSelected = activeTarget?.type === 'dm' && activeTarget.data.id === u.id;
                const isOnline = onlineUsers.has(u.id) || u.status === 'online';
                return (
                  <button
                    key={u.id}
                    onClick={() => onSelectTarget({ type: 'dm', data: u })}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-600/20 border border-indigo-500/40 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="relative">
                        <img src={u.avatar} alt={u.username} className="w-7 h-7 rounded-lg bg-slate-800 object-cover" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-600'
                        }`} />
                      </div>
                      <span className="text-xs font-medium truncate">{u.username}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {isOnline ? 'online' : 'offline'}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoomCreated={handleRoomCreated}
      />
    </aside>
  );
}
