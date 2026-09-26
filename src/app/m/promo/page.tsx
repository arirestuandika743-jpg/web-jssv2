'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { promoService } from '@/services/promoService';
import { referralService } from '@/services/referralService';

export default function MobilePromoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; message?: string; discountAmount: number } | null>(null);
  const [validating, setValidating] = useState(false);
  const [promoBalance, setPromoBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isNewUserEligible, setIsNewUserEligible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        router.push('/m/login');
        return;
      }
      setUser(currentUser);

      try {
        const balance = await referralService.getPromoBalance(currentUser.id);
        setPromoBalance(balance);
        const txns = await referralService.getPromoTransactions(currentUser.id);
        setTransactions(txns);
        const eligible = await referralService.isNewUserPromoEligible(currentUser.id);
        setIsNewUserEligible(eligible);
      } catch (e) {
        console.warn('Promo data load failed:', e);
      }
      setLoading(false);
    };
    loadData();
  }, [router]);

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    setValidating(true);
    setPromoResult(null);
    try {
      const result = await promoService.validatePromoCode(promoCode, user?.phone);
      setPromoResult(result);
    } catch (e: any) {
      setPromoResult({ valid: false, discountAmount: 0, message: e.message });
    }
    setValidating(false);
  };

  const formatPrice = (p: number) => `Rp${Math.abs(p).toLocaleString('id-ID')}`;

  if (loading) {
    return (
      <div className="jss-loading" style={{ minHeight: '60dvh' }}>
        <div className="jss-spinner" />
        <p className="jss-loading-text">Memuat...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Header */}
      <div className="jss-title-bar" style={{ padding: '16px 0', position: 'relative', borderBottom: 'none' }}>
        <h1 className="jss-title-bar-text" style={{ fontSize: 20 }}>🎁 Promo</h1>
      </div>

      {/* Promo Balance Card */}
      <div className="jss-card jss-card-yellow" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
              Saldo Promo JSS
            </p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#FFD700', margin: '4px 0 0' }}>
              {formatPrice(promoBalance)}
            </p>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,215,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            💰
          </div>
        </div>
      </div>

      {/* New User Promo */}
      {isNewUserEligible && (
        <div className="jss-promo-banner" style={{ marginBottom: 16 }}>
          <div className="jss-promo-glow" />
          <div className="jss-promo-badge">🆕 PENGGUNA BARU</div>
          <h3 className="jss-promo-title">Diskon 20% Order Pertama!</h3>
          <p className="jss-promo-desc">
            Nikmati diskon hingga Rp10.000 untuk order pertama kamu. Otomatis berlaku saat checkout.
          </p>
        </div>
      )}

      {/* Promo Code Input */}
      <div className="jss-card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Kode Promo</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            className="jss-input"
            placeholder="Masukkan kode promo"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value.toUpperCase());
              setPromoResult(null);
            }}
            style={{ flex: 1 }}
          />
          <button
            className="jss-btn jss-btn-primary"
            onClick={handleValidatePromo}
            disabled={validating || !promoCode.trim()}
            style={{ whiteSpace: 'nowrap' }}
          >
            {validating ? '...' : 'TERAPKAN'}
          </button>
        </div>
        {promoResult && (
          <div style={{
            marginTop: 8,
            padding: '8px 12px',
            borderRadius: 8,
            background: promoResult.valid ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${promoResult.valid ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            <p style={{ fontSize: 13, color: promoResult.valid ? '#4ADE80' : '#F87171', margin: 0 }}>
              {promoResult.valid
                ? `✅ Kode valid! Diskon ${formatPrice(promoResult.discountAmount)}`
                : `❌ ${promoResult.message}`
              }
            </p>
          </div>
        )}
      </div>

      {/* Referral CTA */}
      <div className="jss-card jss-card-yellow" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28 }}>🎁</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#FFD700' }}>Ajak Teman & Dapat Bonus!</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
              Setiap temanmu yang pakai JSS, kamu dapat Rp5.000 saldo promo.
            </p>
          </div>
        </div>
        <button
          className="jss-btn jss-btn-primary jss-btn-block jss-btn-sm"
          onClick={() => router.push('/m/referral')}
          style={{ marginTop: 12 }}
        >
          AJAK TEMAN SEKARANG
        </button>
      </div>

      {/* Transaction History */}
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Riwayat Saldo Promo</h3>
      {transactions.length === 0 ? (
        <div className="jss-empty" style={{ padding: 24 }}>
          <p className="jss-empty-text">Belum ada transaksi promo</p>
        </div>
      ) : (
        transactions.map((txn) => (
          <div key={txn.id} className="jss-card" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: txn.amount > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: txn.amount > 0 ? '#4ADE80' : '#F87171', fontWeight: 700, fontSize: 14,
            }}>
              {txn.amount > 0 ? '+' : '-'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{txn.description}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
                {new Date(txn.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: txn.amount > 0 ? '#4ADE80' : '#F87171' }}>
              {txn.amount > 0 ? '+' : '-'}{formatPrice(txn.amount)}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
