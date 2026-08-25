'use client';

import { motion } from 'framer-motion';
import { MousePointerClick, Calculator, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const STEPS = [
  {
    step: '01',
    title: 'Pilih Layanan & Lokasi',
    description: 'Tentukan jenis kebutuhan (Ojek / Belanja / Paket) dan pilih lokasi jemput & tujuan.',
    icon: MousePointerClick,
  },
  {
    step: '02',
    title: 'Hitung Ongkir Otomatis',
    description: 'Sistem menghitung jarak aktual & estimasi tarif secara presisi tanpa biaya tambahan.',
    icon: Calculator,
  },
  {
    step: '03',
    title: 'Konfirmasi WhatsApp',
    description: 'Order otomatis terkirim langsung ke admin WhatsApp JSS untuk diproses instan.',
    icon: MessageSquare,
  },
  {
    step: '04',
    title: 'Driver Meluncur',
    description: 'Driver terdekat di Kalirejo menerima pesanan dan langsung jemput / antar tepat waktu.',
    icon: CheckCircle2,
  },
];

export function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section id="cara-kerja" className="section-padding bg-secondary-900 text-white relative overflow-hidden transform-gpu">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Mesh Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #FDB813 1.5px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="container-padding relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            Proses Pemesanan Praktis
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight text-balance">
            Cara Kerja Simple Dalam{' '}
            <span className="gradient-text">4 Langkah Mudah</span>
          </h2>
          <p className="text-base md:text-lg text-white/70 leading-relaxed font-medium">
            Tanpa perlu download aplikasi rumit. Cukup pesan langsung dari browser smartphone kamu dengan cepat.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
        >
          {STEPS.map((stepItem, index) => {
            const IconComp = stepItem.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 shadow-2xl hover:bg-white/10 hover:border-primary/40 transition-all duration-500 flex flex-col justify-between h-full group hover:-translate-y-1.5">
                  <div>
                    {/* Header: Icon & Step Number */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-primary via-primary-400 to-accent flex items-center justify-center text-secondary-900 shadow-golden transition-transform duration-300 group-hover:scale-110">
                        <IconComp className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className="text-3xl font-black text-white/20 group-hover:text-primary transition-colors">
                        {stepItem.step}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {stepItem.title}
                    </h3>
                    <p className="text-xs md:text-sm text-white/60 leading-relaxed font-medium">
                      {stepItem.description}
                    </p>
                  </div>

                  {/* Step Footer Indicator */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40 font-semibold">
                    <span>Langkah {stepItem.step} Dari 04</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 text-center"
        >
          <Link
            href="/order"
            className="btn-primary inline-flex items-center gap-3 text-sm font-bold px-8 py-4 rounded-2xl shadow-golden hover:scale-105 transition-all"
          >
            <span>Mulai Buat Pesanan Sekarang</span>
            <ArrowRight className="w-4 h-4 text-secondary-900" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
