'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const DELIVERY_STAGES = [
  { step: 1, name: 'Hero', title: 'Driver Standby', subtitle: 'Kalirejo Central Hub' },
  { step: 2, name: 'Layanan', title: 'Terima Orderan', subtitle: 'Notifikasi Masuk' },
  { step: 3, name: 'Keunggulan', title: 'Perjalanan', subtitle: 'Meluncur Jalan Kalirejo' },
  { step: 4, name: 'Cara Kerja', title: 'Ambil Titipan', subtitle: 'Belanja / Paket Diambil' },
  { step: 5, name: 'Area', title: 'Pengantaran', subtitle: 'Menuju Rumah Pelanggan' },
  { step: 6, name: 'Testimoni', title: 'Pesanan Selesai', subtitle: 'Diterima & Bintang 5' },
];

export interface DriverJourneyProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  speed?: number;
}

/**
 * DriverJourney Component — Fully Animated JSS Mascot (60 FPS Framer Motion Loops)
 * 
 * Features 8 natural looping animations:
 * 1. Wheel rotation (front & rear wheels)
 * 2. Idle movement (suspension rumble & float)
 * 3. Suspension (pitch lean & chassis compression)
 * 4. Helmet movement (subtle wind head bobbing)
 * 5. Clothes movement (jacket wave/ripple micro-motion)
 * 6. Headlight glow (glowing light cone pulse)
 * 7. Exhaust smoke (floating particle puffs)
 * 8. Soft shadow (pulsing ground shadow)
 */
export function DriverJourney({
  className = '',
  width = '100%',
  height = '100%',
  speed = 1,
}: DriverJourneyProps) {
  const wheelDuration = 0.8 / speed;
  const idleDuration = 0.6;
  const smokeDuration = 1.4 / speed;

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center p-4 select-none transform-gpu ${className}`}>
      {/* Outer Radial Glow Accent */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-soft" />

      {/* Mascot Main Vector Container */}
      <div className="relative w-full max-w-[360px] aspect-[1.3/1] flex flex-col items-center justify-center">
        
        {/* 6. Animated Headlight Beam Cone */}
        <motion.div
          animate={{ opacity: [0.55, 0.88, 0.55], scaleY: [1, 1.04, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-0 top-[40%] translate-x-[45%] -translate-y-1/2 w-48 sm:w-56 h-28 pointer-events-none z-0 transform-gpu"
        >
          <div
            className="w-full h-full"
            style={{
              background: 'radial-gradient(ellipse at left, rgba(253, 184, 19, 0.45) 0%, rgba(255, 235, 170, 0.2) 40%, transparent 80%)',
              clipPath: 'polygon(0% 45%, 100% 0%, 100% 100%, 0% 55%)',
            }}
          />
        </motion.div>

        {/* 7. Animated Exhaust Smoke Particles */}
        <div className="absolute left-[12%] bottom-[32%] z-0 pointer-events-none">
          {[0, 0.45, 0.9].map((delay, index) => (
            <motion.div
              key={index}
              initial={{ x: 0, y: 0, scale: 0.5, opacity: 0.8 }}
              animate={{
                x: [-5, -28, -52],
                y: [0, -12, -26],
                scale: [0.5, 1.2, 1.8],
                opacity: [0.75, 0.35, 0],
              }}
              transition={{
                duration: smokeDuration,
                repeat: Infinity,
                delay: delay,
                ease: 'easeOut',
              }}
              className="absolute w-3.5 h-3.5 rounded-full bg-slate-300/60 blur-[1px] transform-gpu"
            />
          ))}
        </div>

        {/* 2 & 3. Animated Floating & Suspension Motorcycle Assembly */}
        <motion.div
          animate={{
            y: [0, -3.5, 0, 2.5, 0],
            rotate: [-0.8, 1.2, -0.8],
          }}
          transition={{
            duration: idleDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative z-10 w-full h-full flex items-center justify-center transform-gpu"
        >
          <svg
            viewBox="0 0 320 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xl"
            style={{ width, height }}
          >
            {/* Delivery Box */}
            <g id="jss-delivery-box">
              <rect x="52" y="85" width="58" height="52" rx="10" fill="#111111" />
              <rect x="56" y="89" width="50" height="44" rx="7" fill="#1F1F1F" />
              <rect x="65" y="102" width="32" height="18" rx="5" fill="#FDB813" />
              <text
                x="81"
                y="115"
                fontSize="10"
                fontWeight="900"
                textAnchor="middle"
                fill="#111111"
                fontFamily="sans-serif"
              >
                JSS
              </text>
            </g>

            {/* Motorcycle Body & Frame */}
            <g id="motorcycle-body">
              <path d="M 85 145 L 140 145 L 180 135 L 210 115 L 190 100 L 145 105 Z" fill="#FDB813" />
              <path d="M 125 145 L 175 145 L 205 125 L 185 110 L 145 115 Z" fill="#FF6B35" />
              
              {/* Front Shield & Nose */}
              <path d="M 195 100 L 235 102 L 225 135 L 195 130 Z" fill="#111111" />
              <path d="M 200 105 L 230 107 L 222 130 L 198 126 Z" fill="#FDB813" />

              {/* Headlight Lamp */}
              <path d="M 230 107 L 240 108 L 238 118 L 227 116 Z" fill="#FFF" />
              <circle cx="234" cy="112" r="4" fill="#FDB813" />

              {/* Exhaust Pipe */}
              <path d="M 75 158 L 115 158" stroke="#444" strokeWidth="7" strokeLinecap="round" />
              <path d="M 108 158 L 122 158" stroke="#FDB813" strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* JSS Driver Character */}
            <g id="jss-driver">
              {/* Driver Legs */}
              <path d="M 130 118 L 142 145 L 170 148" stroke="#111111" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* 5. Animated Driver Clothes & Jacket Ripple */}
              <motion.g
                animate={{ x: [0, -1.8, 0], scaleY: [1, 1.02, 1] }}
                transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '130px 90px' }}
              >
                <path d="M 120 70 L 155 70 L 165 115 L 125 115 Z" fill="#111111" />
                <path d="M 132 70 L 155 70 L 160 115 L 138 115 Z" fill="#10B981" />
              </motion.g>

              {/* Driver Arms holding Handlebar */}
              <path d="M 140 78 L 182 92 L 210 98" stroke="#111111" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />

              {/* 4. Animated Helmet Wind Bobbing */}
              <motion.g
                animate={{ y: [0, -1.8, 0, 1.2, 0], rotate: [-1.2, 1.5, -1.2] }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '140px 52px' }}
              >
                <circle cx="140" cy="52" r="22" fill="#FDB813" />
                <path d="M 144 42 C 158 42 162 52 158 60 L 140 60 Z" fill="#1F2937" />
                <path d="M 128 38 C 138 33 150 35 154 40" stroke="#FFF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
              </motion.g>
            </g>

            {/* 1. Animated Rear Rotating Wheel */}
            <g id="rear-wheel" transform="translate(90, 160)">
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: wheelDuration, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '0px 0px' }}
              >
                <circle cx="0" cy="0" r="28" fill="#1F2937" stroke="#111" strokeWidth="3" />
                <circle cx="0" cy="0" r="17" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
                <line x1="-15" y1="0" x2="15" y2="0" stroke="#4B5563" strokeWidth="2.5" />
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#4B5563" strokeWidth="2.5" />
                <line x1="-10" y1="-10" x2="10" y2="10" stroke="#4B5563" strokeWidth="2" />
                <line x1="-10" y1="10" x2="10" y2="-10" stroke="#4B5563" strokeWidth="2" />
                <circle cx="0" cy="0" r="6" fill="#FDB813" />
              </motion.g>
            </g>

            {/* 1. Animated Front Rotating Wheel */}
            <g id="front-wheel" transform="translate(225, 160)">
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: wheelDuration, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '0px 0px' }}
              >
                <circle cx="0" cy="0" r="28" fill="#1F2937" stroke="#111" strokeWidth="3" />
                <circle cx="0" cy="0" r="17" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
                <line x1="-15" y1="0" x2="15" y2="0" stroke="#4B5563" strokeWidth="2.5" />
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#4B5563" strokeWidth="2.5" />
                <line x1="-10" y1="-10" x2="10" y2="10" stroke="#4B5563" strokeWidth="2" />
                <line x1="-10" y1="10" x2="10" y2="-10" stroke="#4B5563" strokeWidth="2" />
                <circle cx="0" cy="0" r="6" fill="#FDB813" />
              </motion.g>
            </g>

            {/* Animated Road Track Dashes */}
            <g id="scrolling-road-track">
              <line x1="-50" y1="192" x2="370" y2="192" stroke="#111111" strokeWidth="4" strokeDasharray="16 12" />
            </g>
          </svg>
        </motion.div>

        {/* 8. Animated Soft Ground Shadow */}
        <motion.div
          animate={{
            scaleX: [1, 0.94, 1],
            opacity: [0.35, 0.22, 0.35],
          }}
          transition={{
            duration: idleDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-[75%] h-4 bg-secondary-900 rounded-full blur-md -mt-3 z-0 transform-gpu"
        />
      </div>
    </div>
  );
}
