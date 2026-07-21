'use client';

import { useEffect, useRef } from 'react';
import type { Driver } from '@/types';
import 'leaflet/dist/leaflet.css';

interface AdminMapViewProps {
  drivers: Driver[];
  selectedDriver: Driver | null;
  onSelectDriver: (driver: Driver) => void;
}

export default function AdminMapView({ drivers, selectedDriver, onSelectDriver }: AdminMapViewProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    const L = require('leaflet');

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-5.2818, 104.9833], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add driver markers
    drivers.forEach(driver => {
      if (!driver.currentLocation) return;

      const statusColors: Record<string, string> = {
        online: '#22c55e',
        offline: '#ef4444',
        delivering: '#3b82f6',
        break: '#f59e0b',
      };

      const color = statusColors[driver.status || 'offline'] || '#ef4444';
      const isSelected = selectedDriver?.id === driver.id;

      const icon = L.divIcon({
        html: `
          <div style="
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            background: ${color};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '16px' : '12px'};
            transition: all 0.2s;
            ${isSelected ? 'transform: scale(1.2); z-index: 1000;' : ''}
          ">🏍️</div>
        `,
        className: '',
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
      });

      const marker = L.marker([driver.currentLocation.lat, driver.currentLocation.lng], { icon })
        .addTo(mapRef.current);

      marker.bindPopup(`
        <div style="min-width: 180px; font-family: system-ui;">
          <p style="font-weight: bold; margin: 0 0 4px; font-size: 14px;">${driver.name}</p>
          <p style="color: #666; margin: 0 0 2px; font-size: 12px;">📱 ${driver.phone}</p>
          <p style="color: #666; margin: 0 0 2px; font-size: 12px;">🏍️ ${driver.vehiclePlate}</p>
          <p style="color: #666; margin: 0 0 2px; font-size: 12px;">⭐ ${driver.rating} · ${driver.totalDeliveries} antar</p>
          <p style="color: ${color}; font-weight: 600; margin: 4px 0 0; font-size: 12px; text-transform: uppercase;">${driver.status || 'offline'}</p>
        </div>
      `);

      marker.on('click', () => onSelectDriver(driver));
      markersRef.current.push(marker);
    });

    // Fly to selected driver
    if (selectedDriver?.currentLocation) {
      mapRef.current.flyTo(
        [selectedDriver.currentLocation.lat, selectedDriver.currentLocation.lng],
        16,
        { duration: 0.8 }
      );
    }

    return () => {};
  }, [drivers, selectedDriver, onSelectDriver]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
