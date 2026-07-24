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
  formattedAddress: string;
  name?: string;
  road?: string;
  village?: string;
  subdistrict?: string;
  county?: string;
  state?: string;
  postcode?: string;
}

/**
 * Formats a DetailedAddress object into a clear, unambiguous Indonesian address string
 * with explicit Desa/Kel, Kecamatan, Kab/Kota, and Provinsi details.
 */
export function formatDetailedAddress(details: Partial<DetailedAddress>): string {
  const parts: string[] = [];

  if (details.name && details.name !== details.road && details.name !== details.village && details.name !== details.subdistrict) {
    parts.push(details.name);
  }

  if (details.road) {
    const r = details.road.trim();
    parts.push(/^(jl|jalan|gang|gg)\.?/i.test(r) ? r : `Jl. ${r}`);
  }

  if (details.village) {
    const v = details.village.trim();
    if (/^(desa|kelurahan|kel\.|pekon|kampung|kmpg\.)/i.test(v)) {
      parts.push(v);
    } else {
      parts.push(`Desa/Kel. ${v}`);
    }
  }

  if (details.subdistrict) {
    const s = details.subdistrict.trim();
    if (/^(kecamatan|kec\.)/i.test(s)) {
      parts.push(s);
    } else {
      parts.push(`Kec. ${s}`);
    }
  }

  if (details.county) {
    const c = details.county.trim();
    if (/^(kabupaten|kab\.|kota)/i.test(c)) {
      parts.push(c);
    } else if (c.toLowerCase().includes('kota')) {
      parts.push(`Kota ${c}`);
    } else {
      parts.push(`Kab. ${c}`);
    }
  }

  if (details.state) {
    const st = details.state.trim();
    if (/^(provinsi|prov\.)/i.test(st)) {
      parts.push(st);
    } else {
      parts.push(`Prov. ${st}`);
    }
  }

  if (parts.length === 0) {
    return details.displayName || '';
  }

  return parts.join(', ');
}

/**
 * Parses raw Nominatim search/reverse item into DetailedAddress format
 */
export function parseNominatimAddress(item: any): DetailedAddress {
  if (!item) return { displayName: '', formattedAddress: '' };
  
  // If item is already parsed DetailedAddress object
  if (item.formattedAddress && item.displayName) {
    return item as DetailedAddress;
  }

  const addr = item.address || item.details?.address || {};
  
  const nameKeys = [
    'amenity', 'building', 'shop', 'tourism', 'historic', 'leisure', 
    'office', 'craft', 'emergency', 'railway', 'highway', 'aeroway', 'place', 'attraction'
  ];
  let name = item.name || '';
  if (!name) {
    for (const key of nameKeys) {
      if (addr[key]) {
        name = addr[key];
        break;
      }
    }
  }

  const road = addr.road || addr.pedestrian || addr.cycleway || addr.path || addr.footway || addr.street || '';
  const village = addr.village || addr.hamlet || addr.neighbourhood || addr.suburb || addr.quarter || addr.residential || addr.village_district || '';
  let subdistrict = addr.subdistrict || addr.district || addr.city_district || addr.town || addr.county_subdistrict || '';
  let county = addr.county || addr.city || addr.regency || addr.municipality || addr.state_district || '';
  const state = addr.state || addr.province || 'Lampung';
  const postcode = addr.postcode || '';

  const displayNameRaw = item.display_name || item.displayName || '';

  // If subdistrict or village is omitted by Nominatim's address object, try fallback extraction from display_name chunks
  if (displayNameRaw) {
    const chunks = displayNameRaw.split(',').map((c: string) => c.trim()).filter(Boolean);
    if (!name && chunks[0] && chunks[0] !== road && chunks[0] !== village && chunks[0] !== subdistrict) {
      name = chunks[0];
    }
    if (!subdistrict && chunks.length >= 3) {
      const possibleSub = chunks.find((c: string, idx: number) => {
        if (idx === 0) return false;
        const lower = c.toLowerCase();
        if (village && lower === village.toLowerCase()) return false;
        if (county && lower === county.toLowerCase()) return false;
        if (state && lower === state.toLowerCase()) return false;
        if (lower === 'indonesia' || lower === 'sumatra' || lower === 'sumatera') return false;
        return true;
      });
      if (possibleSub) {
        subdistrict = possibleSub;
      }
    }
  }

  const rawDetails = {
    displayName: displayNameRaw,
    name: name || undefined,
    road: road || undefined,
    village: village || undefined,
    subdistrict: subdistrict || undefined,
    county: county || undefined,
    state: state || undefined,
    postcode: postcode || undefined
  };

  const formattedAddress = formatDetailedAddress(rawDetails) || displayNameRaw;

  return {
    ...rawDetails,
    displayName: formattedAddress || displayNameRaw,
    formattedAddress,
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
