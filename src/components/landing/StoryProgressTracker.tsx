'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Bike, Sparkles, Navigation, MapPin, PackageCheck, CheckCircle2 } from 'lucide-react';
import { DELIVERY_STAGES } from './DriverJourney';

interface StoryProgressTrackerProps {
  currentStage: number;
}

export function StoryProgressTracker({ currentStage }: StoryProgressTrackerProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const activeStage = DELIVERY_STAGES[Math.min(Math.max(currentStage, 0), DELIVERY_STAGES.length - 1)];

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      {/* Top Thin Golden Story Progress Line */}
      <motion.div
        className="h-1 bg-gradient-to-r from-primary via-accent to-emerald-500 origin-left shadow-golden"
        style={{ scaleX }}
      />

      {/* Floating Story Progress Pill (Mobile & Desktop) */}
      <div className="container-padding mt-16 sm:mt-20 flex justify-end pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto bg-secondary-900/90 backdrop-blur-xl text-white px-3.5 py-2 rounded-full border border-white/15 shadow-2xl flex items-center gap-3"
        >
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-secondary-900 font-bold shadow-sm flex-shrink-0">
            <Bike className="w-4 h-4" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                Perjalanan Driver JSS
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-white/10 rounded-full font-semibold">
                {activeStage.step}/6
              </span>
            </div>
            <span className="text-xs font-extrabold text-white leading-none mt-0.5">
              {activeStage.title}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
