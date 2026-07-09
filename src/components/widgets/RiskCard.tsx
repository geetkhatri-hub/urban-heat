import React from 'react';
import { motion } from 'framer-motion';

interface RiskCardProps {
  label: string;
  level: 'Low' | 'Medium' | 'High' | 'Extreme' | 'Critical';
  description?: string;
  dark?: boolean;
}

const RISK_CONFIG = {
  Low: { color: 'text-green-600', bg: 'bg-green-50', ring: 'border-green-200', bar: 'bg-green-500', pct: 20 },
  Medium: { color: 'text-orange-500', bg: 'bg-orange-50', ring: 'border-orange-200', bar: 'bg-orange-400', pct: 50 },
  High: { color: 'text-red-500', bg: 'bg-red-50', ring: 'border-red-200', bar: 'bg-red-500', pct: 75 },
  Extreme: { color: 'text-red-700', bg: 'bg-red-100', ring: 'border-red-300', bar: 'bg-red-700', pct: 90 },
  Critical: { color: 'text-rose-800', bg: 'bg-rose-100', ring: 'border-rose-400', bar: 'bg-rose-800', pct: 100 },
};

export const RiskCard: React.FC<RiskCardProps> = ({ label, level, description, dark = false }) => {
  const config = RISK_CONFIG[level] || RISK_CONFIG.Medium;
  const cardBg = dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const labelColor = dark ? 'text-slate-300' : 'text-slate-700';
  const descColor = dark ? 'text-slate-500' : 'text-slate-400';

  return (
    <motion.div
      className={`${cardBg} rounded-2xl border p-5 shadow-sm`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-medium ${labelColor}`}>{label}</span>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${config.bg} ${config.color} border ${config.ring}`}>
          {level}
        </span>
      </div>
      {/* Risk bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <motion.div
          className={`h-full rounded-full ${config.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${config.pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {description && <p className={`text-xs ${descColor}`}>{description}</p>}
    </motion.div>
  );
};
