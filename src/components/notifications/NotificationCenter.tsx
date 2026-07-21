'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/types';

interface NotificationCenterProps {
  userId: string;
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(userId, 30),
        notificationService.getUnreadCount(userId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(userId);
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-button flex items-center justify-center hover:bg-secondary-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-secondary-500" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </motion.div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-12 z-40 w-80 bg-white rounded-card shadow-soft-xl border border-secondary-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-100">
              <h3 className="font-bold text-secondary-900 text-sm">Notifikasi</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary-700 font-medium hover:underline"
                  >
                    Tandai semua dibaca
                  </button>
                )}
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4 text-secondary-400" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-secondary-400 text-sm">Belum ada notifikasi</div>
              ) : (
                notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id)}
                    className={`w-full text-left px-4 py-3 border-b border-secondary-50 hover:bg-secondary-50/50 transition-colors ${
                      !notif.isRead ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className={`text-sm ${!notif.isRead ? 'font-semibold text-secondary-900' : 'text-secondary-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-secondary-400 text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-secondary-300 text-[10px] mt-1">
                          {new Date(notif.createdAt).toLocaleString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
