'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, MapPin, X } from 'lucide-react';
import { courierService } from '@/services/courierService';
import { notificationService } from '@/services/notificationService';

interface PanicButtonProps {
  courierId: string;
  courierName: string;
  activeOrderId?: string;
}

export default function PanicButton({ courierId, courierName, activeOrderId }: PanicButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handlePanic = async () => {
    setSending(true);
    try {
      let location = { lat: -5.2818, lng: 104.9833 };

      // Try to get real location
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch {}
      }

      await courierService.triggerPanic(courierId, courierName, location, activeOrderId);
      await notificationService.sendPanicNotification(courierName, { location, courierId, activeOrderId });

      setSent(true);
      setTimeout(() => {
        setSent(false);
        setShowConfirm(false);
      }, 3000);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Panic Trigger Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowConfirm(true)}
        className="w-full py-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-2 text-red-400 font-semibold text-sm"
      >
        <AlertTriangle className="w-4 h-4" />
        🚨 PANIC BUTTON
      </motion.button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm mx-4 bg-secondary-800 rounded-3xl overflow-hidden"
            >
              {sent ? (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <span className="text-4xl">🚨</span>
                  </motion.div>
                  <h3 className="text-white font-bold text-lg mb-2">Sinyal Darurat Terkirim!</h3>
                  <p className="text-white/50 text-sm">
                    Tim admin telah menerima lokasi Anda. Tetap tenang dan tunggu bantuan.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-6 text-center">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">Tombol Darurat</h3>
                    <p className="text-white/50 text-sm mb-2">
                      Ini akan mengirimkan sinyal darurat ke admin beserta lokasi GPS Anda saat ini.
                    </p>
                    <p className="text-red-400/80 text-xs font-medium">
                      Gunakan hanya dalam keadaan darurat.
                    </p>
                  </div>

                  <div className="px-6 pb-6 space-y-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handlePanic}
                      disabled={sending}
                      className="w-full py-3.5 bg-red-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5" />
                          <span>KIRIM SINYAL DARURAT</span>
                        </>
                      )}
                    </motion.button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="w-full py-3 text-white/40 text-sm font-medium"
                    >
                      Batal
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
