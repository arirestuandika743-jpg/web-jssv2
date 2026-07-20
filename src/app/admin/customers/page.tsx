'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Phone, MapPin, Calendar, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { dbService } from '@/services/db';
import type { User } from '@/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbService.getCustomers()
      .then(data => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal mengambil data pelanggan:', err);
        setLoading(false);
      });
  }, []);

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
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Pelanggan</h1>
        <p className="text-secondary-500 mt-1">Daftar semua pelanggan terdaftar</p>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => (
          <StaggerItem key={customer.id}>
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-card p-5 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between min-h-[180px]"
            >
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-secondary-900">
                      {customer.name ? customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-secondary-900 truncate">{customer.name || 'Pengguna JSS'}</p>
                    <p className="text-xs text-secondary-400 truncate">{customer.email || 'No Email'}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-secondary-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{customer.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Kalirejo, Lampung Tengah</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-secondary-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-secondary-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Terdaftar:{' '}
                    {customer.createdAt 
                      ? new Date(customer.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
                      : 'Nov 2024'}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-primary fill-primary" />
                  ))}
                </div>
              </div>
            </motion.div>
          </StaggerItem>
        ))}

        {customers.length === 0 && (
          <div className="col-span-full text-center py-10 text-secondary-400 text-sm bg-white rounded-card p-6 shadow-soft">
            Belum ada pelanggan terdaftar.
          </div>
        )}
      </StaggerContainer>
    </div>
  );
}
