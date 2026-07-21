'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, CheckCircle2, XCircle, Users, Truck, Coffee,
  Wifi, WifiOff, DollarSign, TrendingUp, ArrowUpRight, Clock,
  AlertTriangle, Package, Bell,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { analyticsService } from '@/services/analyticsService';
import { courierService } from '@/services/courierService';
import type { PanicAlert } from '@/types';

export default function AdminDashboardEnhanced() {
  const [stats, setStats] = useState({
    ordersToday: 0, ordersInProgress: 0, ordersCompleted: 0, ordersCancelled: 0,
    couriersOnline: 0, couriersOffline: 0, couriersDelivering: 0, couriersOnBreak: 0,
    totalRevenue: 0,
  });
  const [panicAlerts, setPanicAlerts] = useState<PanicAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [enhancedStats, alerts] = await Promise.all([
        analyticsService.getEnhancedStats(),
        courierService.getActivePanicAlerts(),
      ]);
      setStats(enhancedStats);
      setPanicAlerts(alerts);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const orderStats = [
    { label: 'Order Masuk', value: stats.ordersToday, icon: ShoppingCart, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Diproses', value: stats.ordersInProgress, icon: Clock, color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
    { label: 'Selesai', value: stats.ordersCompleted, icon: CheckCircle2, color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'Cancel', value: stats.ordersCancelled, icon: XCircle, color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-600' },
  ];

  const courierStats = [
    { label: 'Online', value: stats.couriersOnline, icon: Wifi, color: 'text-emerald-500', dot: 'bg-emerald-500' },
    { label: 'Offline', value: stats.couriersOffline, icon: WifiOff, color: 'text-red-400', dot: 'bg-red-500' },
    { label: 'Mengantar', value: stats.couriersDelivering, icon: Truck, color: 'text-blue-400', dot: 'bg-blue-500' },
    { label: 'Istirahat', value: stats.couriersOnBreak, icon: Coffee, color: 'text-amber-400', dot: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Dashboard</h1>
            <p className="text-secondary-500 mt-1">Monitoring real-time JSS 📡</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600">Live</span>
          </div>
        </div>
      </FadeIn>

      {/* Panic Alerts */}
      {panicAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 font-bold text-sm">🚨 PANIC ALERT AKTIF</span>
          </div>
          {panicAlerts.map(alert => (
            <div key={alert.id} className="flex items-center justify-between py-2 border-t border-red-100">
              <div>
                <p className="text-red-700 font-semibold text-sm">{alert.courierName}</p>
                <p className="text-red-500 text-xs">{new Date(alert.createdAt).toLocaleString('id-ID')}</p>
              </div>
              <a
                href={`https://maps.google.com/?q=${alert.location.lat},${alert.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold"
              >
                📍 Lokasi
              </a>
            </div>
          ))}
        </motion.div>
      )}

      {/* Order Stats Grid */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {orderStats.map((stat, i) => (
          <StaggerItem key={i}>
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-white rounded-card p-5 shadow-soft"
            >
              <div className={`w-11 h-11 ${stat.bgColor} rounded-2xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              <p className="text-secondary-400 text-sm mt-0.5">{stat.label}</p>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Revenue + Courier Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <FadeIn className="lg:col-span-1">
          <div className="bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-card p-6 shadow-soft text-white">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-white/60 text-sm">Pendapatan Hari Ini</span>
            </div>
            <p className="text-3xl font-black text-primary mb-1">{formatCurrency(stats.totalRevenue)}</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold">Real-time update</span>
            </div>
          </div>
        </FadeIn>

        {/* Courier Status Panel */}
        <FadeIn delay={0.1} className="lg:col-span-2">
          <div className="bg-white rounded-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-secondary-900">👨‍💼 Status Kurir</h3>
              <Link href="/admin/map" className="text-xs text-primary-700 font-semibold hover:underline">
                Lihat Peta →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {courierStats.map((cs, i) => (
                <div key={i} className="bg-secondary-50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <div className={`w-2 h-2 ${cs.dot} rounded-full`} />
                    <cs.icon className={`w-4 h-4 ${cs.color}`} />
                  </div>
                  <p className="text-xl font-bold text-secondary-900">{cs.value}</p>
                  <p className="text-secondary-400 text-xs">{cs.label}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Quick Links */}
      <FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { href: '/admin/deposits', icon: '💳', label: 'Verifikasi Deposit', desc: 'Approve top up kurir' },
            { href: '/admin/analytics', icon: '📊', label: 'Analytics', desc: 'Grafik & statistik' },
            { href: '/admin/leaderboard', icon: '🏆', label: 'Leaderboard', desc: 'Ranking kurir' },
            { href: '/admin/chat', icon: '💬', label: 'Chat', desc: 'Pesan kurir' },
            { href: '/admin/activity-log', icon: '📋', label: 'Log Aktivitas', desc: 'Semua aktivitas' },
          ].map((item, i) => (
            <Link key={i} href={item.href}>
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white rounded-card p-4 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer border border-secondary-100"
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="text-secondary-900 font-semibold text-sm mt-2">{item.label}</p>
                <p className="text-secondary-400 text-xs mt-0.5">{item.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
