'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, Star, MapPin, XCircle, BarChart3, PieChart,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { analyticsService } from '@/services/analyticsService';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import type { AnalyticsData } from '@/types';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<number>(30);

  useEffect(() => {
    analyticsService.getAnalytics(period).then(d => { setData(d); setLoading(false); });
  }, [period]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const maxOrders = Math.max(...data.ordersPerDay.map(d => d.count), 1);
  const maxRevenue = Math.max(...data.revenuePerDay.map(d => d.amount), 1);
  const maxPeakHour = Math.max(...data.peakHours.map(d => d.count), 1);

  // Take last 14 days for display
  const displayOrders = data.ordersPerDay.slice(-14);
  const displayRevenue = data.revenuePerDay.slice(-14);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">📊 Analytics</h1>
            <p className="text-secondary-500 text-sm mt-1">Analisis kinerja dan statistik</p>
          </div>
          <div className="flex bg-secondary-50 rounded-xl p-1">
            {[7, 14, 30].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p ? 'bg-white shadow-sm text-secondary-900' : 'text-secondary-400'
                }`}
              >
                {p} hari
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Summary Cards */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cancel Rate', value: `${data.cancelRate}%`, icon: XCircle, color: 'bg-red-50 text-red-600' },
          { label: 'Waktu Antar', value: `${data.avgDeliveryTime} mnt`, icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { label: 'Rating Rata-rata', value: data.avgRating.toFixed(1), icon: Star, color: 'bg-amber-50 text-amber-600' },
          { label: 'Top Kurir', value: data.topCouriers[0]?.name?.split(' ')[0] || '-', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
        ].map((card, i) => (
          <StaggerItem key={i}>
            <div className="bg-white rounded-card p-5 shadow-soft">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color.split(' ')[0]}`}>
                <card.icon className={`w-5 h-5 ${card.color.split(' ')[1]}`} />
              </div>
              <p className="text-xl font-bold text-secondary-900">{card.value}</p>
              <p className="text-secondary-400 text-xs mt-0.5">{card.label}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders per Day Chart */}
        <FadeIn>
          <div className="bg-white rounded-card p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h3 className="text-secondary-900 font-bold">Order per Hari</h3>
            </div>
            <div className="flex items-end gap-1 h-40">
              {displayOrders.map((d, i) => {
                const height = (d.count / maxOrders) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[9px] text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 4)}%` }}
                      transition={{ delay: i * 0.03, duration: 0.5 }}
                      className="w-full bg-blue-400 rounded-t-md hover:bg-blue-500 transition-colors"
                    />
                    <span className="text-[8px] text-secondary-300">
                      {new Date(d.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Revenue per Day Chart */}
        <FadeIn delay={0.1}>
          <div className="bg-white rounded-card p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="text-secondary-900 font-bold">Pendapatan per Hari</h3>
            </div>
            <div className="flex items-end gap-1 h-40">
              {displayRevenue.map((d, i) => {
                const height = (d.amount / maxRevenue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[9px] text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatCurrency(d.amount).replace('Rp', '')}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 4)}%` }}
                      transition={{ delay: i * 0.03, duration: 0.5 }}
                      className="w-full bg-emerald-400 rounded-t-md hover:bg-emerald-500 transition-colors"
                    />
                    <span className="text-[8px] text-secondary-300">
                      {new Date(d.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Peak Hours + Top Areas */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <FadeIn>
          <div className="bg-white rounded-card p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-purple-500" />
              <h3 className="text-secondary-900 font-bold">Jam Sibuk</h3>
            </div>
            <div className="flex items-end gap-0.5 h-32">
              {data.peakHours.filter(h => h.hour >= 6 && h.hour <= 21).map((h, i) => {
                const height = (h.count / maxPeakHour) * 100;
                const isPeak = h.count >= maxPeakHour * 0.7;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 4)}%` }}
                      transition={{ delay: i * 0.03 }}
                      className={`w-full rounded-t-sm ${isPeak ? 'bg-purple-400' : 'bg-purple-200'}`}
                    />
                    <span className="text-[8px] text-secondary-300">{h.hour}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Busiest Areas + Top Couriers */}
        <FadeIn delay={0.1}>
          <div className="bg-white rounded-card p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-red-500" />
              <h3 className="text-secondary-900 font-bold">Wilayah Tersibuk</h3>
            </div>
            <div className="space-y-3">
              {data.busiestAreas.map((area, i) => {
                const percent = (area.orders / (data.busiestAreas[0]?.orders || 1)) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-secondary-700 text-sm font-medium">{area.area}</span>
                      <span className="text-secondary-400 text-xs">{area.orders} order</span>
                    </div>
                    <div className="w-full h-2 bg-secondary-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Top Couriers Table */}
      <FadeIn>
        <div className="bg-white rounded-card p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary" />
            <h3 className="text-secondary-900 font-bold">Kurir Terbaik</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-100">
                  <th className="text-left py-2 text-xs text-secondary-400 font-semibold">#</th>
                  <th className="text-left py-2 text-xs text-secondary-400 font-semibold">Nama</th>
                  <th className="text-right py-2 text-xs text-secondary-400 font-semibold">Order</th>
                  <th className="text-right py-2 text-xs text-secondary-400 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {data.topCouriers.map((c, i) => (
                  <tr key={i} className="border-b border-secondary-50">
                    <td className="py-3 text-sm font-bold text-secondary-300">{i + 1}</td>
                    <td className="py-3 text-sm font-semibold text-secondary-900">{c.name}</td>
                    <td className="py-3 text-sm text-secondary-600 text-right">{c.orders}</td>
                    <td className="py-3 text-sm text-right">
                      <span className="text-primary font-semibold">⭐ {c.rating.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
