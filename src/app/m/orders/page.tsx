'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { dbService } from '@/services/db';
import type { Order } from '@/types';

const STATUS_MAP: Record<string, { label: string; css: string }> = {
  waiting: { label: 'Menunggu', css: 'jss-status-pending' },
  need_admin_confirmation: { label: 'Menunggu Admin', css: 'jss-status-pending' },
  accepted: { label: 'Diterima', css: 'jss-status-active' },
  driver_going: { label: 'Kurir Menuju', css: 'jss-status-active' },
  shopping: { label: 'Diproses', css: 'jss-status-active' },
  delivering: { label: 'Diantar', css: 'jss-status-active' },
  completed: { label: 'Selesai', css: 'jss-status-completed' },
  cancelled: { label: 'Dibatalkan', css: 'jss-status-cancelled' },
};

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Makanan', shopping: 'Belanja', medicine: 'Obat', documents: 'Dokumen',
  packages: 'Paket', ride: 'Antar Orang', large_cargo: 'Barang', carter: 'Carter',
  car_barang: 'JSS CAR Barang', car_ojek: 'JSS CAR Ojek', others: 'Lainnya',
};

export default function MobileOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'completed' | 'cancelled'>('active');

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        router.push('/m/login');
        return;
      }
      setUser(currentUser);

      try {
        const customerOrders = await dbService.getCustomerOrders(currentUser.id);
        setOrders(customerOrders);
      } catch (e) {
        console.error('Failed to load orders:', e);
      }
      setLoading(false);
    };
    loadData();
  }, [router]);

  const filteredOrders = orders.filter((o) => {
    if (tab === 'active') return !['completed', 'cancelled'].includes(o.status);
    if (tab === 'completed') return o.status === 'completed';
    return o.status === 'cancelled';
  });

  const formatPrice = (price: number) => `Rp${price.toLocaleString('id-ID')}`;
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="jss-loading" style={{ minHeight: '60dvh' }}>
        <div className="jss-spinner" />
        <p className="jss-loading-text">Memuat pesanan...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Header */}
      <div className="jss-title-bar" style={{ padding: '16px 0', position: 'relative', borderBottom: 'none' }}>
        <h1 className="jss-title-bar-text" style={{ fontSize: 20 }}>📋 Pesanan</h1>
      </div>

      {/* Tabs */}
      <div className="jss-tabs">
        <button className={`jss-tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
          Aktif
        </button>
        <button className={`jss-tab ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>
          Selesai
        </button>
        <button className={`jss-tab ${tab === 'cancelled' ? 'active' : ''}`} onClick={() => setTab('cancelled')}>
          Batal
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="jss-empty">
          <div className="jss-empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <h3 className="jss-empty-title">
            {tab === 'active' ? 'Belum ada pesanan aktif' :
             tab === 'completed' ? 'Belum ada pesanan selesai' :
             'Tidak ada pesanan dibatalkan'}
          </h3>
          <p className="jss-empty-text">
            {tab === 'active' ? 'Yuk, buat pesanan pertamamu!' : ''}
          </p>
          {tab === 'active' && (
            <button
              className="jss-btn jss-btn-primary"
              onClick={() => router.push('/m')}
              style={{ marginTop: 16 }}
            >
              Pesan Sekarang
            </button>
          )}
        </div>
      ) : (
        filteredOrders.map((order) => {
          const status = STATUS_MAP[order.status] || { label: order.status, css: 'jss-status-pending' };
          return (
            <div
              key={order.id}
              className="jss-order-card"
              onClick={() => router.push(`/m/orders/${order.id}`)}
            >
              <div className="jss-order-header">
                <span className="jss-order-id">#{order.orderNumber}</span>
                <span className={`jss-order-status ${status.css}`}>
                  {status.label}
                </span>
              </div>

              <div className="jss-order-route">
                <div className="jss-order-point">
                  <div className="jss-order-dot jss-order-dot-pickup" />
                  <span>{order.pickupAddress}</span>
                </div>
                <div className="jss-order-point">
                  <div className="jss-order-dot jss-order-dot-dest" />
                  <span>{order.destinationAddress}</span>
                </div>
              </div>

              <div className="jss-order-footer">
                <span className="jss-order-service">
                  {CATEGORY_LABELS[order.category] || order.category}
                </span>
                <span className="jss-order-price">{formatPrice(order.grandTotal)}</span>
              </div>

              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
                {formatDate(order.createdAt)}
              </div>

              {/* Courier info for active orders */}
              {order.driverName && tab === 'active' && (
                <div className="jss-card" style={{ marginTop: 12, padding: 12, background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#0A0A0A' }}>
                      {order.driverName?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#FFD700' }}>🟢 Kurir: {order.driverName}</div>
                    </div>
                    <button
                      className="jss-btn jss-btn-primary jss-btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://wa.me/62882020705153`, '_blank');
                      }}
                      style={{ padding: '6px 12px', fontSize: 11 }}
                    >
                      Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
