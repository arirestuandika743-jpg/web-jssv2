'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, Package, Truck, Camera, KeyRound, Loader2 } from 'lucide-react';
import { courierService } from '@/services/courierService';
import type { CourierOrderStatus, OrderStatus } from '@/types';
import PhotoProof from './PhotoProof';
import OTPVerification from './OTPVerification';

interface OrderStatusFlowProps {
  orderId: string;
  currentStatus: OrderStatus;
  courierId: string;
  onComplete: () => void;
}

const STEPS: { key: CourierOrderStatus; label: string; icon: React.ReactNode; emoji: string }[] = [
  { key: 'accepted', label: 'Diterima', icon: <Check className="w-4 h-4" />, emoji: '📥' },
  { key: 'heading_to_pickup', label: 'Menuju Lokasi', icon: <MapPin className="w-4 h-4" />, emoji: '🚶' },
  { key: 'item_picked_up', label: 'Barang Diambil', icon: <Package className="w-4 h-4" />, emoji: '📦' },
  { key: 'delivering', label: 'Mengantar', icon: <Truck className="w-4 h-4" />, emoji: '🏍️' },
  { key: 'completed', label: 'Selesai', icon: <Check className="w-4 h-4" />, emoji: '✅' },
];

// Map main order status to courier step index
function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'accepted': return 0;
    case 'driver_going': return 1;
    case 'shopping': return 2;
    case 'delivering': return 3;
    case 'completed': return 4;
    default: return 0;
  }
}

export default function OrderStatusFlow({ orderId, currentStatus, courierId, onComplete }: OrderStatusFlowProps) {
  const [currentStep, setCurrentStep] = useState(getStepIndex(currentStatus));
  const [loading, setLoading] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    setCurrentStep(getStepIndex(currentStatus));
  }, [currentStatus]);

  const handleNextStep = async () => {
    const nextStep = currentStep + 1;
    if (nextStep >= STEPS.length) return;

    const nextStatus = STEPS[nextStep].key;

    // If moving to 'completed', require photo + OTP first
    if (nextStatus === 'completed') {
      if (!photoUploaded) {
        setShowPhotoUpload(true);
        return;
      }
      if (!otpVerified) {
        setShowOTP(true);
        return;
      }
    }

    setLoading(true);
    try {
      await courierService.updateOrderCourierStatus(orderId, nextStatus);
      setCurrentStep(nextStep);

      // If delivering, generate OTP for customer
      if (nextStatus === 'delivering') {
        await courierService.generateOTP(orderId);
      }

      if (nextStatus === 'completed') {
        onComplete();
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUploaded = async (photoUrl: string) => {
    await courierService.uploadProof(orderId, photoUrl);
    setPhotoUploaded(true);
    setShowPhotoUpload(false);
    // Now show OTP
    if (!otpVerified) {
      setShowOTP(true);
    }
  };

  const handleOTPVerified = () => {
    setOtpVerified(true);
    setShowOTP(false);
    // Now complete the order
    handleCompleteOrder();
  };

  const handleCompleteOrder = async () => {
    setLoading(true);
    try {
      await courierService.updateOrderCourierStatus(orderId, 'completed');
      setCurrentStep(4);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Photo Upload Modal */}
      <AnimatePresence>
        {showPhotoUpload && (
          <PhotoProof
            onUpload={handlePhotoUploaded}
            onClose={() => setShowPhotoUpload(false)}
          />
        )}
      </AnimatePresence>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOTP && (
          <OTPVerification
            orderId={orderId}
            onVerified={handleOTPVerified}
            onClose={() => setShowOTP(false)}
          />
        )}
      </AnimatePresence>

      {/* Step Progress */}
      <div className="flex items-center gap-1 mb-3">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className={`
              w-full h-1.5 rounded-full transition-all duration-500
              ${i <= currentStep ? 'bg-primary' : 'bg-white/10'}
            `} />
          </div>
        ))}
      </div>

      {/* Current Step Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{STEPS[currentStep]?.emoji}</span>
          <span className="text-white/70 text-xs font-semibold">{STEPS[currentStep]?.label}</span>
        </div>

        {/* Next Step Button */}
        {currentStep < STEPS.length - 1 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleNextStep}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary rounded-xl text-secondary-900 text-xs font-bold disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                {currentStep === STEPS.length - 2 ? (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Selesaikan</span>
                  </>
                ) : (
                  <>
                    <span>{STEPS[currentStep + 1]?.emoji} {STEPS[currentStep + 1]?.label}</span>
                  </>
                )}
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
