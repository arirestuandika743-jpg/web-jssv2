'use client';

import { useState, useCallback } from 'react';
import { calculateDeliveryPrice } from '@/services/pricing';
import type { LatLng, DeliveryPricing } from '@/types';

// In-memory cache for OSRM routes to prevent duplicate network calls for identical coordinates
const routeCache = new Map<string, { distance: number; duration: number; flippedCoords: [number, number][] }>();

/**
 * Hook that calculates delivery price using OSRM Routing API with in-memory route caching.
 */
export function usePriceCalculation() {
  const [pricing, setPricing] = useState<DeliveryPricing | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  const calculate = useCallback(
    async (
      origin: LatLng, 
      destination: LatLng, 
      estimatedItemPrice: number = 0,
      opts?: {
        category?: string;
        weightRange?: string;
        itemCount?: number;
        hasRain?: boolean;
        waitingMinutes?: number;
        hasHoliday?: boolean;
        hasPeakHour?: boolean;
        hasInsurance?: boolean;
        promoCode?: string;
        isRoundTrip?: boolean;
      }
    ) => {
      setIsCalculating(true);
      const cacheKey = `${origin.lat.toFixed(5)},${origin.lng.toFixed(5)}-${destination.lat.toFixed(5)},${destination.lng.toFixed(5)}`;

      try {
        let distance: number;
        let duration: number;
        let flippedCoords: [number, number][];

        if (routeCache.has(cacheKey)) {
          const cached = routeCache.get(cacheKey)!;
          distance = cached.distance;
          duration = cached.duration;
          flippedCoords = cached.flippedCoords;
        } else {
          // Query OSRM driving route
          const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();

          if (data.code === 'Ok' && data.routes && data.routes[0]) {
            const route = data.routes[0];
            distance = route.distance; // in meters
            duration = route.duration; // in seconds
            flippedCoords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);

            routeCache.set(cacheKey, { distance, duration, flippedCoords });
          } else {
            throw new Error('OSRM routing failed to find a valid route');
          }
        }

        setRouteCoordinates(flippedCoords);

        const price = calculateDeliveryPrice(distance, estimatedItemPrice, {
          ...opts,
          durationInSeconds: duration,
        });
        setPricing(price);
        setIsCalculating(false);
        return price;
      } catch (error) {
        console.error('OSRM route calculation error:', error);
        
        // Fallback: Haversine distance if OSRM is down
        const R = 6371000; // Earth's radius in meters
        const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
        const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((origin.lat * Math.PI) / 180) *
            Math.cos((destination.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const haversineDist = R * c;

        // Add 30% for road factor
        const roadDistance = haversineDist * 1.3;
        // Average speed 30 km/h (8.33 m/s)
        const durationInSeconds = Math.round(roadDistance / 8.33);

        setRouteCoordinates([
          [origin.lat, origin.lng],
          [destination.lat, destination.lng],
        ]);

        const price = calculateDeliveryPrice(roadDistance, estimatedItemPrice, {
          ...opts,
          durationInSeconds,
        });
        setPricing(price);
        setIsCalculating(false);
        return price;
      } finally {
        setIsCalculating(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setPricing(null);
    setRouteCoordinates([]);
  }, []);

  return { pricing, isCalculating, calculate, reset, routeCoordinates };
}
