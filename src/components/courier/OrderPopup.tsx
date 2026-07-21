'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Package, DollarSign, Clock, User, FileText, Navigation } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';

interface OrderPopupProps {
  order: Order;
  timeoutAt: string;
  onAccept: () => void;
  onReject: () => void;
  onTimeout: () => void;
}

export default function OrderPopup({ order, timeoutAt, onAccept, onReject, onTimeout }: OrderPopupProps) {
  const [timeLeft, setTimeLeft] = useState(20);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Calculate initial time left
    const deadline = new Date(timeoutAt).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        onTimeout();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    // Try to play notification sound
    try {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczGj16teleNBkML3e30N6yXDMcRYOw0eCudTkfS4Ku0eCnb0EjTn+p');
      audioRef.current.play().catch(() => {});
    } catch {}

    const timerObj = timeoutRef.current;
    return () => {
      clearInterval(interval);
      if (timerObj) clearTimeout(timerObj);
    };
  }, [timeoutAt, onTimeout]);

  const progressPercent = (timeLeft / 20) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-secondary-900/98 backdrop-blur-xl flex flex-col"
    >
      {/* Timer Ring */}
      <div className="flex items-center justify-center pt-8 pb-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={timeLeft <= 5 ? '#ef4444' : '#FDB813'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercent / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-black ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}
            </span>
            <span className="text-white/40 text-[10px]">detik</span>
          </div>
        </div>
      </div>

      {/* Order Title */}
      <div className="text-center px-6 mb-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-white text-xl font-bold">📦 Order Baru!</h2>
          <p className="text-white/50 text-sm mt-1">{order.orderNumber}</p>
        </motion.div>
      </div>

      {/* Order Details */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 mx-5 bg-white/5 rounded-3xl border border-white/10 overflow-y-auto"
      >
        <div className="p-5 space-y-4">
          {/* Customer */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-11 h-11 bg-primary/20 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-white font-semibold">{order.customerName}</p>
              <p className="text-white/40 text-xs">{order.whatsappNumber}</p>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="w-3 h-3 bg-emerald-400 rounded-full" />
              <div className="w-0.5 h-10 bg-white/20" />
              <div className="w-3 h-3 bg-red-400 rounded-full" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Alamat Jemput</p>
                <p className="text-white text-sm font-medium">{order.pickupAddress}</p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Alamat Tujuan</p>
                <p className="text-white text-sm font-medium">{order.destinationAddress}</p>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Navigation className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-white font-bold text-sm">{(order.distance / 1000).toFixed(1)} km</p>
              <p className="text-white/40 text-[10px]">Jarak</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-white font-bold text-sm">{formatCurrency(order.deliveryFee)}</p>
              <p className="text-white/40 text-[10px]">Bayaran</p>
            </div>
          </div>

          {/* Description */}
          {order.description && (
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3.5 h-3.5 text-white/40" />
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Catatan</p>
              </div>
              <p className="text-white/70 text-sm">{order.description}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-5 py-4 space-y-3"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAccept}
          className="w-full py-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl font-bold text-lg text-secondary-900 shadow-lg shadow-emerald-500/30"
        >
          ✅ TERIMA ORDER
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onReject}
          className="w-full py-3.5 bg-white/10 rounded-2xl font-semibold text-white/60 border border-white/10"
        >
          ❌ TOLAK
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
