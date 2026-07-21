'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, Package, XCircle, Medal } from 'lucide-react';
import { courierService } from '@/services/courierService';
import { formatCurrency } from '@/lib/utils';
import type { LeaderboardEntry, CourierBadge } from '@/types';

const BADGE_CONFIG: Record<CourierBadge, { label: string; icon: string; color: string; bgColor: string }> = {
  platinum: { label: 'Platinum', icon: '🥇', color: 'text-violet-400', bgColor: 'bg-violet-500/20' },
  gold: { label: 'Gold', icon: '🥈', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  silver: { label: 'Silver', icon: '🥉', color: 'text-gray-300', bgColor: 'bg-gray-500/20' },
  rookie: { label: 'Rookie', icon: '⭐', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
};

export default function CourierLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courierService.getLeaderboard().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const podiumColors = ['from-primary to-amber-500', 'from-gray-300 to-gray-400', 'from-amber-600 to-amber-700'];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-secondary-800 to-secondary-900 px-5 pt-6 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="text-white text-xl font-bold">Leaderboard</h1>
        </div>

        {/* Top 3 Podium */}
        {!loading && entries.length >= 3 && (
          <div className="flex items-end justify-center gap-3 h-48">
            {/* 2nd Place */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg">
                <span className="text-secondary-900 font-bold">{entries[1]?.courierName[0]}</span>
              </div>
              <p className="text-white text-xs font-semibold truncate">{entries[1]?.courierName.split(' ')[0]}</p>
              <p className="text-white/40 text-[10px]">{entries[1]?.totalOrders} order</p>
              <div className="bg-white/10 rounded-t-xl mt-2 h-20 flex items-center justify-center">
                <span className="text-2xl font-black text-white/30">2</span>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-1 text-center"
            >
              <div className="text-2xl mb-1">👑</div>
              <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-golden ring-2 ring-primary/50">
                <span className="text-secondary-900 font-bold text-lg">{entries[0]?.courierName[0]}</span>
              </div>
              <p className="text-white text-xs font-bold truncate">{entries[0]?.courierName.split(' ')[0]}</p>
              <p className="text-primary text-[10px] font-semibold">{entries[0]?.totalOrders} order</p>
              <div className="bg-primary/20 rounded-t-xl mt-2 h-28 flex items-center justify-center border-t-2 border-primary">
                <span className="text-3xl font-black text-primary/50">1</span>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">{entries[2]?.courierName[0]}</span>
              </div>
              <p className="text-white text-xs font-semibold truncate">{entries[2]?.courierName.split(' ')[0]}</p>
              <p className="text-white/40 text-[10px]">{entries[2]?.totalOrders} order</p>
              <div className="bg-white/10 rounded-t-xl mt-2 h-14 flex items-center justify-center">
                <span className="text-xl font-black text-white/30">3</span>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Full Rankings */}
      <div className="px-5 py-4 space-y-2 -mt-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          entries.map((entry, i) => (
            <motion.div
              key={entry.courierId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-white/5 ${
                i === 0 ? 'ring-1 ring-primary/30' : ''
              }`}
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                i === 0 ? 'bg-primary text-secondary-900' :
                i === 1 ? 'bg-gray-400 text-secondary-900' :
                i === 2 ? 'bg-amber-600 text-white' :
                'bg-white/10 text-white/30'
              }`}>
                {entry.rank}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{entry.courierName[0]}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm truncate">{entry.courierName}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${BADGE_CONFIG[entry.badge].bgColor} ${BADGE_CONFIG[entry.badge].color}`}>
                    {BADGE_CONFIG[entry.badge].icon}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-white/30 text-xs flex items-center gap-0.5">
                    <Package className="w-3 h-3" /> {entry.totalOrders}
                  </span>
                  <span className="text-white/30 text-xs flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-primary fill-primary" /> {entry.rating.toFixed(1)}
                  </span>
                  <span className="text-white/30 text-xs flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> {entry.onTimeRate}%
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-primary font-bold text-sm">{entry.score}</p>
                <p className="text-white/20 text-[10px]">poin</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
