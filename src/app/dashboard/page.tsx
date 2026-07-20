'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  MapPin,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/services/db';
import type { Order } from '@/types';

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      dbService.getCustomerOrders(user.id)
        .then(data => setOrders(data))
        .catch(err => console.error('Gagal mengambil pesanan:', err))
        .finally(() => setFetching(false));
    } else if (!loading) {
      setFetching(false);
    }
  }, [user, loading]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-card shadow-soft">
        <Package className="w-16 h-16 text-secondary-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-secondary-900 mb-2">Belum Masuk Akun</h2>
        <p className="text-secondary-500 mb-6">Silakan masuk terlebih dahulu untuk mengakses dashboard Anda.</p>
        <Link href="/login" className="btn-primary">Masuk Sekarang</Link>
      </div>
    );
  }

  const activeOrdersCount = orders.filter(o => 
    ['waiting', 'accepted', 'driver_going', 'shopping', 'delivering'].includes(o.status)
  ).length;

  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;

  const stats = [
    { label: 'Total Pesanan', value: orders.length.toString(), icon: ShoppingCart, color: 'bg-blue-50 text-blue-500' },
    { label: 'Sedang Proses', value: activeOrdersCount.toString(), icon: Clock, color: 'bg-amber-50 text-amber-500' },
    { label: 'Selesai', value: completedOrdersCount.toString(), icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-500' },
    { label: 'Alamat Tersimpan', value: '4', icon: MapPin, color: 'bg-purple-50 text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <FadeIn>
        <div className="bg-gradient-to-r from-secondary-900 to-secondary-800 rounded-card p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />
          <div className="relative">
            <p className="text-white/60 text-sm mb-1">Selamat datang kembali 👋</p>
            <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
            <p className="text-white/50 text-sm">
              {activeOrdersCount > 0 
                ? `Kamu punya ${activeOrdersCount} pesanan aktif saat ini.`
                : 'Kamu tidak memiliki pesanan aktif saat ini.'}
            </p>
            <Link href="/order" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              <Package className="w-4 h-4" />
              Pesan Baru
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Quick Stats */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StaggerItem key={i}>
            <div className="bg-white rounded-card p-5 shadow-soft">
              <div className={`w-10 h-10 rounded-xl ${stat.color.split(' ')[0]} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[1]}`} />
              </div>
              <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              <p className="text-xs text-secondary-400 mt-0.5">{stat.label}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Recent Orders */}
      <FadeIn delay={0.1}>
        <div className="bg-white rounded-card shadow-soft">
          <div className="flex items-center justify-between p-6 border-b border-secondary-100">
            <h2 className="text-lg font-bold text-secondary-900">Pesanan Terbaru</h2>
            <Link href="/dashboard/orders" className="text-sm font-medium text-primary-700 flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-secondary-50">
            {orders.slice(0, 3).map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-secondary-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-900">{order.orderNumber}</p>
                    <p className="text-xs text-secondary-400">
                      {order.category.toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={cn(
                    'badge-status text-[11px]',
                    order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    order.status === 'delivering' ? 'bg-cyan-100 text-cyan-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {order.status === 'completed' ? 'Selesai' :
                     order.status === 'cancelled' ? 'Batal' :
                     order.status === 'delivering' ? 'Diantar' :
                     order.status === 'shopping' ? 'Belanja' :
                     order.status === 'driver_going' ? 'Driver Menuju' :
                     order.status === 'accepted' ? 'Diterima' : 'Menunggu'}
                  </span>
                  <p className="text-sm font-semibold text-secondary-900">
                    {order.grandTotal > 0 ? formatCurrency(order.grandTotal) : '-'}
                  </p>
                  <Link
                    href={`/tracking/${order.id}`}
                    className="text-[10px] font-semibold text-primary-700 hover:text-primary-800 mt-0.5"
                  >
                    Detail Lacak →
                  </Link>
                </div>
              </motion.div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-10 text-secondary-400 text-sm">
                Belum ada transaksi pesanan.
              </div>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Quick Actions */}
      <FadeIn delay={0.15}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/order" className="group bg-white rounded-card p-6 shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-secondary-900 transition-colors">
              <Package className="w-6 h-6 text-primary group-hover:text-secondary-900" />
            </div>
            <div>
              <p className="font-semibold text-secondary-900">Buat Pesanan Baru</p>
              <p className="text-xs text-secondary-400">Pesan antar jemput atau titip beli</p>
            </div>
          </Link>
          <Link href="/dashboard/addresses" className="group bg-white rounded-card p-6 shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
              <MapPin className="w-6 h-6 text-emerald-500 group-hover:text-white" />
            </div>
            <div>
              <p className="font-semibold text-secondary-900">Kelola Alamat</p>
              <p className="text-xs text-secondary-400">Tambah atau ubah alamat tersimpan</p>
            </div>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
