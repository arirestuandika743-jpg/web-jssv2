'use client';

import type { Order, OrderBroadcast, BroadcastResponse, Driver } from '@/types';

const MOCK_BROADCASTS_KEY = 'jss_order_broadcasts';
const MOCK_PENDING_BROADCAST_KEY = 'jss_pending_broadcast';
const MOCK_DRIVERS_KEY = 'jss_mock_drivers';

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

export interface PendingBroadcast {
  orderId: string;
  order: Order;
  currentCourierIndex: number;
  courierQueue: string[];
  startedAt: string;
  currentBroadcastId: string;
  timeoutAt: string;
}

export const broadcastService = {
  /** Start broadcasting an order to couriers */
  async startBroadcast(order: Order): Promise<PendingBroadcast | null> {
    // Get available couriers sorted by distance (mock: by rating)
    const drivers = getMock<Driver>(MOCK_DRIVERS_KEY);
    const availableCouriers = drivers
      .filter(d => d.isActive && (d.status === 'online'))
      .sort((a, b) => b.rating - a.rating);

    if (availableCouriers.length === 0) return null;

    const courierQueue = availableCouriers.map(d => d.id);
    const broadcastId = genId();

    // Create first broadcast entry
    const broadcast: OrderBroadcast = {
      id: broadcastId,
      orderId: order.id,
      courierId: courierQueue[0],
      courierName: availableCouriers[0].name,
      response: 'timeout', // Will be updated when courier responds
      createdAt: new Date().toISOString(),
    };

    const broadcasts = getMock<OrderBroadcast>(MOCK_BROADCASTS_KEY);
    broadcasts.push(broadcast);
    setMock(MOCK_BROADCASTS_KEY, broadcasts);

    const pending: PendingBroadcast = {
      orderId: order.id,
      order,
      currentCourierIndex: 0,
      courierQueue,
      startedAt: new Date().toISOString(),
      currentBroadcastId: broadcastId,
      timeoutAt: new Date(Date.now() + 20000).toISOString(),
    };

    // Store pending broadcast
    const pendingList = getMock<PendingBroadcast>(MOCK_PENDING_BROADCAST_KEY);
    const existingIdx = pendingList.findIndex(p => p.orderId === order.id);
    if (existingIdx !== -1) {
      pendingList[existingIdx] = pending;
    } else {
      pendingList.push(pending);
    }
    setMock(MOCK_PENDING_BROADCAST_KEY, pendingList);

    return pending;
  },

  /** Courier accepts the broadcast */
  async acceptBroadcast(orderId: string, courierId: string): Promise<boolean> {
    const broadcasts = getMock<OrderBroadcast>(MOCK_BROADCASTS_KEY);
    const broadcast = broadcasts.find(b => b.orderId === orderId && b.courierId === courierId);
    if (broadcast) {
      broadcast.response = 'accepted';
      broadcast.respondedAt = new Date().toISOString();
      setMock(MOCK_BROADCASTS_KEY, broadcasts);
    }

    // Remove from pending
    const pendingList = getMock<PendingBroadcast>(MOCK_PENDING_BROADCAST_KEY);
    const filtered = pendingList.filter(p => p.orderId !== orderId);
    setMock(MOCK_PENDING_BROADCAST_KEY, filtered);

    return true;
  },

  /** Courier rejects the broadcast */
  async rejectBroadcast(orderId: string, courierId: string): Promise<PendingBroadcast | null> {
    const broadcasts = getMock<OrderBroadcast>(MOCK_BROADCASTS_KEY);
    const broadcast = broadcasts.find(b => b.orderId === orderId && b.courierId === courierId);
    if (broadcast) {
      broadcast.response = 'rejected';
      broadcast.respondedAt = new Date().toISOString();
      setMock(MOCK_BROADCASTS_KEY, broadcasts);
    }

    // Move to next courier
    return this.moveToNextCourier(orderId);
  },

  /** Handle timeout - move to next courier */
  async handleTimeout(orderId: string): Promise<PendingBroadcast | null> {
    return this.moveToNextCourier(orderId);
  },

  /** Move to next courier in queue */
  async moveToNextCourier(orderId: string): Promise<PendingBroadcast | null> {
    const pendingList = getMock<PendingBroadcast>(MOCK_PENDING_BROADCAST_KEY);
    const pending = pendingList.find(p => p.orderId === orderId);
    if (!pending) return null;

    const nextIndex = pending.currentCourierIndex + 1;
    if (nextIndex >= pending.courierQueue.length) {
      // No more couriers available
      const filtered = pendingList.filter(p => p.orderId !== orderId);
      setMock(MOCK_PENDING_BROADCAST_KEY, filtered);
      return null;
    }

    // Get next courier info
    const drivers = getMock<Driver>(MOCK_DRIVERS_KEY);
    const nextCourier = drivers.find(d => d.id === pending.courierQueue[nextIndex]);
    if (!nextCourier) return null;

    const broadcastId = genId();

    // Create new broadcast entry
    const newBroadcast: OrderBroadcast = {
      id: broadcastId,
      orderId,
      courierId: nextCourier.id,
      courierName: nextCourier.name,
      response: 'timeout',
      createdAt: new Date().toISOString(),
    };

    const broadcasts = getMock<OrderBroadcast>(MOCK_BROADCASTS_KEY);
    broadcasts.push(newBroadcast);
    setMock(MOCK_BROADCASTS_KEY, broadcasts);

    // Update pending
    pending.currentCourierIndex = nextIndex;
    pending.currentBroadcastId = broadcastId;
    pending.timeoutAt = new Date(Date.now() + 20000).toISOString();
    setMock(MOCK_PENDING_BROADCAST_KEY, pendingList);

    return pending;
  },

  /** Get broadcast log for an order (admin view) */
  async getBroadcastLog(orderId: string): Promise<OrderBroadcast[]> {
    const broadcasts = getMock<OrderBroadcast>(MOCK_BROADCASTS_KEY);
    return broadcasts.filter(b => b.orderId === orderId);
  },

  /** Get pending broadcast for a courier */
  async getPendingBroadcastForCourier(courierId: string): Promise<{ order: Order; broadcastId: string; timeoutAt: string } | null> {
    const pendingList = getMock<PendingBroadcast>(MOCK_PENDING_BROADCAST_KEY);
    const pending = pendingList.find(p => p.courierQueue[p.currentCourierIndex] === courierId);
    if (!pending) return null;

    return {
      order: pending.order,
      broadcastId: pending.currentBroadcastId,
      timeoutAt: pending.timeoutAt,
    };
  },

  /** Get all broadcast logs (admin overview) */
  async getAllBroadcastLogs(): Promise<OrderBroadcast[]> {
    return getMock<OrderBroadcast>(MOCK_BROADCASTS_KEY);
  },
};
