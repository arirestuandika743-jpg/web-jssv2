'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Plus, Copy, Trash2, XCircle, CheckCircle, RefreshCw, Filter } from 'lucide-react';
import { promoService } from '@/services/promoService';
import type { PromoCode, PromoCodeStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [discountAmount, setDiscountAmount] = useState<number>(5000);
  const [winnerName, setWinnerName] = useState('');
  const [winnerWhatsapp, setWinnerWhatsapp] = useState('');
  const [maxUsage, setMaxUsage] = useState(1);
  const [expiresAt, setExpiresAt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeType, setCodeType] = useState<'standard' | 'unique'>('standard');

  useEffect(() => {
    loadPromos();
    // Default expiration to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setExpiresAt(nextWeek.toISOString().slice(0, 16));
  }, []);

  const loadPromos = async () => {
    setIsLoading(true);
    try {
      const data = await promoService.getPromoCodes();
      setPromos(data);
    } catch (error) {
      toast.error('Gagal memuat data kode promo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateClick = () => {
    const code = promoService.generateCodeString(codeType);
    setGeneratedCode(code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedCode) {
      toast.error('Silakan generate kode promo terlebih dahulu!');
      return;
    }
    if (!winnerName) {
      toast.error('Nama pemenang/pelanggan harus diisi!');
      return;
    }
    if (!expiresAt) {
      toast.error('Tanggal kedaluwarsa harus diisi!');
      return;
    }

    try {
      const newPromo = await promoService.createPromoCode({
        code: generatedCode,
        discountAmount,
        winnerName,
        winnerWhatsapp: winnerWhatsapp || undefined,
        expiresAt: new Date(expiresAt).toISOString(),
        maxUsage
      });

      setPromos([newPromo, ...promos]);
      toast.success('Kode promo berhasil dibuat!');
      
      // Reset form
      setGeneratedCode('');
      setWinnerName('');
      setWinnerWhatsapp('');
      setMaxUsage(1);
      setShowForm(false);
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan kode promo.');
    }
  };

  const handleStatusToggle = async (promo: PromoCode) => {
    if (promo.status === 'used' || promo.status === 'expired') {
      toast.error('Status tidak bisa diubah untuk kode yang sudah digunakan/kedaluwarsa.');
      return;
    }

    const newStatus: PromoCodeStatus = promo.status === 'active' ? 'revoked' : 'active';
    try {
      const success = await promoService.updatePromoStatus(promo.id, newStatus);
      if (success) {
        setPromos(promos.map(p => p.id === promo.id ? { ...p, status: newStatus } : p));
        toast.success(`Kode promo ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}!`);
      }
    } catch (error) {
      toast.error('Gagal mengubah status promo.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus permanen kode promo ini?')) {
      try {
        const success = await promoService.deletePromoCode(id);
        if (success) {
          setPromos(promos.filter(p => p.id !== id));
          toast.success('Kode promo berhasil dihapus!');
        }
      } catch (error) {
        toast.error('Gagal menghapus promo.');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kode promo disalin ke clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-secondary-900 flex items-center gap-3">
            <Gift className="w-8 h-8 text-primary" />
            Promo Giveaway
          </h1>
          <p className="text-sm text-secondary-500 mt-1">
            Kelola kode promo untuk giveaway atau diskon khusus pelanggan.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary-900 text-white px-5 py-2.5 rounded-button font-bold text-sm hover:bg-secondary-800 transition-colors flex items-center gap-2 shadow-golden"
        >
          {showForm ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Batal' : 'Buat Kode Promo'}
        </button>
      </div>

      {/* Form Tambah Promo */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-secondary-200 p-6 rounded-2xl shadow-soft">
              <h2 className="text-lg font-bold text-secondary-900 mb-4 border-b border-secondary-100 pb-3">Form Pembuatan Kode Promo</h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nominal Diskon */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-secondary-700 uppercase">Nominal Diskon</label>
                  <select
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-button text-sm font-bold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value={5000}>Rp 5.000</option>
                    <option value={10000}>Rp 10.000</option>
                    <option value={15000}>Rp 15.000</option>
                    <option value={20000}>Rp 20.000</option>
                  </select>
                </div>

                {/* Tipe Kode */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-secondary-700 uppercase">Format Kode Promo</label>
                  <select
                    value={codeType}
                    onChange={(e) => setCodeType(e.target.value as 'standard' | 'unique')}
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="standard">Standar (e.g., JSS-A1B2-C3D4)</option>
                    <option value="unique">Unik Ekstra (e.g., JSS-A1B2-C3D4-E5F6)</option>
                  </select>
                </div>

                {/* Nama Pemenang */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-secondary-700 uppercase">Nama Pemenang / Pelanggan *</label>
                  <input
                    type="text"
                    required
                    value={winnerName}
                    onChange={(e) => setWinnerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                {/* Nomor WA (Opsional) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-secondary-700 uppercase">No. WhatsApp (Opsional)</label>
                  <input
                    type="text"
                    value={winnerWhatsapp}
                    onChange={(e) => setWinnerWhatsapp(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                  <p className="text-[10px] text-secondary-500">Jika diisi, kode ini hanya bisa dipakai oleh nomor WA tersebut saat order.</p>
                </div>

                {/* Batas Penggunaan */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-secondary-700 uppercase">Batas Maksimal Penggunaan *</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                {/* Kedaluwarsa */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-secondary-700 uppercase">Berlaku Sampai *</label>
                  <input
                    type="datetime-local"
                    required
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                {/* Generate Button & Result */}
                <div className="md:col-span-2 p-4 bg-secondary-50 border border-secondary-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  <button
                    type="button"
                    onClick={handleGenerateClick}
                    className="w-full sm:w-auto bg-primary text-secondary-900 px-5 py-3 rounded-button font-bold text-sm hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Generate Kode Unik
                  </button>

                  <div className="flex-1 w-full relative">
                    <input
                      type="text"
                      readOnly
                      placeholder="Klik Generate..."
                      value={generatedCode}
                      className="w-full pl-4 pr-12 py-3 bg-white border-2 border-dashed border-secondary-300 rounded-button text-lg font-black text-center text-secondary-900 tracking-widest focus:outline-none"
                    />
                    {generatedCode && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedCode)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-secondary-100 hover:bg-secondary-200 rounded-lg text-secondary-700 transition-colors"
                        title="Salin Kode"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="md:col-span-2 pt-2 border-t border-secondary-100 flex justify-end">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-secondary-900 text-white px-8 py-3 rounded-button font-bold hover:bg-secondary-800 transition-colors shadow-golden"
                  >
                    Simpan & Aktifkan Promo
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabel Promo */}
      <div className="bg-white border border-secondary-200 rounded-2xl shadow-soft overflow-hidden">
        <div className="p-4 border-b border-secondary-100 flex items-center justify-between bg-secondary-50/50">
          <h2 className="font-bold text-secondary-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary-500" />
            Daftar Kode Promo
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-50/80 border-b border-secondary-200">
                <th className="p-4 text-xs font-black text-secondary-600 uppercase tracking-wider">Kode Promo</th>
                <th className="p-4 text-xs font-black text-secondary-600 uppercase tracking-wider">Pemenang</th>
                <th className="p-4 text-xs font-black text-secondary-600 uppercase tracking-wider">Diskon</th>
                <th className="p-4 text-xs font-black text-secondary-600 uppercase tracking-wider">Penggunaan</th>
                <th className="p-4 text-xs font-black text-secondary-600 uppercase tracking-wider">Berlaku Sampai</th>
                <th className="p-4 text-xs font-black text-secondary-600 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-black text-secondary-600 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-secondary-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Memuat data...
                  </td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-secondary-500 font-medium">
                    Belum ada kode promo giveaway.
                  </td>
                </tr>
              ) : (
                promos.map((promo) => (
                  <tr key={promo.id} className="border-b border-secondary-100 hover:bg-secondary-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm tracking-wide text-secondary-900 bg-secondary-100 px-2.5 py-1 rounded-md">
                          {promo.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(promo.code)}
                          className="text-secondary-400 hover:text-primary transition-colors"
                          title="Salin"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-sm text-secondary-900">{promo.winnerName}</div>
                      {promo.winnerWhatsapp && (
                        <div className="text-[11px] font-medium text-secondary-500 mt-0.5">WA: {promo.winnerWhatsapp}</div>
                      )}
                    </td>
                    <td className="p-4 font-black text-sm text-emerald-600">
                      {formatCurrency(promo.discountAmount)}
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-secondary-700">
                        {promo.usageCount} <span className="text-secondary-400 font-normal">/ {promo.maxUsage}</span>
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-secondary-700">
                      {format(new Date(promo.expiresAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </td>
                    <td className="p-4">
                      {promo.status === 'active' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" /> Aktif
                        </span>
                      )}
                      {promo.status === 'used' && (
                        <span className="inline-flex items-center gap-1 bg-secondary-200 text-secondary-700 border border-secondary-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Habis Dipakai
                        </span>
                      )}
                      {promo.status === 'expired' && (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Kedaluwarsa
                        </span>
                      )}
                      {promo.status === 'revoked' && (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <XCircle className="w-3 h-3" /> Dinonaktifkan
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Status (Active / Revoked) */}
                        {(promo.status === 'active' || promo.status === 'revoked') && (
                          <button
                            onClick={() => handleStatusToggle(promo)}
                            className={`p-2 rounded-button text-white transition-colors ${
                              promo.status === 'active' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'
                            }`}
                            title={promo.status === 'active' ? 'Nonaktifkan Kode' : 'Aktifkan Kode'}
                          >
                            {promo.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 rounded-button bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
