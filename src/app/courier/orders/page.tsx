'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courierService } from '@/services/courierService';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';

export default function CourierOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const courierId = 'drv-1';

  useEffect(() => {
    courierService.getCourierOrders(courierId).then(data => {
      // Show only active orders
      const active = data.filter(o => !['completed', 'cancelled'].includes(o.status));
      setOrders(active);
      setLoading(false);
    });

    const interval = setInterval(async () => {
      const data = await courierService.getCourierOrders(courierId);
      const active = data.filter(o => !['completed', 'cancelled'].includes(o.status));
      setOrders(active);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusEmoji: Record<string, string> = {
    waiting: '⏳', accepted: '📥', driver_going: '🚶',
    shopping: '🛒', delivering: '🏍️',
  };

  const statusLabel: Record<string, string> = {
    waiting: 'Menunggu', accepted: 'Diterima', driver_going: 'Menuju Lokasi',
    shopping: 'Mengambil Barang', delivering: 'Mengantar',
  };

  return (
    <div className="min-h-screen">
      <div className="bg-secondary-800 px-5 pt-6 pb-6">
        <h1 className="text-white text-xl font-bold">📦 Order Aktif</h1>
        <p className="text-white/40 text-sm mt-1">
          {orders.length > 0 ? `${orders.length} order aktif` : 'Tidak ada order aktif'}
        </p>
      </div>

      <div className="px-5 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-white/10" />
            </div>
            <p className="text-white/30 text-sm">Belum ada order aktif</p>
            <p className="text-white/20 text-xs mt-1">Order baru akan muncul di sini</p>
          </div>
        ) : (
          orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 rounded-2xl p-4 border border-white/5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{statusEmoji[order.status]}</span>
                  <span className="text-white font-semibold text-sm">{order.orderNumber}</span>
                </div>
                <span className="text-primary text-xs font-bold px-2 py-1 bg-primary/10 rounded-lg">
                  {statusLabel[order.status] || order.status}
                </span>
              </div>

              <div className="flex items-start gap-3 mb-3">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                  <div className="w-0.5 h-6 bg-white/20" />
                  <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-white/70 text-xs truncate">{order.pickupAddress}</p>
                  <p className="text-white/70 text-xs truncate">{order.destinationAddress}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-white/40 text-xs">{order.customerName}</span>
                <span className="text-primary font-bold text-sm">{formatCurrency(order.grandTotal)}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
