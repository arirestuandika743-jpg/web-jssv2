'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Bike,
  ShoppingBag,
  UtensilsCrossed,
  Pill,
  Package,
  FileText,
  Truck,
  Car,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  MotorcycleTaxiScene,
  FoodDeliveryScene,
  ShoppingServiceScene,
  MedicineDeliveryScene,
  ParcelDeliveryScene,
  GroceryShoppingScene,
  DocumentDeliveryScene,
} from './services/ServiceAnimatedScenes';

// Map service ID to animated scene component
const SERVICE_SCENES: Record<string, React.ComponentType<{ className?: string }>> = {
  ride: MotorcycleTaxiScene,
  food: FoodDeliveryScene,
  shopping: ShoppingServiceScene,
  medicine: MedicineDeliveryScene,
  packages: ParcelDeliveryScene,
  documents: DocumentDeliveryScene,
  large_cargo: GroceryShoppingScene,
  carter: GroceryShoppingScene,
};

export const SERVICES_LIST = [
  {
    id: 'ride',
    title: 'Ojek Online',
    subtitle: 'Antar Jemput Penumpang',
    description: 'Antar jemput cepat dan nyaman di Kalirejo dengan helm bersih & driver ramah.',
    icon: Bike,
    badge: 'Populer',
  },
  {
    id: 'shopping',
    title: 'Titip Belanja Pasar',
    subtitle: 'Pasar & Minimarket',
    description: 'Bisa titip beli sayur, sembako, atau kebutuhan harian di Pasar Kalirejo.',
    icon: ShoppingBag,
    badge: 'Favorit',
  },
  {
    id: 'food',
    title: 'Antar Makanan',
    subtitle: 'Kuliner & Warung',
    description: 'Pesan makanan dari resto atau kedai favoritmu di Kalirejo langsung ke rumah.',
    icon: UtensilsCrossed,
    badge: 'Kuliner',
  },
  {
    id: 'medicine',
    title: 'Titip Beli Obat',
    subtitle: 'Apotek & Kesehatan',
    description: 'Beli obat resep atau vitamin dari apotek terdekat tanpa harus keluar.',
    icon: Pill,
    badge: 'Express',
  },
  {
    id: 'packages',
    title: 'Kirim Paket',
    subtitle: 'Barang Antar Desa',
    description: 'Antar jemput barang atau titipan kilat antar desa se-Kecamatan Kalirejo.',
    icon: Package,
    badge: 'Kurir',
  },
  {
    id: 'documents',
    title: 'Kirim Dokumen',
    subtitle: 'Berkas Important',
    description: 'Pengiriman surat dan berkas sekolah/kantor dengan jaminan kerahasiaan.',
    icon: FileText,
    badge: 'Aman',
  },
  {
    id: 'large_cargo',
    title: 'Pengiriman Besar',
    subtitle: 'Kargo & Muatan',
    description: 'Layanan angkut barang berat atau muatan besar dengan armada terpercaya.',
    icon: Truck,
    badge: 'Kargo',
  },
  {
    id: 'carter',
    title: 'Carter Mobil',
    subtitle: 'Luar Kota / Desa',
    description: 'Sewa mobil lengkap dengan driver profesional untuk perjalanan pribadi/keluarga.',
    icon: Car,
    badge: 'Carter',
  },
];

export function FeatureCards() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section id="layanan" className="section-padding bg-gradient-to-b from-white via-background to-white relative overflow-hidden transform-gpu">
      {/* Background Ambient Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="container-padding relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-secondary-900 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-secondary-900" />
            Layanan Ekosistem JSS
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary-900 mb-5 tracking-tight text-balance">
            Satu Aplikasi untuk{' '}
            <span className="gradient-text">Semua Kebutuhan Harian</span>
          </h2>
          <p className="text-base md:text-lg text-secondary-600 leading-relaxed font-medium">
            Pilih jenis layanan yang kamu perlukan. Driver profesional kami di Kalirejo siap memproses pesananmu secara cepat dan efisien.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {SERVICES_LIST.map((service) => {
            const IconComponent = service.icon;
            return (
              <motion.div key={service.id} variants={item}>
                <Link
                  href={`/order?category=${service.id}`}
                  className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-soft hover:shadow-soft-xl transition-all duration-500 border border-secondary-200/60 flex flex-col justify-between h-full overflow-hidden hover:-translate-y-1.5"
                >
                  {/* Top Glowing Gradient Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-500 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    {/* Animated Scene Illustration */}
                    {(() => {
                      const SceneComponent = SERVICE_SCENES[service.id];
                      return SceneComponent ? (
                        <div className="w-full flex items-center justify-center mb-3 -mt-2 overflow-hidden rounded-2xl bg-gradient-to-b from-secondary-50/80 to-white/40">
                          <SceneComponent className="scale-75" />
                        </div>
                      ) : null;
                    })()}

                    {/* Icon & Badge Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-primary to-accent p-3.5 flex items-center justify-center text-secondary-900 shadow-golden transition-transform duration-300 group-hover:scale-110">
                        <IconComponent className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-secondary-900/5 text-secondary-900 border border-secondary-900/10">
                        {service.badge}
                      </span>
                    </div>

                    {/* Content */}
                    <span className="text-[11px] font-bold text-secondary-400 block uppercase tracking-wider mb-1">
                      {service.subtitle}
                    </span>
                    <h3 className="text-lg font-extrabold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs md:text-sm text-secondary-500 leading-relaxed mb-6 font-medium">
                      {service.description}
                    </p>
                  </div>

                  {/* CTA Footer */}
                  <div className="inline-flex items-center justify-between w-full pt-4 border-t border-secondary-100/80 text-xs font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                    <span>Pesan Layanan Ini</span>
                    <div className="w-7 h-7 rounded-full bg-secondary-900/5 group-hover:bg-primary group-hover:text-secondary-900 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
