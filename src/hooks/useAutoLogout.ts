'use client';

import { useEffect, useRef, useCallback } from 'react';
import { courierService } from '@/services/courierService';

interface UseAutoLogoutOptions {
  courierId: string;
  enabled: boolean;
  timeoutMs?: number;       // Default 30 minutes
  warningMs?: number;       // Warning 5 minutes before
  onWarning?: () => void;
  onLogout?: () => void;
}

export function useAutoLogout({
  courierId,
  enabled,
  timeoutMs = 30 * 60 * 1000,  // 30 minutes
  warningMs = 25 * 60 * 1000,  // 25 minutes (5 min before logout)
  onWarning,
  onLogout,
}: UseAutoLogoutOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    if (!enabled) return;

    // Set warning timer
    warningRef.current = setTimeout(() => {
      onWarning?.();
    }, warningMs);

    // Set logout timer
    timerRef.current = setTimeout(async () => {
      await courierService.updateCourierStatus(courierId, 'offline');
      await courierService.endShift(courierId);
      onLogout?.();
    }, timeoutMs);
  }, [courierId, enabled, timeoutMs, warningMs, onWarning, onLogout]);

  useEffect(() => {
    if (!enabled) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => resetTimer();
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [enabled, resetTimer]);

  return { resetTimer };
}
