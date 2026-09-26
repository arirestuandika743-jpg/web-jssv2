'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

export default function MobileAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) { router.push('/m/login'); return; }
      setUser(currentUser);
      setLoading(false);
    };
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/m');
  };

  const menuItems = [
    { icon: '👤', title: 'Edit Profil', subtitle: 'Ubah nama, foto profil', href: '/m/account/edit' },
    { icon: '🔒', title: 'Ubah Password', subtitle: 'Ganti password akun', href: '/m/account/password' },
    { icon: '📍', title: 'Lokasi Tersimpan', subtitle: 'Rumah, Kantor, Sekolah', href: '/m/saved-locations' },
    { icon: '📋', title: 'Riwayat Pesanan', subtitle: 'Lihat semua pesanan', href: '/m/orders' },
    { icon: '🎁', title: 'Promo', subtitle: 'Kode promo & saldo', href: '/m/promo' },
    { icon: '🔗', title: 'Referral', subtitle: 'Ajak teman dapat bonus', href: '/m/referral' },
    { icon: '❓', title: 'Bantuan', subtitle: 'FAQ & panduan', href: '/about' },
    { icon: '📞', title: 'Hubungi JSS', subtitle: 'Chat admin via WhatsApp', action: 'whatsapp' },
  ];

  if (loading) {
    return (
      <div className="jss-loading" style={{ minHeight: '60dvh' }}>
        <div className="jss-spinner" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Header */}
      <div className="jss-title-bar" style={{ padding: '16px 0', position: 'relative', borderBottom: 'none' }}>
        <h1 className="jss-title-bar-text" style={{ fontSize: 20 }}>👤 Akun</h1>
      </div>

      {/* Profile Card */}
      <div className="jss-card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFD700, #E6C200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 900, color: '#0A0A0A',
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{user?.name}</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
            {user?.phone || user?.email}
          </p>
          <span className="jss-badge jss-badge-yellow" style={{ marginTop: 4 }}>
            Customer
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="jss-card" style={{ padding: 4, marginBottom: 16 }}>
        {menuItems.map((item, idx) => (
          <React.Fragment key={idx}>
            <button
              className="jss-menu-item"
              onClick={() => {
                if (item.action === 'whatsapp') {
                  window.open('https://wa.me/62882020705153', '_blank');
                } else if (item.href) {
                  router.push(item.href);
                }
              }}
            >
              <div className="jss-menu-icon" style={{ fontSize: 18 }}>
                {item.icon}
              </div>
              <div className="jss-menu-content">
                <div className="jss-menu-title">{item.title}</div>
                <div className="jss-menu-subtitle">{item.subtitle}</div>
              </div>
              <div className="jss-menu-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </div>
            </button>
            {idx < menuItems.length - 1 && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 16px' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Courier Mode Switch */}
      {user?.role === 'runner' || user?.role === 'driver' ? (
        <div className="jss-card jss-card-yellow" style={{ marginBottom: 16 }}>
          <button
            className="jss-btn jss-btn-primary jss-btn-block"
            onClick={() => router.push('/m/courier')}
          >
            🛵 Beralih ke Mode Kurir
          </button>
        </div>
      ) : null}

      {/* Admin Access */}
      {(user?.role === 'admin' || user?.role === 'super_admin') && (
        <div className="jss-card" style={{ marginBottom: 16 }}>
          <button
            className="jss-btn jss-btn-outline jss-btn-block"
            onClick={() => router.push('/admin')}
          >
            ⚙️ Admin Dashboard
          </button>
        </div>
      )}

      {/* Logout */}
      <button
        className="jss-btn jss-btn-ghost jss-btn-block"
        onClick={handleLogout}
        style={{ color: '#EF4444', marginBottom: 24 }}
      >
        Keluar
      </button>

      {/* App Version */}
      <div style={{ textAlign: 'center', paddingBottom: 24 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          JSS Kalirejo v1.0.0
        </p>
      </div>
    </div>
  );
}
