'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, CheckCircle2, XCircle, Clock, Eye, X, Phone,
  Search, ShieldCheck, AlertCircle, RefreshCw, FileText
} from 'lucide-react';
import { courierService } from '@/services/courierService';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { FadeIn } from '@/components/layout/PageTransition';
import type { DepositRequest, DepositStatus } from '@/types';

export default function AdminDepositsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | DepositStatus>('pending');
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<DepositRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const adminName = user?.name || 'Admin JSS';
  const adminId = user?.id || 'admin-id-123';

  const loadRequests = async () => {
    try {
      const data = await courierService.getDepositRequests();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (request: DepositRequest) => {
    setActionLoading(request.id);
    try {
      await courierService.approveDepositRequest(request.id, adminId, adminName);
      await loadRequests();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingRequest || !rejectionReason.trim()) return;
    setActionLoading(rejectingRequest.id);
    try {
      await courierService.rejectDepositRequest(
        rejectingRequest.id,
        adminId,
        adminName,
        rejectionReason.trim()
      );
      setRejectingRequest(null);
      setRejectionReason('');
      await loadRequests();
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Proof Photo Viewer Modal */}
      <AnimatePresence>
        {selectedProof && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedProof(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-xl w-full bg-secondary-900 rounded-3xl overflow-hidden border border-white/20 p-2 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <span className="text-white text-xs font-bold">📷 Bukti Transfer Deposit DANA</span>
                <button onClick={() => setSelectedProof(null)} className="p-1 rounded-lg bg-white/10 text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 flex items-center justify-center max-h-[75vh] overflow-auto">
                <img src={selectedProof} alt="Bukti Transfer" className="max-w-full max-h-[70vh] rounded-2xl object-contain" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {rejectingRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-card p-6 max-w-md w-full shadow-soft-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
                <h3 className="font-bold text-secondary-900 text-base">Tolak Pengajuan Deposit</h3>
                <button onClick={() => setRejectingRequest(null)} className="text-secondary-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <p className="text-secondary-500 text-xs mb-1">Kurir: <strong className="text-secondary-900">{rejectingRequest.courierName}</strong></p>
                <p className="text-secondary-500 text-xs mb-3">Nominal: <strong className="text-primary-700">{formatCurrency(rejectingRequest.amount)}</strong> (Ref: {rejectingRequest.referenceNumber})</p>
                <label className="text-xs font-bold text-secondary-700 block mb-1">Alasan Penolakan (Wajib)</label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Contoh: Bukti transfer tidak terpotong jelas / nominal tidak sesuai DANA Admin..."
                  rows={3}
                  className="w-full px-3 py-2 border border-secondary-200 rounded-xl text-xs outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setRejectingRequest(null)}
                  className="flex-1 py-2.5 border border-secondary-200 rounded-xl text-xs font-semibold text-secondary-500"
                >
                  Batal
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectionReason.trim() || !!actionLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-xs disabled:opacity-50"
                >
                  Tolak Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-3">
              <span>💳 Verifikasi Deposit Kurir</span>
              {pendingCount > 0 && (
                <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-extrabold shadow-sm animate-pulse">
                  {pendingCount} Menunggu Verifikasi
                </span>
              )}
            </h1>
            <p className="text-secondary-500 text-sm mt-1">Verifikasi bukti transfer DANA (088286557710) sebelum saldo bertambah</p>
          </div>
          <button
            onClick={loadRequests}
            className="flex items-center gap-2 px-4 py-2 bg-secondary-50 hover:bg-secondary-100 rounded-xl text-xs font-bold text-secondary-700 border border-secondary-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>
      </FadeIn>

      {/* Filter Tabs */}
      <div className="flex bg-secondary-50 p-1.5 rounded-2xl w-fit border border-secondary-200">
        {[
          { key: 'pending', label: `Menunggu (${pendingCount})`, icon: Clock },
          { key: 'approved', label: 'Disetujui', icon: CheckCircle2 },
          { key: 'rejected', label: 'Ditolak', icon: XCircle },
          { key: 'all', label: 'Semua Status', icon: FileText },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === tab.key
                ? 'bg-white shadow-soft text-secondary-900'
                : 'text-secondary-500 hover:text-secondary-800'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-white rounded-card shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
            <p className="text-secondary-400 text-xs">Memuat data pengajuan deposit...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-secondary-400 text-sm">
            Tidak ada pengajuan deposit dengan status ini.
          </div>
        ) : (
          <div className="divide-y divide-secondary-50">
            {filteredRequests.map(req => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-secondary-50/50 transition-colors"
              >
                {/* Courier & Request Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Proof Thumbnail */}
                  <div
                    onClick={() => setSelectedProof(req.proofUrl)}
                    className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary-100 border border-secondary-200 flex-shrink-0 cursor-pointer group shadow-sm"
                  >
                    <img src={req.proofUrl} alt="Bukti Transfer" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-secondary-900 text-base">{req.courierName}</h4>
                      <span className="text-xs font-mono bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-md font-semibold">
                        {req.referenceNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-secondary-500">
                      <span>📱 {req.courierPhone || '088286557710'}</span>
                      <span>•</span>
                      <span>Waktu: {new Date(req.createdAt).toLocaleString('id-ID')}</span>
                    </div>

                    {req.verifiedBy && (
                      <p className="text-[11px] text-secondary-400 italic">
                        Diverifikasi oleh <strong className="text-secondary-700">{req.verifiedBy}</strong> pada {new Date(req.verifiedAt || '').toLocaleString('id-ID')}
                      </p>
                    )}

                    {req.rejectionReason && (
                      <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                        Alasan ditolak: {req.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount & Status / Actions */}
                <div className="flex flex-col md:items-end gap-3 min-w-[200px]">
                  <div className="text-left md:text-right">
                    <p className="text-secondary-400 text-xs">Nominal Transfer</p>
                    <p className="text-2xl font-black text-secondary-900">{formatCurrency(req.amount)}</p>
                  </div>

                  {req.status === 'pending' ? (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => handleApprove(req)}
                        disabled={actionLoading === req.id}
                        className="flex-1 md:flex-initial px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {actionLoading === req.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>Approve (Tambah Saldo)</span>
                      </button>

                      <button
                        onClick={() => setRejectingRequest(req)}
                        disabled={actionLoading === req.id}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {req.status === 'approved' ? '🟢 Disetujui (Saldo Bertambah)' : '🔴 Ditolak (Saldo Tetap)'}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
