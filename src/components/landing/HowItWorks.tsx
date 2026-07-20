'use client';

import { motion } from 'framer-motion';
import { MousePointerClick, Calculator, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';

export const STEPS = [
  {
    step: '01',
    title: 'Pilih Layanan & Lokasi',
    description: 'Tentukan jenis layanan (Ojek/Belanja/Paket) serta tentukan titik penjemputan dan tujuan di peta.',
    icon: MousePointerClick,
    color: 'from-amber-500 to-orange-500',
  },
  {
    step: '02',
    title: 'Hitung Tarif Transparan',
    description: 'Sistem Peta Google/OSRM menghitung jarak & ongkir secara otomatis tanpa biaya tersembunyi.',
    icon: Calculator,
    color: 'from-orange-500 to-red-500',
  },
  {
    step: '03',
    title: 'Konfirmasi via WhatsApp',
    description: 'Klik pesan dan rincian booking Anda otomatis terkirim langsung ke WhatsApp admin JSS Kalirejo.',
    icon: MessageSquare,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    step: '04',
    title: 'Driver Meluncur Instan',
    description: 'Driver terdekat menerima orderan dan langsung meluncur menyelesaikan pesanan Anda dengan cepat.',
    icon: CheckCircle,
    color: 'from-blue-600 to-indigo-700',
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="section-padding bg-secondary-900 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Dots Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #FDB813 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container-padding relative z-10">
        {/* Section Header */}
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            Cara Kerja Simple
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5">
            Pesan Suruhan Dalam{' '}
            <span className="gradient-text">4 Langkah Praktis</span>
          </h2>
          <p className="text-base md:text-lg text-white/70 leading-relaxed font-medium">
            Tanpa install aplikasi rumit. Cukup dari browser ponsel Anda, pesanan siap diproses dalam hitungan detik.
          </p>
        </FadeIn>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] -translate-y-12 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 z-0" />

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {STEPS.map((stepItem, index) => {
              const IconComp = stepItem.icon;
              return (
                <StaggerItem key={index}>
                  <motion.div
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-7 shadow-2xl hover:bg-white/10 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between h-full group"
                  >
                    <div>
                      {/* Step Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stepItem.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComp className="w-7 h-7" />
                        </div>
                        <span className="text-3xl font-black text-white/20 group-hover:text-primary transition-colors font-outfit">
                          {stepItem.step}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                        {stepItem.title}
                      </h3>
                      <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                        {stepItem.description}
                      </p>
                    </div>

                    {/* Step indicator bar */}
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                      <span>Langkah {stepItem.step} Dari 04</span>
                      <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

        {/* Bottom CTA Box */}
        <FadeIn delay={0.4} className="mt-14 text-center">
          <Link
            href="/order"
            className="btn-primary inline-flex items-center gap-3 text-sm font-bold px-8 py-4 rounded-2xl shadow-golden hover:scale-105 transition-all"
          >
            Coba Buat Pesanan Sekarang
            <ArrowRight className="w-4 h-4" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
