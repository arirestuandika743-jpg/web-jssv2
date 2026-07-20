'use client';

import { motion } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2, Star, Home, Briefcase } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';

const savedAddresses = [
  { id: 1, label: 'Rumah', icon: Home, address: 'Desa Kalirejo RT 03/RW 02, Kec. Kalirejo, Lampung Tengah', isFavorite: true },
  { id: 2, label: 'Kantor', icon: Briefcase, address: 'Kantor Kecamatan Kalirejo, Jl. Raya Kalirejo No. 1', isFavorite: true },
  { id: 3, label: 'Pasar', icon: MapPin, address: 'Pasar Kalirejo, Jl. Pasar Raya, Kalirejo', isFavorite: false },
  { id: 4, label: 'Apotek', icon: MapPin, address: 'Apotek Sehat, Jl. Merdeka No. 15, Kalirejo', isFavorite: false },
];

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Alamat Tersimpan</h1>
            <p className="text-secondary-500 mt-1">Kelola alamat favorit Anda</p>
          </div>
          <button className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Alamat
          </button>
        </div>
      </FadeIn>

      <StaggerContainer className="space-y-4">
        {savedAddresses.map((addr) => (
          <StaggerItem key={addr.id}>
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-card p-5 shadow-soft hover:shadow-soft-lg transition-all flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <addr.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-secondary-900">{addr.label}</span>
                    {addr.isFavorite && <Star className="w-3.5 h-3.5 text-primary fill-primary" />}
                  </div>
                  <p className="text-sm text-secondary-500">{addr.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="w-8 h-8 rounded-lg hover:bg-secondary-100 flex items-center justify-center transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4 text-secondary-400" />
                </button>
                <button className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors" title="Hapus">
                  <Trash2 className="w-4 h-4 text-secondary-400 hover:text-red-500" />
                </button>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
