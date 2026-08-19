import React from 'react';
import { Card } from '../common/Card';
import { Clock, Send, AlertTriangle, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

interface StatsCardProps {
  title: string;
  value: number;
  type: 'scheduled' | 'processing' | 'sent' | 'failed';
  subtext?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, type, subtext, onClick, isActive }) => {
  const getConfig = () => {
    switch (type) {
      case 'scheduled':
        return {
          icon: Clock,
          color: 'text-blue-400',
          bg: 'bg-blue-950/40 border-blue-800/40',
          activeBorder: 'ring-2 ring-blue-500 bg-blue-950/30',
        };
      case 'processing':
        return {
          icon: RefreshCw,
          color: 'text-amber-400',
          bg: 'bg-amber-950/40 border-amber-800/40',
          activeBorder: 'ring-2 ring-amber-500 bg-amber-950/30',
        };
      case 'sent':
        return {
          icon: Send,
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/40 border-emerald-800/40',
          activeBorder: 'ring-2 ring-emerald-500 bg-emerald-950/30',
        };
      case 'failed':
        return {
          icon: AlertTriangle,
          color: 'text-rose-400',
          bg: 'bg-rose-950/40 border-rose-800/40',
          activeBorder: 'ring-2 ring-rose-500 bg-rose-950/30',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={clsx(
        'cursor-pointer transition-all duration-200 transform active:scale-95 rounded-2xl',
        isActive && config.activeBorder
      )}
    >
      <Card hoverEffect className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value.toLocaleString()}</p>
          {subtext && <p className="text-[11px] text-slate-400 mt-0.5">{subtext}</p>}
        </div>
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center border', config.bg)}>
          <Icon className={clsx('w-6 h-6', config.color, type === 'processing' && 'animate-spin')} />
        </div>
      </Card>
    </div>
  );
};
