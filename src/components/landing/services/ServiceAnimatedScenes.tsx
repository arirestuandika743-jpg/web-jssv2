'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface ServiceSceneProps {
  className?: string;
}

// 1. MOTORCYCLE TAXI (Ojek Online - Passenger Helmet & Route Pulsing)
export function MotorcycleTaxiScene({ className = '' }: ServiceSceneProps) {
  return (
    <div className={`relative w-full aspect-[4/3] flex items-center justify-center pointer-events-none select-none ${className}`}>
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Pulsing Target Aura */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md transform-gpu"
        />

        <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-xl z-10">
          {/* Passenger Scooter */}
          <path d="M 20 80 L 50 80 L 80 70 L 100 55 L 90 40 L 55 45 Z" fill="#FDB813" />
          <circle cx="35" cy="90" r="14" fill="#1F2937" stroke="#111" strokeWidth="2" />
          <circle cx="85" cy="90" r="14" fill="#1F2937" stroke="#111" strokeWidth="2" />
          
          {/* Passenger Helmet */}
          <motion.g
            animate={{ y: [0, -4, 0], rotate: [-2, 3, -2] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '70px 30px' }}
          >
            <circle cx="70" cy="30" r="14" fill="#10B981" />
            <path d="M 72 23 C 82 23 85 30 82 35 L 70 35 Z" fill="#1F2937" />
          </motion.g>
        </svg>
      </div>
    </div>
  );
}

// 2. FOOD DELIVERY (Hot Steaming Culinary Bowl)
export function FoodDeliveryScene({ className = '' }: ServiceSceneProps) {
  return (
    <div className={`relative w-full aspect-[4/3] flex items-center justify-center pointer-events-none select-none ${className}`}>
      <div className="relative w-36 h-36 flex flex-col items-center justify-center">
        {/* Rising Steam Particles */}
        <div className="absolute top-4 flex gap-3">
          {[0, 0.3, 0.6].map((delay, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 0, opacity: 0.8, scale: 0.8 }}
              animate={{ y: [-5, -22], opacity: [0.8, 0], scale: [0.8, 1.4] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: delay, ease: 'easeOut' }}
              className="w-2 h-6 rounded-full bg-amber-400/50 blur-[1px] transform-gpu"
            />
          ))}
        </div>

        <motion.svg
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          viewBox="0 0 120 120"
          className="w-28 h-28 drop-shadow-xl z-10"
        >
          {/* Culinary Bowl */}
          <ellipse cx="60" cy="75" rx="40" ry="20" fill="#FF6B35" />
          <path d="M 20 75 Q 60 115, 100 75 Z" fill="#E85520" />
          {/* Food Cover */}
          <path d="M 30 65 Q 60 30, 90 65 Z" fill="#FDB813" />
          <circle cx="60" cy="32" r="5" fill="#111" />
        </motion.svg>
      </div>
    </div>
  );
}

// 3. SHOPPING SERVICE (Titip Belanja Market Basket)
export function ShoppingServiceScene({ className = '' }: ServiceSceneProps) {
  return (
    <div className={`relative w-full aspect-[4/3] flex items-center justify-center pointer-events-none select-none ${className}`}>
      <div className="relative w-36 h-36 flex items-center justify-center">
        <motion.svg
          animate={{ y: [0, -4, 0], rotate: [-1, 2, -1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          viewBox="0 0 120 120"
          className="w-28 h-28 drop-shadow-xl"
        >
          {/* Basket Base */}
          <rect x="25" y="55" width="70" height="45" rx="8" fill="#FDB813" />
          <path d="M 20 55 L 100 55 L 92 95 L 28 95 Z" fill="#EAB308" />
          {/* Basket Handle */}
          <path d="M 35 55 Q 60 20, 85 55" stroke="#111" strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* Floating Purchased Items */}
          <motion.circle
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            cx="45"
            cy="45"
            r="10"
            fill="#EF4444"
          />
          <motion.rect
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            x="65"
            y="38"
            width="18"
            height="22"
            rx="4"
            fill="#10B981"
          />
        </motion.svg>
      </div>
    </div>
  );
}

// 4. MEDICINE DELIVERY (Pill Bottle & Glowing Health Cross)
export function MedicineDeliveryScene({ className = '' }: ServiceSceneProps) {
  return (
    <div className={`relative w-full aspect-[4/3] flex items-center justify-center pointer-events-none select-none ${className}`}>
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Floating Health Cross */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-2 right-4 w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg transform-gpu"
        >
          <span className="text-white font-black text-sm">+</span>
        </motion.div>

        <motion.svg
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
          viewBox="0 0 120 120"
          className="w-28 h-28 drop-shadow-xl"
        >
          {/* Bottle */}
          <rect x="40" y="45" width="40" height="55" rx="8" fill="#FFF" stroke="#CBD5E1" strokeWidth="3" />
          <rect x="45" y="32" width="30" height="15" rx="4" fill="#10B981" />
          {/* Label */}
          <rect x="44" y="60" width="32" height="25" rx="4" fill="#ECFDF5" />
          <path d="M 60 67 V 77 M 55 72 H 65" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
        </motion.svg>
      </div>
    </div>
  );
}

// 5. PARCEL DELIVERY (Sealed Express Package Box)
export function ParcelDeliveryScene({ className = '' }: ServiceSceneProps) {
  return (
    <div className={`relative w-full aspect-[4/3] flex items-center justify-center pointer-events-none select-none ${className}`}>
      <div className="relative w-36 h-36 flex items-center justify-center">
        <motion.svg
          animate={{ y: [0, -4, 0], rotate: [-1, 2, -1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          viewBox="0 0 120 120"
          className="w-28 h-28 drop-shadow-xl"
        >
          {/* Parcel Box */}
          <rect x="25" y="45" width="70" height="55" rx="8" fill="#D97706" />
          <path d="M 25 45 L 60 25 L 95 45 L 60 60 Z" fill="#F59E0B" />
          {/* Tape */}
          <rect x="54" y="25" width="12" height="75" fill="#FDB813" opacity="0.9" />
          {/* Fragile Ribbon Badge */}
          <circle cx="75" cy="70" r="10" fill="#EF4444" />
          <text x="75" y="74" fontSize="10" fontWeight="900" textAnchor="middle" fill="#FFF">JSS</text>
        </motion.svg>
      </div>
    </div>
  );
}

// 6. GROCERY SHOPPING (Fresh Sembako Paper Bag)
export function GroceryShoppingScene({ className = '' }: ServiceSceneProps) {
  return (
    <div className={`relative w-full aspect-[4/3] flex items-center justify-center pointer-events-none select-none ${className}`}>
      <div className="relative w-36 h-36 flex items-center justify-center">
        <motion.svg
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          viewBox="0 0 120 120"
          className="w-28 h-28 drop-shadow-xl"
        >
          {/* Paper Bag */}
          <path d="M 25 45 L 95 45 L 90 100 L 30 100 Z" fill="#B45309" />
          <path d="M 25 45 L 35 40 L 85 40 L 95 45 Z" fill="#D97706" />
          {/* Produce Items */}
          <motion.circle
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
            cx="45"
            cy="35"
            r="12"
            fill="#EF4444"
          />
          <motion.circle
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            cx="75"
            cy="33"
            r="10"
            fill="#10B981"
          />
        </motion.svg>
      </div>
    </div>
  );
}

// 7. DOCUMENT DELIVERY (Confidential Envelope & Seal Stamp)
export function DocumentDeliveryScene({ className = '' }: ServiceSceneProps) {
  return (
    <div className={`relative w-full aspect-[4/3] flex items-center justify-center pointer-events-none select-none ${className}`}>
      <div className="relative w-36 h-36 flex items-center justify-center">
        <motion.svg
          animate={{ y: [0, -4, 0], rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
          viewBox="0 0 120 120"
          className="w-28 h-28 drop-shadow-xl"
        >
          {/* Envelope */}
          <rect x="20" y="40" width="80" height="55" rx="8" fill="#3B82F6" />
          <path d="M 20 40 L 60 70 L 100 40 Z" fill="#2563EB" />
          {/* Wax Seal */}
          <circle cx="60" cy="65" r="10" fill="#FDB813" />
          <circle cx="60" cy="65" r="7" fill="#D97706" />
        </motion.svg>
      </div>
    </div>
  );
}
