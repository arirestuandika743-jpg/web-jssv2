'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function JssCarPage() {
  const router = useRouter();

  return (
    <div style={{ padding: '0 16px' }}>
      <div className="jss-title-bar" style={{ padding: '16px 0', position: 'relative', borderBottom: 'none' }}>
        <button className="jss-title-bar-back" onClick={() => router.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <span className="jss-title-bar-text">🚗 JSS CAR</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* JSS CAR BARANG */}
        <button
          className="jss-card jss-card-hover"
          onClick={() => router.push('/m/order-create?service=car_barang')}
          style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid rgba(255,215,0,0.15)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>
              📦
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#FFD700' }}>
                JSS CAR BARANG
              </h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>
                Antar & angkut barang menggunakan mobil
              </p>
            </div>
          </div>
        </button>

        {/* JSS CAR OJEK */}
        <button
          className="jss-card jss-card-hover"
          onClick={() => router.push('/m/order-create?service=car_ojek')}
          style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid rgba(255,215,0,0.15)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>
              👤
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#FFD700' }}>
                JSS CAR OJEK
              </h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>
                Antar & jemput penumpang menggunakan mobil
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Info */}
      <div className="jss-card" style={{ marginTop: 24, background: 'rgba(255,215,0,0.05)' }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px', color: '#FFD700' }}>ℹ️ Info JSS CAR</h4>
        <ul style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, padding: '0 0 0 16px', lineHeight: 1.8 }}>
          <li>Menggunakan kendaraan roda 4 (mobil)</li>
          <li>Cocok untuk barang besar/banyak atau penumpang</li>
          <li>Tarif dasar lebih tinggi dari motor</li>
          <li>Jangkauan area lebih luas</li>
        </ul>
      </div>
    </div>
  );
}
