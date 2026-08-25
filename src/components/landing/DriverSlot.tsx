'use client';

import { motion } from 'framer-motion';
import { Bike, ShieldCheck, Sparkles, Navigation } from 'lucide-react';

interface DriverSlotProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * DriverSlot Component
 * 
 * Reserved fluid container slot for the future 3D/animated JSS Driver component.
 * Ensures zero layout shifts when the animated driver is integrated in Phase 2.
 */
export function DriverSlot({ children, className = '' }: DriverSlotProps) {
  return (
    <div className={`relative w-full max-w-lg mx-auto aspect-[4/3] md:aspect-square lg:aspect-[4/3.8] flex items-center justify-center ${className}`}>
      {/* Outer Radial Ambient Glows */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl transform-gpu animate-pulse-soft" />
      <div className="absolute -inset-4 bg-gradient-to-bl from-primary-400/10 via-transparent to-primary/10 rounded-full blur-2xl transform-gpu" />

      {/* If animated driver component is passed in Phase 2, render it here */}
      {children ? (
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {children}
        </div>
      ) : (
        /* Phase 1 Layout Slot Placeholder */
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 text-center">
          {/* Glass Card Container prepared for Driver */}
          <div className="relative w-full h-full rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-soft-xl overflow-hidden flex flex-col items-center justify-between p-6 sm:p-8">
            {/* Top Status Header */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-bold text-emerald-800">
                  Driver Standby Kalirejo
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30">
                <Sparkles className="w-3.5 h-3.5 text-secondary-900" />
                <span className="text-[11px] font-bold text-secondary-900">
                  Respon &lt; 3 Mnt
                </span>
              </div>
            </div>

            {/* Center Visual Mock / Driver Preparation Area */}
            <div className="relative my-auto flex flex-col items-center justify-center">
              {/* Pulsing Target Rings */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-dashed border-primary/40 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-3 rounded-full border border-primary/20 animate-[spin_12s_linear_infinite_reverse]" />
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-primary via-primary-400 to-accent flex items-center justify-center shadow-golden transform-gpu transition-all duration-500 hover:scale-105">
                  <Bike className="w-10 h-10 text-secondary-900" />
                </div>
              </div>
              
              <div className="mt-4 space-y-1">
                <h4 className="text-sm font-extrabold text-secondary-900 tracking-tight">
                  Area Slot Driver JSS
                </h4>
                <p className="text-xs text-secondary-500 max-w-xs font-medium">
                  Siap melayani kebutuhan antar-jemput & titip beli di Kalirejo
                </p>
              </div>
            </div>

            {/* Bottom Quick Metric Pills */}
            <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-secondary-100">
              <div className="flex items-center gap-2.5 bg-white/80 p-2.5 rounded-2xl border border-secondary-100/80">
                <div className="w-7 h-7 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-3.5 h-3.5 text-secondary-900" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-secondary-400 block font-semibold uppercase">Area</span>
                  <span className="text-xs font-bold text-secondary-900">Kalirejo Hub</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white/80 p-2.5 rounded-2xl border border-secondary-100/80">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-secondary-400 block font-semibold uppercase">Jaminan</span>
                  <span className="text-xs font-bold text-secondary-900">100% Aman</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Driver Rating Pill */}
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-3 -right-2 bg-white rounded-2xl px-4 py-2.5 shadow-soft-xl border border-secondary-100 flex items-center gap-3 z-20"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
              ✓
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-secondary-900 leading-tight">Driver Terverifikasi</p>
              <p className="text-[10px] text-secondary-500 font-medium">Kalirejo & Sekitarnya</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
