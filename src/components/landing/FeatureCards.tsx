'use client';

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
import { StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';

export const SERVICES_LIST = [
  {
    id: 'ride',
    title: 'Ojek Online (Antar Orang)',
    description: 'Antar jemput penumpang cepat dan aman dengan helm bersih & driver ramah.',
    icon: Bike,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Populer',
    tag: 'Ojek Cepat',
  },
  {
    id: 'shopping',
    title: 'Titip Belanja Pasar & Toko',
    description: 'Bisa titip belanja kebutuhan pokok di Pasar Kalirejo atau minimarket terdekat.',
    icon: ShoppingBag,
    color: 'from-amber-500 to-orange-600',
    badge: 'Favorit Ibu',
    tag: 'Jasa Titip',
  },
  {
    id: 'food',
    title: 'Antar Makanan & Kuliner',
    description: 'Pesan makanan dari warung, kedai, atau resto kesukaan Anda di Kalirejo.',
    icon: UtensilsCrossed,
    color: 'from-orange-500 to-red-600',
    badge: 'Kuliner',
    tag: 'Cepat Saji',
  },
  {
    id: 'medicine',
    title: 'Beli Obat & Apotek',
    description: 'Titip belikan obat reseptur atau vitamin dari apotek terdekat tanpa keluar rumah.',
    icon: Pill,
    color: 'from-emerald-600 to-green-700',
    tag: 'Apotek 24/7',
  },
  {
    id: 'packages',
    title: 'Kirim Paket & Barang',
    description: 'Antar paket atau titipan barang antar desa di Kalirejo dengan aman.',
    icon: Package,
    color: 'from-purple-500 to-indigo-600',
    tag: 'Kurir Lokal',
  },
  {
    id: 'documents',
    title: 'Kirim Dokumen Penting',
    description: 'Pengiriman surat, berkas, atau dokumen penting dengan jaminan kerahasiaan.',
    icon: FileText,
    color: 'from-blue-500 to-cyan-600',
    tag: 'Express',
  },
  {
    id: 'large_cargo',
    title: 'Pengiriman Barang Besar',
    description: 'Layanan pengangkutan barang kapasitas berat atau muatan besar di Kalirejo.',
    icon: Truck,
    color: 'from-rose-500 to-red-700',
    tag: 'Kargo',
  },
  {
    id: 'carter',
    title: 'Carter Mobil & Driver',
    description: 'Sewa mobil lengkap dengan driver profesional untuk perjalanan luar desa/kota.',
    icon: Car,
    color: 'from-indigo-600 to-slate-800',
    tag: 'Sewa Mobil',
  },
];

export function FeatureCards() {
  return (
    <section id="layanan" className="section-padding bg-gradient-to-b from-white via-background to-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container-padding relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" />
            Layanan Unggulan
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary-900 mb-5">
            Layanan Lengkap untuk{' '}
            <span className="gradient-text">Segala Kebutuhan</span>
          </h2>
          <p className="text-base md:text-lg text-secondary-600 leading-relaxed font-medium">
            Pilih jenis layanan yang Anda butuhkan. Driver kami siap melayani pesanan Anda dengan respon cepat dan tarif transparan.
          </p>
        </motion.div>

        {/* Services Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES_LIST.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <StaggerItem key={service.id}>
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group relative bg-white rounded-[24px] p-6 shadow-soft hover:shadow-2xl transition-all duration-300 border border-secondary-100 flex flex-col justify-between h-full overflow-hidden"
                >
                  {/* Hover Top Accent Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-500 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    {/* Icon & Badge Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                        <IconComponent className="w-7 h-7" />
                      </div>
                      {service.badge ? (
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-primary/15 text-secondary-900 border border-primary/20">
                          {service.badge}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-secondary-100 text-secondary-500">
                          {service.tag}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-extrabold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs md:text-sm text-secondary-500 leading-relaxed mb-6 font-medium">
                      {service.description}
                    </p>
                  </div>

                  {/* CTA Link */}
                  <Link
                    href={`/order?category=${service.id}`}
                    className="inline-flex items-center justify-between w-full pt-4 border-t border-secondary-100 text-xs font-bold text-secondary-900 group-hover:text-primary-600 transition-colors"
                  >
                    <span>Pesan Layanan Ini</span>
                    <div className="w-7 h-7 rounded-full bg-secondary-50 group-hover:bg-primary group-hover:text-secondary-900 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
