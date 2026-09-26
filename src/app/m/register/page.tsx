'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth';
import { referralService } from '@/services/referralService';
import '@/app/mobile.css';

export default function MobileRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(refCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (!whatsapp || whatsapp.length < 10) {
      setError('Nomor WhatsApp tidak valid.');
      return;
    }

    setLoading(true);

    try {
      const registerEmail = email || `${whatsapp.replace(/\D/g, '')}@jss.local`;
      const { user, error: regError } = await authService.signUp(
        registerEmail,
        password,
        name,
        whatsapp,
        'customer'
      );

      if (regError) {
        setError(regError.message || 'Pendaftaran gagal.');
        setLoading(false);
        return;
      }

      if (user) {
        // Process referral if provided
        if (referralCode) {
          try {
            await referralService.processReferralOnRegister(user.id, referralCode);
          } catch (e) {
            console.warn('Referral processing failed:', e);
          }
        }

        router.push('/m');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  return (
    <div className="jss-mobile-app" style={{ paddingBottom: 0 }}>
      <div style={{ padding: '24px 20px', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        {/* Back */}
        <button
          className="jss-btn jss-btn-ghost"
          onClick={() => router.push('/m')}
          style={{ alignSelf: 'flex-start', padding: '8px 0', marginBottom: 16 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          Kembali
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <svg width="56" height="56" viewBox="0 0 120 120" fill="none">
            <rect width="120" height="120" rx="28" fill="#FFD700" />
            <text x="60" y="70" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="42" fontWeight="900" fill="#0A0A0A">JSS</text>
          </svg>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 12, color: '#FFFFFF' }}>Daftar Akun Baru</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Buat akun untuk mulai pesan di JSS
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ flex: 1 }}>
          <div className="jss-input-group">
            <label className="jss-input-label">Nama Lengkap / Nama Panggilan *</label>
            <input
              type="text"
              className="jss-input"
              placeholder="Masukkan nama Anda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="jss-input-group">
            <label className="jss-input-label">Nomor WhatsApp *</label>
            <input
              type="tel"
              className="jss-input"
              placeholder="08xxxxxxxxxx"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              autoComplete="tel"
            />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              Nomor WhatsApp digunakan untuk komunikasi order
            </p>
          </div>

          <div className="jss-input-group">
            <label className="jss-input-label">Password *</label>
            <input
              type="password"
              className="jss-input"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="jss-input-group">
            <label className="jss-input-label">Konfirmasi Password *</label>
            <input
              type="password"
              className="jss-input"
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="jss-input-group">
            <label className="jss-input-label">Email (opsional)</label>
            <input
              type="email"
              className="jss-input"
              placeholder="email@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="jss-input-group">
            <label className="jss-input-label">Kode Referral (opsional)</label>
            <input
              type="text"
              className="jss-input"
              placeholder="JSS-XXXXX"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              autoComplete="off"
            />
            {referralCode && (
              <p style={{ fontSize: 11, color: '#FFD700', marginTop: 4 }}>
                🎁 Kamu akan mendapat diskon 20% untuk order pertama!
              </p>
            )}
          </div>

          {error && <p className="jss-error-text" style={{ marginBottom: 16 }}>{error}</p>}

          <button
            type="submit"
            className="jss-btn jss-btn-primary jss-btn-block jss-btn-lg"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? (
              <>
                <div className="jss-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Mendaftar...
              </>
            ) : 'DAFTAR'}
          </button>
        </form>

        {/* Login Link */}
        <div style={{ textAlign: 'center', paddingTop: 24, paddingBottom: 24 }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            Sudah punya akun?{' '}
            <button
              className="jss-btn jss-btn-ghost"
              onClick={() => router.push('/m/login')}
              style={{ color: '#FFD700', fontWeight: 700, padding: 0, display: 'inline' }}
            >
              Masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
