'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { FadeIn } from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/services/db';
import type { Order, OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; class: string }> = {
  waiting: { label: 'Menunggu', class: 'badge-pending' },
  accepted: { label: 'Diterima', class: 'badge-active' },
  driver_going: { label: 'Driver Menuju', class: 'bg-indigo-100 text-indigo-700 badge-status' },
  shopping: { label: 'Belanja', class: 'bg-purple-100 text-purple-700 badge-status' },
  delivering: { label: 'Diantar', class: 'bg-cyan-100 text-cyan-700 badge-status' },
  completed: { label: 'Selesai', class: 'badge-completed' },
  cancelled: { label: 'Dibatalkan', class: 'badge-cancelled' },
};

export default function OrderHistoryPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      dbService.getCustomerOrders(user.id)
        .then(data => setOrders(data))
        .catch(err => console.error(err))
        .finally(() => setFetching(false));
    } else if (!loading) {
      setFetching(false);
    }
  }, [user, loading]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 bg-white rounded-card shadow-soft">
        <p className="text-secondary-500 mb-4">Silakan login untuk melihat riwayat pesanan Anda.</p>
        <Link href="/login" className="btn-primary">Masuk</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-bold text-secondary-900">Riwayat Pesanan</h1>
        <p className="text-secondary-500 mt-1">Semua pesanan yang pernah Anda buat</p>
      </FadeIn>

      <div className="space-y-4">
        {orders.map((order, index) => {
          const config = statusConfig[order.status];
          return (
            <FadeIn key={order.id} delay={index * 0.05}>
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white rounded-card p-5 shadow-soft hover:shadow-soft-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-primary-700">{order.orderNumber}</span>
                        <span className={config?.class}>{config?.label}</span>
                      </div>
                      <p className="text-sm text-secondary-600 mb-1">{order.category.toUpperCase()} - {order.description}</p>
                      <div className="flex items-center gap-1 text-xs text-secondary-400">
                        <MapPin className="w-3 h-3" />
                        {order.pickupAddress} → {order.destinationAddress}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-secondary-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} WIB
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <p className="text-lg font-bold text-secondary-900">
                      {order.grandTotal > 0 ? formatCurrency(order.grandTotal) : '-'}
                    </p>
                    <Link
                      href={`/tracking/${order.id}`}
                      className="text-xs font-medium text-primary-700 hover:text-primary-800 flex items-center gap-1"
                    >
                      Lacak Pesanan <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          );
        })}

        {orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-card shadow-soft">
            <Package className="w-12 h-12 text-secondary-200 mx-auto mb-3" />
            <p className="text-secondary-500 mb-4">Anda belum memiliki riwayat pesanan.</p>
            <Link href="/order" className="btn-primary text-sm">Buat Pesanan Sekarang</Link>
          </div>
        )}
      </div>
    </div>
  );
}
