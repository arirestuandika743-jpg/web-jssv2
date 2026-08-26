'use client';

import { useEffect, useRef } from 'react';

/**
 * CinematicBackground — Multi-layered dark atmospheric background
 * Layers: deep black → ambient gradient → warm JSS glow → haze → minimal particles → film grain
 * Uses CSS only, no WebGL. Respects prefers-reduced-motion.
 */
export function CinematicBackground() {
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Layer 1 — Deep Background */}
      <div className="absolute inset-0 bg-[#07090C]" />

      {/* Layer 2 — Atmospheric Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #07090C 0%, #0A0E13 30%, #0B0F14 60%, #07090C 100%)',
        }}
      />

      {/* Layer 3 — Ambient JSS Warm Glow */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full animate-ambient-drift"
        style={{
          background: 'radial-gradient(circle, rgba(255,201,40,0.04) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] rounded-full animate-ambient-drift"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,53,0.03) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animationDelay: '10s',
          animationDirection: 'reverse',
        }}
      />
      <div
        className="absolute top-[40%] left-[50%] w-[40%] h-[40%] -translate-x-1/2 rounded-full animate-ambient-drift"
        style={{
          background: 'radial-gradient(circle, rgba(255,201,40,0.025) 0%, transparent 60%)',
          filter: 'blur(120px)',
          animationDelay: '5s',
        }}
      />

      {/* Layer 4 — Atmospheric Haze */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.01) 0%, transparent 60%)',
        }}
      />

      {/* Layer 5 — Minimal Particles (CSS-only) */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-[2px] h-[2px] rounded-full bg-white/20 animate-particle-float"
          style={{
            left: `${15 + i * 14}%`,
            animationDuration: `${14 + i * 3}s`,
            animationDelay: `${i * 2.5}s`,
          }}
        />
      ))}

      {/* Layer 6 — Film Grain (very subtle) */}
      <div className="film-grain" />
    </div>
  );
}
