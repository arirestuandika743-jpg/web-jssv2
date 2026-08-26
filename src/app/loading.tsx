'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#07090C] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute w-[300px] h-[300px] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center relative z-10 space-y-5">
        {/* JSS Logo with pulse animation */}
        <div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden shadow-golden animate-pulse-soft border border-primary/20">
          <Image
            src="/logo-jss.png"
            alt="JSS Logo"
            width={64}
            height={64}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        {/* Progress Line */}
        <div className="w-40 h-[2px] bg-white/[0.06] rounded-full overflow-hidden mx-auto">
          <div className="w-1/2 h-full bg-gradient-to-r from-primary to-accent rounded-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        </div>

        {/* Loading text */}
        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
          Menyiapkan layanan JSS...
        </p>
      </div>
    </div>
  );
}
