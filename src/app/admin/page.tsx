'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Users,
  Truck,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { dbService } from '@/services/db';
import type { Order, DashboardStats } from '@/types';

const statusConfig: Record<string, { label: string; class: string }> = {
  waiting: { label: 'Menunggu', class: 'badge-pending' },
  accepted: { label: 'Diterima', class: 'badge-active' },
  driver_going: { label: 'Driver Menuju', class: 'bg-indigo-100 text-indigo-700 badge-status' },
  shopping: { label: 'Belanja', class: 'bg-purple-100 text-purple-700 badge-status' },
  delivering: { label: 'Diantar', class: 'bg-cyan-100 text-cyan-700 badge-status' },
  completed: { label: 'Selesai', class: 'badge-completed' },
  cancelled: { label: 'Batal', class: 'badge-cancelled' },
};

const monthlyData = [
  { month: 'Jan', revenue: 2400000 },
  { month: 'Feb', revenue: 3100000 },
  { month: 'Mar', revenue: 2800000 },
  { month: 'Apr', revenue: 3500000 },
  { month: 'May', revenue: 4200000 },
  { month: 'Jun', revenue: 3900000 },
  { month: 'Jul', revenue: 4800000 },
];

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dbService.getDashboardStats(),
      dbService.getAllOrders()
    ]).then(([statsResult, ordersResult]) => {
      setStatsData(statsResult);
      setOrders(ordersResult);
    }).catch(err => console.error('Gagal memuat dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  const stats = [
    {
      label: "Pesanan Hari Ini",
      value: statsData?.todayOrders || 0,
      change: '+12%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: "Pendapatan Hari Ini",
      value: formatCurrency(statsData?.todayRevenue || 0),
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      label: "Pesanan Pending",
      value: statsData?.pendingOrders || 0,
      change: '-3',
      trend: 'down',
      icon: Clock,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      label: "Pesanan Selesai",
      value: statsData?.completedOrders || 0,
      change: '+15%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'bg-primary-500',
      bgColor: 'bg-primary-50',
    },
  ];

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-500 mt-1">Selamat datang di panel admin JSS 👋</p>
        </div>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <StaggerItem key={index}>
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-card p-6 shadow-soft hover:shadow-soft-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              <p className="text-sm text-secondary-400 mt-1">{stat.label}</p>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="grid lg:grid-cols-3 gap-6">
        <FadeIn className="lg:col-span-2">
          <div className="bg-white rounded-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-secondary-900">Pendapatan Bulanan</h3>
                <p className="text-sm text-secondary-400">7 bulan terakhir</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600">+23% bulan ini</span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-3 h-48">
              {monthlyData.map((data, index) => {
                const height = (data.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className={`w-full rounded-t-lg transition-colors ${
                        index === monthlyData.length - 1
                          ? 'bg-gradient-to-t from-primary to-primary-400'
                          : 'bg-secondary-100 hover:bg-primary/30'
                      }`}
                    />
                    <span className="text-xs text-secondary-400 font-medium">{data.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-white rounded-card p-6 shadow-soft">
            <h3 className="text-lg font-bold text-secondary-900 mb-6">Ringkasan</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-secondary-900">Total Pesanan</p>
                  <p className="text-xs text-secondary-400">Semua Waktu</p>
                </div>
                <span className="text-lg font-bold text-secondary-900">{orders.length}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-secondary-900">Revenue</p>
                  <p className="text-xs text-secondary-400">Total Riil</p>
                </div>
                <span className="text-lg font-bold text-secondary-900">
                  {formatCurrency(orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.grandTotal, 0))}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-secondary-900">Pesanan Aktif</p>
                  <p className="text-xs text-secondary-400">Dalam Pengantaran</p>
                </div>
                <span className="text-lg font-bold text-secondary-900">
                  {orders.filter(o => ['waiting', 'accepted', 'driver_going', 'shopping', 'delivering'].includes(o.status)).length}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-secondary-900">Driver Aktif</p>
                  <p className="text-xs text-secondary-400">Terdaftar</p>
                </div>
                <span className="text-lg font-bold text-secondary-900">5</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      <FadeIn>
        <div className="bg-white rounded-card shadow-soft overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-secondary-100">
            <div>
              <h3 className="text-lg font-bold text-secondary-900">Pesanan Terbaru</h3>
              <p className="text-sm text-secondary-400">Menampilkan pesanan terkini</p>
            </div>
            <Link href="/admin/orders" className="text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors">
              Lihat Semua →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Pelanggan</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Kategori</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Waktu</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {orders.slice(0, 6).map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-secondary-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-primary-700">
                      <Link href={`/tracking/${order.id}`} className="hover:underline">{order.orderNumber}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-900 font-medium">{order.customerName}</td>
                    <td className="px-6 py-4 text-sm text-secondary-500">{order.category.toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <span className={statusConfig[order.status]?.class}>
                        {statusConfig[order.status]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-400">
                      {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-secondary-900 text-right">
                      {order.grandTotal > 0 ? formatCurrency(order.grandTotal) : '-'}
                    </td>
                  </motion.tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-secondary-400 text-sm">
                      Belum ada transaksi pesanan masuk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
