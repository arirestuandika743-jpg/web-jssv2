'use client';

import dynamic from 'next/dynamic';
import { Navigation } from 'lucide-react';
import { MAP_CENTER, MAP_ZOOM } from '@/lib/constants';
import type { LatLng } from '@/types';

// Lazy load ReusableMap to prevent SSR document/window undefined issues
const ReusableMap = dynamic(() => import('@/components/map/ReusableMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] md:h-[350px] bg-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-primary/80 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-secondary-500 text-xs font-medium">Memuat Peta Rute...</p>
      </div>
    </div>
  ),
});

interface OrderMapPreviewProps {
  pickupCoords: LatLng | null;
  destinationCoords: LatLng | null;
  distanceText?: string;
  durationText?: string;
  routeCoordinates?: [number, number][];
  onPickupChange?: (coords: LatLng) => void;
  onDestinationChange?: (coords: LatLng) => void;
  onClickMap?: (coords: LatLng) => void;
  activeMarkerType?: 'pickup' | 'destination';
  onActiveMarkerTypeChange?: (type: 'pickup' | 'destination') => void;
}

export function OrderMapPreview({
  pickupCoords,
  destinationCoords,
  distanceText,
  durationText,
  routeCoordinates = [],
  onPickupChange,
  onDestinationChange,
  onClickMap,
  activeMarkerType,
  onActiveMarkerTypeChange,
}: OrderMapPreviewProps) {
  return (
    <div className="relative rounded-card shadow-soft overflow-hidden border border-secondary-100">
      {/* Reusable Leaflet Map */}
      <ReusableMap
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        pickupCoords={pickupCoords}
        destinationCoords={destinationCoords}
        routeCoordinates={routeCoordinates}
        height="300px"
        onPickupChange={onPickupChange}
        onDestinationChange={onDestinationChange}
        onClickMap={onClickMap}
        activeMarkerType={activeMarkerType}
        onActiveMarkerTypeChange={onActiveMarkerTypeChange}
      />

      {/* Stats Overlay */}
      {pickupCoords && destinationCoords && distanceText && durationText && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-secondary-150 flex items-center justify-between text-left z-10">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-400">Jarak Tempuh</p>
            <p className="text-base font-extrabold text-secondary-900">{distanceText}</p>
          </div>
          <div className="w-px h-8 bg-secondary-150" />
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-400">Estimasi Waktu</p>
            <p className="text-base font-extrabold text-secondary-900">{durationText}</p>
          </div>
          <div className="w-px h-8 bg-secondary-150" />
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Navigation className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-bold">Rute Tercepat</span>
          </div>
        </div>
      )}
    </div>
  );
}
