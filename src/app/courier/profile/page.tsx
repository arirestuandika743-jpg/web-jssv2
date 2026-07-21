'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Star, Wallet, Package, Shield, Bell, LogOut, ChevronRight,
  Award, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courierService } from '@/services/courierService';
import { notificationService } from '@/services/notificationService';
import { formatCurrency } from '@/lib/utils';
import type { Notification, CourierBadge } from '@/types';
import { useRouter } from 'next/navigation';

const BADGE_CONFIG: Record<CourierBadge, { label: string; icon: string; gradient: string }> = {
  platinum: { label: 'Platinum', icon: '🥇', gradient: 'from-violet-500 to-purple-600' },
  gold: { label: 'Gold', icon: '🥈', gradient: 'from-amber-400 to-orange-500' },
  silver: { label: 'Silver', icon: '🥉', gradient: 'from-gray-300 to-gray-500' },
  rookie: { label: 'Rookie', icon: '⭐', gradient: 'from-emerald-400 to-teal-500' },
};

export default function CourierProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ rating: 5.0, balance: 0, totalDeliveries: 0, badge: 'rookie' as CourierBadge, todayOrders: 0, todayEarnings: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [penalties, setPenalties] = useState(0);
  const courierId = 'drv-1';

  useEffect(() => {
    Promise.all([
      courierService.getCourierStats(courierId),
      notificationService.getNotifications(user?.id || courierId, 20),
      courierService.getPenaltyPoints(courierId),
    ]).then(([s, n, p]) => {
      setStats(s);
      setNotifications(n);
      setPenalties(p);
    });
  }, [user?.id]);

  const handleLogout = async () => {
    await courierService.endShift(courierId);
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="bg-secondary-800 px-5 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-golden">
            <span className="text-2xl font-bold text-secondary-900">
              {(user?.name || 'K')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold">{user?.name || 'Kurir JSS'}</h1>
            <p className="text-white/40 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`px-2 py-0.5 rounded-lg bg-gradient-to-r ${BADGE_CONFIG[stats.badge].gradient}`}>
                <span className="text-white text-xs font-bold">{BADGE_CONFIG[stats.badge].icon} {BADGE_CONFIG[stats.badge].label}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-white/80 text-sm font-semibold">{stats.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-primary font-bold">{formatCurrency(stats.balance)}</p>
            <p className="text-white/30 text-[10px]">Saldo</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-emerald-400 font-bold">{stats.totalDeliveries}</p>
            <p className="text-white/30 text-[10px]">Total Antar</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className={`font-bold ${penalties > 0 ? 'text-red-400' : 'text-white'}`}>{penalties}</p>
            <p className="text-white/30 text-[10px]">Poin Penalti</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-5 py-4 space-y-2">
        {penalties >= 7 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-400 text-sm font-semibold">⚠ Perlu Pemeriksaan</p>
              <p className="text-red-400/60 text-xs">Poin penalti mendekati batas. Hubungi admin.</p>
            </div>
          </div>
        )}

        {[
          { icon: Bell, label: 'Notifikasi', desc: `${notifications.filter(n => !n.isRead).length} belum dibaca`, href: '#' },
          { icon: Award, label: 'Pencapaian', desc: `Badge: ${BADGE_CONFIG[stats.badge].label}`, href: '#' },
          { icon: Shield, label: 'Keamanan', desc: 'Password & verifikasi', href: '#' },
        ].map((item, i) => (
          <button
            key={i}
            className="w-full bg-white/5 rounded-xl p-4 flex items-center gap-3 border border-white/5"
          >
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <item.icon className="w-5 h-5 text-white/50" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-semibold text-sm">{item.label}</p>
              <p className="text-white/30 text-xs">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20" />
          </button>
        ))}

        {/* Notifications List */}
        {notifications.length > 0 && (
          <div className="mt-4">
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 px-1">Notifikasi Terbaru</h3>
            <div className="space-y-1">
              {notifications.slice(0, 5).map(n => (
                <div key={n.id} className={`p-3 rounded-xl ${n.isRead ? 'bg-white/5' : 'bg-primary/10 border border-primary/20'}`}>
                  <p className="text-white text-sm font-medium">{n.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{n.message}</p>
                  <p className="text-white/20 text-[10px] mt-1">
                    {new Date(n.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full mt-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-semibold text-sm flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </motion.button>
      </div>
    </div>
  );
}
