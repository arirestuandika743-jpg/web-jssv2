'use client';

import type { Notification, NotificationType } from '@/types';

const MOCK_NOTIFICATIONS_KEY = 'jss_notifications';

function getMock<T>(key: string, fallback: T[] = []): T[] {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try { return JSON.parse(stored); } catch { return fallback; }
}

function setMock<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  order_new: '🔔',
  order_broadcast: '📦',
  order_status: '📋',
  order_late: '⏰',
  shift_reminder: '🕐',
  panic_alert: '🚨',
  bonus_earned: '🎉',
  admin_message: '💬',
  rating_received: '⭐',
  penalty_warning: '⚠️',
  target_achieved: '🎯',
};

export const notificationService = {
  /** Send a notification */
  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<Notification> {
    const notification: Notification = {
      id: genId(),
      userId,
      type,
      title: `${NOTIFICATION_ICONS[type]} ${title}`,
      message,
      data,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const notifications = getMock<Notification>(MOCK_NOTIFICATIONS_KEY);
    notifications.unshift(notification);
    // Keep only last 100 notifications per user
    const userNotifs = notifications.filter(n => n.userId === userId).slice(0, 100);
    const otherNotifs = notifications.filter(n => n.userId !== userId);
    setMock(MOCK_NOTIFICATIONS_KEY, [...userNotifs, ...otherNotifs]);

    return notification;
  },

  /** Get notifications for a user */
  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    const notifications = getMock<Notification>(MOCK_NOTIFICATIONS_KEY);
    return notifications
      .filter(n => n.userId === userId)
      .slice(0, limit);
  },

  /** Get unread count */
  async getUnreadCount(userId: string): Promise<number> {
    const notifications = getMock<Notification>(MOCK_NOTIFICATIONS_KEY);
    return notifications.filter(n => n.userId === userId && !n.isRead).length;
  },

  /** Mark notification as read */
  async markAsRead(notificationId: string): Promise<void> {
    const notifications = getMock<Notification>(MOCK_NOTIFICATIONS_KEY);
    const notif = notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.isRead = true;
      setMock(MOCK_NOTIFICATIONS_KEY, notifications);
    }
  },

  /** Mark all as read for a user */
  async markAllAsRead(userId: string): Promise<void> {
    const notifications = getMock<Notification>(MOCK_NOTIFICATIONS_KEY);
    notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    setMock(MOCK_NOTIFICATIONS_KEY, notifications);
  },

  /** Send notification to all admins */
  async notifyAdmins(type: NotificationType, title: string, message: string, data?: Record<string, any>): Promise<void> {
    // In mock mode, send to admin-id-123
    await this.sendNotification('admin-id-123', type, title, message, data);
  },

  /** Send panic alert notification */
  async sendPanicNotification(courierName: string, data: Record<string, any>): Promise<void> {
    await this.notifyAdmins(
      'panic_alert',
      'DARURAT: Panic Button',
      `${courierName} menekan tombol darurat!`,
      data
    );
  },

  /** Send order completion reminder */
  async sendOrderReminder(courierId: string, orderNumber: string): Promise<void> {
    await this.sendNotification(
      courierId,
      'order_late',
      'Order Belum Selesai',
      `Order ${orderNumber} belum ditandai selesai. Segera update status.`
    );
    await this.notifyAdmins(
      'order_late',
      'Kurir Belum Menyelesaikan Order',
      `Order ${orderNumber} belum diselesaikan oleh kurir.`
    );
  },
};
