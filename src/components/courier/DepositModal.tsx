'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Copy, Check, Upload, X, ArrowUpRight, Phone, ShieldCheck, Clock, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { courierService } from '@/services/courierService';
import { formatCurrency } from '@/lib/utils';
import type { DepositRequest } from '@/types';

interface DepositModalProps {
  courierId: string;
  currentBalance: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function DepositModal({ courierId, currentBalance, onSuccess, onClose }: DepositModalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [amount, setAmount] = useState<number>(20000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<DepositRequest | null>(null);
  const [history, setHistory] = useState<DepositRequest[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adminDanaNumber = '088286557710';
  const adminName = 'Admin JSS (DANA)';

  useEffect(() => {
    courierService.getCourierDepositRequests(courierId).then(setHistory);
  }, [courierId, createdRequest]);

  const handleCopy = () => {
    navigator.clipboard.writeText(adminDanaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const finalAmount = customAmount ? parseInt(customAmount, 10) || 0 : amount;

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const max = 800;
        if (width > max || height > max) {
          if (width > height) {
            height = Math.round((height * max) / width);
            width = max;
          } else {
            width = Math.round((width * max) / height);
            height = max;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      const compressed = await compressImage(raw);
      setProofPreview(compressed);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDeposit = async () => {
    if (finalAmount < 2000 || !proofPreview) return;
    setSubmitting(true);
    try {
      const compressed = await compressImage(proofPreview);
      const req = await courierService.createDepositRequest(
        courierId,
        'Kurir JSS Kalirejo',
        '088286557710',
        finalAmount,
        compressed
      );
      setCreatedRequest(req);
      onSuccess();
    } catch (err) {
      console.error('Gagal mengirim deposit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const presetAmounts = [10000, 20000, 50000, 100000];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="w-full max-w-md bg-secondary-900 rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-secondary-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Top Up Deposit Kurir</h3>
              <p className="text-white/40 text-xs">Saldo saat ini: <span className="text-primary font-semibold">{formatCurrency(currentBalance)}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 bg-secondary-800/50 p-1">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'form' ? 'bg-primary text-secondary-900 shadow-golden' : 'text-white/40 hover:text-white'
            }`}
          >
            ➕ Form Top Up
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'history' ? 'bg-primary text-secondary-900 shadow-golden' : 'text-white/40 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Riwayat Deposit</span>
            {history.filter(h => h.status === 'pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'history' ? (
            <div className="space-y-3">
              <p className="text-white/60 text-xs font-semibold">Riwayat Pengajuan Top Up Deposit</p>
              {history.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-xs">Belum ada pengajuan deposit</div>
              ) : (
                history.map(req => (
                  <div key={req.id} className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-primary">{req.referenceNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        req.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {req.status === 'approved' ? '🟢 Disetujui Admin' :
                         req.status === 'rejected' ? '🔴 Ditolak Admin' :
                         '🟡 Menunggu Verifikasi'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-white/60">Nominal Transfer:</span>
                      <span className="text-white font-extrabold">{formatCurrency(req.amount)}</span>
                    </div>

                    <p className="text-[10px] text-white/30">
                      Waktu: {new Date(req.createdAt).toLocaleString('id-ID')}
                    </p>

                    {req.rejectionReason && (
                      <p className="text-red-400 text-xs bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                        Alasan penolakan: {req.rejectionReason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : createdRequest ? (
            <div className="text-center py-4 space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                <Clock className="w-8 h-8 text-amber-400" />
              </motion.div>
              <div>
                <h3 className="text-white font-bold text-lg">Permintaan Deposit Terkirim!</h3>
                <p className="text-amber-400 font-mono text-xs font-bold mt-1">Ref: {createdRequest.referenceNumber}</p>
                <p className="text-white/60 text-xs mt-2 leading-relaxed">
                  Data pengajuan deposit <span className="text-primary font-bold">{formatCurrency(createdRequest.amount)}</span> dan bukti transfer Anda telah masuk ke <span className="text-white font-semibold">Dashboard Admin</span>.
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Status Verifikasi:</span>
                  <span className="text-amber-400 font-bold">🟡 Menunggu Verifikasi Admin</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">DANA Admin:</span>
                  <span className="text-primary font-bold font-mono">{adminDanaNumber}</span>
                </div>
                <p className="text-white/40 text-[11px] pt-1 border-t border-white/5">
                  🔒 Saldo Anda akan bertambah secara otomatis begitu Admin menekan tombol <strong className="text-emerald-400">Approve</strong>.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setCreatedRequest(null)}
                  className="w-full py-3 bg-primary rounded-xl font-bold text-secondary-900 text-xs shadow-golden"
                >
                  Buat Pengajuan Baru
                </button>
                <a
                  href={`https://wa.me/6288286557710?text=Halo%20Admin%20JSS,%20saya%20sudah%20mengirim%20bukti%20transfer%20deposit%20Rp%20${createdRequest.amount.toLocaleString('id-ID')}%20(Ref:%20${createdRequest.referenceNumber})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Konfirmasi Langsung ke WhatsApp Admin (088286557710)
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Security Banner */}
              <div className="bg-gradient-to-r from-primary/10 to-amber-500/10 rounded-2xl p-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="text-white font-bold">Prosedur Aman Top Up Deposit:</p>
                    <p className="text-white/70">
                      1. Transfer ke DANA Admin <span className="text-primary font-bold">088286557710</span>.<br />
                      2. Upload foto/screenshot Bukti Transfer.<br />
                      3. Admin akan memverifikasi dan menyetujui pengajuan saldo Anda.
                    </p>
                  </div>
                </div>
              </div>

              {/* DANA Admin Info */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold">Tujuan Transfer DANA Admin</p>
                <div className="flex items-center justify-between bg-black/30 rounded-xl p-3 border border-white/5">
                  <div>
                    <p className="text-primary font-mono font-bold text-lg leading-tight">{adminDanaNumber}</p>
                    <p className="text-white/60 text-xs mt-0.5">{adminName}</p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-bold transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin DANA'}</span>
                  </button>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <p className="text-white/70 text-xs font-semibold mb-2">Pilih Nominal Deposit</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {presetAmounts.map(val => (
                    <button
                      key={val}
                      onClick={() => { setAmount(val); setCustomAmount(''); }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        amount === val && !customAmount
                          ? 'bg-primary text-secondary-900 border-primary shadow-golden'
                          : 'bg-white/5 text-white/70 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {formatCurrency(val)}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Atau ketik nominal lain (Min Rp 2.000)..."
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-primary"
                />
              </div>

              {/* Required Upload Proof */}
              <div>
                <p className="text-white/70 text-xs font-semibold mb-2 flex items-center justify-between">
                  <span>Upload Bukti Transfer DANA (Wajib)</span>
                  <span className="text-amber-400 text-[10px]">JPG / PNG / Screenshot</span>
                </p>

                {proofPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-primary/30">
                    <img src={proofPreview} alt="Bukti Transfer" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => setProofPreview(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-white/20 hover:border-primary/50 rounded-2xl flex flex-col items-center justify-center gap-2 bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-white/60 text-xs font-medium">Ketuk untuk pilih foto / screenshot transfer</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Total Summary & Submit */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/60 text-xs">Total Pengajuan Deposit</span>
                  <span className="text-primary font-extrabold text-lg">{formatCurrency(finalAmount)}</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmitDeposit}
                  disabled={submitting || finalAmount < 2000 || !proofPreview}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-amber-400 rounded-2xl font-bold text-secondary-900 flex items-center justify-center gap-2 shadow-golden disabled:opacity-30"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-secondary-900/30 border-t-secondary-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Kirim Pengajuan ke Admin</span>
                    </>
                  )}
                </motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
