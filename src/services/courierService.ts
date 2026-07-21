'use client';

import { createClient } from '@/lib/supabase';
import { isSupabaseEnabled } from './auth';
import { getApiUrl } from './db';
import { notificationService } from './notificationService';
import type {
  Driver, Order, CourierStatus, CourierShift, CourierOrderStatus,
  OrderProof, OrderOTP, PanicAlert, CourierLocation, ActivityLog,
  ActivityAction, LatLng, CourierPenalty, DailyTarget, CourierIncentive,
  LeaderboardEntry, CourierBadge, FraudCheckResult, DepositRequest, DepositStatus
} from '@/types';

const supabase = isSupabaseEnabled ? createClient() : null;

// Mock storage keys
const MOCK_SHIFTS_KEY = 'jss_courier_shifts';
const MOCK_COURIER_STATUS_KEY = 'jss_courier_status';
const MOCK_ORDER_STATUS_KEY = 'jss_order_courier_status';
const MOCK_PROOFS_KEY = 'jss_order_proofs';
const MOCK_OTPS_KEY = 'jss_order_otps';
const MOCK_PANIC_KEY = 'jss_panic_alerts';
const MOCK_LOCATIONS_KEY = 'jss_courier_locations';
const MOCK_ACTIVITY_KEY = 'jss_activity_logs';
const MOCK_PENALTIES_KEY = 'jss_penalties';
const MOCK_TARGETS_KEY = 'jss_daily_targets';
const MOCK_INCENTIVES_KEY = 'jss_incentives';
const MOCK_DRIVERS_KEY = 'jss_mock_drivers';

// Helper to get/set mock data
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

// Default daily target
const DEFAULT_TARGET: DailyTarget = {
  id: 'target-default',
  targetOrders: 10,
  bonusAmount: 20000,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/** Commission deducted per completed order */
export const COMMISSION_FEE = 2000;
export const ADMIN_DANA_NUMBER = '088286557710';

async function compressBase64Image(base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
  if (typeof window === 'undefined' || !base64Str || !base64Str.startsWith('data:image')) return base64Str;
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
}

export const courierService = {
  // ============================================
  // DEPOSIT & COMMISSION SYSTEM
  // ============================================

  /** Check if courier has sufficient balance to accept order (Min Rp 2.000) */
  async canAcceptOrder(courierId: string): Promise<{ allowed: boolean; reason?: string; currentBalance: number }> {
    const stats = await this.getCourierStats(courierId);
    if (stats.balance < COMMISSION_FEE) {
      return {
        allowed: false,
        reason: `Saldo deposit Anda (${stats.balance.toLocaleString('id-ID')}) kurang dari komisi min. Rp 2.000. Silakan Top Up Deposit ke DANA Admin (${ADMIN_DANA_NUMBER}).`,
        currentBalance: stats.balance,
      };
    }
    return { allowed: true, currentBalance: stats.balance };
  },

  /** Create a new deposit request (Pending Verification - DOES NOT ALTER BALANCE) */
  async createDepositRequest(
    courierId: string,
    courierName: string,
    courierPhone: string,
    amount: number,
    proofUrl: string
  ): Promise<DepositRequest> {
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    const referenceNumber = `DEP-${dateCode}-${randomCode}`;

    // Compress mobile camera photo / screenshot to fit Vercel 4MB payload limit
    const compressedProof = await compressBase64Image(proofUrl, 800, 800, 0.7);

    const request: DepositRequest = {
      id: genId(),
      referenceNumber,
      courierId,
      courierName,
      courierPhone,
      amount,
      proofUrl: compressedProof,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const requests = getMock<DepositRequest>('jss_deposit_requests');
    requests.unshift(request);
    setMock('jss_deposit_requests', requests);

    // Sync with Server API Route (/api/deposits) across all domain origins and HP devices
    try {
      await fetch(getApiUrl('/api/deposits'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deposit: request }),
      });
    } catch (e) {
      console.warn('API deposit sync error:', e);
    }

    // Log activity
    await this.logActivity(
      courierId,
      'login',
      `Mengajukan Top Up Deposit Rp ${amount.toLocaleString('id-ID')} (Ref: ${referenceNumber}). Status: Menunggu Verifikasi Admin.`
    );

    // Send notification to admin
    await notificationService.notifyAdmins(
      'order_new',
      'Pengajuan Deposit Baru',
      `${courierName} mengajukan deposit sebesar Rp ${amount.toLocaleString('id-ID')} (Ref: ${referenceNumber})`,
      { requestId: request.id, amount, courierId }
    );

    return request;
  },

  /** Get all deposit requests (for Admin view - multi-device sync) */
  async getDepositRequests(filterStatus?: DepositStatus): Promise<DepositRequest[]> {
    let requests = getMock<DepositRequest>('jss_deposit_requests');

    try {
      const res = await fetch(getApiUrl('/api/deposits'));
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.deposits)) {
          const serverDeps: DepositRequest[] = json.deposits;
          const map = new Map<string, DepositRequest>();
          serverDeps.forEach(d => map.set(d.id, d));
          requests.forEach(d => { if (!map.has(d.id)) map.set(d.id, d); });
          requests = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setMock('jss_deposit_requests', requests);
        }
      }
    } catch (e) {
      // Ignore API error, fallback to mock
    }

    if (filterStatus) {
      return requests.filter(r => r.status === filterStatus);
    }
    return requests;
  },

  /** Get deposit requests for a specific courier */
  async getCourierDepositRequests(courierId: string): Promise<DepositRequest[]> {
    const requests = await this.getDepositRequests();
    return requests.filter(r => r.courierId === courierId);
  },

  /** Admin approves deposit request - ONLY HERE DOES BALANCE INCREASE */
  async approveDepositRequest(requestId: string, adminId: string, adminName: string): Promise<boolean> {
    const requests = getMock<DepositRequest>('jss_deposit_requests');
    const req = requests.find(r => r.id === requestId);

    try {
      await fetch(getApiUrl('/api/deposits'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', requestId, adminId, adminName }),
      });
    } catch (e) {}

    if (req && req.status === 'pending') {
      req.status = 'approved';
      req.verifiedAt = new Date().toISOString();
      req.verifiedBy = adminName;
      setMock('jss_deposit_requests', requests);

      // Add to courier balance
      const drivers = getMock<Driver>(MOCK_DRIVERS_KEY);
      const driverIdx = drivers.findIndex(d => d.id === req.courierId);
      let newBalance = req.amount;

      if (driverIdx !== -1) {
        const current = drivers[driverIdx].balance || 0;
        newBalance = current + req.amount;
        drivers[driverIdx].balance = newBalance;
        setMock(MOCK_DRIVERS_KEY, drivers);
      } else {
        drivers.push({
          id: req.courierId,
          name: req.courierName,
          phone: req.courierPhone || '081234567890',
          vehicleType: 'motorcycle',
          vehiclePlate: 'BE 1234 XX',
          isActive: true,
          rating: 5.0,
          totalDeliveries: 0,
          balance: req.amount,
          status: 'online',
        });
        setMock(MOCK_DRIVERS_KEY, drivers);
      }

      await this.logActivity(
        req.courierId,
        'login',
        `Top Up Deposit Rp ${req.amount.toLocaleString('id-ID')} (Ref: ${req.referenceNumber}) DISETUJUI oleh Admin ${adminName}. Saldo baru: Rp ${newBalance.toLocaleString('id-ID')}`
      );

      await notificationService.sendNotification(
        req.courierId,
        'bonus_earned',
        'Deposit Disetujui! 🎉',
        `Pengajuan deposit Rp ${req.amount.toLocaleString('id-ID')} (Ref: ${req.referenceNumber}) telah disetujui. Saldo Anda sekarang: Rp ${newBalance.toLocaleString('id-ID')}`
      );

      return true;
    }

    return false;
  },

  /** Admin rejects deposit request - Balance remains unchanged */
  async rejectDepositRequest(requestId: string, adminId: string, adminName: string, reason: string): Promise<boolean> {
    const requests = getMock<DepositRequest>('jss_deposit_requests');
    const req = requests.find(r => r.id === requestId);

    try {
      await fetch(getApiUrl('/api/deposits'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', requestId, adminId, adminName, reason }),
      });
    } catch (e) {}

    if (req && req.status === 'pending') {
      req.status = 'rejected';
      req.rejectionReason = reason;
      req.verifiedAt = new Date().toISOString();
      req.verifiedBy = adminName;
      setMock('jss_deposit_requests', requests);

      await this.logActivity(
        req.courierId,
        'login',
        `Top Up Deposit Rp ${req.amount.toLocaleString('id-ID')} (Ref: ${req.referenceNumber}) DITOLAK oleh Admin ${adminName}. Alasan: ${reason}`
      );

      await notificationService.sendNotification(
        req.courierId,
        'penalty_warning',
        'Deposit Ditolak ❌',
        `Pengajuan deposit Rp ${req.amount.toLocaleString('id-ID')} (Ref: ${req.referenceNumber}) ditolak. Alasan: ${reason}`
      );

      return true;
    }

    return false;
  },

  /** Deduct Rp 2.000 commission when order is completed */
  async deductCommission(courierId: string, orderId: string, orderNumber: string): Promise<boolean> {
    const drivers = getMock<Driver>(MOCK_DRIVERS_KEY);
    const driverIdx = drivers.findIndex(d => d.id === courierId);
    if (driverIdx !== -1) {
      const current = drivers[driverIdx].balance || 0;
      drivers[driverIdx].balance = Math.max(0, current - COMMISSION_FEE);
      setMock(MOCK_DRIVERS_KEY, drivers);
    }

    // Log activity
    await this.logActivity(
      courierId,
      'order_complete',
      `Potongan komisi Rp 2.000 untuk order #${orderNumber} dialokasikan ke DANA Admin (${ADMIN_DANA_NUMBER})`
    );

    return true;
  },
  // ============================================
  // SHIFT MANAGEMENT
  // ============================================

  /** Start a work shift */
  async startShift(courierId: string, location?: LatLng): Promise<CourierShift> {
    const shift: CourierShift = {
      id: genId(),
      courierId,
      startTime: new Date().toISOString(),
      startLocation: location,
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'Unknown',
      ipAddress: 'local',
      isActive: true,
    };

    const shifts = getMock<CourierShift>(MOCK_SHIFTS_KEY);
    shifts.push(shift);
    setMock(MOCK_SHIFTS_KEY, shifts);

    // Update courier status to online
    await this.updateCourierStatus(courierId, 'online');

    // Log activity
    await this.logActivity(courierId, 'shift_start', 'Memulai shift kerja', { location });

    return shift;
  },

  /** End work shift */
  async endShift(courierId: string, location?: LatLng): Promise<boolean> {
    const shifts = getMock<CourierShift>(MOCK_SHIFTS_KEY);
    const activeShift = shifts.find(s => s.courierId === courierId && s.isActive);
    if (activeShift) {
      activeShift.endTime = new Date().toISOString();
      activeShift.endLocation = location;
      activeShift.isActive = false;
      setMock(MOCK_SHIFTS_KEY, shifts);
    }

    await this.updateCourierStatus(courierId, 'offline');
    await this.logActivity(courierId, 'shift_end', 'Mengakhiri shift kerja', { location });

    return true;
  },

  /** Get active shift for a courier */
  async getActiveShift(courierId: string): Promise<CourierShift | null> {
    const shifts = getMock<CourierShift>(MOCK_SHIFTS_KEY);
    return shifts.find(s => s.courierId === courierId && s.isActive) || null;
  },

  /** Check if courier has started shift */
  async isShiftActive(courierId: string): Promise<boolean> {
    const shift = await this.getActiveShift(courierId);
    return !!shift;
  },

  // ============================================
  // COURIER STATUS
  // ============================================

  /** Update courier status */
  async updateCourierStatus(courierId: string, status: CourierStatus): Promise<boolean> {
    const statuses = getMock<{ id: string; status: CourierStatus; updatedAt: string }>(MOCK_COURIER_STATUS_KEY);
    const existing = statuses.find(s => s.id === courierId);
    if (existing) {
      existing.status = status;
      existing.updatedAt = new Date().toISOString();
    } else {
      statuses.push({ id: courierId, status, updatedAt: new Date().toISOString() });
    }
    setMock(MOCK_COURIER_STATUS_KEY, statuses);

    // Also update the driver record
    this.updateDriverField(courierId, { status, lastActiveAt: new Date().toISOString() });

    return true;
  },

  /** Get courier status */
  async getCourierStatus(courierId: string): Promise<CourierStatus> {
    const statuses = getMock<{ id: string; status: CourierStatus }>(MOCK_COURIER_STATUS_KEY);
    const found = statuses.find(s => s.id === courierId);
    return found?.status || 'offline';
  },

  // ============================================
  // ORDER STATUS FLOW
  // ============================================

  /** Update order courier status (step by step) */
  async updateOrderCourierStatus(orderId: string, status: CourierOrderStatus, location?: LatLng): Promise<boolean> {
    const statusMap: Record<string, { id: string; status: CourierOrderStatus; location?: LatLng; timestamp: string }[]> = 
      JSON.parse(typeof window !== 'undefined' ? localStorage.getItem(MOCK_ORDER_STATUS_KEY) || '{}' : '{}');
    
    if (!statusMap[orderId]) statusMap[orderId] = [];
    statusMap[orderId].push({ id: genId(), status, location, timestamp: new Date().toISOString() });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(MOCK_ORDER_STATUS_KEY, JSON.stringify(statusMap));
    }

    // Map courier status to order status for the main orders table
    const orderStatusMap: Record<CourierOrderStatus, string> = {
      'accepted': 'accepted',
      'heading_to_pickup': 'driver_going',
      'item_picked_up': 'shopping',
      'delivering': 'delivering',
      'completed': 'completed',
    };

    // Update main order status in mock storage
    const ordersKey = 'jss_mock_orders_v4';
    const orders = getMock<Order>(ordersKey);
    const orderIdx = orders.findIndex(o => o.id === orderId);
    if (orderIdx !== -1) {
      const mappedStatus = orderStatusMap[status];
      if (mappedStatus) {
        (orders[orderIdx] as any).status = mappedStatus;
        orders[orderIdx].updatedAt = new Date().toISOString();
        if (status === 'completed') {
          orders[orderIdx].completedAt = new Date().toISOString();
        }
      }
      setMock(ordersKey, orders);
    }

    return true;
  },

  /** Get order courier status history */
  async getOrderStatusHistory(orderId: string): Promise<{ status: CourierOrderStatus; timestamp: string }[]> {
    const statusMap = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem(MOCK_ORDER_STATUS_KEY) || '{}' : '{}');
    return statusMap[orderId] || [];
  },

  // ============================================
  // PROOF PHOTO
  // ============================================

  /** Upload proof photo */
  async uploadProof(orderId: string, photoUrl: string, type: 'item' | 'customer_receipt' = 'item'): Promise<OrderProof> {
    const proof: OrderProof = {
      id: genId(),
      orderId,
      photoUrl,
      type,
      uploadedAt: new Date().toISOString(),
    };

    const proofs = getMock<OrderProof>(MOCK_PROOFS_KEY);
    proofs.push(proof);
    setMock(MOCK_PROOFS_KEY, proofs);

    // Update order
    const ordersKey = 'jss_mock_orders_v4';
    const orders = getMock<Order>(ordersKey);
    const orderIdx = orders.findIndex(o => o.id === orderId);
    if (orderIdx !== -1) {
      orders[orderIdx].proofPhotoUrl = photoUrl;
      setMock(ordersKey, orders);
    }

    return proof;
  },

  /** Get proofs for an order */
  async getOrderProofs(orderId: string): Promise<OrderProof[]> {
    const proofs = getMock<OrderProof>(MOCK_PROOFS_KEY);
    return proofs.filter(p => p.orderId === orderId);
  },

  // ============================================
  // OTP VERIFICATION
  // ============================================

  /** Generate OTP for order completion */
  async generateOTP(orderId: string): Promise<string> {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const otp: OrderOTP = {
      id: genId(),
      orderId,
      code,
      verified: false,
      createdAt: new Date().toISOString(),
    };

    const otps = getMock<OrderOTP>(MOCK_OTPS_KEY);
    // Remove old OTPs for this order
    const filtered = otps.filter(o => o.orderId !== orderId);
    filtered.push(otp);
    setMock(MOCK_OTPS_KEY, filtered);

    // Store OTP on order
    const ordersKey = 'jss_mock_orders_v4';
    const orders = getMock<Order>(ordersKey);
    const orderIdx = orders.findIndex(o => o.id === orderId);
    if (orderIdx !== -1) {
      orders[orderIdx].otpCode = code;
      orders[orderIdx].otpVerified = false;
      setMock(ordersKey, orders);
    }

    return code;
  },

  /** Verify OTP */
  async verifyOTP(orderId: string, inputCode: string): Promise<boolean> {
    const otps = getMock<OrderOTP>(MOCK_OTPS_KEY);
    const otp = otps.find(o => o.orderId === orderId && !o.verified);
    
    if (!otp || otp.code !== inputCode) return false;

    otp.verified = true;
    otp.verifiedAt = new Date().toISOString();
    setMock(MOCK_OTPS_KEY, otps);

    // Update order
    const ordersKey = 'jss_mock_orders_v4';
    const orders = getMock<Order>(ordersKey);
    const orderIdx = orders.findIndex(o => o.id === orderId);
    if (orderIdx !== -1) {
      orders[orderIdx].otpVerified = true;
      setMock(ordersKey, orders);
    }

    return true;
  },

  /** Get OTP for order (customer view) */
  async getOTP(orderId: string): Promise<string | null> {
    const otps = getMock<OrderOTP>(MOCK_OTPS_KEY);
    const otp = otps.find(o => o.orderId === orderId && !o.verified);
    return otp?.code || null;
  },

  // ============================================
  // PANIC BUTTON
  // ============================================

  /** Trigger panic alert */
  async triggerPanic(courierId: string, courierName: string, location: LatLng, orderId?: string): Promise<PanicAlert> {
    const alert: PanicAlert = {
      id: genId(),
      courierId,
      courierName,
      location,
      orderId,
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    const alerts = getMock<PanicAlert>(MOCK_PANIC_KEY);
    alerts.unshift(alert);
    setMock(MOCK_PANIC_KEY, alerts);

    await this.logActivity(courierId, 'panic_trigger', `PANIC BUTTON ditekan oleh ${courierName}`, { location, orderId });

    return alert;
  },

  /** Get active panic alerts */
  async getActivePanicAlerts(): Promise<PanicAlert[]> {
    const alerts = getMock<PanicAlert>(MOCK_PANIC_KEY);
    return alerts.filter(a => !a.resolved);
  },

  /** Resolve panic alert */
  async resolvePanic(alertId: string, resolvedBy: string): Promise<boolean> {
    const alerts = getMock<PanicAlert>(MOCK_PANIC_KEY);
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return false;
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = resolvedBy;
    setMock(MOCK_PANIC_KEY, alerts);
    return true;
  },

  // ============================================
  // GPS LOCATION
  // ============================================

  /** Update courier location */
  async updateLocation(courierId: string, location: LatLng, extras?: { speed?: number; heading?: number; accuracy?: number; batteryLevel?: number }): Promise<void> {
    const loc: CourierLocation = {
      id: genId(),
      courierId,
      location,
      speed: extras?.speed,
      heading: extras?.heading,
      accuracy: extras?.accuracy,
      batteryLevel: extras?.batteryLevel,
      timestamp: new Date().toISOString(),
    };

    const locations = getMock<CourierLocation>(MOCK_LOCATIONS_KEY);
    // Keep only last 100 locations per courier
    const otherLocs = locations.filter(l => l.courierId !== courierId);
    const courierLocs = locations.filter(l => l.courierId === courierId).slice(-99);
    courierLocs.push(loc);
    setMock(MOCK_LOCATIONS_KEY, [...otherLocs, ...courierLocs]);

    // Update driver record
    this.updateDriverField(courierId, { 
      currentLocation: location, 
      currentSpeed: extras?.speed,
      batteryLevel: extras?.batteryLevel,
      lastActiveAt: new Date().toISOString() 
    });
  },

  /** Get courier location history */
  async getLocationHistory(courierId: string, limit: number = 50): Promise<CourierLocation[]> {
    const locations = getMock<CourierLocation>(MOCK_LOCATIONS_KEY);
    return locations.filter(l => l.courierId === courierId).slice(-limit);
  },

  /** Get all active courier locations (for admin map) */
  async getAllCourierLocations(): Promise<(Driver & { location: LatLng })[]> {
    const driversRaw = getMock<Driver>(MOCK_DRIVERS_KEY);
    // Return all drivers that have a known location
    return driversRaw
      .filter(d => d.currentLocation)
      .map(d => ({ ...d, location: d.currentLocation! }));
  },

  // ============================================
  // ACTIVITY LOG
  // ============================================

  /** Log an activity */
  async logActivity(userId: string, action: ActivityAction, details: string, metadata?: Record<string, any>): Promise<void> {
    const log: ActivityLog = {
      id: genId(),
      userId,
      userName: '',
      userRole: 'driver',
      action,
      details,
      metadata,
      timestamp: new Date().toISOString(),
    };

    const logs = getMock<ActivityLog>(MOCK_ACTIVITY_KEY);
    logs.unshift(log);
    // Keep only last 500 logs
    setMock(MOCK_ACTIVITY_KEY, logs.slice(0, 500));
  },

  /** Get activity logs */
  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    const logs = getMock<ActivityLog>(MOCK_ACTIVITY_KEY);
    return logs.slice(0, limit);
  },

  // ============================================
  // PENALTIES
  // ============================================

  /** Add penalty points */
  async addPenalty(courierId: string, reason: string, points: number, orderId?: string): Promise<CourierPenalty> {
    const penalty: CourierPenalty = {
      id: genId(),
      courierId,
      reason,
      points,
      orderId,
      createdAt: new Date().toISOString(),
    };

    const penalties = getMock<CourierPenalty>(MOCK_PENALTIES_KEY);
    penalties.push(penalty);
    setMock(MOCK_PENALTIES_KEY, penalties);

    // Update driver penalty points
    const drivers = getMock<Driver>(MOCK_DRIVERS_KEY);
    const driverIdx = drivers.findIndex(d => d.id === courierId);
    if (driverIdx !== -1) {
      drivers[driverIdx].penaltyPoints = (drivers[driverIdx].penaltyPoints || 0) + points;
      // Auto-deactivate if threshold exceeded
      if ((drivers[driverIdx].penaltyPoints || 0) >= 10) {
        drivers[driverIdx].isActive = false;
      }
      setMock(MOCK_DRIVERS_KEY, drivers);
    }

    return penalty;
  },

  /** Get courier penalties */
  async getCourierPenalties(courierId: string): Promise<CourierPenalty[]> {
    const penalties = getMock<CourierPenalty>(MOCK_PENALTIES_KEY);
    return penalties.filter(p => p.courierId === courierId);
  },

  /** Get total penalty points */
  async getPenaltyPoints(courierId: string): Promise<number> {
    const penalties = getMock<CourierPenalty>(MOCK_PENALTIES_KEY);
    return penalties.filter(p => p.courierId === courierId).reduce((sum, p) => sum + p.points, 0);
  },

  // ============================================
  // DAILY TARGETS & INCENTIVES
  // ============================================

  /** Get active daily target */
  async getDailyTarget(): Promise<DailyTarget> {
    const targets = getMock<DailyTarget>(MOCK_TARGETS_KEY, [DEFAULT_TARGET]);
    return targets.find(t => t.isActive) || DEFAULT_TARGET;
  },

  /** Set daily target (admin) */
  async setDailyTarget(targetOrders: number, bonusAmount: number): Promise<DailyTarget> {
    const target: DailyTarget = {
      id: genId(),
      targetOrders,
      bonusAmount,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deactivate all previous targets
    const targets = getMock<DailyTarget>(MOCK_TARGETS_KEY);
    targets.forEach(t => t.isActive = false);
    targets.push(target);
    setMock(MOCK_TARGETS_KEY, targets);

    return target;
  },

  /** Get courier daily progress */
  async getDailyProgress(courierId: string): Promise<{ completed: number; target: number; bonusAmount: number }> {
    const target = await this.getDailyTarget();
    
    // Count today's completed orders for this courier
    const ordersKey = 'jss_mock_orders_v4';
    const orders = getMock<Order>(ordersKey);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCompleted = orders.filter(o => 
      o.driverId === courierId && 
      o.status === 'completed' && 
      new Date(o.updatedAt) >= today
    ).length;

    return {
      completed: todayCompleted,
      target: target.targetOrders,
      bonusAmount: target.bonusAmount,
    };
  },

  /** Check and award incentive */
  async checkAndAwardIncentive(courierId: string): Promise<CourierIncentive | null> {
    const progress = await this.getDailyProgress(courierId);
    if (progress.completed < progress.target) return null;

    // Check if already awarded today
    const incentives = getMock<CourierIncentive>(MOCK_INCENTIVES_KEY);
    const today = new Date().toISOString().split('T')[0];
    const existing = incentives.find(i => i.courierId === courierId && i.date === today);
    if (existing) return existing;

    const incentive: CourierIncentive = {
      id: genId(),
      courierId,
      targetId: 'target-default',
      amount: progress.bonusAmount,
      achieved: true,
      achievedAt: new Date().toISOString(),
      date: today,
    };

    incentives.push(incentive);
    setMock(MOCK_INCENTIVES_KEY, incentives);

    // Add to courier balance
    const drivers = getMock<Driver>(MOCK_DRIVERS_KEY);
    const driverIdx = drivers.findIndex(d => d.id === courierId);
    if (driverIdx !== -1) {
      drivers[driverIdx].balance = (drivers[driverIdx].balance || 0) + progress.bonusAmount;
      setMock(MOCK_DRIVERS_KEY, drivers);
    }

    return incentive;
  },

  // ============================================
  // LEADERBOARD
  // ============================================

  /** Get leaderboard */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const drivers = getMock<Driver>(MOCK_DRIVERS_KEY);
    const ordersKey = 'jss_mock_orders_v4';
    const orders = getMock<Order>(ordersKey);

    const entries: LeaderboardEntry[] = drivers.map(d => {
      const driverOrders = orders.filter(o => o.driverId === d.id);
      const completedOrders = driverOrders.filter(o => o.status === 'completed');
      const cancelledOrders = driverOrders.filter(o => o.status === 'cancelled');
      const totalEarnings = completedOrders.reduce((sum, o) => sum + o.deliveryFee, 0);
      const onTimeRate = completedOrders.length > 0 ? Math.min(100, 75 + Math.random() * 25) : 0;

      const badge = this.calculateBadge(completedOrders.length, d.rating);
      const score = (completedOrders.length * 10) + (d.rating * 20) + (onTimeRate * 0.5) - (cancelledOrders.length * 5);

      return {
        rank: 0,
        courierId: d.id,
        courierName: d.name,
        totalOrders: completedOrders.length,
        rating: d.rating,
        onTimeRate: Math.round(onTimeRate),
        totalEarnings,
        cancelCount: cancelledOrders.length,
        badge,
        score: Math.round(score),
      };
    });

    // Sort by score descending
    entries.sort((a, b) => b.score - a.score);
    entries.forEach((e, i) => e.rank = i + 1);

    return entries;
  },

  /** Calculate badge based on performance */
  calculateBadge(totalOrders: number, rating: number): CourierBadge {
    if (totalOrders >= 200 && rating >= 4.8) return 'platinum';
    if (totalOrders >= 100 && rating >= 4.5) return 'gold';
    if (totalOrders >= 50 && rating >= 4.0) return 'silver';
    return 'rookie';
  },

  // ============================================
  // COURIER STATS
  // ============================================

  /** Get courier dashboard stats */
  async getCourierStats(courierId: string): Promise<{
    todayOrders: number;
    todayEarnings: number;
    rating: number;
    balance: number;
    totalDeliveries: number;
    badge: CourierBadge;
  }> {
    const drivers = getMock<Driver>(MOCK_DRIVERS_KEY);
    const driver = drivers.find(d => d.id === courierId);
    
    const ordersKey = 'jss_mock_orders_v4';
    const orders = getMock<Order>(ordersKey);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(o => 
      o.driverId === courierId && 
      new Date(o.createdAt) >= today
    );
    
    const todayEarnings = todayOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.deliveryFee, 0);

    return {
      todayOrders: todayOrders.length,
      todayEarnings,
      rating: driver?.rating || 5.0,
      balance: driver?.balance || 0,
      totalDeliveries: driver?.totalDeliveries || 0,
      badge: this.calculateBadge(driver?.totalDeliveries || 0, driver?.rating || 5.0),
    };
  },

  /** Get courier's active order */
  async getActiveOrder(courierId: string): Promise<Order | null> {
    const ordersKey = 'jss_mock_orders_v4';
    const orders = getMock<Order>(ordersKey);
    return orders.find(o => 
      o.driverId === courierId && 
      !['completed', 'cancelled'].includes(o.status)
    ) || null;
  },

  /** Get courier order history */
  async getCourierOrders(courierId: string, filter?: 'day' | 'week' | 'month'): Promise<Order[]> {
    const ordersKey = 'jss_mock_orders_v4';
    const orders = getMock<Order>(ordersKey);
    let filtered = orders.filter(o => o.driverId === courierId);
    
    if (filter) {
      const now = new Date();
      let cutoff = new Date();
      if (filter === 'day') cutoff.setHours(0, 0, 0, 0);
      else if (filter === 'week') cutoff.setDate(now.getDate() - 7);
      else if (filter === 'month') cutoff.setMonth(now.getMonth() - 1);
      
      filtered = filtered.filter(o => new Date(o.createdAt) >= cutoff);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // ============================================
  // HELPER: Update driver fields
  // ============================================

  updateDriverField(courierId: string, updates: Partial<Driver>): void {
    const drivers = getMock<Driver>(MOCK_DRIVERS_KEY);
    const idx = drivers.findIndex(d => d.id === courierId);
    if (idx !== -1) {
      Object.assign(drivers[idx], updates);
      setMock(MOCK_DRIVERS_KEY, drivers);
    }
  },

  // ============================================
  // FRAUD DETECTION
  // ============================================

  /** Check for suspicious activity */
  async checkFraud(courierId: string): Promise<FraudCheckResult> {
    const drivers = getMock<Driver>(MOCK_DRIVERS_KEY);
    const driver = drivers.find(d => d.id === courierId);
    const orders = getMock<Order>('jss_mock_orders_v4');
    const courierOrders = orders.filter(o => o.driverId === courierId);

    const reasons: string[] = [];
    let fakeGPS = false;
    let tooFastCompletion = false;
    let noMovement = false;
    let frequentCancel = false;

    // Check frequent cancellations (>30% cancel rate)
    const cancelRate = courierOrders.length > 5 ? 
      courierOrders.filter(o => o.status === 'cancelled').length / courierOrders.length : 0;
    if (cancelRate > 0.3) {
      frequentCancel = true;
      reasons.push(`Cancel rate tinggi: ${Math.round(cancelRate * 100)}%`);
    }

    // Check total cancels
    if ((driver?.totalCancel || 0) > 10) {
      frequentCancel = true;
      reasons.push(`Total cancel: ${driver?.totalCancel}`);
    }

    const isSuspicious = reasons.length > 0;

    return {
      courierId,
      isSuspicious,
      reasons,
      checkTimestamp: new Date().toISOString(),
      fakeGPS,
      tooFastCompletion,
      noMovement,
      frequentCancel,
    };
  },
};
