import React from 'react';
import { motion } from 'framer-motion';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  dark?: boolean;
  action?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, dark = false, action }) => {
  const cardBg = dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const titleColor = dark ? 'text-white' : 'text-slate-900';
  const subtitleColor = dark ? 'text-slate-400' : 'text-slate-500';

  return (
    <motion.div
      className={`${cardBg} rounded-2xl border p-6 shadow-sm`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`text-base font-semibold ${titleColor}`}>{title}</h3>
          {subtitle && <p className={`text-xs mt-0.5 ${subtitleColor}`}>{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </motion.div>
  );
};
