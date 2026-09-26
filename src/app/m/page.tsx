'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

export default function MobileHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('Gunakan lokasi saat ini');
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    // Splash screen timer
    const splashTimer = setTimeout(() => {
      setSplashFading(true);
      setTimeout(() => setShowSplash(false), 500);
    }, 2000);

    // Load user
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (e) {
        console.warn('Auth check failed:', e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();

    return () => clearTimeout(splashTimer);
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          setCurrentLocation(data.display_name?.split(',').slice(0, 3).join(',') || 'Lokasi ditemukan');
        } catch {
          setCurrentLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
        setGettingLocation(false);
      },
      () => {
        setCurrentLocation('Tidak dapat mengakses lokasi');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const services = [
    { id: 'ride', icon: '🛵', name: 'JSS MOTOR', color: '#10B981' },
    { id: 'jss-car', icon: '🚗', name: 'JSS CAR', color: '#3B82F6', isSection: true },
    { id: 'car_barang', icon: '📦', name: 'JSS CAR\nBARANG', color: '#F59E0B' },
    { id: 'car_ojek', icon: '👤', name: 'JSS CAR\nOJEK', color: '#10B981' },
    { id: 'food', icon: '🍔', name: 'JASTIP\nMAKANAN', color: '#FF6B35' },
    { id: 'shopping', icon: '🛒', name: 'BELANJA', color: '#FDB813' },
    { id: 'packages', icon: '📦', name: 'PAKET', color: '#8B5CF6' },
    { id: 'medicine', icon: '💊', name: 'OBAT', color: '#10B981' },
    { id: 'documents', icon: '📄', name: 'DOKUMEN', color: '#3B82F6' },
    { id: 'large_cargo', icon: '🧺', name: 'BARANG', color: '#EF4444' },
    { id: 'others', icon: '👨‍👩‍👧', name: 'ANTAR\nORANG', color: '#6B7280' },
  ];

  const handleServiceClick = (serviceId: string) => {
    if (!user) {
      router.push('/m/welcome');
      return;
    }
    if (serviceId === 'jss-car') {
      router.push('/m/jss-car');
      return;
    }
    router.push(`/m/order-create?service=${serviceId}`);
  };

  // Splash screen
  if (showSplash) {
    return (
      <div className={`jss-splash ${splashFading ? 'fade-out' : ''}`}>
        <div className="jss-splash-logo">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect width="120" height="120" rx="28" fill="#FFD700" />
            <text x="60" y="70" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="42" fontWeight="900" fill="#0A0A0A">JSS</text>
          </svg>
        </div>
        <div className="jss-splash-brand">JSS</div>
        <div className="jss-splash-tagline">Jasa Suruh Kalirejo</div>
        <div className="jss-splash-loader">
          <div className="jss-splash-loader-bar" />
        </div>
      </div>
    );
  }

  // Welcome screen (not logged in, first open)
  if (!user && !loading) {
    return (
      <div className="jss-welcome" style={{ paddingBottom: 0 }}>
        <div className="jss-welcome-logo">
          <svg width="100" height="100" viewBox="0 0 120 120" fill="none">
            <rect width="120" height="120" rx="28" fill="#FFD700" />
            <text x="60" y="70" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="42" fontWeight="900" fill="#0A0A0A">JSS</text>
          </svg>
        </div>
        <div className="jss-welcome-brand">JSS</div>
        <div className="jss-welcome-subtitle">Jasa Suruh Kalirejo</div>
        <p className="jss-welcome-tagline">
          &ldquo;Semua kebutuhanmu, tinggal suruh JSS.&rdquo;
        </p>
        <div className="jss-welcome-actions">
          <button
            className="jss-btn jss-btn-primary jss-btn-block jss-btn-lg"
            onClick={() => router.push('/m/login')}
          >
            MASUK
          </button>
          <button
            className="jss-btn jss-btn-outline jss-btn-block jss-btn-lg"
            onClick={() => router.push('/m/register')}
          >
            DAFTAR
          </button>
          <button
            className="jss-btn jss-btn-ghost jss-btn-block"
            onClick={() => {
              setUser({ id: 'guest', name: 'Tamu', role: 'guest' });
            }}
            style={{ marginTop: 8 }}
          >
            Lihat sebagai Tamu →
          </button>
        </div>

        {/* Guest info links */}
        <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="jss-btn jss-btn-ghost jss-btn-sm" onClick={() => router.push('/about')}>
            Tentang JSS
          </button>
          <button className="jss-btn jss-btn-ghost jss-btn-sm" onClick={() => router.push('/contact')}>
            Kontak
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="jss-loading" style={{ minHeight: '100dvh' }}>
        <div className="jss-spinner" />
        <p className="jss-loading-text">Memuat...</p>
      </div>
    );
  }

  const isGuest = user?.role === 'guest' || !user;
  const displayName = user?.name || 'Tamu';

  // Main Home
  return (
    <div className="jss-home">
      {/* Header */}
      <div className="jss-home-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="jss-home-greeting">Selamat datang di JSS 👋</h1>
            <p className="jss-home-subgreeting">Halo, {displayName}</p>
          </div>
          {/* Notifications icon */}
          <button
            className="jss-btn jss-btn-ghost"
            style={{ padding: 8, borderRadius: '50%' }}
            onClick={() => router.push('/m/account')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Location Card */}
      <div className="jss-location-card" onClick={handleGetLocation}>
        <div className="jss-location-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
        <div className="jss-location-text">
          <div className="jss-location-label">📍 Lokasi Anda</div>
          <div className="jss-location-address">
            {gettingLocation ? 'Mencari lokasi...' : currentLocation}
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </div>

      {/* New User Promo Banner */}
      {!isGuest && (
        <div className="jss-promo-banner" onClick={() => router.push('/m/promo')}>
          <div className="jss-promo-glow" />
          <div className="jss-promo-badge">🎁 PROMO PENGGUNA BARU</div>
          <h3 className="jss-promo-title">Diskon 20% Order Pertama!</h3>
          <p className="jss-promo-desc">Maksimal Rp10.000 untuk order pertama kamu di JSS.</p>
        </div>
      )}

      {/* Section Title */}
      <h2 className="jss-section-title">
        MAU PESAN APA HARI INI?
      </h2>

      {/* Service Grid */}
      <div className="jss-service-grid">
        {services.map((svc) => (
          <button
            key={svc.id}
            className="jss-service-item"
            onClick={() => handleServiceClick(svc.id)}
          >
            <div
              className="jss-service-icon"
              style={{ background: `${svc.color}18` }}
            >
              {svc.icon}
            </div>
            <span className="jss-service-name" style={{ whiteSpace: 'pre-line' }}>{svc.name}</span>
          </button>
        ))}
      </div>

      {/* See All Services */}
      <button
        className="jss-btn jss-btn-outline jss-btn-block"
        onClick={() => router.push('/m/services')}
        style={{ marginBottom: 24 }}
      >
        LIHAT SEMUA LAYANAN
      </button>

      {/* Referral Banner */}
      {!isGuest && (
        <div className="jss-card jss-card-yellow" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 32 }}>🎁</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: '#FFD700' }}>
                Ajak Teman & Dapat Bonus!
              </h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                Bagikan JSS, temanmu dapat diskon, kamu dapat saldo promo.
              </p>
            </div>
          </div>
          <button
            className="jss-btn jss-btn-primary jss-btn-block jss-btn-sm"
            onClick={() => router.push('/m/referral')}
            style={{ marginTop: 12 }}
          >
            BAGIKAN SEKARANG
          </button>
        </div>
      )}

      {/* Guest Login CTA */}
      {isGuest && (
        <div className="jss-card" style={{ marginBottom: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 12px' }}>
            Masuk atau daftar untuk mulai pesan di JSS
          </p>
          <button
            className="jss-btn jss-btn-primary jss-btn-block"
            onClick={() => router.push('/m/login')}
          >
            MASUK / DAFTAR
          </button>
        </div>
      )}
    </div>
  );
}
