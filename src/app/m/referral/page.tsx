'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { referralService, type Referral } from '@/services/referralService';

export default function MobileReferralPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState('');
  const [promoBalance, setPromoBalance] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) { router.push('/m/login'); return; }
      setUser(currentUser);

      try {
        const code = await referralService.getReferralCode(currentUser.id);
        setReferralCode(code);
        setReferralLink(referralService.getReferralLink(code));
        const refs = await referralService.getReferralsByReferrer(currentUser.id);
        setReferrals(refs);
        const balance = await referralService.getPromoBalance(currentUser.id);
        setPromoBalance(balance);
      } catch (e) {
        console.warn('Referral data load error:', e);
      }
      setLoading(false);
    };
    loadData();
  }, [router]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `🎁 Yuk pakai JSS - Jasa Suruh Kalirejo!\n\nDapat diskon 20% untuk order pertamamu.\n\nDaftar pakai kode: ${referralCode}\n\nAtau klik: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatPrice = (p: number) => `Rp${p.toLocaleString('id-ID')}`;
  const pendingReferrals = referrals.filter(r => r.status === 'pending');
  const completedReferrals = referrals.filter(r => r.status === 'rewarded' || r.status === 'completed');
  const totalRewards = completedReferrals.reduce((sum, r) => sum + r.referrerReward, 0);

  if (loading) {
    return (
      <div className="jss-loading" style={{ minHeight: '60dvh' }}>
        <div className="jss-spinner" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Title */}
      <div className="jss-title-bar" style={{ padding: '16px 0', position: 'relative', borderBottom: 'none' }}>
        <button className="jss-title-bar-back" onClick={() => router.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <h1 className="jss-title-bar-text">🎁 Ajak Teman & Dapat Bonus</h1>
      </div>

      {/* Info Card */}
      <div className="jss-card jss-card-yellow" style={{ marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎁</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: '#FFD700' }}>
          Bagikan JSS ke Temanmu
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px', lineHeight: 1.6 }}>
          Temanmu dapat <strong style={{ color: '#FFD700' }}>diskon 20%</strong> untuk order pertama.
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
          Setelah temanmu menyelesaikan order pertama, kamu mendapatkan <strong style={{ color: '#4ADE80' }}>Rp5.000 saldo promo JSS</strong>.
        </p>
      </div>

      {/* Referral Code */}
      <div className="jss-card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
          Kode Referral Kamu
        </p>
        <div style={{
          background: '#1A1A1A',
          border: '2px dashed rgba(255,215,0,0.3)',
          borderRadius: 12,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#FFD700', letterSpacing: 2 }}>{referralCode}</span>
          <button
            className="jss-btn jss-btn-primary jss-btn-sm"
            onClick={() => handleCopy(referralCode, 'code')}
          >
            {copied === 'code' ? '✓ Disalin' : 'SALIN KODE'}
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="jss-btn jss-btn-primary jss-btn-block" onClick={handleShareWhatsApp}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            BAGIKAN KE WHATSAPP
          </button>
          <button
            className="jss-btn jss-btn-outline jss-btn-block"
            onClick={() => handleCopy(referralLink, 'link')}
          >
            {copied === 'link' ? '✓ Link Disalin' : '🔗 SALIN LINK REFERRAL'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="jss-courier-stats">
        <div className="jss-stat-card">
          <div className="jss-stat-value">{completedReferrals.length}</div>
          <div className="jss-stat-label">Berhasil</div>
        </div>
        <div className="jss-stat-card">
          <div className="jss-stat-value">{pendingReferrals.length}</div>
          <div className="jss-stat-label">Menunggu</div>
        </div>
        <div className="jss-stat-card">
          <div className="jss-stat-value" style={{ color: '#4ADE80' }}>{formatPrice(totalRewards)}</div>
          <div className="jss-stat-label">Total Reward</div>
        </div>
        <div className="jss-stat-card">
          <div className="jss-stat-value">{formatPrice(promoBalance)}</div>
          <div className="jss-stat-label">Saldo Promo</div>
        </div>
      </div>

      {/* Referral List */}
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '20px 0 12px' }}>Daftar Referral</h3>
      {referrals.length === 0 ? (
        <div className="jss-empty" style={{ padding: 24 }}>
          <p className="jss-empty-text">Belum ada referral. Bagikan kode kamu!</p>
        </div>
      ) : (
        referrals.map((ref) => (
          <div key={ref.id} className="jss-card" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: ref.status === 'rewarded' ? 'rgba(34,197,94,0.15)' : 'rgba(255,215,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>
              {ref.status === 'rewarded' ? '✅' : '⏳'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
                {ref.referredName || 'Pengguna Baru'}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
                {ref.status === 'pending' ? 'Menunggu order pertama' :
                 ref.status === 'rewarded' ? `Reward +${formatPrice(ref.referrerReward)}` :
                 'Selesai'}
              </p>
            </div>
            <span className={`jss-badge ${ref.status === 'rewarded' ? 'jss-badge-green' : 'jss-badge-yellow'}`}>
              {ref.status === 'pending' ? 'Pending' : 'Berhasil'}
            </span>
          </div>
        ))
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}
