'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Search, Filter } from 'lucide-react';
import { courierService } from '@/services/courierService';
import { FadeIn } from '@/components/layout/PageTransition';
import type { ActivityLog, ActivityAction } from '@/types';

const ACTION_CONFIG: Record<ActivityAction, { emoji: string; label: string; color: string }> = {
  login: { emoji: '🔑', label: 'Login', color: 'text-blue-500' },
  logout: { emoji: '🚪', label: 'Logout', color: 'text-gray-500' },
  shift_start: { emoji: '🟢', label: 'Mulai Shift', color: 'text-emerald-500' },
  shift_end: { emoji: '🔴', label: 'Selesai Shift', color: 'text-red-500' },
  order_accept: { emoji: '✅', label: 'Terima Order', color: 'text-emerald-500' },
  order_reject: { emoji: '❌', label: 'Tolak Order', color: 'text-red-500' },
  order_status_update: { emoji: '📋', label: 'Update Status', color: 'text-blue-500' },
  order_complete: { emoji: '🎉', label: 'Order Selesai', color: 'text-emerald-500' },
  photo_upload: { emoji: '📷', label: 'Upload Foto', color: 'text-purple-500' },
  otp_verify: { emoji: '🔢', label: 'Verifikasi OTP', color: 'text-indigo-500' },
  panic_trigger: { emoji: '🚨', label: 'PANIC', color: 'text-red-600' },
  chat_send: { emoji: '💬', label: 'Kirim Pesan', color: 'text-blue-500' },
  location_update: { emoji: '📍', label: 'Update Lokasi', color: 'text-teal-500' },
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    courierService.getActivityLogs(200).then(data => {
      setLogs(data);
      setLoading(false);
    });
    const interval = setInterval(async () => {
      const data = await courierService.getActivityLogs(200);
      setLogs(data);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (search && !log.details.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">📋 Log Aktivitas</h1>
          <p className="text-secondary-500 text-sm mt-1">Semua aktivitas kurir tercatat</p>
        </div>
      </FadeIn>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Cari aktivitas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-secondary-200 rounded-xl text-sm focus:border-primary outline-none shadow-soft"
          />
        </div>
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          className="px-4 py-2.5 bg-white border border-secondary-200 rounded-xl text-sm focus:border-primary outline-none shadow-soft"
        >
          <option value="all">Semua Aktivitas</option>
          {Object.entries(ACTION_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.emoji} {config.label}</option>
          ))}
        </select>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-card shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" /></div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-secondary-400 text-sm">Belum ada aktivitas tercatat</div>
        ) : (
          <div className="divide-y divide-secondary-50">
            {filteredLogs.slice(0, 100).map((log, i) => {
              const config = ACTION_CONFIG[log.action] || { emoji: '📌', label: log.action, color: 'text-secondary-500' };
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`px-5 py-3 flex items-start gap-3 hover:bg-secondary-50/50 ${
                    log.action === 'panic_trigger' ? 'bg-red-50/50' : ''
                  }`}
                >
                  <span className="text-lg mt-0.5">{config.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-secondary-900 text-sm">{log.details}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                      <span className="text-secondary-300 text-xs">·</span>
                      <span className="text-secondary-400 text-xs">
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
