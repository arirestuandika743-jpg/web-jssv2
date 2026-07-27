'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { courierService } from '@/services/courierService';
import { MAP_CENTER } from '@/lib/constants';
import type { LatLng } from '@/types';

interface UseGPSTrackingOptions {
  courierId: string;
  enabled: boolean;
  intervalMs?: number;
}

export function useGPSTracking({ courierId, enabled, intervalMs = 5000 }: UseGPSTrackingOptions) {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendLocation = useCallback(async (pos: GeolocationPosition) => {
    const loc: LatLng = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };
    setLocation(loc);

    await courierService.updateLocation(courierId, loc, {
      speed: pos.coords.speed || undefined,
      heading: pos.coords.heading || undefined,
      accuracy: pos.coords.accuracy,
    });
  }, [courierId]);

  const simulateMovement = useCallback(() => {
    // Demo: simulate GPS movement around Kalirejo
    let lat: number = MAP_CENTER.lat;
    let lng: number = MAP_CENTER.lng;

    intervalRef.current = setInterval(() => {
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;
      const loc = { lat, lng };
      setLocation(loc);
      courierService.updateLocation(courierId, loc, {
        speed: Math.random() * 30,
        accuracy: 10,
      });
    }, intervalMs);
    setTracking(true);
  }, [courierId, intervalMs]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser Anda');
      // Fallback: simulate movement for demo
      simulateMovement();
      return;
    }

    setTracking(true);
    setError(null);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => sendLocation(pos),
      (err) => {
        console.warn('GPS error, using simulation:', err.message);
        simulateMovement();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Watch position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos),
      (err) => {
        setError(err.message);
        simulateMovement();
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }, [sendLocation, simulateMovement]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTracking(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [enabled, startTracking, stopTracking]);

  return { location, error, tracking };
}
