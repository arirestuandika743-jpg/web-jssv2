import type { DeliveryPricing } from '@/types';

/**
 * Advanced delivery pricing calculator based on OpenStreetMap routing details.
 * Pricing formula: Base Fee (Rp5.000) + Distance Fee (Rp3.000 / km) + Shopping/Category Fee + Weight Surcharge
 */
export function calculateDeliveryPrice(
  distanceInMeters: number,
  estimatedItemPrice: number = 0,
  opts?: {
    category?: string;
    weightRange?: string; // For logistics: '0-2', '3-5', '6-10', '11-20', '20+'. For Ojek: '<80', '80-120', '120+'
    itemCount?: number;
    hasRain?: boolean;
    waitingMinutes?: number;
    durationInSeconds?: number;
    hasNightService?: boolean;
    hasLargeQuantity?: boolean;
    hasHoliday?: boolean;
    hasPeakHour?: boolean;
    hasInsurance?: boolean;
    promoCode?: string;
    isRoundTrip?: boolean;
  }
): DeliveryPricing {
  const distanceInKm = distanceInMeters / 1000;
  const category = opts?.category || '';
  const isRide = category === 'ride';

  // 1. Base Fee
  const baseFee = isRide ? 10000 : 5000;

  // 2. Distance Fee (Rp3.000/km)
  const perKmRate = 3000;
  const distanceFee = Math.round(distanceInKm * perKmRate);

  // 3. Weight Surcharge (Handles Ojek weight limits and standard logistics weights)
  let weightFee = 0;
  const weightRange = opts?.weightRange || '';
  if (isRide) {
    if (weightRange === '80-120') weightFee = 3000;
    else if (weightRange === '120+') weightFee = 10000;
  } else {
    if (weightRange === '3-5') weightFee = 3000;
    else if (weightRange === '6-10') weightFee = 8000;
    else if (weightRange === '11-20') weightFee = 15000;
    else if (weightRange === '20+') weightFee = 30000;
  }

  // 4. Shopping Fee (Layanan Titip Belanja - GRATIS / Rp0 promo)
  let shoppingFee = 0;
  if (!isRide && ['shopping', 'food', 'medicine'].includes(category)) {
    shoppingFee = 0;
  }

  // 5. Waiting Fee (Rp500/minute)
  const waitingMinutes = opts?.waitingMinutes || 0;
  const waitingFee = waitingMinutes * 500;

  const heavyItemFee = 0;

  // 7. Large Quantity Fee (Rp0 by default, active only if explicitly requested)
  const largeQuantityFee = (!isRide && opts?.hasLargeQuantity) ? (opts.itemCount || 0) * 500 : 0;

  // 8. Remote Area Fee (Rp10.000 if distance > 20 km)
  const remoteAreaFee = distanceInKm > 20 ? 10000 : 0;

  // 9. Night Service Fee (Rp5.000 if active)
  const nightServiceFee = opts?.hasNightService ? 5000 : 0;

  // 10. Rain/Weather Fee (Rp3.000 if rainy)
  const rainFee = opts?.hasRain ? 3000 : 0;

  // 11. Holiday Fee (Rp2.000 flat when holiday is active)
  const holidayFee = opts?.hasHoliday ? 2000 : 0;

  // 12. Peak Hour Fee (Rp3.000 flat, auto-detect between 17:00-19:00 or if set manually)
  let isPeak = false;
  if (opts?.hasPeakHour !== undefined) {
    isPeak = opts.hasPeakHour;
  } else {
    try {
      const now = new Date();
      const hours = now.getHours();
      isPeak = hours >= 17 && hours <= 19;
    } catch (e) {}
  }
  const peakHourFee = isPeak ? 3000 : 0;

  // 13. Service Fee / Platform Fee (Rp0 flat)
  const serviceFee = 0;

  // 14. Insurance Fee (Rp1.000 flat)
  const insuranceFee = opts?.hasInsurance ? 1000 : 0;

  // Total delivery fee before discount
  let totalDeliveryFee =
    baseFee +
    distanceFee +
    weightFee +
    shoppingFee +
    waitingFee +
    heavyItemFee +
    largeQuantityFee +
    remoteAreaFee +
    nightServiceFee +
    rainFee +
    holidayFee +
    peakHourFee +
    serviceFee +
    insuranceFee;

  // Ensure minimum delivery fee (Rp10.000 for Ojek, Rp5.000 for standard)
  const minDeliveryFee = isRide ? 10000 : 5000;
  totalDeliveryFee = Math.max(totalDeliveryFee, minDeliveryFee);

  // Round to nearest Rp500
  totalDeliveryFee = Math.round(totalDeliveryFee / 500) * 500;

  // Round trip multiplier (Doubles the tariff for PP / Pulang Pergi)
  const roundTripFee = opts?.isRoundTrip ? totalDeliveryFee : 0;
  if (opts?.isRoundTrip) {
    totalDeliveryFee = totalDeliveryFee * 2;
  }

  // 15. Promo Discount
  let promoDiscount = 0;
  if (opts?.promoCode) {
    const code = opts.promoCode.toUpperCase();
    if (code === 'JSSPERDANA') {
      promoDiscount = 5000;
    } else if (code === 'DISKON30') {
      promoDiscount = Math.round((totalDeliveryFee * 0.3) / 500) * 500;
    } else if (code === 'DISKON50') {
      promoDiscount = Math.round((totalDeliveryFee * 0.5) / 500) * 500;
    }
    promoDiscount = Math.min(promoDiscount, totalDeliveryFee);
  }

  const finalDeliveryFee = totalDeliveryFee - promoDiscount;
  const grandTotal = finalDeliveryFee + estimatedItemPrice;

  const effectiveDistance = opts?.isRoundTrip ? distanceInMeters * 2 : distanceInMeters;
  const effectiveDuration = opts?.isRoundTrip ? (opts?.durationInSeconds || 0) * 2 : (opts?.durationInSeconds || 0);

  return {
    distance: effectiveDistance,
    duration: effectiveDuration,
    baseFee,
    distanceFee,
    weightFee,
    shoppingFee,
    waitingFee,
    heavyItemFee,
    largeQuantityFee,
    remoteAreaFee,
    nightServiceFee,
    rainFee,
    holidayFee,
    peakHourFee,
    serviceFee,
    insuranceFee,
    isRoundTrip: opts?.isRoundTrip || false,
    roundTripFee,
    promoDiscount,
    totalDeliveryFee: finalDeliveryFee,
    estimatedItemPrice,
    grandTotal,
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Fallback when Routing service is down.
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate duration based on average speed (30 km/h for local roads).
 */
export function estimateDuration(distanceInMeters: number): number {
  const avgSpeedMps = 30 / 3.6; // 30 km/h converted to m/s
  return Math.round(distanceInMeters / avgSpeedMps);
}
