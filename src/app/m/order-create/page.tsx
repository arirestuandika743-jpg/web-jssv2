'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth';
import { dbService } from '@/services/db';
import { calculateDeliveryPrice, calculateHaversineDistance, estimateDuration } from '@/services/pricing';
import { referralService } from '@/services/referralService';
import type { OrderFormData, LatLng } from '@/types';

const SERVICE_INFO: Record<string, { label: string; icon: string }> = {
  ride: { label: 'JSS MOTOR - Antar Orang', icon: '🛵' },
  food: { label: 'Jastip Makanan', icon: '🍔' },
  shopping: { label: 'Belanja', icon: '🛒' },
  packages: { label: 'Paket', icon: '📦' },
  medicine: { label: 'Obat', icon: '💊' },
  documents: { label: 'Dokumen', icon: '📄' },
  large_cargo: { label: 'Barang', icon: '🧺' },
  car_barang: { label: 'JSS CAR Barang', icon: '📦' },
  car_ojek: { label: 'JSS CAR Ojek', icon: '👤' },
  others: { label: 'Lainnya', icon: '📌' },
};

export default function OrderCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service') || 'packages';

  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: pickup, 2: destination, 3: details, 4: summary
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState<LatLng | null>(null);
  const [destAddress, setDestAddress] = useState('');
  const [destCoords, setDestCoords] = useState<LatLng | null>(null);
  const [description, setDescription] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [estimatedItemPrice, setEstimatedItemPrice] = useState(0);

  // Pricing
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pricing, setPricing] = useState<any>(null);
  const [newUserDiscount, setNewUserDiscount] = useState(0);

  const serviceInfo = SERVICE_INFO[serviceId] || SERVICE_INFO.packages;

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        router.push('/m/login');
        return;
      }
      setUser(currentUser);
      setLoading(false);
    };
    loadUser();
  }, [router]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPickupCoords(coords);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
          );
          const data = await res.json();
          setPickupAddress(data.display_name?.split(',').slice(0, 4).join(',') || `${coords.lat}, ${coords.lng}`);
        } catch {
          setPickupAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
        }
      },
      () => alert('Tidak dapat mengakses lokasi GPS'),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const calculateRoute = async () => {
    if (!pickupCoords || !destCoords) return;

    const dist = calculateHaversineDistance(
      pickupCoords.lat, pickupCoords.lng,
      destCoords.lat, destCoords.lng
    );
    const dur = estimateDuration(dist);

    setDistance(dist);
    setDuration(dur);

    const pricingResult = calculateDeliveryPrice(dist, estimatedItemPrice, {
      category: serviceId,
      durationInSeconds: dur,
    });

    setPricing(pricingResult);

    // Check new user discount
    if (user) {
      const discount = await referralService.calculateNewUserDiscount(user.id, pricingResult.totalDeliveryFee);
      setNewUserDiscount(discount);
    }
  };

  useEffect(() => {
    if (pickupCoords && destCoords) {
      calculateRoute();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupCoords, destCoords]);

  const handleSubmitOrder = async () => {
    if (!user || !pricing) return;
    setSubmitting(true);

    try {
      const formData: OrderFormData = {
        customerName: user.name,
        whatsappNumber: user.phone || '',
        pickupAddress,
        pickupCoordinates: pickupCoords || undefined,
        destinationAddress: destAddress,
        destinationCoordinates: destCoords || undefined,
        category: serviceId as any,
        description: description || serviceInfo.label,
        deliveryNotes: deliveryNotes || undefined,
        estimatedItemPrice,
        paymentMethod: 'cash',
      };

      const finalPrice = {
        distance,
        duration,
        totalDeliveryFee: pricing.totalDeliveryFee - newUserDiscount,
        grandTotal: pricing.grandTotal - newUserDiscount,
      };

      const order = await dbService.createOrder(formData, finalPrice, user.id);

      // Mark new user promo as used if applied
      if (newUserDiscount > 0) {
        await referralService.markNewUserPromoUsed(user.id);
        // Complete referral if this user was referred
        await referralService.completeReferralOnFirstOrder(user.id, order.id);
      }

      router.push(`/m/orders?created=${order.orderNumber}`);
    } catch (e: any) {
      alert('Gagal membuat pesanan: ' + (e.message || 'Terjadi kesalahan'));
    }
    setSubmitting(false);
  };

  const formatPrice = (p: number) => `Rp${p.toLocaleString('id-ID')}`;
  const formatDistance = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
  const formatDuration = (s: number) => {
    const mins = Math.round(s / 60);
    return mins >= 60 ? `${Math.floor(mins / 60)}j ${mins % 60}m` : `${mins} menit`;
  };

  if (loading) {
    return (
      <div className="jss-loading" style={{ minHeight: '100dvh' }}>
        <div className="jss-spinner" />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div className="jss-title-bar">
        <button className="jss-title-bar-back" onClick={() => step > 1 ? setStep(step - 1) : router.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <span className="jss-title-bar-text">{serviceInfo.icon} {serviceInfo.label}</span>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 4, padding: '0 16px', marginBottom: 20 }}>
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            style={{
              flex: 1, height: 3, borderRadius: 3,
              background: s <= step ? '#FFD700' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Step 1: Pickup */}
        {step === 1 && (
          <div style={{ animation: 'slideUp 0.3s ease' }}>
            <h2 className="jss-section-title">📍 Lokasi Penjemputan</h2>

            <button
              className="jss-btn jss-btn-outline jss-btn-block"
              onClick={handleGetCurrentLocation}
              style={{ marginBottom: 16 }}
            >
              📍 Gunakan Lokasi Saat Ini
            </button>

            <div className="jss-input-group">
              <label className="jss-input-label">Alamat Penjemputan</label>
              <textarea
                className="jss-input"
                placeholder="Masukkan alamat lengkap penjemputan"
                rows={3}
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            {pickupCoords && (
              <p style={{ fontSize: 12, color: '#4ADE80', margin: '0 0 16px' }}>
                ✅ Koordinat: {pickupCoords.lat.toFixed(5)}, {pickupCoords.lng.toFixed(5)}
              </p>
            )}

            <button
              className="jss-btn jss-btn-primary jss-btn-block jss-btn-lg"
              disabled={!pickupAddress.trim()}
              onClick={() => {
                if (!pickupCoords) {
                  // Simulate coords for demo if not using GPS
                  setPickupCoords({ lat: -5.2275, lng: 104.9601 });
                }
                setStep(2);
              }}
            >
              Lanjut →
            </button>
          </div>
        )}

        {/* Step 2: Destination */}
        {step === 2 && (
          <div style={{ animation: 'slideUp 0.3s ease' }}>
            <h2 className="jss-section-title">🏁 Lokasi Tujuan</h2>

            <div className="jss-input-group">
              <label className="jss-input-label">Alamat Tujuan</label>
              <textarea
                className="jss-input"
                placeholder="Masukkan alamat lengkap tujuan"
                rows={3}
                value={destAddress}
                onChange={(e) => setDestAddress(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            <button
              className="jss-btn jss-btn-primary jss-btn-block jss-btn-lg"
              disabled={!destAddress.trim()}
              onClick={() => {
                if (!destCoords) {
                  // Simulate coords with small offset for demo
                  setDestCoords({ lat: -5.2375 + (Math.random() * 0.02 - 0.01), lng: 104.9701 + (Math.random() * 0.02 - 0.01) });
                }
                setStep(3);
              }}
            >
              Lanjut →
            </button>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div style={{ animation: 'slideUp 0.3s ease' }}>
            <h2 className="jss-section-title">📝 Detail Pesanan</h2>

            <div className="jss-input-group">
              <label className="jss-input-label">Deskripsi Pesanan</label>
              <textarea
                className="jss-input"
                placeholder="Jelaskan pesanan Anda..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            {['food', 'shopping', 'medicine'].includes(serviceId) && (
              <div className="jss-input-group">
                <label className="jss-input-label">Estimasi Harga Barang (Rp)</label>
                <input
                  type="number"
                  className="jss-input"
                  placeholder="0"
                  value={estimatedItemPrice || ''}
                  onChange={(e) => setEstimatedItemPrice(Number(e.target.value) || 0)}
                />
              </div>
            )}

            <div className="jss-input-group">
              <label className="jss-input-label">Catatan Tambahan (opsional)</label>
              <input
                type="text"
                className="jss-input"
                placeholder="Contoh: lantai 2, pakai plastik"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
              />
            </div>

            <button
              className="jss-btn jss-btn-primary jss-btn-block jss-btn-lg"
              onClick={() => setStep(4)}
            >
              Lihat Ringkasan →
            </button>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && pricing && (
          <div style={{ animation: 'slideUp 0.3s ease' }}>
            <h2 className="jss-section-title">📋 Ringkasan Pesanan</h2>

            <div className="jss-card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Customer</span>
                  <span style={{ fontWeight: 600 }}>{user?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>WhatsApp</span>
                  <span>{user?.phone}</span>
                </div>
                <div className="jss-divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Layanan</span>
                  <span style={{ fontWeight: 600 }}>{serviceInfo.icon} {serviceInfo.label}</span>
                </div>

                <div className="jss-divider" />

                <div className="jss-order-route">
                  <div className="jss-order-point">
                    <div className="jss-order-dot jss-order-dot-pickup" />
                    <span style={{ fontSize: 13 }}>{pickupAddress}</span>
                  </div>
                  <div className="jss-order-point">
                    <div className="jss-order-dot jss-order-dot-dest" />
                    <span style={{ fontSize: 13 }}>{destAddress}</span>
                  </div>
                </div>

                <div className="jss-divider" />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Jarak</span>
                  <span>{formatDistance(distance)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Estimasi Waktu</span>
                  <span>{formatDuration(duration)}</span>
                </div>

                <div className="jss-divider" />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Ongkos Kirim</span>
                  <span>{formatPrice(pricing.totalDeliveryFee)}</span>
                </div>

                {estimatedItemPrice > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Harga Barang</span>
                    <span>{formatPrice(estimatedItemPrice)}</span>
                  </div>
                )}

                {newUserDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#4ADE80' }}>🎁 Diskon Pengguna Baru</span>
                    <span style={{ color: '#4ADE80', fontWeight: 700 }}>-{formatPrice(newUserDiscount)}</span>
                  </div>
                )}

                <div className="jss-divider" />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontWeight: 800, color: '#FFD700', fontSize: 18 }}>
                    {formatPrice(pricing.grandTotal - newUserDiscount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="jss-card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 20 }}>💵</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Pembayaran: Tunai</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Bayar langsung ke kurir</p>
              </div>
            </div>

            <button
              className="jss-btn jss-btn-primary jss-btn-block jss-btn-lg"
              onClick={handleSubmitOrder}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="jss-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Memproses...
                </>
              ) : 'KONFIRMASI PESANAN'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
