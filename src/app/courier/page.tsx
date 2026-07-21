'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Wallet, Package, MapPin, Zap, Shield, Bell,
  ChevronRight, Navigation, AlertTriangle, Trophy, Clock,
  TrendingUp, Target, Plus, CheckCircle, XCircle, ArrowUpRight,
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
import DepositModal from '@/components/courier/DepositModal';
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
    balance: 0, // Initial balance starts at Rp 0 until top up
    totalDeliveries: 0,
    badge: 'rookie' as CourierBadge,
  });
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [incomingOrders, setIncomingOrders] = useState<Order[]>([]);
  const [pendingBroadcast, setPendingBroadcast] = useState<{ order: Order; broadcastId: string; timeoutAt: string } | null>(null);
  const [dailyProgress, setDailyProgress] = useState({ completed: 0, target: 10, bonusAmount: 20000 });
  const [showIncentive, setShowIncentive] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [lowBalanceAlert, setLowBalanceAlert] = useState<string | null>(null);
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

      // Load unassigned waiting orders for "Orderan Masuk" list
      const ordersKey = 'jss_mock_orders_v3';
      const allOrders: Order[] = JSON.parse(localStorage.getItem(ordersKey) || '[]');
      const waiting = allOrders.filter(o => o.status === 'waiting' && !o.driverId);
      setIncomingOrders(waiting);

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
    const interval = setInterval(loadData, 3000); // Poll every 3s

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('jss_orders_sync');
      bc.onmessage = () => loadData();
    } catch (e) {}

    const handleSync = () => loadData();
    window.addEventListener('jss_order_created', handleSync);
    window.addEventListener('jss_orders_reset', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
      window.removeEventListener('jss_order_created', handleSync);
      window.removeEventListener('jss_orders_reset', handleSync);
      window.removeEventListener('storage', handleSync);
    };
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

  /** Ambil Orderan (Accept) */
  const handleTakeOrder = async (targetOrder: Order) => {
    // Check balance first
    const check = await courierService.canAcceptOrder(courierId);
    if (!check.allowed) {
      setLowBalanceAlert(check.reason || 'Saldo deposit tidak mencukupi');
      return;
    }

    // Assign driver to order
    const ordersKey = 'jss_mock_orders_v3';
    const orders: Order[] = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    const idx = orders.findIndex(o => o.id === targetOrder.id);
    if (idx !== -1) {
      orders[idx].driverId = courierId;
      orders[idx].driverName = user?.name || 'Kurir JSS';
      orders[idx].status = 'accepted';
      localStorage.setItem(ordersKey, JSON.stringify(orders));
    }

    await courierService.updateCourierStatus(courierId, 'delivering');
    setStatus('delivering');
    if (pendingBroadcast?.order.id === targetOrder.id) {
      setPendingBroadcast(null);
    }
    loadData();
  };

  /** Cancel/Tolak Order */
  const handleCancelOrder = async (targetOrderId: string) => {
    if (pendingBroadcast?.order.id === targetOrderId) {
      await broadcastService.rejectBroadcast(targetOrderId, courierId);
      setPendingBroadcast(null);
    } else {
      // Hide or reject order locally
      setIncomingOrders(prev => prev.filter(o => o.id !== targetOrderId));
    }
  };

  /** Selesaikan Order */
  const handleOrderComplete = async () => {
    if (activeOrder) {
      // Deduct Rp 2.000 commission for Admin DANA 088286557710
      await courierService.deductCommission(courierId, activeOrder.id, activeOrder.orderNumber);
    }

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
    <div className="min-h-screen bg-secondary-900 text-white">
      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <DepositModal
            courierId={courierId}
            currentBalance={stats.balance}
            onSuccess={loadData}
            onClose={() => setShowDepositModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Low Balance Alert Modal */}
      <AnimatePresence>
        {lowBalanceAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-secondary-800 rounded-3xl p-6 max-w-sm w-full border border-red-500/30 text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Saldo Deposit Tidak Mencukupi!</h3>
              <p className="text-white/70 text-xs leading-relaxed mb-6">{lowBalanceAlert}</p>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setLowBalanceAlert(null);
                    setShowDepositModal(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-primary to-amber-400 text-secondary-900 font-bold rounded-xl text-xs shadow-golden flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Top Up Deposit Sekarang
                </button>
                <button
                  onClick={() => setLowBalanceAlert(null)}
                  className="w-full py-2.5 bg-white/10 text-white/60 font-semibold rounded-xl text-xs"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Broadcast Popup */}
      <AnimatePresence>
        {pendingBroadcast && isShiftActive && (
          <OrderPopup
            order={pendingBroadcast.order}
            timeoutAt={pendingBroadcast.timeoutAt}
            onAccept={() => handleTakeOrder(pendingBroadcast.order)}
            onReject={() => handleCancelOrder(pendingBroadcast.order.id)}
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

      {/* Driver Console Header */}
      <div className="bg-gradient-to-b from-secondary-800 via-secondary-800 to-secondary-900 px-5 pt-6 pb-8 border-b border-white/5">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-golden ring-2 ring-primary/30">
              <span className="text-lg font-black text-secondary-900">
                {(user?.name || 'K')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">{user?.name || 'Kurir JSS Kalirejo'}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  <span className="text-white text-xs font-bold">{stats.rating.toFixed(1)}</span>
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_CONFIG[status].bg}`}>
                  <span>{STATUS_CONFIG[status].icon}</span>
                  <span className={STATUS_CONFIG[status].color}>{STATUS_CONFIG[status].label}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${BADGE_CONFIG[stats.badge].color} shadow-lg`}>
              <span className="text-xs font-bold text-white">
                {BADGE_CONFIG[stats.badge].icon} {BADGE_CONFIG[stats.badge].label}
              </span>
            </div>
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

        {/* Stats Cards Row with Deposit Top Up Button */}
        <div className="grid grid-cols-3 gap-3">
          {/* Saldo + Deposit */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowDepositModal(true)}
            className="bg-gradient-to-br from-primary/20 to-amber-500/10 rounded-2xl p-3 text-center border border-primary/30 relative cursor-pointer group"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold text-primary bg-primary/20 px-1.5 py-0.2 rounded">+ Deposit</span>
            </div>
            <p className="text-white font-extrabold text-sm truncate">{formatCurrency(stats.balance)}</p>
            <p className="text-primary/70 text-[10px] mt-0.5 font-medium">Klik Top Up</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/5"
          >
            <Package className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-white font-bold text-sm">{stats.todayOrders}</p>
            <p className="text-white/40 text-[10px] mt-0.5">Order Hari Ini</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/5"
          >
            <TrendingUp className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-white font-bold text-sm">{formatCurrency(stats.todayEarnings)}</p>
            <p className="text-white/40 text-[10px] mt-0.5">Pendapatan</p>
          </motion.div>
        </div>
      </div>

      {/* Body Content */}
      <div className="px-5 -mt-4 space-y-4 relative z-10 max-w-lg mx-auto pb-24">
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
              <p className="text-amber-300/60 text-xs mt-0.5">Silakan klik &quot;🟢 Mulai Kerja&quot; terlebih dahulu untuk melihat dan mengambil order.</p>
            </div>
          </motion.div>
        )}

        {/* Low Balance Warning Banner */}
        {isShiftActive && stats.balance < 2000 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowDepositModal(true)}
            className="bg-red-500/20 border border-red-500/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-red-400 font-bold text-xs">Saldo Kurang dari Rp 2.000!</p>
                <p className="text-white/60 text-[11px] mt-0.5">Top up ke DANA Admin <span className="text-primary font-bold">088286557710</span></p>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-primary text-secondary-900 rounded-xl font-bold text-xs flex items-center gap-1 shadow-golden">
              <Plus className="w-3.5 h-3.5" />
              Top Up
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
            className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <div className="bg-primary/20 px-4 py-2.5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-primary font-bold text-sm">Orderan Sedang Berjalan</span>
              </div>
              <span className="text-white/50 text-xs font-mono">{activeOrder.orderNumber}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                  <div className="w-0.5 h-8 bg-white/20" />
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Lokasi Jemput</p>
                    <p className="text-white text-sm font-medium">{activeOrder.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Lokasi Tujuan</p>
                    <p className="text-white text-sm font-medium">{activeOrder.destinationAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10 mb-4">
                <div>
                  <p className="text-white/40 text-xs">Customer</p>
                  <p className="text-white font-semibold text-sm">{activeOrder.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs">Total Bayar</p>
                  <p className="text-primary font-bold text-sm">{formatCurrency(activeOrder.grandTotal)}</p>
                </div>
              </div>

              {/* Order Status Flow (Ambil, Menuju, Diambil, Mengantar, Selesai) */}
              <OrderStatusFlow
                orderId={activeOrder.id}
                currentStatus={activeOrder.status}
                courierId={courierId}
                onComplete={handleOrderComplete}
              />
            </div>
          </motion.div>
        )}

        {/* Section Orderan Masuk (Available Incoming Orders List with Ambil, Cancel, Selesai) */}
        {isShiftActive && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <span>📦 Orderan Masuk Tersedia</span>
                {incomingOrders.length > 0 && (
                  <span className="px-2 py-0.5 bg-primary text-secondary-900 rounded-full text-xs font-extrabold">
                    {incomingOrders.length}
                  </span>
                )}
              </h3>
              <button onClick={loadData} className="text-xs text-primary font-semibold hover:underline">
                Refresh
              </button>
            </div>

            {incomingOrders.length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/5">
                <Navigation className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/50 text-xs font-medium">Belum ada orderan masuk baru</p>
                <p className="text-white/20 text-[10px] mt-0.5">Orderan dari warga Kalirejo akan tampil secara otomatis di sini</p>
              </div>
            ) : (
              incomingOrders.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary font-bold rounded-md">
                        {order.category.toUpperCase()}
                      </span>
                      <span className="text-white/60 text-xs font-mono font-semibold">{order.orderNumber}</span>
                    </div>
                    <span className="text-primary font-extrabold text-sm">{formatCurrency(order.grandTotal)}</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                      <div className="w-0.5 h-6 bg-white/20" />
                      <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <p className="text-white font-medium">{order.pickupAddress}</p>
                      <p className="text-white/70">{order.destinationAddress}</p>
                    </div>
                  </div>

                  {/* Actions: Ambil, Cancel, Selesai */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTakeOrder(order)}
                      className="py-2.5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl text-secondary-900 font-extrabold text-xs flex items-center justify-center gap-1 shadow-emerald-500/20"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Ambil Order
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCancelOrder(order.id)}
                      className="py-2.5 bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/60 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-white/10 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleOrderComplete}
                      className="py-2.5 bg-primary/20 text-primary hover:bg-primary hover:text-secondary-900 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Selesai
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Quick Actions */}
        {isShiftActive && (
          <div className="grid grid-cols-2 gap-3 pt-2">
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
      </div>
    </div>
  );
}
