'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng } from '@/types';
import { cn } from '@/lib/utils';
import { Compass, Maximize2, Minimize2, Ruler, Play, RotateCcw, MapPin, ZoomIn, ZoomOut, Navigation, Crosshair, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Earth radius in meters for Haversine
const R = 6371000;

// Haversine calculator
function getHaversineDistance(p1: LatLng, p2: LatLng): number {
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate angle between two points for vehicle rotation heading
function calculateHeading(p1: [number, number], p2: [number, number]): number {
  const lat1 = p1[0] * Math.PI / 180;
  const lon1 = p1[1] * Math.PI / 180;
  const lat2 = p2[0] * Math.PI / 180;
  const lon2 = p2[1] * Math.PI / 180;
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

const TILE_LAYERS = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri & Contributors',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

// Premium glowing, pulsing marker icons
const createPremiumIcon = (isPickup: boolean) => {
  const color = isPickup ? '#10B981' : '#EF4444'; // Emerald for pickup, Red for destination
  const pulseColor = isPickup ? 'bg-emerald-500' : 'bg-red-500';
  return L.divIcon({
    html: `<div class="relative flex flex-col items-center">
            <!-- Pulsing outer ring -->
            <div class="absolute -top-1 w-8 h-8 rounded-full ${pulseColor} opacity-40 animate-ping"></div>
            <!-- Pin Head -->
            <div class="relative w-8 h-8 rounded-full bg-white border-[3px] flex items-center justify-center shadow-lg hover:scale-110 transition-transform" style="border-color: ${color}">
              <div class="w-3.5 h-3.5 rounded-full" style="background-color: ${color}"></div>
            </div>
            <!-- Pin Pointer -->
            <div class="w-2.5 h-2.5 rotate-45 -mt-1.5 bg-white border-r border-b" style="border-color: ${color}"></div>
          </div>`,
    className: 'custom-premium-marker',
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -34],
  });
};

const pickupIcon = typeof window !== 'undefined' ? createPremiumIcon(true) : null;
const destIcon = typeof window !== 'undefined' ? createPremiumIcon(false) : null;
const centerIcon = typeof window !== 'undefined' ? L.divIcon({
  html: `<div class="w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-md">
          <span class="text-white text-[8px] font-bold">JSS</span>
        </div>`,
  className: 'custom-center-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
}) : null;

// User GPS icon (pulsing blue dot)
const gpsDotIcon = typeof window !== 'undefined' ? L.divIcon({
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-6 h-6 rounded-full bg-blue-500 opacity-30 animate-ping"></div>
          <div class="relative w-3.5 h-3.5 rounded-full bg-blue-600 border-[2.5px] border-white shadow-lg"></div>
        </div>`,
  className: 'user-gps-dot',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
}) : null;

// Simulated driver icon
const driverIcon = (angle: number) => L.divIcon({
  html: `<div style="transform: rotate(${angle}deg); transition: transform 0.5s ease-out;" class="flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="5.5" cy="17.5" r="2.5"/>
              <circle cx="18.5" cy="17.5" r="2.5"/>
              <path d="M3 17.5 8 10h7l4 7.5"/>
              <path d="m8 10 2-6h4l1.5 6"/>
            </svg>
          </div>
        </div>`,
  className: 'simulated-driver-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Animated scooter/motor marker icon
const animatedMotorIcon = (angle: number) => L.divIcon({
  html: `<div style="transform: rotate(${angle}deg); transition: transform 0.1s linear;" class="flex items-center justify-center">
          <div class="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="5.5" cy="17.5" r="2.5"/>
              <circle cx="18.5" cy="17.5" r="2.5"/>
              <path d="M3 17.5 8 10h7l4 7.5"/>
              <path d="m8 10 2-6h4l1.5 6"/>
            </svg>
          </div>
        </div>`,
  className: 'animated-motor-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Auto fit map bounds helper
function AutoFitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const pointsKey = JSON.stringify(points);

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, map]);

  return null;
}

// Assign map instance reference to parent
function MapRefAssigner({ setMap }: { setMap: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  return null;
}

// Map Click Listener
function MapClickHandler({ onClick }: { onClick: (coords: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export interface MapMarker {
  position: LatLng;
  title: string;
  description?: string;
  type: 'pickup' | 'destination' | 'center';
}

export interface MapCircle {
  name: string;
  description?: string;
  isMain: boolean;
  lat: number;
  lng: number;
  radius: number;
}

interface ReusableMapProps {
  center: LatLng;
  zoom: number;
  pickupCoords?: LatLng | null;
  destinationCoords?: LatLng | null;
  routeCoordinates?: [number, number][];
  markers?: MapMarker[];
  circles?: MapCircle[];
  height?: string;
  showDrivers?: boolean;
  onPickupChange?: (coords: LatLng) => void;
  onDestinationChange?: (coords: LatLng) => void;
  onClickMap?: (coords: LatLng) => void;
  routeOption?: 'fastest' | 'shortest' | 'motorcycle';
  activeMarkerType?: 'pickup' | 'destination';
  onActiveMarkerTypeChange?: (type: 'pickup' | 'destination') => void;
}

interface FakeDriver {
  id: number;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
}

export default function ReusableMap({
  center,
  zoom,
  pickupCoords,
  destinationCoords,
  routeCoordinates = [],
  markers = [],
  circles = [],
  height = '350px',
  showDrivers = false,
  onPickupChange,
  onDestinationChange,
  onClickMap,
  routeOption = 'fastest',
  activeMarkerType,
  onActiveMarkerTypeChange,
}: ReusableMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'terrain' | 'dark'>('standard');

  // GPS States
  const [gpsCoords, setGpsCoords] = useState<LatLng | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [followUser, setFollowUser] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  // Ruler / Measure Distance State
  const [rulerActive, setRulerActive] = useState(false);
  const [rulerPoints, setRulerPoints] = useState<LatLng[]>([]);

  // Driver Simulation
  const [simDrivers, setSimDrivers] = useState<FakeDriver[]>([]);

  // Animated Motor tracing route
  const [motorCoords, setMotorCoords] = useState<[number, number] | null>(null);
  const [motorHeading, setMotorHeading] = useState<number>(0);
  const [motorIndex, setMotorIndex] = useState<number>(0);

  // Initialize simulated drivers nearby
  useEffect(() => {
    const originLat = pickupCoords?.lat || center.lat;
    const originLng = pickupCoords?.lng || center.lng;

    const drivers: FakeDriver[] = Array.from({ length: 4 }).map((_, idx) => ({
      id: idx + 1,
      lat: originLat + (Math.random() - 0.5) * 0.015,
      lng: originLng + (Math.random() - 0.5) * 0.015,
      heading: Math.random() * 360,
      speed: 0.00005 + Math.random() * 0.00005,
    }));
    setSimDrivers(drivers);
  }, [center, pickupCoords]);

  // Simulated drivers random drift loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSimDrivers((prevDrivers) =>
        prevDrivers.map((driver) => {
          const deltaLat = (Math.random() - 0.5) * 0.0002;
          const deltaLng = (Math.random() - 0.5) * 0.0002;
          const newLat = driver.lat + deltaLat;
          const newLng = driver.lng + deltaLng;
          const heading = calculateHeading([driver.lat, driver.lng], [newLat, newLng]) || driver.heading;
          return { ...driver, lat: newLat, lng: newLng, heading };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Watch User location with watchPosition API
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    let watchId: number;
    if (followUser) {
      setGpsLoading(true);
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGpsCoords(coords);
          setGpsAccuracy(pos.coords.accuracy);
          setGpsLoading(false);

          if (map) {
            map.setView([coords.lat, coords.lng], 15, { animate: true });
          }
        },
        (err) => {
          console.error('GPS tracking error:', err);
          toast.error('Gagal mengakses GPS Anda.');
          setFollowUser(false);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [followUser, map]);

  // Route Motor animation loop
  useEffect(() => {
    if (routeCoordinates.length === 0) {
      setMotorCoords(null);
      return;
    }

    setMotorIndex(0);
    setMotorCoords(routeCoordinates[0]);
    setMotorHeading(0);
  }, [routeCoordinates]);

  useEffect(() => {
    if (routeCoordinates.length === 0 || motorIndex >= routeCoordinates.length) {
      // Loop trace
      if (routeCoordinates.length > 0 && motorIndex >= routeCoordinates.length) {
        setMotorIndex(0);
      }
      return;
    }

    // Determine speed: shorter route moves slower, longer moves faster to finish in ~7 seconds
    const totalSteps = routeCoordinates.length;
    const intervalTime = Math.max(30, Math.min(120, 7000 / totalSteps));

    const timeout = setTimeout(() => {
      const currentPoint = routeCoordinates[motorIndex];
      setMotorCoords(currentPoint);

      if (motorIndex < routeCoordinates.length - 1) {
        const nextPoint = routeCoordinates[motorIndex + 1];
        const heading = calculateHeading(currentPoint, nextPoint);
        setMotorHeading(heading);
      }

      setMotorIndex((prev) => prev + 1);
    }, intervalTime);

    return () => clearTimeout(timeout);
  }, [motorIndex, routeCoordinates]);

  // Bound points calculation
  const boundsPoints: [number, number][] = [];
  if (pickupCoords) boundsPoints.push([pickupCoords.lat, pickupCoords.lng]);
  if (destinationCoords) boundsPoints.push([destinationCoords.lat, destinationCoords.lng]);
  if (gpsCoords) boundsPoints.push([gpsCoords.lat, gpsCoords.lng]);

  if (boundsPoints.length === 0 && markers.length > 0) {
    markers.forEach((m) => boundsPoints.push([m.position.lat, m.position.lng]));
  }
  if (boundsPoints.length === 0) {
    boundsPoints.push([center.lat, center.lng]);
  }

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!mapWrapperRef.current) return;
    if (!document.fullscreenElement) {
      mapWrapperRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {
        toast.error('Gagal membuka layar penuh');
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Map Controls functions
  const handleRecenter = () => {
    if (!map) return;
    if (pickupCoords) {
      map.setView([pickupCoords.lat, pickupCoords.lng], 15, { animate: true });
    } else {
      map.setView([center.lat, center.lng], zoom, { animate: true });
    }
    toast.success('Peta dikembalikan ke titik awal');
  };

  const handleCompassNorth = () => {
    if (!map) return;
    // Map reset orientation (compass face north)
    map.setView(map.getCenter(), map.getZoom(), { animate: true });
    toast.info('Kompas diarahkan ke Utara');
  };

  const handleMeasureDistance = () => {
    setRulerActive((prev) => {
      const next = !prev;
      if (next) {
        setRulerPoints([]);
        toast.info('Ruler aktif. Silakan klik beberapa titik di peta untuk mengukur jarak.');
      } else {
        toast.info('Ruler dinonaktifkan.');
      }
      return next;
    });
  };

  const handleClearRuler = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRulerPoints([]);
    toast.info('Jalur penggaris dihapus.');
  };

  const handleMapClickInternal = (coords: LatLng) => {
    if (rulerActive) {
      setRulerPoints((prev) => [...prev, coords]);
    } else if (onClickMap) {
      onClickMap(coords);
    }
  };

  // Calculate cumulative ruler distance
  const getRulerDistance = () => {
    if (rulerPoints.length < 2) return 0;
    let dist = 0;
    for (let i = 0; i < rulerPoints.length - 1; i++) {
      dist += getHaversineDistance(rulerPoints[i], rulerPoints[i + 1]);
    }
    return dist;
  };

  // Choose route polyline style/color
  const getRouteColor = () => {
    if (routeOption === 'shortest') return '#10B981'; // Green for shortest
    if (routeOption === 'motorcycle') return '#FDB813'; // Amber for bike friendly
    return '#3B82F6'; // Blue for fastest
  };

  return (
    <div
      ref={mapWrapperRef}
      style={{ height, width: '100%', position: 'relative' }}
      className="leaflet-map-wrapper rounded-card overflow-hidden group shadow-soft"
    >
      {/* Floating Style Switcher */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-2xl shadow-soft border border-secondary-100 space-x-1">
        {(['standard', 'satellite', 'terrain', 'dark'] as const).map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => setMapStyle(style)}
            className={cn(
              'px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-xl transition-all',
              mapStyle === style
                ? 'bg-secondary-900 text-white shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
            )}
          >
            {style}
          </button>
        ))}
      </div>

      {/* Floating Control Center (Right Side) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2.5">
        {/* Compass North */}
        <button
          type="button"
          onClick={handleCompassNorth}
          className="w-10 h-10 rounded-xl bg-white hover:bg-secondary-50 text-secondary-800 shadow-md border border-secondary-150 flex items-center justify-center transition-all active:scale-95"
          title="Arahkan Utara"
        >
          <Compass className="w-5 h-5 text-secondary-700 animate-spin-slow" />
        </button>

        {/* User GPS Locate toggler */}
        <button
          type="button"
          onClick={() => setFollowUser((prev) => !prev)}
          className={cn(
            'w-10 h-10 rounded-xl shadow-md border flex items-center justify-center transition-all active:scale-95',
            followUser
              ? 'bg-blue-600 border-blue-700 text-white hover:bg-blue-700'
              : 'bg-white border-secondary-150 text-secondary-800 hover:bg-secondary-50'
          )}
          title="Ikuti GPS Saya"
        >
          {gpsLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Crosshair className="w-5 h-5" />
          )}
        </button>

        {/* Recenter */}
        <button
          type="button"
          onClick={handleRecenter}
          className="w-10 h-10 rounded-xl bg-white hover:bg-secondary-50 text-secondary-800 shadow-md border border-secondary-150 flex items-center justify-center transition-all active:scale-95"
          title="Recenter"
        >
          <Navigation className="w-5 h-5 text-primary rotate-45" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-white rounded-xl shadow-md border border-secondary-150 overflow-hidden">
          <button
            type="button"
            onClick={() => map?.zoomIn()}
            className="w-10 h-10 hover:bg-secondary-50 text-secondary-800 flex items-center justify-center transition-all active:scale-95 border-b border-secondary-100"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => map?.zoomOut()}
            className="w-10 h-10 hover:bg-secondary-50 text-secondary-800 flex items-center justify-center transition-all active:scale-95"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>

        {/* Ruler measurement tool */}
        <button
          type="button"
          onClick={handleMeasureDistance}
          className={cn(
            'w-10 h-10 rounded-xl shadow-md border flex items-center justify-center transition-all active:scale-95',
            rulerActive
              ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'
              : 'bg-white border-secondary-150 text-secondary-800 hover:bg-secondary-50'
          )}
          title="Ukur Jarak Rute"
        >
          <Ruler className="w-5 h-5" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="w-10 h-10 rounded-xl bg-white hover:bg-secondary-50 text-secondary-800 shadow-md border border-secondary-150 flex items-center justify-center transition-all active:scale-95"
          title="Fullscreen Map"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Floating Ruler Output Overlay */}
      {rulerActive && (
        <div className="absolute bottom-4 left-4 right-16 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-emerald-100 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800">
            <Ruler className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-[9px] uppercase font-bold text-secondary-400">Ruler Jarak</p>
              <p className="text-sm font-extrabold font-outfit">
                {rulerPoints.length < 2
                  ? 'Klik titik di peta...'
                  : `${(getRulerDistance() / 1000).toFixed(2)} km (${rulerPoints.length} titik)`}
              </p>
            </div>
          </div>
          {rulerPoints.length > 0 && (
            <button
              type="button"
              onClick={handleClearRuler}
              className="text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200"
            >
              Hapus Jalur
            </button>
          )}
        </div>
      )}

      {/* Floating Click Target Selector */}
      {!rulerActive && onPickupChange && onDestinationChange && activeMarkerType && (
        <div className="absolute bottom-4 left-4 z-[1000] flex items-center bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-soft border border-secondary-150 space-x-1">
          <span className="text-[9px] font-bold text-secondary-500 px-2 uppercase tracking-wider">Set Peta:</span>
          <button
            type="button"
            onClick={() => onActiveMarkerTypeChange?.('pickup')}
            className={cn(
              'px-3 py-1.5 text-[10px] font-extrabold rounded-xl transition-all flex items-center gap-1.5',
              activeMarkerType === 'pickup'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Jemput
          </button>
          <button
            type="button"
            onClick={() => onActiveMarkerTypeChange?.('destination')}
            className={cn(
              'px-3 py-1.5 text-[10px] font-extrabold rounded-xl transition-all flex items-center gap-1.5',
              activeMarkerType === 'destination'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Tujuan
          </button>
        </div>
      )}

      {/* Map Main */}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <MapRefAssigner setMap={setMap} />

        <TileLayer attribution={TILE_LAYERS[mapStyle].attribution} url={TILE_LAYERS[mapStyle].url} />

        {/* Map Click Listener */}
        <MapClickHandler onClick={handleMapClickInternal} />

        {/* User GPS location dot and accuracy radius */}
        {gpsCoords && gpsDotIcon && (
          <>
            <Marker position={[gpsCoords.lat, gpsCoords.lng]} icon={gpsDotIcon}>
              <Popup>
                <div className="text-xs font-sans text-center">
                  <p className="font-bold text-blue-600">Lokasi GPS Anda</p>
                  {gpsAccuracy && <p className="text-[10px] text-secondary-400">Akurasi: ±{Math.round(gpsAccuracy)}m</p>}
                </div>
              </Popup>
            </Marker>
            {gpsAccuracy && gpsAccuracy <= 1000 && (
              <Circle
                center={[gpsCoords.lat, gpsCoords.lng]}
                radius={gpsAccuracy}
                pathOptions={{
                  color: '#3B82F6',
                  fillColor: '#3B82F6',
                  fillOpacity: 0.1,
                  weight: 1,
                }}
              />
            )}
          </>
        )}

        {/* Render Pickup Marker */}
        {pickupCoords && pickupIcon && (
          <Marker
            position={[pickupCoords.lat, pickupCoords.lng]}
            icon={pickupIcon}
            draggable={!rulerActive}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                if (onPickupChange) onPickupChange({ lat: pos.lat, lng: pos.lng });
              },
            }}
          >
            <Popup>
              <div className="font-sans text-xs">
                <p className="font-bold text-emerald-600">📍 Titik Penjemputan</p>
                <p className="text-[9px] text-secondary-400 mt-0.5">Geser untuk mengubah titik</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render Destination Marker */}
        {destinationCoords && destIcon && (
          <Marker
            position={[destinationCoords.lat, destinationCoords.lng]}
            icon={destIcon}
            draggable={!rulerActive}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                if (onDestinationChange) onDestinationChange({ lat: pos.lat, lng: pos.lng });
              },
            }}
          >
            <Popup>
              <div className="font-sans text-xs">
                <p className="font-bold text-red-600">🏁 Titik Tujuan</p>
                <p className="text-[9px] text-secondary-400 mt-0.5">Geser untuk mengubah titik</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Simulated driver markers */}
        {showDrivers && simDrivers.map((driver) => (
          <Marker
            key={`driver-${driver.id}`}
            position={[driver.lat, driver.lng]}
            icon={driverIcon(driver.heading)}
          >
            <Popup>
              <div className="text-xs font-sans">
                <p className="font-bold text-secondary-900">Kurir JSS Terdekat</p>
                <p className="text-[9px] text-secondary-500">Status: Siap Melayani</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Animated Scooter/Motor following OSRM route */}
        {motorCoords && (
          <Marker position={motorCoords} icon={animatedMotorIcon(motorHeading)} />
        )}

        {/* Ruler drawing polyline and distance markers */}
        {rulerActive && rulerPoints.length > 0 && (
          <>
            <Polyline
              positions={rulerPoints.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: '#10B981',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.8,
              }}
            />
            {rulerPoints.map((point, idx) => (
              <Marker
                key={`ruler-dot-${idx}`}
                position={[point.lat, point.lng]}
                icon={L.divIcon({
                  html: `<div class="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-sm flex items-center justify-center text-white text-[8px]">${idx + 1}</div>`,
                  className: 'ruler-dot-icon',
                  iconSize: [12, 12],
                  iconAnchor: [6, 6],
                })}
              />
            ))}
          </>
        )}

        {/* Render Route Polyline */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: getRouteColor(),
              weight: 5,
              opacity: 0.8,
            }}
          />
        )}

        {/* Coverage circles */}
        {circles.map((circle, idx) => (
          <Circle
            key={idx}
            center={[circle.lat, circle.lng]}
            radius={circle.radius * 1000}
            pathOptions={{
              color: circle.isMain ? '#FDB813' : '#10B981',
              fillColor: circle.isMain ? '#FEF0CF' : '#A7F3D0',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          />
        ))}

        {/* Render markers */}
        {markers.map((marker, idx) => {
          const icon = marker.type === 'pickup' ? pickupIcon :
                       marker.type === 'destination' ? destIcon : centerIcon;
          if (!icon) return null;
          return (
            <Marker key={`mark-${idx}`} position={[marker.position.lat, marker.position.lng]} icon={icon}>
              <Popup>
                <div className="font-sans text-xs p-1">
                  <h4 className="font-bold text-secondary-900">{marker.title}</h4>
                  {marker.description && <p className="text-secondary-500 mt-1 leading-relaxed">{marker.description}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Auto boundaries resize helper */}
        <AutoFitBounds points={boundsPoints} />
      </MapContainer>
    </div>
  );
}
