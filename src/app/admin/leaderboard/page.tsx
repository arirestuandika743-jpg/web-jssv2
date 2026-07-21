'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Package, TrendingUp, XCircle, Settings } from 'lucide-react';
import { courierService } from '@/services/courierService';
import { formatCurrency } from '@/lib/utils';
import { FadeIn } from '@/components/layout/PageTransition';
import type { LeaderboardEntry, CourierBadge, DailyTarget } from '@/types';

const BADGE_CONFIG: Record<CourierBadge, { label: string; icon: string; color: string }> = {
  platinum: { label: 'Platinum', icon: '🥇', color: 'text-violet-500 bg-violet-50' },
  gold: { label: 'Gold', icon: '🥈', color: 'text-amber-500 bg-amber-50' },
  silver: { label: 'Silver', icon: '🥉', color: 'text-gray-500 bg-gray-50' },
  rookie: { label: 'Rookie', icon: '⭐', color: 'text-emerald-500 bg-emerald-50' },
};

export default function AdminLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<DailyTarget | null>(null);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [newTarget, setNewTarget] = useState({ orders: 10, bonus: 20000 });

  useEffect(() => {
    Promise.all([
      courierService.getLeaderboard(),
      courierService.getDailyTarget(),
    ]).then(([lb, tgt]) => {
      setEntries(lb);
      setTarget(tgt);
      setNewTarget({ orders: tgt.targetOrders, bonus: tgt.bonusAmount });
      setLoading(false);
    });
  }, []);

  const handleSaveTarget = async () => {
    const t = await courierService.setDailyTarget(newTarget.orders, newTarget.bonus);
    setTarget(t);
    setShowTargetModal(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">🏆 Leaderboard</h1>
            <p className="text-secondary-500 text-sm mt-1">Ranking dan performa kurir</p>
          </div>
          <button
            onClick={() => setShowTargetModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary rounded-xl text-secondary-900 text-sm font-bold"
          >
            <Settings className="w-4 h-4" />
            Target Harian
          </button>
        </div>
      </FadeIn>

      {/* Current Target */}
      {target && (
        <div className="bg-gradient-to-r from-primary/10 to-amber-50 rounded-card p-5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-900 font-bold text-sm">🎯 Target Harian Aktif</p>
              <p className="text-secondary-500 text-xs mt-1">Bonus {formatCurrency(target.bonusAmount)} per {target.targetOrders} order selesai</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-primary">{target.targetOrders}</p>
              <p className="text-secondary-400 text-xs">order</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-card shadow-soft overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase">Kurir</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-500 uppercase">Badge</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-500 uppercase">Order</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-500 uppercase hidden md:table-cell">Rating</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-500 uppercase hidden md:table-cell">On-Time</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-500 uppercase hidden lg:table-cell">Pendapatan</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-500 uppercase hidden lg:table-cell">Cancel</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-500 uppercase">Skor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-50">
            {entries.map((entry, i) => (
              <motion.tr
                key={entry.courierId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`hover:bg-secondary-50/50 ${i < 3 ? 'bg-primary/3' : ''}`}
              >
                <td className="px-4 py-3">
                  <span className={`text-sm font-black ${
                    i === 0 ? 'text-primary' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-secondary-300'
                  }`}>{entry.rank}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      i === 0 ? 'bg-primary' : 'bg-secondary-100'
                    }`}>
                      <span className={`font-bold text-sm ${i === 0 ? 'text-secondary-900' : 'text-secondary-400'}`}>
                        {entry.courierName[0]}
                      </span>
                    </div>
                    <span className="text-secondary-900 font-semibold text-sm">{entry.courierName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${BADGE_CONFIG[entry.badge].color}`}>
                    {BADGE_CONFIG[entry.badge].icon} {BADGE_CONFIG[entry.badge].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-secondary-700">{entry.totalOrders}</td>
                <td className="px-4 py-3 text-right text-sm text-secondary-600 hidden md:table-cell">⭐ {entry.rating.toFixed(1)}</td>
                <td className="px-4 py-3 text-right text-sm text-secondary-600 hidden md:table-cell">{entry.onTimeRate}%</td>
                <td className="px-4 py-3 text-right text-sm text-secondary-600 hidden lg:table-cell">{formatCurrency(entry.totalEarnings)}</td>
                <td className="px-4 py-3 text-right text-sm text-red-400 hidden lg:table-cell">{entry.cancelCount}</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-primary font-bold text-sm">{entry.score}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowTargetModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-card p-6 max-w-md w-full mx-4 shadow-soft-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-secondary-900 mb-4">🎯 Atur Target Harian</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-secondary-700 block mb-1">Jumlah Order Target</label>
                <select
                  value={newTarget.orders}
                  onChange={e => setNewTarget(p => ({ ...p, orders: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:border-primary outline-none"
                >
                  {[5, 10, 15, 20, 25, 30].map(n => (
                    <option key={n} value={n}>{n} Order</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-secondary-700 block mb-1">Bonus (Rp)</label>
                <input
                  type="number"
                  value={newTarget.bonus}
                  onChange={e => setNewTarget(p => ({ ...p, bonus: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:border-primary outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowTargetModal(false)} className="flex-1 py-2.5 border border-secondary-200 rounded-xl text-sm font-medium text-secondary-500">Batal</button>
                <button onClick={handleSaveTarget} className="flex-1 py-2.5 bg-primary rounded-xl text-sm font-bold text-secondary-900">Simpan</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
