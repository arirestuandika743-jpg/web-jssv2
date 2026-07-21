'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, X, ThumbsDown, Check } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';

interface RatingFormProps {
  orderId: string;
  courierId: string;
  customerId: string;
  customerName: string;
  onSubmit: () => void;
  onClose: () => void;
}

const LOW_RATING_REASONS = [
  'Kurir terlambat',
  'Barang rusak',
  'Kurir tidak sopan',
  'Tidak sesuai pesanan',
  'Terlalu lama menunggu',
  'Lainnya',
];

export default function RatingForm({
  orderId, courierId, customerId, customerName, onSubmit, onClose,
}: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    
    await analyticsService.submitRating(
      orderId, courierId, customerId, customerName,
      rating, review || undefined, reasons.length > 0 ? reasons : undefined
    );

    setSubmitted(true);
    setTimeout(() => {
      onSubmit();
    }, 1500);
    setSubmitting(false);
  };

  const toggleReason = (reason: string) => {
    setReasons(prev =>
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-soft-xl mx-0 sm:mx-4"
      >
        {submitted ? (
          <div className="p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-secondary-900 font-bold text-lg">Terima Kasih!</h3>
              <p className="text-secondary-400 text-sm mt-1">Rating Anda telah disimpan</p>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-100">
              <h3 className="text-secondary-900 font-bold">Beri Rating</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary-50 flex items-center justify-center">
                <X className="w-4 h-4 text-secondary-400" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Stars */}
              <div className="text-center">
                <p className="text-secondary-500 text-sm mb-3">Bagaimana pengalaman Anda?</p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <motion.button
                      key={n}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          n <= (hoverRating || rating)
                            ? 'text-primary fill-primary'
                            : 'text-secondary-200'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-secondary-400 text-xs mt-2">
                    {rating === 5 ? '⭐ Sangat Puas!' : rating === 4 ? '😊 Puas' : rating === 3 ? '😐 Biasa' : rating === 2 ? '😕 Kurang' : '😞 Tidak Puas'}
                  </p>
                )}
              </div>

              {/* Low rating reasons */}
              <AnimatePresence>
                {rating > 0 && rating <= 3 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <p className="text-secondary-700 text-sm font-semibold mb-2">Apa yang bisa diperbaiki?</p>
                    <div className="flex flex-wrap gap-2">
                      {LOW_RATING_REASONS.map(reason => (
                        <button
                          key={reason}
                          onClick={() => toggleReason(reason)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            reasons.includes(reason)
                              ? 'bg-primary/10 border-primary text-primary-700'
                              : 'border-secondary-200 text-secondary-400 hover:border-secondary-300'
                          }`}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Review */}
              <div>
                <textarea
                  value={review}
                  onChange={e => setReview(e.target.value)}
                  placeholder="Tulis ulasan singkat (opsional)..."
                  rows={3}
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl text-sm outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className="w-full py-3.5 bg-primary rounded-xl font-bold text-secondary-900 flex items-center justify-center gap-2 disabled:opacity-30"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-secondary-900/30 border-t-secondary-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Rating</span>
                  </>
                )}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
