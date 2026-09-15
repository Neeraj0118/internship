import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border-b border-indigo-900/50 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-200 tracking-tight">
                EmpManager <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">v1.0</span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Employee Management System & Admin Portal</p>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700/60">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs shadow-inner">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-semibold text-slate-200 flex items-center gap-1">
                  {user?.name || 'Administrator'}
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xs text-slate-400">{user?.email || 'admin@company.com'}</div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="flex items-center space-x-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg border border-red-500/20 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
