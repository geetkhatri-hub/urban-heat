import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated Logo */}
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl"
          />
          <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-5 rounded-2xl shadow-2xl">
            <Flame className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            UrbanHeat<span className="text-orange-400">X</span> AI
          </h1>
          <p className="text-slate-500 text-sm mt-1">Loading Command Center...</p>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-orange-500"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
