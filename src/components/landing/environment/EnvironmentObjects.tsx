'use client';

import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

export interface ParallaxProps {
  className?: string;
  depth?: number; // Depth factor for parallax (0.1 = background, 1.0 = foreground)
  scrollProgress?: MotionValue<number>;
}

// 1. CLOUDS (Background Layer - Soft floating clouds)
export function Clouds({ className = '', depth = 0.2 }: ParallaxProps) {
  return (
    <div className={`relative w-full h-32 overflow-hidden pointer-events-none select-none ${className}`}>
      {[
        { top: '10%', left: '5%', size: 'w-24 h-10', duration: 18, delay: 0 },
        { top: '25%', left: '40%', size: 'w-32 h-12', duration: 24, delay: 3 },
        { top: '15%', left: '75%', size: 'w-28 h-10', duration: 20, delay: 6 },
      ].map((cloud, i) => (
        <motion.div
          key={i}
          initial={{ x: 0 }}
          animate={{ x: [0, 40, 0] }}
          transition={{ duration: cloud.duration, repeat: Infinity, ease: 'easeInOut', delay: cloud.delay }}
          className={`absolute ${cloud.size} rounded-full bg-white/70 backdrop-blur-sm shadow-soft transform-gpu`}
          style={{ top: cloud.top, left: cloud.left }}
        />
      ))}
    </div>
  );
}

// 2. BIRDS (Background Layer - Flying flock)
export function Birds({ className = '' }: ParallaxProps) {
  return (
    <div className={`relative w-full h-20 pointer-events-none select-none ${className}`}>
      <motion.div
        animate={{ y: [0, -8, 0], x: [0, 15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center gap-4 opacity-60 transform-gpu"
      >
        {[0, 12, 24].map((offset, idx) => (
          <motion.svg
            key={idx}
            animate={{ rotate: [-4, 6, -4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.2 }}
            viewBox="0 0 32 16"
            className="w-6 h-4 stroke-secondary-800 fill-none stroke-[2]"
          >
            <path d="M 2 12 Q 8 2, 16 8 Q 24 2, 30 12" />
          </motion.svg>
        ))}
      </motion.div>
    </div>
  );
}

// 3. TREES (Midground Layer - Swaying Pine & Palm trees)
export function Trees({ className = '' }: ParallaxProps) {
  return (
    <div className={`flex items-end gap-6 pointer-events-none select-none ${className}`}>
      {[1, 2, 3].map((tree, i) => (
        <motion.svg
          key={i}
          animate={{ rotate: [-1.5, 2, -1.5] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
          viewBox="0 0 60 100"
          className="w-12 h-20 transform-gpu"
          style={{ transformOrigin: 'bottom center' }}
        >
          {/* Trunk */}
          <rect x="26" y="60" width="8" height="40" fill="#78350F" rx="2" />
          {/* Leaves */}
          <path d="M 30 5 L 55 45 L 5 45 Z" fill="#10B981" />
          <path d="M 30 25 L 50 65 L 10 65 Z" fill="#059669" />
        </motion.svg>
      ))}
    </div>
  );
}

// 4. BUILDINGS (Town & Office Buildings)
export function Buildings({ className = '' }: ParallaxProps) {
  return (
    <div className={`flex items-end gap-3 pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 120 140" className="w-24 h-28 drop-shadow-md">
        <rect x="10" y="20" width="100" height="120" rx="8" fill="#1E293B" />
        <rect x="25" y="35" width="20" height="20" rx="3" fill="#FDB813" opacity="0.8" />
        <rect x="75" y="35" width="20" height="20" rx="3" fill="#FDB813" opacity="0.8" />
        <rect x="25" y="70" width="20" height="20" rx="3" fill="#FFF" opacity="0.4" />
        <rect x="75" y="70" width="20" height="20" rx="3" fill="#FDB813" opacity="0.9" />
        <rect x="45" y="100" width="30" height="40" rx="4" fill="#FDB813" />
      </svg>
    </div>
  );
}

// 5. RESTAURANTS (Kuliner & Warung Kalirejo)
export function Restaurants({ className = '' }: ParallaxProps) {
  return (
    <div className={`flex items-end pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 140 120" className="w-28 h-24 drop-shadow-md">
        <rect x="10" y="30" width="120" height="90" rx="10" fill="#FFF" stroke="#E2E8F0" strokeWidth="2" />
        {/* Awning stripe */}
        <path d="M 10 30 L 130 30 L 130 50 L 10 50 Z" fill="#FF6B35" />
        <path d="M 30 30 L 50 30 L 50 50 L 30 50 Z" fill="#FFF" />
        <path d="M 70 30 L 90 30 L 90 50 L 70 50 Z" fill="#FFF" />
        <path d="M 110 30 L 130 30 L 130 50 L 110 50 Z" fill="#FFF" />
        {/* Signboard */}
        <rect x="35" y="10" width="70" height="18" rx="5" fill="#111" />
        <text x="70" y="23" fontSize="9" fontWeight="900" textAnchor="middle" fill="#FDB813">KULINER</text>
        {/* Door */}
        <rect x="55" y="70" width="30" height="50" rx="4" fill="#1E293B" />
      </svg>
    </div>
  );
}

// 6. MINIMARKET (Titip Belanja Store)
export function Minimarket({ className = '' }: ParallaxProps) {
  return (
    <div className={`flex items-end pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 140 120" className="w-28 h-24 drop-shadow-md">
        <rect x="10" y="30" width="120" height="90" rx="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="10" y="30" width="120" height="20" fill="#10B981" />
        <text x="70" y="44" fontSize="10" fontWeight="900" textAnchor="middle" fill="#FFF">PASAR / MINIMARKET</text>
        <rect x="25" y="65" width="35" height="40" rx="4" fill="#E2E8F0" />
        <rect x="80" y="65" width="35" height="40" rx="4" fill="#E2E8F0" />
      </svg>
    </div>
  );
}

// 7. HOSPITAL (Apotek & Klinik Kalirejo)
export function Hospital({ className = '' }: ParallaxProps) {
  return (
    <div className={`flex items-end pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 130 130" className="w-26 h-26 drop-shadow-md">
        <rect x="10" y="20" width="110" height="110" rx="12" fill="#FFF" stroke="#E2E8F0" strokeWidth="2" />
        {/* Red Cross */}
        <rect x="55" y="35" width="20" height="45" rx="3" fill="#EF4444" />
        <rect x="42.5" y="47.5" width="45" height="20" rx="3" fill="#EF4444" />
        <text x="65" y="100" fontSize="9" fontWeight="900" textAnchor="middle" fill="#1E293B">KLINIK / APOTEK</text>
      </svg>
    </div>
  );
}

// 8. GAS STATION (SPBU Kalirejo)
export function GasStation({ className = '' }: ParallaxProps) {
  return (
    <div className={`flex items-end pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 150 110" className="w-32 h-22 drop-shadow-md">
        {/* Canopy Roof */}
        <rect x="5" y="15" width="140" height="16" rx="4" fill="#EF4444" />
        <text x="75" y="27" fontSize="9" fontWeight="900" textAnchor="middle" fill="#FFF">SPBU KALIREJO</text>
        {/* Pillars */}
        <rect x="25" y="31" width="12" height="70" fill="#CBD5E1" />
        <rect x="113" y="31" width="12" height="70" fill="#CBD5E1" />
        {/* Pump */}
        <rect x="60" y="50" width="30" height="50" rx="6" fill="#1E293B" />
        <rect x="67" y="60" width="16" height="15" rx="3" fill="#FDB813" />
      </svg>
    </div>
  );
}

// 9. STREET LIGHTS (Lamp Posts with Warm Light Glow)
export function StreetLights({ className = '' }: ParallaxProps) {
  return (
    <div className={`relative pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 40 120" className="w-8 h-24 drop-shadow-sm">
        {/* Post */}
        <rect x="18" y="20" width="4" height="100" fill="#334155" rx="2" />
        <path d="M 20 20 C 20 5 35 5 35 15" stroke="#334155" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Lamp */}
        <circle cx="35" cy="17" r="5" fill="#FDB813" />
      </svg>
      {/* Light Cone */}
      <div
        className="absolute top-3 left-3 w-16 h-20 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(253, 184, 19, 0.6) 0%, transparent 80%)',
          clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)',
        }}
      />
    </div>
  );
}

// 10. TRAFFIC SIGNS (Speed Limit & Direction)
export function TrafficSigns({ className = '' }: ParallaxProps) {
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 50 100" className="w-10 h-20 drop-shadow-sm">
        <rect x="23" y="30" width="4" height="70" fill="#475569" rx="2" />
        {/* Speed sign */}
        <circle cx="25" cy="25" r="18" fill="#FFF" stroke="#EF4444" strokeWidth="4" />
        <text x="25" y="31" fontSize="13" fontWeight="900" textAnchor="middle" fill="#111">40</text>
      </svg>
    </div>
  );
}

// 11. ROAD MARKINGS (Zebra Cross & Arrows)
export function RoadMarkings({ className = '' }: ParallaxProps) {
  return (
    <div className={`w-full h-8 flex items-center justify-around pointer-events-none select-none ${className}`}>
      {[1, 2, 3, 4, 5].map((idx) => (
        <div key={idx} className="w-12 h-2.5 bg-white/90 rounded-sm transform -skew-x-12 shadow-sm" />
      ))}
    </div>
  );
}

// 12. ROAD (Asphalt Base & Lane Stripes)
export function Road({ className = '' }: ParallaxProps) {
  return (
    <div className={`relative w-full h-20 bg-secondary-900 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* Top Curb */}
      <div className="w-full h-2 bg-gradient-to-r from-amber-400 via-stone-800 to-amber-400 bg-[length:40px_100%]" />
      
      {/* Center Dashed Lines */}
      <div className="w-full h-full flex items-center justify-around">
        {[1, 2, 3, 4, 5, 6].map((dash) => (
          <div key={dash} className="w-16 h-2 bg-primary rounded-full shadow-golden opacity-90" />
        ))}
      </div>

      {/* Bottom Edge */}
      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-secondary-800" />
    </div>
  );
}
