'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Phone, Star, CheckCircle, XCircle, MoreHorizontal, Loader2, Power } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { dbService } from '@/services/db';
import type { Driver } from '@/types';
import { toast } from 'sonner';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = () => {
    setLoading(true);
    dbService.getDrivers()
      .then(data => {
        setDrivers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal mengambil data driver:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleToggleActive = (driverId: string, currentStatus: boolean) => {
    // Optimistic UI Update
    const updated = drivers.map(d => d.id === driverId ? { ...d, isActive: !currentStatus } : d);
    setDrivers(updated);

    // Save to localStorage if fallback simulation
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jss_mock_drivers');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const idx = list.findIndex((d: any) => d.id === driverId);
          if (idx !== -1) {
            list[idx].isActive = !currentStatus;
            localStorage.setItem('jss_mock_drivers', JSON.stringify(list));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    toast.success(`Status driver berhasil diubah menjadi ${!currentStatus ? 'Aktif (Online)' : 'Offline'}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Driver</h1>
            <p className="text-secondary-500 mt-1">Kelola mitra driver</p>
          </div>
          <button onClick={fetchDrivers} className="btn-outline text-sm py-2 flex items-center gap-2">
            <Loader2 className="w-4 h-4" /> Refresh
          </button>
        </div>
      </FadeIn>

      <StaggerContainer className="space-y-4">
        {drivers.map((driver) => (
          <StaggerItem key={driver.id}>
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-card p-5 shadow-soft hover:shadow-soft-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
                    <span className="font-bold text-secondary-900 text-lg">
                      {driver.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white',
                    driver.isActive ? 'bg-emerald-400' : 'bg-secondary-300'
                  )} />
                </div>
                <div>
                  <p className="font-bold text-secondary-900">{driver.name}</p>
                  <p className="text-sm text-secondary-400">{driver.vehicleType} · {driver.vehiclePlate}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-xs font-semibold text-secondary-700">{driver.rating}</span>
                    </div>
                    <span className="text-xs text-secondary-400">{driver.totalDeliveries} pengiriman</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(driver.id, driver.isActive)}
                  className={cn(
                    'badge-status flex items-center gap-1 cursor-pointer transition-all border border-transparent',
                    driver.isActive 
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                      : 'bg-secondary-100 text-secondary-500 hover:bg-secondary-200'
                  )}
                  title="Klik untuk mengubah status aktif"
                >
                  <Power className="w-3 h-3" />
                  {driver.isActive ? 'Aktif' : 'Offline'}
                </button>
                <a 
                  href={`tel:${driver.phone}`} 
                  className="w-9 h-9 rounded-lg bg-secondary-100 hover:bg-secondary-200 flex items-center justify-center transition-colors"
                  title="Telepon Driver"
                >
                  <Phone className="w-4 h-4 text-secondary-500" />
                </a>
              </div>
            </motion.div>
          </StaggerItem>
        ))}

        {drivers.length === 0 && (
          <div className="text-center py-10 text-secondary-400 text-sm">
            Tidak ada driver yang terdaftar.
          </div>
        )}
      </StaggerContainer>
    </div>
  );
}
