'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Wallet, Package, MapPin, Zap, Shield, Bell,
  ChevronRight, Navigation, AlertTriangle, Trophy, Clock,
  TrendingUp, Target,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courierService } from '@/services/courierService';
import { broadcastService } from '@/services/broadcastService';
import { notificationService } from '@/services/notificationService';
import { formatCurrency } from '@/lib/utils';
import type { CourierStatus, Order, CourierBadge } from '@/types';
import ShiftButton from '@/components/courier/ShiftButton';
import OrderPopup from '@/components/courier/OrderPopup';
import PanicButton from '@/components/courier/PanicButton';
import OrderStatusFlow from '@/components/courier/OrderStatusFlow';
import Link from 'next/link';

const STATUS_CONFIG: Record<CourierStatus, { label: string; color: string; bg: string; icon: string }> = {
  online: { label: 'ONLINE', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: '🟢' },
  offline: { label: 'OFFLINE', color: 'text-red-400', bg: 'bg-red-500/20', icon: '🔴' },
  delivering: { label: 'MENGANTAR', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '🏍️' },
  break: { label: 'ISTIRAHAT', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: '☕' },
};

const BADGE_CONFIG: Record<CourierBadge, { label: string; icon: string; color: string }> = {
  platinum: { label: 'Platinum', icon: '🥇', color: 'from-violet-500 to-purple-600' },
  gold: { label: 'Gold', icon: '🥈', color: 'from-amber-400 to-orange-500' },
  silver: { label: 'Silver', icon: '🥉', color: 'from-gray-300 to-gray-500' },
  rookie: { label: 'Rookie', icon: '⭐', color: 'from-emerald-400 to-teal-500' },
};

export default function CourierDashboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState<CourierStatus>('offline');
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayEarnings: 0,
    rating: 5.0,
    balance: 0,
    totalDeliveries: 0,
    badge: 'rookie' as CourierBadge,
  });
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [pendingBroadcast, setPendingBroadcast] = useState<{ order: Order; broadcastId: string; timeoutAt: string } | null>(null);
  const [dailyProgress, setDailyProgress] = useState({ completed: 0, target: 10, bonusAmount: 20000 });
  const [showIncentive, setShowIncentive] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const courierId = user?.id === 'runner-id-123' ? 'drv-1' : 'drv-1';

  const loadData = useCallback(async () => {
    try {
      const [courierStats, shiftActive, active, progress, pending] = await Promise.all([
        courierService.getCourierStats(courierId),
        courierService.isShiftActive(courierId),
        courierService.getActiveOrder(courierId),
        courierService.getDailyProgress(courierId),
        broadcastService.getPendingBroadcastForCourier(courierId),
      ]);

      setStats(courierStats);
      setIsShiftActive(shiftActive);
      setActiveOrder(active);
      setDailyProgress(progress);

      if (shiftActive) {
        const s = await courierService.getCourierStatus(courierId);
        setStatus(s);
      } else {
        setStatus('offline');
      }

      if (pending && shiftActive) {
        setPendingBroadcast(pending);
      }

      if (user?.id) {
        const count = await notificationService.getUnreadCount(user.id);
        setNotifCount(count);
      }
    } catch (err) {
      console.error('Error loading courier data:', err);
    }
  }, [courierId, user?.id]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [loadData]);

  const handleShiftStart = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await courierService.startShift(courierId, { lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsShiftActive(true);
          setStatus('online');
          loadData();
        },
        async () => {
          await courierService.startShift(courierId, { lat: -5.2818, lng: 104.9833 });
          setIsShiftActive(true);
          setStatus('online');
          loadData();
        }
      );
    } else {
      await courierService.startShift(courierId, { lat: -5.2818, lng: 104.9833 });
      setIsShiftActive(true);
      setStatus('online');
      loadData();
    }
  };

  const handleShiftEnd = async () => {
    await courierService.endShift(courierId);
    setIsShiftActive(false);
    setStatus('offline');
    loadData();
  };

  const handleAcceptOrder = async () => {
    if (!pendingBroadcast) return;
    await broadcastService.acceptBroadcast(pendingBroadcast.order.id, courierId);
    
    // Assign driver to order
    const ordersKey = 'jss_mock_orders_v2';
    const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    const idx = orders.findIndex((o: Order) => o.id === pendingBroadcast.order.id);
    if (idx !== -1) {
      orders[idx].driverId = courierId;
      orders[idx].driverName = user?.name || 'Kurir';
      orders[idx].status = 'accepted';
      localStorage.setItem(ordersKey, JSON.stringify(orders));
    }

    await courierService.updateCourierStatus(courierId, 'delivering');
    setPendingBroadcast(null);
    setStatus('delivering');
    loadData();
  };

  const handleRejectOrder = async () => {
    if (!pendingBroadcast) return;
    await broadcastService.rejectBroadcast(pendingBroadcast.order.id, courierId);
    setPendingBroadcast(null);
  };

  const handleOrderComplete = async () => {
    setActiveOrder(null);
    await courierService.updateCourierStatus(courierId, 'online');
    setStatus('online');
    
    // Check for incentive
    const incentive = await courierService.checkAndAwardIncentive(courierId);
    if (incentive) {
      setShowIncentive(true);
      setTimeout(() => setShowIncentive(false), 5000);
    }
    loadData();
  };

  const progressPercent = dailyProgress.target > 0 ? Math.min(100, (dailyProgress.completed / dailyProgress.target) * 100) : 0;

  return (
    <div className="min-h-screen">
      {/* Order Broadcast Popup */}
      <AnimatePresence>
        {pendingBroadcast && isShiftActive && (
          <OrderPopup
            order={pendingBroadcast.order}
            timeoutAt={pendingBroadcast.timeoutAt}
            onAccept={handleAcceptOrder}
            onReject={handleRejectOrder}
            onTimeout={() => {
              broadcastService.handleTimeout(pendingBroadcast.order.id);
              setPendingBroadcast(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Incentive Celebration */}
      <AnimatePresence>
        {showIncentive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowIncentive(false)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-br from-primary via-amber-400 to-orange-500 rounded-3xl p-8 text-center max-w-sm mx-4 shadow-golden-lg"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">Target Tercapai!</h2>
              <p className="text-secondary-700 mb-4">Selamat! Kamu mendapatkan bonus</p>
              <div className="text-3xl font-black text-secondary-900">
                {formatCurrency(dailyProgress.bonusAmount)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-b from-secondary-800 to-secondary-900 px-5 pt-6 pb-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-golden">
              <span className="text-lg font-bold text-secondary-900">
                {(user?.name || 'K')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">{user?.name || 'Kurir JSS'}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                  <span className="text-white/80 text-sm font-semibold">{stats.rating.toFixed(1)}</span>
                </div>
                <span className="text-white/30">·</span>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_CONFIG[status].bg}`}>
                  <span>{STATUS_CONFIG[status].icon}</span>
                  <span className={STATUS_CONFIG[status].color}>{STATUS_CONFIG[status].label}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Badge */}
            <div className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${BADGE_CONFIG[stats.badge].color} shadow-lg`}>
              <span className="text-xs font-bold text-white">
                {BADGE_CONFIG[stats.badge].icon} {BADGE_CONFIG[stats.badge].label}
              </span>
            </div>
            {/* Notifications */}
            <Link href="/courier/profile" className="relative w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white/70" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{notifCount > 9 ? '9+' : notifCount}</span>
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/5"
          >
            <Wallet className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-white font-bold text-sm">{formatCurrency(stats.balance)}</p>
            <p className="text-white/40 text-[10px] mt-0.5">Saldo</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/5"
          >
            <Package className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-white font-bold text-sm">{stats.todayOrders}</p>
            <p className="text-white/40 text-[10px] mt-0.5">Order Hari Ini</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/5"
          >
            <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-white font-bold text-sm">{formatCurrency(stats.todayEarnings)}</p>
            <p className="text-white/40 text-[10px] mt-0.5">Pendapatan</p>
          </motion.div>
        </div>
      </div>

      {/* Body Content */}
      <div className="px-5 -mt-4 space-y-4 relative z-10">
        {/* Shift Button */}
        <ShiftButton
          isActive={isShiftActive}
          onStart={handleShiftStart}
          onEnd={handleShiftEnd}
        />

        {/* Shift Not Started Warning */}
        {!isShiftActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-300 font-semibold text-sm">Shift Belum Dimulai</p>
              <p className="text-amber-300/60 text-xs mt-0.5">Silakan mulai shift terlebih dahulu untuk menerima order.</p>
            </div>
          </motion.div>
        )}

        {/* Daily Target Progress */}
        {isShiftActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-white/80 text-sm font-semibold">Target Harian</span>
              </div>
              <span className="text-primary text-sm font-bold">
                {dailyProgress.completed} / {dailyProgress.target} Order
              </span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  progressPercent >= 100
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                    : 'bg-gradient-to-r from-primary to-amber-400'
                }`}
              />
            </div>
            {progressPercent >= 100 && (
              <p className="text-emerald-400 text-xs mt-2 font-semibold">
                🎉 Target tercapai! Bonus {formatCurrency(dailyProgress.bonusAmount)}
              </p>
            )}
          </motion.div>
        )}

        {/* Active Order Card */}
        {activeOrder && isShiftActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10"
          >
            <div className="bg-primary/20 px-4 py-2.5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-primary font-bold text-sm">Order Aktif</span>
              </div>
              <span className="text-white/50 text-xs font-mono">{activeOrder.orderNumber}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                  <div className="w-0.5 h-8 bg-white/20" />
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">Jemput</p>
                    <p className="text-white text-sm font-medium">{activeOrder.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">Tujuan</p>
                    <p className="text-white text-sm font-medium">{activeOrder.destinationAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div>
                  <p className="text-white/40 text-xs">Customer</p>
                  <p className="text-white font-semibold text-sm">{activeOrder.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs">Total</p>
                  <p className="text-primary font-bold text-sm">{formatCurrency(activeOrder.grandTotal)}</p>
                </div>
              </div>

              {/* Order Status Flow */}
              <div className="mt-4">
                <OrderStatusFlow
                  orderId={activeOrder.id}
                  currentStatus={activeOrder.status}
                  courierId={courierId}
                  onComplete={handleOrderComplete}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {isShiftActive && (
          <div className="grid grid-cols-2 gap-3">
            <Link href="/courier/history">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 border border-white/5"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Riwayat</p>
                  <p className="text-white/40 text-[10px]">Lihat order</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 ml-auto" />
              </motion.div>
            </Link>

            <Link href="/courier/leaderboard">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 border border-white/5"
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Ranking</p>
                  <p className="text-white/40 text-[10px]">Leaderboard</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 ml-auto" />
              </motion.div>
            </Link>
          </div>
        )}

        {/* Panic Button */}
        {isShiftActive && (
          <PanicButton
            courierId={courierId}
            courierName={user?.name || 'Kurir'}
            activeOrderId={activeOrder?.id}
          />
        )}

        {/* Empty state when no active order and shift is active */}
        {!activeOrder && isShiftActive && !pendingBroadcast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-10 h-10 text-white/20" />
            </div>
            <p className="text-white/40 text-sm font-medium">Menunggu order masuk...</p>
            <p className="text-white/20 text-xs mt-1">Tetap di area jangkauan untuk menerima order</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
