'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { courierService } from '@/services/courierService';
import { broadcastService } from '@/services/broadcastService';
import { dbService } from '@/services/db';
import type { Order } from '@/types';

export default function CourierHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [shiftStarted, setShiftStarted] = useState(false);
  const [stats, setStats] = useState({ completedOrders: 0, earnings: 0, rating: 5.0, hoursWorked: 0 });
  const [pendingOrder, setPendingOrder] = useState<{ order: Order; broadcastId: string; timeoutAt: string } | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);

  const loadCourierData = useCallback(async (userId: string) => {
    try {
      const courierStats = await courierService.getCourierStats(userId);
      setStats({
        completedOrders: courierStats.totalDeliveries || 0,
        earnings: courierStats.todayEarnings || 0,
        rating: courierStats.rating || 5.0,
        hoursWorked: 0,
      });

      const status = await courierService.getCourierStatus(userId);
      setIsOnline(status === 'online' || status === 'delivering');
      setShiftStarted(status !== 'offline');

      // Check for pending broadcast
      const broadcast = await broadcastService.getPendingBroadcastForCourier(userId);
      setPendingOrder(broadcast);

      // Check for active order
      const activeOrd = await courierService.getActiveOrder(userId);
      setActiveOrder(activeOrd);
    } catch (e) {
      console.warn('Failed to load courier data:', e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || (currentUser.role !== 'runner' && currentUser.role !== 'driver')) {
        router.push('/m/courier/login');
        return;
      }
      setUser(currentUser);
      await loadCourierData(currentUser.id);
      setLoading(false);
    };
    init();

    // Refresh every 10 seconds for order broadcasts
    const interval = setInterval(() => {
      if (user?.id) loadCourierData(user.id);
    }, 10000);

    return () => clearInterval(interval);
  }, [router, loadCourierData, user?.id]);

  const handleStartShift = async () => {
    if (!user) return;
    try {
      await courierService.startShift(user.id);
      setIsOnline(true);
      setShiftStarted(true);
    } catch (e) {
      console.error('Failed to start shift:', e);
    }
  };

  const handleEndShift = async () => {
    if (!user) return;
    try {
      await courierService.endShift(user.id);
      setIsOnline(false);
      setShiftStarted(false);
    } catch (e) {
      console.error('Failed to end shift:', e);
    }
  };

  const handleAcceptOrder = async () => {
    if (!user || !pendingOrder) return;
    try {
      await broadcastService.acceptBroadcast(pendingOrder.order.id, user.id);
      await dbService.assignDriver(pendingOrder.order.id, user.id);
      setPendingOrder(null);
      await loadCourierData(user.id);
    } catch (e) {
      console.error('Failed to accept order:', e);
    }
  };

  const handleRejectOrder = async () => {
    if (!user || !pendingOrder) return;
    try {
      await broadcastService.rejectBroadcast(pendingOrder.order.id, user.id);
      setPendingOrder(null);
    } catch (e) {
      console.error('Failed to reject order:', e);
    }
  };

  const handlePanic = async () => {
    if (!user) return;
    setShowPanicConfirm(false);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          await courierService.triggerPanic(
            user.id,
            user.name,
            { lat: pos.coords.latitude, lng: pos.coords.longitude },
            activeOrder?.id
          );
          alert('🚨 Alert terkirim ke Admin JSS');
        });
      }
    } catch (e) {
      console.error('Panic alert failed:', e);
    }
  };

  const formatPrice = (p: number) => `Rp${p.toLocaleString('id-ID')}`;

  if (loading) {
    return (
      <div className="jss-loading" style={{ minHeight: '100dvh' }}>
        <div className="jss-spinner" />
        <p className="jss-loading-text">Memuat Dashboard Kurir...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Order Broadcast Alert */}
      {pendingOrder && (
        <div className="jss-broadcast-alert">
          <div className="jss-broadcast-card">
            <div className="jss-broadcast-header">
              <div className="jss-broadcast-alert-icon">
                <span style={{ fontSize: 16 }}>🚨</span>
              </div>
              <div className="jss-broadcast-title">PESANAN BARU</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', width: 70 }}>Layanan:</span>
                <span style={{ fontWeight: 600 }}>{pendingOrder.order.category}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', width: 70 }}>Pickup:</span>
                <span>{pendingOrder.order.pickupAddress}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', width: 70 }}>Tujuan:</span>
                <span>{pendingOrder.order.destinationAddress}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', width: 70 }}>Jarak:</span>
                <span>{(pendingOrder.order.distance / 1000).toFixed(1)} km</span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', width: 70 }}>Harga:</span>
                <span style={{ color: '#FFD700', fontWeight: 700 }}>{formatPrice(pendingOrder.order.grandTotal)}</span>
              </div>
            </div>

            <div className="jss-broadcast-actions">
              <button className="jss-btn jss-btn-primary jss-btn-block" onClick={handleAcceptOrder}>
                TERIMA
              </button>
              <button className="jss-btn jss-btn-outline jss-btn-block" onClick={handleRejectOrder}>
                TOLAK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '16px 0 20px' }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
          Selamat Datang, {user?.name?.split(' ')[0]} 🛵
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span className={`jss-courier-status ${isOnline ? 'jss-courier-online' : 'jss-courier-offline'}`}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="jss-courier-stats">
        <div className="jss-stat-card">
          <div className="jss-stat-value">{stats.completedOrders}</div>
          <div className="jss-stat-label">Pesanan Selesai</div>
        </div>
        <div className="jss-stat-card">
          <div className="jss-stat-value">{formatPrice(stats.earnings)}</div>
          <div className="jss-stat-label">Pendapatan</div>
        </div>
        <div className="jss-stat-card">
          <div className="jss-stat-value">⭐ {stats.rating.toFixed(1)}</div>
          <div className="jss-stat-label">Rating</div>
        </div>
        <div className="jss-stat-card">
          <div className="jss-stat-value">{stats.hoursWorked}j</div>
          <div className="jss-stat-label">Jam Kerja</div>
        </div>
      </div>

      {/* Shift Controls */}
      <div style={{ display: 'flex', gap: 12, margin: '20px 0' }}>
        {!shiftStarted ? (
          <button className="jss-btn jss-btn-success jss-btn-block jss-btn-lg" onClick={handleStartShift}>
            ▶️ MULAI KERJA
          </button>
        ) : (
          <button className="jss-btn jss-btn-danger jss-btn-block jss-btn-lg" onClick={handleEndShift}>
            ⏹️ SELESAI KERJA
          </button>
        )}
      </div>

      {/* Active Order */}
      {activeOrder && (
        <div className="jss-card jss-card-yellow" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="jss-badge jss-badge-green">Pesanan Aktif</span>
            <span className="jss-order-id">#{activeOrder.orderNumber}</span>
          </div>

          <div className="jss-order-route">
            <div className="jss-order-point">
              <div className="jss-order-dot jss-order-dot-pickup" />
              <span style={{ fontSize: 13 }}>{activeOrder.pickupAddress}</span>
            </div>
            <div className="jss-order-point">
              <div className="jss-order-dot jss-order-dot-dest" />
              <span style={{ fontSize: 13 }}>{activeOrder.destinationAddress}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              {activeOrder.customerName}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#FFD700' }}>
              {formatPrice(activeOrder.grandTotal)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="jss-btn jss-btn-outline jss-btn-sm"
              onClick={() => window.open(`https://wa.me/${activeOrder.whatsappNumber?.replace(/^0/, '62')}`, '_blank')}
              style={{ flex: 1 }}
            >
              💬 Hubungi
            </button>
            <button
              className="jss-btn jss-btn-outline jss-btn-sm"
              onClick={() => {
                const lat = activeOrder.pickupCoordinates?.lat || activeOrder.destinationCoordinates?.lat;
                const lng = activeOrder.pickupCoordinates?.lng || activeOrder.destinationCoordinates?.lng;
                if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
              }}
              style={{ flex: 1 }}
            >
              🗺️ Lokasi
            </button>
            <button
              className="jss-btn jss-btn-primary jss-btn-sm"
              onClick={() => router.push(`/m/courier/orders/${activeOrder.id}`)}
              style={{ flex: 1 }}
            >
              Detail
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Admin */}
      <button
        className="jss-btn jss-btn-outline jss-btn-block"
        onClick={() => window.open('https://wa.me/62882020705153', '_blank')}
        style={{ marginBottom: 12 }}
      >
        💬 Chat Admin via WhatsApp
      </button>

      {/* Panic Button */}
      {shiftStarted && (
        <>
          <button
            className="jss-panic-btn"
            onClick={() => setShowPanicConfirm(true)}
          >
            🚨 PANIC BUTTON
          </button>

          {/* Panic Confirmation */}
          {showPanicConfirm && (
            <div className="jss-broadcast-alert">
              <div className="jss-broadcast-card" style={{ borderColor: '#EF4444' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#EF4444', margin: '0 0 12px' }}>
                  🚨 Kirim Alert Darurat?
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px' }}>
                  Ini akan mengirim lokasi dan informasi Anda ke Admin JSS. Gunakan hanya dalam keadaan darurat.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="jss-btn jss-btn-danger jss-btn-block" onClick={handlePanic}>
                    YA, KIRIM ALERT
                  </button>
                  <button className="jss-btn jss-btn-outline jss-btn-block" onClick={() => setShowPanicConfirm(false)}>
                    BATAL
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}
