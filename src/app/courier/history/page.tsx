'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, MapPin, DollarSign, Camera, Filter, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courierService } from '@/services/courierService';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';

type FilterType = 'day' | 'week' | 'month';

export default function CourierHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterType>('week');
  const [loading, setLoading] = useState(true);
  const courierId = 'drv-1';

  useEffect(() => {
    setLoading(true);
    courierService.getCourierOrders(courierId, filter).then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, [filter]);

  const totalEarnings = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.deliveryFee, 0);
  const completedCount = orders.filter(o => o.status === 'completed').length;

  const statusEmoji: Record<string, string> = {
    waiting: '⏳', accepted: '📥', driver_going: '🚶', shopping: '🛒',
    delivering: '🏍️', completed: '✅', cancelled: '❌',
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-secondary-800 px-5 pt-6 pb-6">
        <h1 className="text-white text-xl font-bold mb-4">📋 Riwayat Order</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-primary font-bold text-lg">{completedCount}</p>
            <p className="text-white/40 text-xs">Order Selesai</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-emerald-400 font-bold text-lg">{formatCurrency(totalEarnings)}</p>
            <p className="text-white/40 text-xs">Pendapatan</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-white/5 rounded-xl p-1 gap-1">
          {(['day', 'week', 'month'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                filter === f ? 'bg-primary text-secondary-900' : 'text-white/40'
              }`}
            >
              {f === 'day' ? 'Hari Ini' : f === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-5 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">Belum ada order di periode ini</p>
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
                  <span className="text-sm">{statusEmoji[order.status] || '📦'}</span>
                  <span className="text-white font-semibold text-sm">{order.orderNumber}</span>
                </div>
                <span className="text-white/30 text-xs">
                  {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div className="space-y-1.5 flex-1">
                  <p className="text-white/70 text-sm">{order.customerName}</p>
                  <div className="flex items-center gap-1.5 text-white/30 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{order.destinationAddress}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-white/30">{(order.distance / 1000).toFixed(1)} km</span>
                    <span className="text-white/30">{Math.round(order.duration / 60)} mnt</span>
                    {order.customerRating && (
                      <span className="flex items-center gap-0.5 text-primary">
                        <Star className="w-3 h-3 fill-primary" />
                        {order.customerRating}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold text-sm">{formatCurrency(order.deliveryFee)}</p>
                  <p className={`text-xs font-medium mt-1 ${
                    order.status === 'completed' ? 'text-emerald-400' :
                    order.status === 'cancelled' ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {order.status === 'completed' ? 'Selesai' :
                     order.status === 'cancelled' ? 'Batal' : 'Aktif'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
