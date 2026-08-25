'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2, Sparkles, Heart } from 'lucide-react';

export interface CinematicAtmosphereProps {
  showCelebration?: boolean;
  onCloseCelebration?: () => void;
}

export function CinematicAtmosphere({
  showCelebration = false,
  onCloseCelebration,
}: CinematicAtmosphereProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none transform-gpu">
      {/* 1. Dynamic Sunlight Flare & Ambient Light Spot */}
      <motion.div
        animate={{
          opacity: [0.35, 0.6, 0.35],
          scale: [1, 1.06, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none transform-gpu"
        style={{
          background: 'radial-gradient(circle at center, rgba(253, 184, 19, 0.22) 0%, rgba(255, 107, 53, 0.1) 45%, transparent 75%)',
        }}
      />

      {/* 2. Floating Leaves Drifting in Soft Wind */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { left: '12%', delay: 0, duration: 12 },
          { left: '42%', delay: 4, duration: 15 },
          { left: '78%', delay: 8, duration: 14 },
        ].map((leaf, idx) => (
          <motion.svg
            key={idx}
            initial={{ y: -40, opacity: 0, rotate: 0 }}
            animate={{
              y: ['0vh', '100vh'],
              x: [-20, 25, -15, 20],
              opacity: [0, 0.7, 0.7, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: leaf.duration,
              repeat: Infinity,
              delay: leaf.delay,
              ease: 'easeInOut',
            }}
            style={{ left: leaf.left }}
            viewBox="0 0 24 24"
            className="absolute w-5 h-5 fill-emerald-500/40 stroke-emerald-600/30 transform-gpu"
          >
            <path d="M 12 2 C 6 8 2 14 6 20 C 12 22 18 18 22 12 C 22 6 18 2 12 2 Z M 12 2 L 12 20" />
          </motion.svg>
        ))}
      </div>

      {/* 3. Soft Translucent Wind Lines */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { top: '25%', duration: 3, delay: 0 },
          { top: '55%', duration: 4, delay: 1.5 },
          { top: '80%', duration: 3.5, delay: 3 },
        ].map((line, idx) => (
          <motion.div
            key={idx}
            initial={{ x: '-20%', opacity: 0 }}
            animate={{
              x: ['-20%', '120%'],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: line.duration,
              repeat: Infinity,
              delay: line.delay,
              ease: 'linear',
            }}
            className="absolute h-0.5 w-48 bg-gradient-to-r from-transparent via-primary/30 to-transparent transform-gpu"
            style={{ top: line.top }}
          />
        ))}
      </div>

      {/* 4. Delivery Completed Success Celebration Banner & Confetti */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-md pointer-events-auto">
            {/* Confetti Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    scale: 0,
                  }}
                  animate={{
                    x: `${(Math.random() - 0.5) * 80 + 50}vw`,
                    y: `${(Math.random() - 0.5) * 80 + 50}vh`,
                    scale: [0.5, 1, 0.8],
                    rotate: [0, 360],
                    opacity: [1, 1, 0],
                  }}
                  transition={{ duration: 2.5, ease: 'easeOut' }}
                  className={`absolute w-3 h-3 rounded-full ${
                    i % 3 === 0 ? 'bg-primary' : i % 3 === 1 ? 'bg-emerald-400' : 'bg-accent'
                  }`}
                />
              ))}
            </div>

            {/* Celebration Modal Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-soft-xl border border-secondary-100 space-y-5 relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <h3 className="text-2xl font-black text-secondary-900 tracking-tight">
                  Pengantaran Sukses!
                </h3>
                <p className="text-xs text-secondary-500 font-medium mt-1">
                  Paket & Titipan Telah Sampai Tepat Waktu di Kalirejo
                </p>
              </div>

              <button
                onClick={onCloseCelebration}
                className="w-full py-3.5 bg-secondary-900 text-white rounded-2xl font-extrabold text-xs shadow-md hover:bg-secondary-800 transition-all"
              >
                Tutup & Kembali ke Beranda
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
