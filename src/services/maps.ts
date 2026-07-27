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
 * Known Lampung Kecamatan Bounding Boxes
 */
interface KecamatanBoundary {
  name: string;
  county: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export const LAMPUNG_KECAMATAN_BOUNDS: KecamatanBoundary[] = [
  // Lampung Tengah
  { name: 'Kalirejo', county: 'Lampung Tengah', minLat: -5.38, maxLat: -5.20, minLng: 104.91, maxLng: 105.05 },
  { name: 'Sendang Agung', county: 'Lampung Tengah', minLat: -5.38, maxLat: -5.20, minLng: 104.76, maxLng: 104.91 },
  { name: 'Bangunrejo', county: 'Lampung Tengah', minLat: -5.22, maxLat: -5.06, minLng: 104.90, maxLng: 105.08 },
  { name: 'Padang Ratu', county: 'Lampung Tengah', minLat: -5.16, maxLat: -4.98, minLng: 104.82, maxLng: 104.98 },
  { name: 'Pubian', county: 'Lampung Tengah', minLat: -5.22, maxLat: -4.95, minLng: 104.65, maxLng: 104.85 },
  { name: 'Anak Tuha', county: 'Lampung Tengah', minLat: -5.10, maxLat: -4.92, minLng: 104.98, maxLng: 105.15 },
  { name: 'Bekri', county: 'Lampung Tengah', minLat: -5.26, maxLat: -5.08, minLng: 105.04, maxLng: 105.22 },
  { name: 'Gunung Sugih', county: 'Lampung Tengah', minLat: -5.08, maxLat: -4.85, minLng: 105.12, maxLng: 105.28 },
  { name: 'Terbanggi Besar', county: 'Lampung Tengah', minLat: -4.96, maxLat: -4.75, minLng: 105.10, maxLng: 105.32 },
  { name: 'Trimurjo', county: 'Lampung Tengah', minLat: -5.18, maxLat: -5.00, minLng: 105.20, maxLng: 105.35 },
  { name: 'Punggur', county: 'Lampung Tengah', minLat: -5.08, maxLat: -4.92, minLng: 105.26, maxLng: 105.42 },
  { name: 'Kota Gajah', county: 'Lampung Tengah', minLat: -5.04, maxLat: -4.88, minLng: 105.32, maxLng: 105.45 },
  { name: 'Seputih Raman', county: 'Lampung Tengah', minLat: -4.98, maxLat: -4.78, minLng: 105.35, maxLng: 105.52 },
  { name: 'Seputih Banyak', county: 'Lampung Tengah', minLat: -4.95, maxLat: -4.70, minLng: 105.45, maxLng: 105.65 },
  { name: 'Rumbia', county: 'Lampung Tengah', minLat: -4.92, maxLat: -4.65, minLng: 105.55, maxLng: 105.80 },
  { name: 'Way Pengubuan', county: 'Lampung Tengah', minLat: -4.86, maxLat: -4.68, minLng: 105.18, maxLng: 105.35 },
  { name: 'Terusan Nunyai', county: 'Lampung Tengah', minLat: -4.78, maxLat: -4.55, minLng: 105.15, maxLng: 105.38 },

  // Pringsewu
  { name: 'Sukoharjo', county: 'Pringsewu', minLat: -5.40, maxLat: -5.26, minLng: 104.91, maxLng: 105.05 },
  { name: 'Adiluwih', county: 'Pringsewu', minLat: -5.35, maxLat: -5.22, minLng: 105.00, maxLng: 105.12 },
  { name: 'Pringsewu', county: 'Pringsewu', minLat: -5.45, maxLat: -5.32, minLng: 104.92, maxLng: 105.03 },
  { name: 'Gadingrejo', county: 'Pringsewu', minLat: -5.45, maxLat: -5.32, minLng: 105.02, maxLng: 105.16 },

  // Pesawaran
  { name: 'Negeri Katon', county: 'Pesawaran', minLat: -5.36, maxLat: -5.18, minLng: 105.06, maxLng: 105.20 },
  { name: 'Gedong Tataan', county: 'Pesawaran', minLat: -5.48, maxLat: -5.32, minLng: 105.06, maxLng: 105.22 },

  // Kota Metro
  { name: 'Metro Pusat', county: 'Kota Metro', minLat: -5.16, maxLat: -5.06, minLng: 105.26, maxLng: 105.35 },

  // Bandar Lampung
  { name: 'Bandar Lampung', county: 'Kota Bandar Lampung', minLat: -5.52, maxLat: -5.32, minLng: 105.18, maxLng: 105.38 },
];

/**
 * Direct Village Name -> Kecamatan Lookup Dictionary
 */
export const VILLAGE_TO_KECAMATAN_MAP: Record<string, { kecamatan: string; county: string }> = {
  // Kecamatan Kalirejo
  'sri basuki': { kecamatan: 'Kalirejo', county: 'Lampung Tengah' },
  'sri wungu': { kecamatan: 'Kalirejo', county: 'Lampung Tengah' },
  'sri mulyo': { kecamatan: 'Kalirejo', county: 'Lampung Tengah' },
  'kalirejo': { kecamatan: 'Kalirejo', county: 'Lampung Tengah' },
  'kali rejo': { kecamatan: 'Kalirejo', county: 'Lampung Tengah' },
  'sukosari': { kecamatan: 'Kalirejo', county: 'Lampung Tengah' },
  'watu agung': { kecamatan: 'Kalirejo', county: 'Lampung Tengah' },
  'balai rejo': { kecamatan: 'Kalirejo', county: 'Lampung Tengah' },
  'sinar sari': { kecamatan: 'Kalirejo', county: 'Lampung Tengah' },
  'agung timur': { kecamatan: 'Kalirejo', county: 'Lampung Tengah' },
  'pondok agung': { kecamatan: 'Kalirejo', county: 'Lampung Tengah' },
  'way wayo': { kecamatan: 'Kalirejo', county: 'Lampung Tengah' },

  // Sendang Agung
  'sendang agung': { kecamatan: 'Sendang Agung', county: 'Lampung Tengah' },
  'sendang retno': { kecamatan: 'Sendang Agung', county: 'Lampung Tengah' },
  'sendang asri': { kecamatan: 'Sendang Agung', county: 'Lampung Tengah' },
  'sendang mukti': { kecamatan: 'Sendang Agung', county: 'Lampung Tengah' },
  'sendang baru': { kecamatan: 'Sendang Agung', county: 'Lampung Tengah' },
  'sendang mulyo': { kecamatan: 'Sendang Agung', county: 'Lampung Tengah' },

  // Bangunrejo
  'bangunrejo': { kecamatan: 'Bangunrejo', county: 'Lampung Tengah' },
  'bangun rejo': { kecamatan: 'Bangunrejo', county: 'Lampung Tengah' },
  'sukarame': { kecamatan: 'Bangunrejo', county: 'Lampung Tengah' },
  'sidomulyo': { kecamatan: 'Bangunrejo', county: 'Lampung Tengah' },
  'cimutu': { kecamatan: 'Bangunrejo', county: 'Lampung Tengah' },
  'tanjung jaya': { kecamatan: 'Bangunrejo', county: 'Lampung Tengah' },
  'purwodadi': { kecamatan: 'Bangunrejo', county: 'Lampung Tengah' },
  'sri dadi': { kecamatan: 'Bangunrejo', county: 'Lampung Tengah' },

  // Sukoharjo
  'sukoharjo': { kecamatan: 'Sukoharjo', county: 'Pringsewu' },
  'pandansari': { kecamatan: 'Sukoharjo', county: 'Pringsewu' },
  'sinar baru': { kecamatan: 'Sukoharjo', county: 'Pringsewu' },

  // Adiluwih
  'adiluwih': { kecamatan: 'Adiluwih', county: 'Pringsewu' },
  'kutawaringin': { kecamatan: 'Adiluwih', county: 'Pringsewu' },
  'bandung baru': { kecamatan: 'Adiluwih', county: 'Pringsewu' },

  // Terbanggi Besar / Bandar Jaya
  'bandar jaya': { kecamatan: 'Terbanggi Besar', county: 'Lampung Tengah' },
  'bandar jaya barat': { kecamatan: 'Terbanggi Besar', county: 'Lampung Tengah' },
  'bandar jaya timur': { kecamatan: 'Terbanggi Besar', county: 'Lampung Tengah' },
  'yukum jaya': { kecamatan: 'Terbanggi Besar', county: 'Lampung Tengah' },
  'terbanggi besar': { kecamatan: 'Terbanggi Besar', county: 'Lampung Tengah' },
  'poncowati': { kecamatan: 'Terbanggi Besar', county: 'Lampung Tengah' },
};

/**
 * Infers Kecamatan and County when Nominatim address object omits subdistrict
 */
export function inferKecamatan(village?: string, lat?: number, lng?: number): { subdistrict: string; county?: string } | undefined {
  // 1. Coordinate Bounding Box lookup
  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
    const matchedBound = LAMPUNG_KECAMATAN_BOUNDS.find(b => 
      lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng
    );
    if (matchedBound) {
      return { subdistrict: matchedBound.name, county: matchedBound.county };
    }
  }

  // 2. Village Name Dictionary lookup
  if (village) {
    const cleanV = village.toLowerCase().replace(/^(desa|kelurahan|kel\.|pekon|kampung|kmpg\.)\s*/i, '').trim();
    if (VILLAGE_TO_KECAMATAN_MAP[cleanV]) {
      const match = VILLAGE_TO_KECAMATAN_MAP[cleanV];
      return { subdistrict: match.kecamatan, county: match.county };
    }
  }

  return undefined;
}

/**
 * Formats a DetailedAddress object into a clear, unambiguous Indonesian address string
 * with explicit Desa/Kel, Kecamatan, Kab/Kota, and Provinsi details.
 */
export function formatDetailedAddress(details: Partial<DetailedAddress>): string {
  if (!details) return '';
  const parts: string[] = [];

  const isUglyName = (s?: string) => !s || /lokasi peta|koordinat|fallback_/i.test(s);

  if (details.name && details.name !== details.road && details.name !== details.village && details.name !== details.subdistrict && !isUglyName(details.name)) {
    parts.push(details.name);
  }

  if (details.road && !isUglyName(details.road)) {
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
    if (details.displayName && !isUglyName(details.displayName)) {
      return details.displayName;
    }
    return '';
  }

  return parts.join(', ');
}

/**
 * Parses Google Maps URL, share link, or raw coordinate string into LatLng
 */
export function parseGoogleMapsCoordinates(text: string): LatLng | null {
  if (!text) return null;

  // 1. Matches @lat,lng format e.g. @-5.295123,104.975234
  const atMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 2. Matches q=lat,lng or ll=lat,lng format e.g. q=-5.295123,104.975234
  const queryMatch = text.match(/(?:q|ll|query|destination|origin)=(-?\d+\.\d+),(-?\d+\.\d+)/i);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // 3. Matches raw coordinates format e.g. -5.295123, 104.975234
  const rawMatch = text.match(/(-?\d{1,2}\.\d{3,7})\s*,\s*(-?\d{2,3}\.\d{3,7})/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  return null;
}

/**
 * Parses raw Nominatim search/reverse item into DetailedAddress format
 */
export function parseNominatimAddress(item: any, overrideCoords?: LatLng | null): DetailedAddress {
  if (!item) return { displayName: '', formattedAddress: '' };
  
  // If item is already parsed DetailedAddress object with subdistrict populated
  if (item.formattedAddress && item.displayName && item.subdistrict && !/lokasi peta|koordinat/i.test(item.formattedAddress)) {
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

  const isUglyStr = (s?: string) => !s || /lokasi peta|koordinat|fallback_/i.test(s);
  if (isUglyStr(name)) name = '';

  const road = addr.road || addr.pedestrian || addr.cycleway || addr.path || addr.footway || addr.street || '';
  let village = addr.village || addr.neighbourhood || addr.suburb || addr.quarter || addr.residential || addr.village_district || addr.hamlet || '';
  let subdistrict = addr.subdistrict || addr.district || addr.city_district || addr.town || addr.county_subdistrict || '';
  let county = addr.county || addr.city || addr.regency || addr.municipality || addr.state_district || '';
  let state = addr.state || addr.province || 'Lampung';
  const postcode = addr.postcode || '';

  const displayNameRaw = item.display_name || item.displayName || '';

  // Extract lat/lng for coordinate-based Kecamatan & Village inference
  const latNum = overrideCoords?.lat ?? (item.lat ? parseFloat(item.lat) : item.latitude ? parseFloat(item.latitude) : undefined);
  const lngNum = overrideCoords?.lng ?? (item.lon ? parseFloat(item.lon) : item.lng ? parseFloat(item.lng) : item.longitude ? parseFloat(item.longitude) : undefined);

  // Hamlet to official Village mapping (Cimarian -> Sri Basuki)
  const hamletLower = (addr.hamlet || village || '').toLowerCase();
  if (hamletLower.includes('cimarian') || hamletLower.includes('cikal') || hamletLower.includes('sri basuki')) {
    village = 'Sri Basuki';
    subdistrict = 'Kalirejo';
  } else if (hamletLower.includes('sri wungu') || hamletLower.includes('kaliwungu') || hamletLower.includes('kali wungu')) {
    village = 'Kaliwungu';
    subdistrict = 'Kalirejo';
  } else if (hamletLower.includes('sri mulyo') || hamletLower.includes('srimulyo')) {
    village = 'Sri Mulyo';
    subdistrict = 'Kalirejo';
  }

  // Exact coordinate bounding box for Sri Basuki and Kalirejo town center
  if (typeof latNum === 'number' && typeof lngNum === 'number' && !isNaN(latNum) && !isNaN(lngNum)) {
    if (latNum >= -5.315 && latNum <= -5.288 && lngNum >= 104.955 && lngNum <= 104.982) {
      village = 'Sri Basuki';
      subdistrict = 'Kalirejo';
      county = 'Lampung Tengah';
    } else if (latNum >= -5.290 && latNum <= -5.275 && lngNum >= 104.980 && lngNum <= 104.995) {
      village = 'Kalirejo';
      subdistrict = 'Kalirejo';
      county = 'Lampung Tengah';
    }
  }

  // If subdistrict or village is omitted by Nominatim, try display_name chunks first
  if (displayNameRaw && !isUglyStr(displayNameRaw)) {
    const chunks = displayNameRaw.split(',').map((c: string) => c.trim()).filter(Boolean);
    if (!name && chunks[0] && chunks[0] !== road && chunks[0] !== village && chunks[0] !== subdistrict) {
      if (!isUglyStr(chunks[0])) {
        name = chunks[0];
      }
    }
    if (!subdistrict && chunks.length >= 3) {
      const possibleSub = chunks.find((c: string, idx: number) => {
        if (idx === 0) return false;
        const lower = c.toLowerCase();
        if (village && lower === village.toLowerCase()) return false;
        if (county && lower === county.toLowerCase()) return false;
        if (state && lower === state.toLowerCase()) return false;
        if (lower === 'indonesia' || lower === 'sumatra' || lower === 'sumatera') return false;
        if (isUglyStr(lower)) return false;
        return true;
      });
      if (possibleSub) {
        subdistrict = possibleSub;
      }
    }
  }

  // If subdistrict is STILL missing, use our Lampung Kecamatan Inference engine
  if (!subdistrict) {
    const inferred = inferKecamatan(village, latNum, lngNum);
    if (inferred) {
      subdistrict = inferred.subdistrict;
      if (!county && inferred.county) {
        county = inferred.county;
      }
    } else {
      if ((county && county.toLowerCase().includes('lampung tengah')) || isWithinLampung(latNum || -5.28, lngNum || 104.98)) {
        subdistrict = 'Kalirejo';
      }
    }
  }

  const rawDetails = {
    displayName: isUglyStr(displayNameRaw) ? '' : displayNameRaw,
    name: name || undefined,
    road: isUglyStr(road) ? undefined : road,
    village: village || undefined,
    subdistrict: subdistrict || undefined,
    county: county || 'Lampung Tengah',
    state: state || 'Lampung',
    postcode: postcode || undefined
  };

  let formattedAddress = formatDetailedAddress(rawDetails);
  if (!formattedAddress || isUglyStr(formattedAddress)) {
    if (village || subdistrict) {
      formattedAddress = [
        village ? `Desa/Kel. ${village}` : null,
        subdistrict ? `Kec. ${subdistrict}` : null,
        county ? `Kab. ${county}` : 'Kab. Lampung Tengah',
        'Prov. Lampung'
      ].filter(Boolean).join(', ');
    } else {
      formattedAddress = displayNameRaw && !isUglyStr(displayNameRaw) ? displayNameRaw : 'Lokasi Peta Pilihan';
    }
  }

  return {
    ...rawDetails,
    displayName: formattedAddress,
    formattedAddress,
  };
}

// Client-side cache for reverse geocoding to optimize Nominatim API usage
const reverseGeocodeCache = new Map<string, any>();

/**
 * Perform reverse geocoding with in-memory cache to prevent duplicate Nominatim requests
 */
export async function reverseGeocodeWithCache(lat: number, lng: number): Promise<any> {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (reverseGeocodeCache.has(key)) {
    return reverseGeocodeCache.get(key);
  }

  try {
    const proxyUrl = `/api/geocode?type=reverse&lat=${lat}&lng=${lng}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        reverseGeocodeCache.set(key, data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Proxy geocode failed, attempting direct fetch fallback:', err);
  }

  try {
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

  const fallback = {
    display_name: `Lokasi Peta (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
    lat: lat.toString(),
    lon: lng.toString(),
    address: {
      county: 'Lampung Tengah',
      state: 'Lampung',
    },
  };
  reverseGeocodeCache.set(key, fallback);
  return fallback;
}

/**
 * Geocodes an address text or village/subdistrict combo into LatLng coordinates
 * with fallback search strategies for Indonesian addresses.
 */
export async function geocodeAddressText(
  text: string,
  village?: string,
  subdistrict?: string,
  county?: string
): Promise<LatLng | null> {
  // If user pasted a Google Maps URL, share link, or raw coordinates, parse directly!
  const gmapsCoords = parseGoogleMapsCoordinates(text);
  if (gmapsCoords) {
    return gmapsCoords;
  }

  // High-precision local coordinate dictionary for Kalirejo villages to prevent Nominatim misindexing (e.g. Keputran bug)
  const queryLower = (text + ' ' + (village || '') + ' ' + (subdistrict || '')).toLowerCase();
  
  if (queryLower.includes('kali rejo') || queryLower.includes('kalirejo')) {
    return { lat: -5.2760, lng: 104.9825 };
  }
  if (queryLower.includes('sri basuki') || queryLower.includes('cimarian') || queryLower.includes('cikal')) {
    return { lat: -5.2950, lng: 104.9750 };
  }
  if (queryLower.includes('srimulyo') || queryLower.includes('sri mulyo')) {
    return { lat: -5.2650, lng: 105.0100 };
  }
  if (queryLower.includes('kaliwungu') || queryLower.includes('sri wungu') || queryLower.includes('kali wungu')) {
    return { lat: -5.2750, lng: 104.9810 };
  }
  if (queryLower.includes('sukosari')) {
    return { lat: -5.2850, lng: 104.9600 };
  }
  if (queryLower.includes('watuagung') || queryLower.includes('watu agung')) {
    return { lat: -5.3200, lng: 104.9700 };
  }
  if (queryLower.includes('balairejo') || queryLower.includes('balai rejo')) {
    return { lat: -5.2800, lng: 104.9920 };
  }

  const cleanStr = (s: string) => s.replace(/^(desa\/kel\.|desa|kelurahan|kel\.|kecamatan|kec\.|kabupaten|kab\.|provinsi|prov\.)\s*/gi, '').trim();

  const v = village ? cleanStr(village) : '';
  const s = subdistrict ? cleanStr(subdistrict) : '';
  const c = county ? cleanStr(county) : 'Lampung Tengah';

  const queries: string[] = [];

  if (v && s) {
    queries.push(`${v}, ${s}, ${c}, Lampung`);
    queries.push(`${v}, ${s}, Lampung`);
    queries.push(`${v}, ${s}`);
  }
  if (v) {
    queries.push(`${v}, ${c}, Lampung`);
    queries.push(`${v}, Lampung`);
  }
  if (s) {
    queries.push(`${s}, ${c}, Lampung`);
  }

  const cleanInput = text.replace(/^(desa\/kel\.|desa|kel\.|kec\.|kab\.|prov\.)\s*/gi, '').trim();
  if (cleanInput && !/lokasi peta|koordinat/i.test(cleanInput)) {
    queries.push(`${cleanInput}, Lampung`);
    queries.push(cleanInput);
  }

  const uniqueQueries = Array.from(new Set(queries.filter(Boolean)));

  for (const q of uniqueQueries) {
    try {
      const proxyUrl = `/api/geocode?type=search&q=${encodeURIComponent(q)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const bestMatch = data.find((item: any) => 
            item.class === 'place' || 
            item.class === 'boundary' || 
            item.type === 'village' || 
            item.type === 'hamlet' || 
            item.type === 'administrative' ||
            item.addresstype === 'village' ||
            item.addresstype === 'hamlet'
          ) || data[0];

          const lat = parseFloat(bestMatch.lat);
          const lng = parseFloat(bestMatch.lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        }
      }
    } catch (e) {
      console.warn('geocodeAddressText query attempt failed:', q, e);
    }
  }

  return null;
}
