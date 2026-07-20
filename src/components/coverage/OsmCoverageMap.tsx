'use client';

import dynamic from 'next/dynamic';
import { COVERAGE_AREAS, MAP_CENTER, MAP_ZOOM } from '@/lib/constants';

const ReusableMap = dynamic(() => import('@/components/map/ReusableMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-secondary-600 text-sm">Memuat Peta JSS...</p>
      </div>
    </div>
  ),
});

export default function OsmCoverageMap() {
  // Convert COVERAGE_AREAS to Leaflet markers and circles
  const markers = COVERAGE_AREAS.map((area) => ({
    position: { lat: area.lat, lng: area.lng },
    title: area.name,
    description: `${area.description} (~${area.radius} km)`,
    type: 'center' as const,
  }));

  const circles = COVERAGE_AREAS.map((area) => ({
    name: area.name,
    description: area.description,
    isMain: area.isMain,
    lat: area.lat,
    lng: area.lng,
    radius: area.radius,
  }));

  return (
    <div className="relative w-full h-full min-h-[450px]">
      <ReusableMap
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        markers={markers}
        circles={circles}
        height="450px"
      />
    </div>
  );
}
