import React from 'react';

interface LoadingSkeletonProps {
  lines?: number;
  dark?: boolean;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ lines = 3, dark = false, className = '' }) => {
  const base = dark ? 'bg-slate-800' : 'bg-slate-100';
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-4 rounded-lg ${base}`} style={{ width: `${100 - i * 12}%` }} />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const bg = dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const base = dark ? 'bg-slate-800' : 'bg-slate-100';
  return (
    <div className={`${bg} rounded-2xl border p-5 shadow-sm animate-pulse`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl ${base}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-3 rounded ${base} w-1/2`} />
          <div className={`h-5 rounded ${base} w-3/4`} />
        </div>
      </div>
      <div className={`h-2 rounded-full ${base}`} />
    </div>
  );
};

export const ChartSkeleton: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const bg = dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const base = dark ? 'bg-slate-800' : 'bg-slate-100';
  return (
    <div className={`${bg} rounded-2xl border p-6 shadow-sm animate-pulse`}>
      <div className={`h-4 rounded ${base} w-1/3 mb-6`} />
      <div className="flex items-end gap-2 h-40">
        {[60, 80, 45, 90, 70, 85, 55].map((h, i) => (
          <div key={i} className={`flex-1 rounded-t-lg ${base}`} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
};
