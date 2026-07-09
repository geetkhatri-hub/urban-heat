import React from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accentColor?: string;
  bgColor?: string;
  iconBg?: string;
  dark?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon,
  trend,
  trendValue,
  accentColor = 'text-orange-500',
  iconBg = 'bg-orange-50',
  dark = false,
}) => {
  const cardBg = dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const labelColor = dark ? 'text-slate-400' : 'text-slate-500';
  const valueColor = dark ? 'text-white' : 'text-slate-900';

  const trendColors = {
    up: 'text-red-500 bg-red-50',
    down: 'text-green-600 bg-green-50',
    neutral: 'text-slate-500 bg-slate-100',
  };

  return (
    <motion.div
      className={`${cardBg} rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-default`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBg} p-3 rounded-xl ${accentColor}`}>
          {icon}
        </div>
        {trend && trendValue && (
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${trendColors[trend]}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
      <div>
        <p className={`text-xs font-medium uppercase tracking-widest mb-1 ${labelColor}`}>{label}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${valueColor}`}>{value}</span>
          {unit && <span className={`text-sm font-medium ${labelColor}`}>{unit}</span>}
        </div>
      </div>
    </motion.div>
  );
};
