import React from 'react';
import { LogOut, Plus, RefreshCw, Send } from 'lucide-react';
import { Button } from '../common/Button';
import { User } from '../../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onOpenCompose: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenCompose,
  onRefresh,
  refreshing,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand logo for mobile / title */}
      <div className="flex items-center space-x-3">
        <div className="md:hidden flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Send className="w-4 h-4" />
          </div>
          <span className="font-bold text-white tracking-tight">ReachInbox</span>
        </div>
        <div className="hidden md:block">
          <h1 className="text-sm font-medium text-slate-400">
            Welcome back, <span className="text-white font-semibold">{user?.name || 'Explorer'}</span>
          </h1>
        </div>
      </div>

      {/* Action buttons & User profile */}
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          loading={refreshing}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenCompose}
          icon={<Plus className="w-4 h-4" />}
        >
          Compose Campaign
        </Button>

        <div className="h-6 w-px bg-slate-800 mx-1" />

        {/* User profile dropdown or info */}
        <div className="flex items-center space-x-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full ring-2 ring-brand-500/30 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-brand-400 font-semibold flex items-center justify-center text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <div className="hidden lg:block text-left text-xs leading-tight">
            <p className="font-medium text-slate-200">{user?.name}</p>
            <p className="text-slate-400 truncate max-w-[140px]">{user?.email}</p>
          </div>

          <button
            onClick={onLogout}
            title="Logout"
            className="text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 p-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
