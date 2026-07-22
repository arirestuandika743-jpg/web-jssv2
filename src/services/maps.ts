import type { LatLng } from '@/types';

/**
 * Bounding Box parameters for Lampung Province, Indonesia.
 * Covers from northern border near Palembang border to southern coastal islands.
 */
export const LAMPUNG_BOUNDS = {
  minLat: -6.15,
  maxLat: -3.60,
  minLng: 103.40,
  maxLng: 106.10,
};

/**
 * Checks if coordinate lies within Lampung Province bounding box.
 */
export function isWithinLampung(lat: number, lng: number): boolean {
  return (
    lat >= LAMPUNG_BOUNDS.minLat &&
    lat <= LAMPUNG_BOUNDS.maxLat &&
    lng >= LAMPUNG_BOUNDS.minLng &&
    lng <= LAMPUNG_BOUNDS.maxLng
  );
}

export interface DetailedAddress {
  displayName: string;
  name?: string;
  road?: string;
  village?: string;
  subdistrict?: string;
  county?: string;
  state?: string;
  postcode?: string;
}

/**
 * Parses raw Nominatim search/reverse item into DetailedAddress format
 */
export function parseNominatimAddress(item: any): DetailedAddress {
  if (!item) return { displayName: '' };
  const addr = item.address || {};
  
  const nameKeys = [
    'amenity', 'building', 'shop', 'tourism', 'historic', 'leisure', 
    'office', 'craft', 'emergency', 'railway', 'highway', 'aeroway'
  ];
  let name = '';
  for (const key of nameKeys) {
    if (addr[key]) {
      name = addr[key];
      break;
    }
  }
  if (!name && item.display_name) {
    const firstChunk = item.display_name.split(',')[0].trim();
    if (firstChunk !== addr.road) {
      name = firstChunk;
    }
  }

  const road = addr.road || addr.pedestrian || addr.cycleway || addr.path || addr.footway || '';
  const village = addr.village || addr.hamlet || addr.neighbourhood || addr.suburb || '';
  const subdistrict = addr.subdistrict || addr.town || addr.city_district || '';
  const county = addr.county || addr.city || addr.municipality || '';
  const state = addr.state || 'Lampung';
  const postcode = addr.postcode || '';

  return {
    displayName: item.display_name || '',
    name: name || undefined,
    road: road || undefined,
    village: village || undefined,
    subdistrict: subdistrict || undefined,
    county: county || undefined,
    state: state || undefined,
    postcode: postcode || undefined
  };
}

// Client-side cache for reverse geocoding to optimize Nominatim API usage
const reverseGeocodeCache = new Map<string, any>();

/**
 * Performs reverse geocoding with caching to prevent redundant API calls
 */
export async function reverseGeocodeWithCache(lat: number, lng: number): Promise<any> {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`; // ~1 meter precision grouping
  if (reverseGeocodeCache.has(key)) {
    return reverseGeocodeCache.get(key);
  }

  try {
    // 1. Try local API proxy route first (avoids CORS and browser User-Agent restrictions)
    const proxyUrl = `/api/geocode?type=reverse&lat=${lat}&lng=${lng}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.display_name || data.address)) {
        reverseGeocodeCache.set(key, data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Proxy geocode failed, attempting direct fetch fallback:', err);
  }

  try {
    // 2. Direct Nominatim fallback
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      reverseGeocodeCache.set(key, data);
      return data;
    }
  } catch (err) {
    console.error('Direct reverse geocode failed:', err);
  }

  // 3. Graceful fallback object when network/geocoding API is unreachable or rate limited
  const fallback = {
    display_name: `Lokasi Peta (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
    lat: lat.toString(),
    lon: lng.toString(),
    address: {
      road: `Koordinat (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      county: 'Lampung',
      state: 'Lampung',
    },
  };
  reverseGeocodeCache.set(key, fallback);
  return fallback;
}
