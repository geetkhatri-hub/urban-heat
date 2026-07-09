import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  dark?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Failed to load data. Please try again.',
  onRetry,
  dark = false,
}) => {
  const cardBg = dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const textColor = dark ? 'text-slate-300' : 'text-slate-600';

  return (
    <motion.div
      className={`${cardBg} rounded-2xl border p-8 flex flex-col items-center text-center shadow-sm`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-red-50 p-4 rounded-2xl mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <p className={`text-sm ${textColor} mb-4 max-w-xs`}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </motion.div>
  );
};
