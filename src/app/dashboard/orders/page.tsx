'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Clock, ArrowRight, Loader2, Star, X, Send } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, cn } from '@/lib/utils';
import { FadeIn } from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/services/db';
import type { Order, OrderStatus } from '@/types';
import { toast } from 'sonner';

const RATED_ORDERS_KEY = 'jss_rated_orders';

function getRatedOrders(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RATED_ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function markOrderRated(orderId: string) {
  const rated = getRatedOrders();
  if (!rated.includes(orderId)) {
    rated.push(orderId);
    localStorage.setItem(RATED_ORDERS_KEY, JSON.stringify(rated));
  }
}

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
  const [ratedOrders, setRatedOrders] = useState<string[]>([]);

  // Rating modal state
  const [ratingModal, setRatingModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    setRatedOrders(getRatedOrders());
  }, []);

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

  const openRatingModal = (order: Order) => {
    setRatingModal({ open: true, order });
    setSelectedRating(0);
    setHoverRating(0);
  };

  const closeRatingModal = () => {
    setRatingModal({ open: false, order: null });
    setSelectedRating(0);
    setHoverRating(0);
  };

  const handleSubmitRating = async () => {
    if (!ratingModal.order || selectedRating === 0) {
      toast.error('Pilih rating bintang terlebih dahulu');
      return;
    }
    if (!ratingModal.order.driverId) {
      toast.error('Pesanan ini tidak memiliki driver');
      return;
    }

    setSubmittingRating(true);
    try {
      await dbService.rateDriver(ratingModal.order.driverId, selectedRating);
      markOrderRated(ratingModal.order.id);
      setRatedOrders(prev => [...prev, ratingModal.order!.id]);
      toast.success(`Terima kasih! Rating ${selectedRating} bintang berhasil dikirim untuk driver ${ratingModal.order.driverName || 'kurir'}`);
      closeRatingModal();
    } catch (err) {
      toast.error('Gagal mengirim rating. Silakan coba lagi.');
    } finally {
      setSubmittingRating(false);
    }
  };

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
          const isCompleted = order.status === 'completed';
          const hasDriver = !!order.driverId;
          const alreadyRated = ratedOrders.includes(order.id);
          const canRate = isCompleted && hasDriver && !alreadyRated;

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

                      {/* Driver name display */}
                      {order.driverName && (
                        <p className="text-xs text-secondary-500 mt-1 font-medium">
                          🚗 Driver: {order.driverName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <p className="text-lg font-bold text-secondary-900">
                      {order.grandTotal > 0 ? formatCurrency(order.grandTotal) : '-'}
                    </p>
                    <div className="flex items-center gap-2">
                      {/* Rating Button */}
                      {canRate && (
                        <button
                          onClick={() => openRatingModal(order)}
                          className="text-xs font-bold text-white bg-primary hover:bg-primary-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-golden hover:shadow-golden-lg"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Beri Rating
                        </button>
                      )}
                      {alreadyRated && isCompleted && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                          Sudah Dirating
                        </span>
                      )}
                      <Link
                        href={`/tracking/${order.id}`}
                        className="text-xs font-medium text-primary-700 hover:text-primary-800 flex items-center gap-1"
                      >
                        Lacak Pesanan <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
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

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingModal.open && ratingModal.order && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={closeRatingModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-[20%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-secondary-100">
                <h2 className="text-lg font-bold text-secondary-900">Beri Rating Driver</h2>
                <button
                  onClick={closeRatingModal}
                  className="w-9 h-9 rounded-xl bg-secondary-100 hover:bg-secondary-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                {/* Driver info */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-secondary-900 text-xl">
                    {(ratingModal.order.driverName || 'D')
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <p className="font-bold text-secondary-900 text-lg mb-0.5">
                  {ratingModal.order.driverName || 'Driver'}
                </p>
                <p className="text-xs text-secondary-400 mb-1">
                  Pesanan #{ratingModal.order.orderNumber}
                </p>
                <p className="text-sm text-secondary-500 mb-6">
                  Bagaimana pelayanan driver ini?
                </p>

                {/* Star Rating */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-all"
                    >
                      <Star
                        className={cn(
                          'w-10 h-10 transition-all duration-200',
                          (hoverRating || selectedRating) >= star
                            ? 'text-primary fill-primary drop-shadow-md'
                            : 'text-secondary-200'
                        )}
                      />
                    </motion.button>
                  ))}
                </div>

                {/* Rating Label */}
                <p className="text-sm font-semibold text-secondary-700 h-6 mb-4">
                  {selectedRating === 1 && '😞 Kurang'}
                  {selectedRating === 2 && '😐 Cukup'}
                  {selectedRating === 3 && '🙂 Lumayan'}
                  {selectedRating === 4 && '😊 Bagus'}
                  {selectedRating === 5 && '🤩 Luar Biasa!'}
                </p>
              </div>

              {/* Submit */}
              <div className="p-5 border-t border-secondary-100 flex items-center gap-3">
                <button
                  onClick={closeRatingModal}
                  className="btn-outline flex-1 py-3 text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={submittingRating || selectedRating === 0}
                  className={cn(
                    'flex-1 py-3 text-sm font-bold rounded-button flex items-center justify-center gap-2 transition-all',
                    selectedRating > 0
                      ? 'btn-primary shadow-golden'
                      : 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                  )}
                >
                  {submittingRating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Kirim Rating
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
