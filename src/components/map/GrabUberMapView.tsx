'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  Bike,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface GrabUberMapViewProps {
  pickupName?: string;
  dropoffName?: string;
  estimatedKm?: number;
  basePrice?: number;
  initialEtaMinutes?: number;
  className?: string;
  onConfirmOrder?: () => void;
}

/**
 * GrabUberMapView Component
 * 
 * Grab/Uber-inspired Map Experience featuring:
 * - Animated Price Counter (Spring count-up from 0 to total Rp)
 * - Animated ETA Countdown (e.g. ~6 min countdown & live status)
 * - Animated Route Line & Driver Tracking Visual
 * - Pulsing Pickup & Destination Pin Markers
 * - Grab/Uber-style Glass Card Overlays
 */
export function GrabUberMapView({
  pickupName = 'Pasar Kalirejo (Depan Masjid)',
  dropoffName = 'Desa Srimulyo, Kalirejo',
  estimatedKm = 3.2,
  basePrice = 12000,
  initialEtaMinutes = 6,
  className = '',
  onConfirmOrder,
}: GrabUberMapViewProps) {
  // Animated Price Counter Spring
  const priceSpring = useSpring(0, { stiffness: 60, damping: 20 });
  const [displayPrice, setDisplayPrice] = useState(0);

  // Animated ETA State
  const [eta, setEta] = useState(initialEtaMinutes);
  const [driverProgress, setDriverProgress] = useState(0.25); // 25% along the route
  const [isDriverMoving, setIsDriverMoving] = useState(true);

  // Trigger price counter spring animation on mount or basePrice change
  useEffect(() => {
    priceSpring.set(basePrice);
    const unsubscribe = priceSpring.on('change', (latest) => {
      setDisplayPrice(Math.round(latest));
    });
    return () => unsubscribe();
  }, [basePrice, priceSpring]);

  // Simulate driver movement & ETA tick
  useEffect(() => {
    if (!isDriverMoving) return;

    const interval = setInterval(() => {
      setDriverProgress((prev) => {
        if (prev >= 0.9) return 0.9;
        return prev + 0.05;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isDriverMoving]);

  const formattedPrice = `Rp ${displayPrice.toLocaleString('id-ID')}`;

  return (
    <div className={`relative w-full rounded-[32px] overflow-hidden bg-secondary-900 shadow-2xl border border-white/15 ${className}`}>
      {/* Simulated Map Canvas Background */}
      <div className="relative w-full h-[460px] sm:h-[500px] overflow-hidden">
        {/* Dark CartoDB Style Map Grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(253, 184, 19, 0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(253, 184, 19, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Grab/Uber Style Live Map Header Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 bg-secondary-900/90 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-white tracking-tight">
              GPS Live Tracker Kalirejo
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <Badge variant="primary" size="md" dot>
              Driver Meluncur
            </Badge>
          </div>
        </div>

        {/* SVG Route Line & Animated Markers */}
        <svg viewBox="0 0 500 400" className="w-full h-full relative z-10 pointer-events-none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#FDB813" />
              <stop offset="100%" stopColor="#FF6B35" />
            </linearGradient>
          </defs>

          {/* Background Route Glow */}
          <path
            d="M 80 280 C 160 260, 220 180, 300 210 C 360 230, 390 150, 420 100"
            stroke="rgba(253, 184, 19, 0.2)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          />

          {/* Animated Dashed OSRM Route Line */}
          <motion.path
            d="M 80 280 C 160 260, 220 180, 300 210 C 360 230, 390 150, 420 100"
            stroke="url(#routeGradient)"
            strokeWidth="5"
            strokeDasharray="10 8"
            fill="none"
            strokeLinecap="round"
            animate={{ strokeDashoffset: [0, -72] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />

          {/* 1. Pickup Marker (Emerald Pulsing Pin) */}
          <g transform="translate(80, 280)" className="pointer-events-auto cursor-pointer">
            <circle cx="0" cy="0" r="16" fill="rgba(16, 185, 129, 0.25)" className="animate-ping" />
            <circle cx="0" cy="0" r="10" fill="#10B981" stroke="#FFF" strokeWidth="3" />
            <text x="0" y="24" fontSize="10" fontWeight="800" textAnchor="middle" fill="#FFF">
              Jemput
            </text>
          </g>

          {/* 1. Destination Marker (Red Pulsing Pin) */}
          <g transform="translate(420, 100)" className="pointer-events-auto cursor-pointer">
            <circle cx="0" cy="0" r="16" fill="rgba(239, 68, 68, 0.25)" className="animate-ping" />
            <circle cx="0" cy="0" r="10" fill="#EF4444" stroke="#FFF" strokeWidth="3" />
            <text x="0" y="24" fontSize="10" fontWeight="800" textAnchor="middle" fill="#FFF">
              Tujuan
            </text>
          </g>

          {/* 3. Animated Moving Driver Marker along the Route */}
          <g transform={`translate(${80 + (420 - 80) * driverProgress}, ${280 + (100 - 280) * driverProgress})`}>
            <circle cx="0" cy="0" r="22" fill="rgba(253, 184, 19, 0.3)" className="animate-pulse" />
            <circle cx="0" cy="0" r="14" fill="#FDB813" stroke="#111" strokeWidth="2.5" />
            <foreignObject x="-10" y="-10" width="20" height="20">
              <div className="w-full h-full flex items-center justify-center">
                <Bike className="w-3.5 h-3.5 text-secondary-900" />
              </div>
            </foreignObject>
          </g>
        </svg>

        {/* Floating ETA & Live Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-28 left-4 right-4 z-20 max-w-sm mx-auto"
        >
          <div className="bg-secondary-900/95 backdrop-blur-2xl rounded-2xl p-3.5 border border-white/15 shadow-2xl flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-[10px] text-white/60 font-semibold block uppercase">Estimasi Tiba (ETA)</span>
                <span className="text-sm font-black text-white flex items-center gap-1.5">
                  ~{eta} Menit <span className="text-emerald-400 text-xs font-bold">• On Time</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-white/60 font-semibold block uppercase">Jarak Rute</span>
              <span className="text-xs font-extrabold text-primary">{estimatedKm} KM</span>
            </div>
          </div>
        </motion.div>

        {/* Grab/Uber Style Bottom Price & Booking Glass Card */}
        <div className="absolute bottom-4 left-4 right-4 z-20 max-w-md mx-auto">
          <Card variant="dark" className="p-4 sm:p-5 border-white/20 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-golden">
                  <Bike className="w-6 h-6 text-secondary-900" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">JSS Express Scooter</h4>
                  <p className="text-xs text-white/60 font-medium">Pengantaran Cepat Kalirejo</p>
                </div>
              </div>

              {/* 6. Animated Price Counter Display */}
              <div className="text-right">
                <span className="text-[10px] text-white/60 font-semibold block uppercase">Total Tarif</span>
                <motion.span
                  key={displayPrice}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-xl sm:text-2xl font-black text-primary"
                >
                  {formattedPrice}
                </motion.span>
              </div>
            </div>

            {/* Action Button */}
            {onConfirmOrder && (
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={onConfirmOrder}
                leftIcon={<Sparkles className="w-4 h-4 text-secondary-900" />}
                rightIcon={<ArrowRight className="w-4 h-4 text-secondary-900" />}
              >
                Pesan Rute Ini Sekarang
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
