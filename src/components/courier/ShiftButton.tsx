'use client';

import { motion } from 'framer-motion';
import { Power, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ShiftButtonProps {
  isActive: boolean;
  onStart: () => Promise<void>;
  onEnd: () => Promise<void>;
}

export default function ShiftButton({ isActive, onStart, onEnd }: ShiftButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isActive) {
        await onEnd();
      } else {
        await onStart();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleToggle}
      disabled={loading}
      className={`
        w-full rounded-2xl p-4 flex items-center justify-center gap-3
        font-bold text-lg transition-all duration-300 shadow-lg
        ${isActive
          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30'
          : 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-secondary-900 shadow-emerald-500/30'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <>
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${isActive ? 'bg-white/20' : 'bg-black/10'}
          `}>
            <Power className="w-5 h-5" />
          </div>
          <span>{isActive ? '🔴 Selesai Kerja' : '🟢 Mulai Kerja'}</span>
        </>
      )}

      {/* Pulse ring animation when active */}
      {isActive && !loading && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-red-400"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
}
