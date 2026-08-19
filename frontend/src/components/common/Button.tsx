import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-sm';

  const variantStyles = {
    primary:
      'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500 shadow-brand-500/25',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 focus:ring-slate-400',
    outline:
      'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700 focus:ring-brand-500',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-rose-600/25',
    ghost:
      'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white focus:ring-slate-500 shadow-none',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
