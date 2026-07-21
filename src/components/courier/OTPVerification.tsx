'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, X, AlertCircle, Check } from 'lucide-react';
import { courierService } from '@/services/courierService';

interface OTPVerificationProps {
  orderId: string;
  onVerified: () => void;
  onClose: () => void;
}

export default function OTPVerification({ orderId, onVerified, onClose }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (index === 3 && value) {
      const fullOtp = [...newOtp.slice(0, 3), value.slice(-1)].join('');
      if (fullOtp.length === 4) {
        verifyOTP(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (code: string) => {
    setVerifying(true);
    setError('');
    try {
      const isValid = await courierService.verifyOTP(orderId, code);
      if (isValid) {
        setSuccess(true);
        setTimeout(() => {
          onVerified();
        }, 1000);
      } else {
        setError('Kode OTP salah. Silakan coba lagi.');
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-sm flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm mx-4 bg-secondary-800 rounded-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            <h3 className="text-white font-bold">Verifikasi OTP</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {success ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="py-8"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-bold text-lg">OTP Terverifikasi!</p>
            </motion.div>
          ) : (
            <>
              <p className="text-white/50 text-sm mb-6">
                Masukkan kode OTP 4 digit dari customer untuk menyelesaikan order.
              </p>

              {/* OTP Input */}
              <div className="flex items-center justify-center gap-3 mb-4">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleInput(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className={`
                      w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 
                      bg-white/5 text-white outline-none transition-all
                      ${error ? 'border-red-500/50' : digit ? 'border-primary/50' : 'border-white/10'}
                      focus:border-primary focus:ring-2 focus:ring-primary/20
                    `}
                    disabled={verifying}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-red-400 text-sm mb-4"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Loading */}
              {verifying && (
                <div className="flex items-center justify-center gap-2 text-primary text-sm">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
