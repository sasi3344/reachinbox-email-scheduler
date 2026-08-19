import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-slate-800 rounded-md w-1/4 mb-6"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-4 bg-slate-800 rounded w-1/4"></div>
          <div className="h-4 bg-slate-800 rounded w-1/3"></div>
          <div className="h-4 bg-slate-800 rounded w-1/6"></div>
          <div className="h-4 bg-slate-800 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  );
};
