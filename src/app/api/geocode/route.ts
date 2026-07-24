import { NextResponse } from 'next/server';

declare global {
  var geocodeCache: Map<string, any> | undefined;
}

if (!globalThis.geocodeCache) {
  globalThis.geocodeCache = new Map();
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'reverse') {
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (!latStr || !lngStr) {
      return NextResponse.json({ error: 'Koordinat lat dan lng wajib diisi' }, { status: 400, headers: corsHeaders });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Koordinat tidak valid' }, { status: 400, headers: corsHeaders });
    }

    const cacheKey = `rev_${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (globalThis.geocodeCache?.has(cacheKey)) {
      return NextResponse.json(globalThis.geocodeCache.get(cacheKey), { headers: corsHeaders });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 JSS-Delivery-App/1.0',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && (data.display_name || data.address)) {
          globalThis.geocodeCache?.set(cacheKey, data);
          return NextResponse.json(data, { headers: corsHeaders });
        }
      }
    } catch (error) {
      console.error('Nominatim reverse proxy error:', error);
    }

    // Fallback response if Nominatim fails or times out
    const fallbackData = {
      place_id: `fallback_${lat}_${lng}`,
      display_name: `Lokasi Peta (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      lat: lat.toString(),
      lon: lng.toString(),
      address: {
        road: `Koordinat ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        county: 'Lampung',
        state: 'Lampung',
      },
    };

    return NextResponse.json(fallbackData, { headers: corsHeaders });
  }

  if (type === 'search') {
    const q = searchParams.get('q');
    if (!q || q.trim().length === 0) {
      return NextResponse.json([], { headers: corsHeaders });
    }

    const cacheKey = `search_${q.trim().toLowerCase()}`;
    if (globalThis.geocodeCache?.has(cacheKey)) {
      return NextResponse.json(globalThis.geocodeCache.get(cacheKey), { headers: corsHeaders });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=id&viewbox=103.5,-3.5,106.5,-6.2&format=json&addressdetails=1&limit=15`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 JSS-Delivery-App/1.0',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          globalThis.geocodeCache?.set(cacheKey, data);
          return NextResponse.json(data, { headers: corsHeaders });
        }
      }
    } catch (error) {
      console.error('Nominatim search proxy error:', error);
    }

    return NextResponse.json([], { headers: corsHeaders });
  }

  return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400, headers: corsHeaders });
}
