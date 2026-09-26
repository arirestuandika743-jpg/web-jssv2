'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import '@/app/mobile.css';

export default function MobileLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'whatsapp' | 'email'>('whatsapp');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginId = mode === 'whatsapp' ? `${whatsapp}@jss.local` : email;
      const { user, error: loginError } = await authService.signIn(loginId, password);

      if (loginError) {
        setError(loginError.message || 'Login gagal. Periksa kembali data Anda.');
        setLoading(false);
        return;
      }

      if (user) {
        // Redirect based on role
        if (user.role === 'runner' || user.role === 'driver') {
          router.push('/m/courier');
        } else if (user.role === 'admin' || user.role === 'super_admin') {
          router.push('/admin');
        } else {
          router.push('/m');
        }
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

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <svg width="64" height="64" viewBox="0 0 120 120" fill="none">
            <rect width="120" height="120" rx="28" fill="#FFD700" />
            <text x="60" y="70" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="42" fontWeight="900" fill="#0A0A0A">JSS</text>
          </svg>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 16, color: '#FFFFFF' }}>Masuk ke JSS</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Selamat datang kembali!
          </p>
        </div>

        {/* Login Mode Tabs */}
        <div className="jss-tabs">
          <button
            className={`jss-tab ${mode === 'whatsapp' ? 'active' : ''}`}
            onClick={() => setMode('whatsapp')}
          >
            WhatsApp
          </button>
          <button
            className={`jss-tab ${mode === 'email' ? 'active' : ''}`}
            onClick={() => setMode('email')}
          >
            Email
          </button>
        </div>

        <form onSubmit={handleLogin}>
          {mode === 'whatsapp' ? (
            <div className="jss-input-group">
              <label className="jss-input-label">Nomor WhatsApp</label>
              <input
                type="tel"
                className={`jss-input ${error ? 'jss-input-error' : ''}`}
                placeholder="08xxxxxxxxxx"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                autoComplete="tel"
              />
            </div>
          ) : (
            <div className="jss-input-group">
              <label className="jss-input-label">Email</label>
              <input
                type="email"
                className={`jss-input ${error ? 'jss-input-error' : ''}`}
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          )}

          <div className="jss-input-group">
            <label className="jss-input-label">Password</label>
            <input
              type="password"
              className={`jss-input ${error ? 'jss-input-error' : ''}`}
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="jss-error-text" style={{ marginBottom: 16 }}>{error}</p>}

          <button
            type="submit"
            className="jss-btn jss-btn-primary jss-btn-block jss-btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="jss-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Memproses...
              </>
            ) : 'MASUK'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>atau</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Google Login */}
        <button className="jss-btn jss-btn-outline jss-btn-block" style={{ gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Lanjut dengan Google
        </button>

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            Belum punya akun?{' '}
            <button
              className="jss-btn jss-btn-ghost"
              onClick={() => router.push('/m/register')}
              style={{ color: '#FFD700', fontWeight: 700, padding: 0, display: 'inline' }}
            >
              Daftar Sekarang
            </button>
          </p>
        </div>

        {/* Courier Login */}
        <div style={{ marginTop: 'auto', paddingTop: 24, textAlign: 'center' }}>
          <button
            className="jss-btn jss-btn-ghost jss-btn-sm"
            onClick={() => router.push('/m/courier/login')}
          >
            🛵 Masuk sebagai Kurir JSS
          </button>
        </div>
      </div>
    </div>
  );
}
