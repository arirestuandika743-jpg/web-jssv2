'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { MapPin, Phone, Zap, Battery, Clock, Package, Navigation } from 'lucide-react';
import { courierService } from '@/services/courierService';
import { MAP_CENTER } from '@/lib/constants';
import type { Driver, CourierStatus } from '@/types';
import { FadeIn } from '@/components/layout/PageTransition';

// Dynamically import map component (SSR disabled)
const AdminMapView = dynamic(() => import('@/components/map/AdminMapView'), { ssr: false });

export default function AdminMapPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const loadDrivers = async () => {
    try {
      const driversRaw = JSON.parse(localStorage.getItem('jss_mock_drivers') || '[]') as Driver[];
      const statuses = JSON.parse(localStorage.getItem('jss_courier_status') || '[]') as { id: string; status: CourierStatus }[];
      
      // Merge status info
      const merged = driversRaw.map(d => {
        const s = statuses.find(st => st.id === d.id);
        return {
          ...d,
          status: s?.status || d.status || 'offline',
          currentLocation: d.currentLocation || {
            lat: MAP_CENTER.lat + (Math.random() - 0.5) * 0.01,
            lng: MAP_CENTER.lng + (Math.random() - 0.5) * 0.01,
          },
        };
      });
      setDrivers(merged);
    } catch (err) {
      console.error('Map load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
    const interval = setInterval(loadDrivers, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusCounts = {
    online: drivers.filter(d => d.status === 'online').length,
    offline: drivers.filter(d => d.status === 'offline').length,
    delivering: drivers.filter(d => d.status === 'delivering').length,
    break: drivers.filter(d => d.status === 'break').length,
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">🗺️ Peta Kurir</h1>
            <p className="text-secondary-500 text-sm mt-1">Pantau lokasi semua kurir real-time</p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { color: 'bg-emerald-500', label: `Online (${statusCounts.online})` },
              { color: 'bg-red-500', label: `Offline (${statusCounts.offline})` },
              { color: 'bg-blue-500', label: `Antar (${statusCounts.delivering})` },
              { color: 'bg-amber-500', label: `Istirahat (${statusCounts.break})` },
            ].map((item, i) => (
              <div key={i} className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-secondary-50 rounded-lg">
                <div className={`w-2.5 h-2.5 ${item.color} rounded-full`} />
                <span className="text-secondary-500 text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Map */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-card shadow-soft overflow-hidden" style={{ height: '600px' }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <AdminMapView
                drivers={drivers}
                selectedDriver={selectedDriver}
                onSelectDriver={setSelectedDriver}
              />
            )}
          </div>
        </div>

        {/* Driver List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-card shadow-soft p-4 max-h-[600px] overflow-y-auto">
            <h3 className="font-bold text-secondary-900 mb-3 text-sm">Daftar Kurir</h3>
            <div className="space-y-2">
              {drivers.map(d => {
                const statusColor = d.status === 'online' ? 'bg-emerald-500' :
                  d.status === 'delivering' ? 'bg-blue-500' :
                  d.status === 'break' ? 'bg-amber-500' : 'bg-red-500';

                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDriver(d)}
                    className={`w-full text-left p-3 rounded-xl hover:bg-secondary-50 transition-colors border ${
                      selectedDriver?.id === d.id ? 'border-primary bg-primary/5' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 ${statusColor} rounded-full`} />
                      <span className="text-secondary-900 font-semibold text-xs">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-secondary-400 ml-4">
                      <span>{d.vehiclePlate}</span>
                      <span>⭐ {d.rating}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Driver Detail */}
      {selectedDriver && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-card shadow-soft p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-secondary-900">Detail Kurir</h3>
            <button onClick={() => setSelectedDriver(null)} className="text-secondary-400 text-sm">Tutup</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary-50 rounded-xl p-3">
              <p className="text-secondary-400 text-xs mb-1">Nama</p>
              <p className="text-secondary-900 font-semibold text-sm">{selectedDriver.name}</p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-3">
              <p className="text-secondary-400 text-xs mb-1">Telepon</p>
              <p className="text-secondary-900 font-semibold text-sm">{selectedDriver.phone}</p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-3">
              <p className="text-secondary-400 text-xs mb-1">Kendaraan</p>
              <p className="text-secondary-900 font-semibold text-sm">{selectedDriver.vehiclePlate}</p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-3">
              <p className="text-secondary-400 text-xs mb-1">Rating</p>
              <p className="text-secondary-900 font-semibold text-sm">⭐ {selectedDriver.rating}</p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-3">
              <p className="text-secondary-400 text-xs mb-1">Status</p>
              <p className="text-secondary-900 font-semibold text-sm capitalize">{selectedDriver.status || 'offline'}</p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-3">
              <p className="text-secondary-400 text-xs mb-1">Total Antar</p>
              <p className="text-secondary-900 font-semibold text-sm">{selectedDriver.totalDeliveries}</p>
            </div>
            <div className="bg-secondary-50 rounded-xl p-3 col-span-2">
              <p className="text-secondary-400 text-xs mb-1">Lokasi Terakhir</p>
              {selectedDriver.currentLocation ? (
                <a
                  href={`https://maps.google.com/?q=${selectedDriver.currentLocation.lat},${selectedDriver.currentLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-700 font-semibold text-sm hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Buka di Google Maps
                </a>
              ) : (
                <p className="text-secondary-400 text-sm">Tidak tersedia</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
