import React from 'react';
import { clsx } from 'clsx';
import { Clock, Send, AlertTriangle, RefreshCw } from 'lucide-react';
import { EmailStatus } from '../../types';

interface BadgeProps {
  status: EmailStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md', className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'SCHEDULED':
        return {
          label: 'Scheduled',
          icon: Clock,
          bg: 'bg-blue-950/60 text-blue-400 border-blue-800/60',
          dot: 'bg-blue-400',
        };
      case 'PROCESSING':
        return {
          label: 'Processing',
          icon: RefreshCw,
          bg: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
          dot: 'bg-amber-400 animate-pulse',
        };
      case 'SENT':
        return {
          label: 'Sent',
          icon: Send,
          bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
          dot: 'bg-emerald-400',
        };
      case 'FAILED':
        return {
          label: 'Failed',
          icon: AlertTriangle,
          bg: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
          dot: 'bg-rose-400',
        };
      default:
        return {
          label: status,
          icon: Clock,
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border shadow-sm',
        config.bg,
        size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5',
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
      <Icon className={clsx('w-3 h-3', status === 'PROCESSING' && 'animate-spin')} />
      <span>{config.label}</span>
    </span>
  );
};
