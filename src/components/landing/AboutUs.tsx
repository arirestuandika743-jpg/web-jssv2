'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Eye, MapPin, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const TRUST_CARDS = [
  {
    icon: ShieldCheck,
    title: 'Kurir Teridentifikasi',
    description: 'Pesanan diproses melalui sistem JSS dengan kurir yang terdata dan terpantau.',
    color: '#10B981',
  },
  {
    icon: Eye,
    title: 'Harga Transparan',
    description: 'Biaya dapat diketahui sebelum pesanan dibuat. Tidak ada biaya tersembunyi.',
    color: '#3B82F6',
  },
  {
    icon: MapPin,
    title: 'Layanan Lokal',
    description: 'Fokus membantu kebutuhan masyarakat Kecamatan Kalirejo dan sekitarnya.',
    color: '#FFC928',
  },
  {
    icon: Globe,
    title: 'Praktis',
    description: 'Pesan langsung melalui website tanpa perlu download aplikasi tambahan.',
    color: '#8B5CF6',
  },
];

export function AboutUs() {
  return (
    <section id="keunggulan" className="section-padding relative overflow-hidden transform-gpu">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-primary/[0.025] rounded-full blur-[160px] pointer-events-none" />

      <div className="container-padding relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-primary text-[11px] font-bold uppercase tracking-wider mb-5">
            Kenapa JSS
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight text-balance">
            Layanan Terpercaya{' '}
            <span className="gradient-text">untuk Kalirejo</span>
          </h2>
          <p className="text-sm md:text-base text-white/40 leading-relaxed font-medium">
            JSS hadir memberikan solusi layanan antar dan titip beli yang cepat, transparan, dan terpercaya.
          </p>
        </motion.div>

        {/* Trust Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRUST_CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-500 hover:-translate-y-1"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${card.color}12`, border: `1px solid ${card.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>

                <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed font-medium">{card.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { value: '100%', label: 'Driver Lokal' },
            { value: '< 15m', label: 'Estimasi Tiba' },
            { value: '24/7', label: 'Jam Operasional' },
            { value: 'Rp5K', label: 'Mulai Dari' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-2xl sm:text-3xl font-black text-primary mb-1">{stat.value}</p>
              <p className="text-[11px] text-white/30 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link href="/order" className="btn-primary text-sm px-7 py-3.5 flex items-center gap-2 rounded-2xl">
            <span>Pesan Layanan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/coverage" className="btn-outline text-sm px-7 py-3.5 rounded-2xl">
            Cek Area Coverage
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
