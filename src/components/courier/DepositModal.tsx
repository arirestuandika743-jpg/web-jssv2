'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Copy, Check, Upload, X, ArrowUpRight, Phone, ShieldCheck } from 'lucide-react';
import { courierService } from '@/services/courierService';
import { formatCurrency } from '@/lib/utils';

interface DepositModalProps {
  courierId: string;
  currentBalance: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function DepositModal({ courierId, currentBalance, onSuccess, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState<number>(20000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const adminDanaNumber = '088286557710';
  const adminName = 'Admin JSS (DANA)';

  const handleCopy = () => {
    navigator.clipboard.writeText(adminDanaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const finalAmount = customAmount ? parseInt(customAmount, 10) || 0 : amount;

  const handleSubmitDeposit = async () => {
    if (finalAmount < 2000) return;
    setSubmitting(true);
    try {
      await courierService.topUpDeposit(courierId, finalAmount);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
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
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="w-full max-w-md bg-secondary-900 rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
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

        {success ? (
          <div className="p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h3 className="text-white font-bold text-xl mb-1">Deposit Berhasil!</h3>
            <p className="text-white/60 text-sm">Saldo sebesar <span className="text-primary font-bold">{formatCurrency(finalAmount)}</span> telah ditambahkan.</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Instruction Banner */}
            <div className="bg-gradient-to-r from-primary/10 to-amber-500/10 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="text-white font-bold">Ketentuan Deposit Order JSS:</p>
                  <p className="text-white/70">
                    Setiap orderan dipotong komisi sebesar <span className="text-primary font-bold">Rp 2.000</span> untuk Admin.
                    Pastikan saldo deposit minimal <span className="text-emerald-400 font-bold">Rp 2.000</span> untuk bisa mengambil order.
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

            {/* Total Summary & Submit */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/60 text-xs">Total Deposit Ditambahkan</span>
                <span className="text-primary font-extrabold text-lg">{formatCurrency(finalAmount)}</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmitDeposit}
                disabled={submitting || finalAmount < 2000}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-amber-400 rounded-2xl font-bold text-secondary-900 flex items-center justify-center gap-2 shadow-golden disabled:opacity-30"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-secondary-900/30 border-t-secondary-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Konfirmasi Top Up Deposit</span>
                  </>
                )}
              </motion.button>
              <a
                href={`https://wa.me/6288286557710?text=Halo%20Admin%20JSS,%20saya%20mau%20konfirmasi%20deposit%20saldo%20kurir%20sebesar%20${formatCurrency(finalAmount)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                Konfirmasi via WhatsApp Admin (088286557710)
              </a>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
