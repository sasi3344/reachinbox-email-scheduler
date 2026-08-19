import React from 'react';
import { CalendarClock, CheckCircle2, Send, BarChart3, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

export type ActiveTab = 'scheduled' | 'sent' | 'analytics';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  scheduledCount: number;
  sentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  scheduledCount,
  sentCount,
}) => {
  const navItems = [
    {
      id: 'scheduled' as ActiveTab,
      label: 'Scheduled Queue',
      icon: CalendarClock,
      badge: scheduledCount,
    },
    {
      id: 'sent' as ActiveTab,
      label: 'Sent Outbox',
      icon: CheckCircle2,
      badge: sentCount,
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'System & Architecture',
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white tracking-tight text-base">ReachInbox</h2>
            <p className="text-[11px] text-brand-400 font-medium">Enterprise Scheduler</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={clsx('w-4 h-4', isActive ? 'text-brand-400' : 'text-slate-400')} />
                  <span>{item.label}</span>
                </div>
                {typeof item.badge === 'number' && (
                  <span
                    className={clsx(
                      'text-xs px-2 py-0.5 rounded-full font-semibold',
                      isActive ? 'bg-brand-500/20 text-brand-300' : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status card in sidebar footer */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>BullMQ Engine</span>
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Delayed queuing via Redis. Zero cron dependencies.
        </p>
      </div>
    </aside>
  );
};
