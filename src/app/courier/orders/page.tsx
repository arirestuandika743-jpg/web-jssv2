'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courierService } from '@/services/courierService';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';
import DepositModal from '@/components/courier/DepositModal';

export default function CourierOrdersPage() {
  const { user } = useAuth();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [incomingOrders, setIncomingOrders] = useState<Order[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [lowBalanceAlert, setLowBalanceAlert] = useState<string | null>(null);
  const courierId = 'drv-1';

  const loadData = useCallback(async () => {
    try {
      const stats = await courierService.getCourierStats(courierId);
      setBalance(stats.balance);

      const ordersKey = 'jss_mock_orders_v3';
      const allOrders: Order[] = JSON.parse(localStorage.getItem(ordersKey) || '[]');
      
      const active = allOrders.filter(o => o.driverId === courierId && !['completed', 'cancelled'].includes(o.status));
      const incoming = allOrders.filter(o => o.status === 'waiting' && !o.driverId);
      
      setActiveOrders(active);
      setIncomingOrders(incoming);
    } finally {
      setLoading(false);
    }
  }, [courierId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);

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

  const handleTakeOrder = async (targetOrder: Order) => {
    const check = await courierService.canAcceptOrder(courierId);
    if (!check.allowed) {
      setLowBalanceAlert(check.reason || 'Saldo deposit Anda kurang dari min. Rp 2.000');
      return;
    }

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
    loadData();
  };

  const handleCancelOrder = async (orderId: string) => {
    const ordersKey = 'jss_mock_orders_v3';
    const orders: Order[] = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1 && orders[idx].driverId === courierId) {
      orders[idx].status = 'cancelled';
      localStorage.setItem(ordersKey, JSON.stringify(orders));
    } else {
      setIncomingOrders(prev => prev.filter(o => o.id !== orderId));
    }
    loadData();
  };

  const handleCompleteOrder = async (order: Order) => {
    await courierService.updateOrderCourierStatus(order.id, 'completed');
    await courierService.deductCommission(courierId, order.id, order.orderNumber);
    await courierService.updateCourierStatus(courierId, 'online');
    loadData();
  };

  return (
    <div className="min-h-screen bg-secondary-900 text-white pb-24">
      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <DepositModal
            courierId={courierId}
            currentBalance={balance}
            onSuccess={loadData}
            onClose={() => setShowDepositModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Low Balance Modal */}
      <AnimatePresence>
        {lowBalanceAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-secondary-800 rounded-3xl p-6 max-w-sm w-full border border-red-500/30 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-base mb-2">Saldo Deposit Tidak Mencukupi!</h3>
              <p className="text-white/60 text-xs mb-4">{lowBalanceAlert}</p>
              <button
                onClick={() => { setLowBalanceAlert(null); setShowDepositModal(true); }}
                className="w-full py-3 bg-primary text-secondary-900 font-bold rounded-xl text-xs mb-2 shadow-golden"
              >
                Top Up Deposit (DANA 088286557710)
              </button>
              <button onClick={() => setLowBalanceAlert(null)} className="w-full py-2 bg-white/10 text-white/50 rounded-xl text-xs">Batal</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-secondary-800 px-5 pt-6 pb-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-white text-xl font-bold">📦 Kelola Orderan</h1>
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl text-xs font-bold transition-all"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Saldo: {formatCurrency(balance)}</span>
          </button>
        </div>
        <p className="text-white/40 text-xs">Pilih orderan masuk, ambil, cancel, atau tandai selesai</p>
      </div>

      <div className="px-5 py-4 space-y-6 max-w-lg mx-auto">
        {/* Section 1: Orderan Masuk Tersedia */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              <span>📥 Orderan Masuk (Tersedia)</span>
              {incomingOrders.length > 0 && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-xs font-bold">
                  {incomingOrders.length}
                </span>
              )}
            </h2>
          </div>

          {incomingOrders.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-5 text-center border border-white/5 text-white/40 text-xs">
              Tidak ada orderan masuk yang tersedia saat ini
            </div>
          ) : (
            <div className="space-y-3">
              {incomingOrders.map(order => (
                <div key={order.id} className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/60">{order.orderNumber}</span>
                    <span className="text-primary font-extrabold text-sm">{formatCurrency(order.grandTotal)}</span>
                  </div>
                  <div className="text-xs space-y-1 text-white/80">
                    <p>📍 <span className="font-semibold text-white">{order.pickupAddress}</span></p>
                    <p>🏁 <span>{order.destinationAddress}</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleTakeOrder(order)}
                      className="py-2.5 bg-emerald-500 text-secondary-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-lg"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Ambil Order
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="py-2.5 bg-white/10 text-white/60 hover:text-red-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Orderan Sedang Berjalan */}
        <div>
          <h2 className="text-white font-bold text-sm mb-3">🏍️ Orderan Sedang Berjalan</h2>

          {activeOrders.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-5 text-center border border-white/5 text-white/40 text-xs">
              Belum ada orderan yang Anda ambil saat ini
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map(order => (
                <div key={order.id} className="bg-gradient-to-br from-primary/10 to-amber-500/10 rounded-2xl p-4 border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-primary font-bold">{order.orderNumber}</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{formatCurrency(order.grandTotal)}</span>
                  </div>
                  <div className="text-xs space-y-1 text-white">
                    <p>Customer: <span className="font-bold">{order.customerName}</span></p>
                    <p>Tujuan: <span className="text-white/70">{order.destinationAddress}</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleCompleteOrder(order)}
                      className="py-2.5 bg-primary text-secondary-900 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 shadow-golden"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Selesai Order
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="py-2.5 bg-red-500/20 text-red-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
