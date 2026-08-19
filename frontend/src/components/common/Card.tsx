import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 shadow-xl transition-all duration-200',
        hoverEffect && 'hover:border-slate-700 hover:shadow-2xl hover:bg-slate-900/90',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
