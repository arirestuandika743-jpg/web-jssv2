'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Users, Zap, HeartHandshake, ArrowRight, Award, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { BRAND } from '@/lib/constants';

export function AboutUs() {
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
    <section id="keunggulan" className="section-padding bg-gradient-to-b from-white via-background to-white relative overflow-hidden transform-gpu">
      {/* Background Ambient Decor */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-padding relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left Visual Illustration */}
          <motion.div variants={itemVariants} className="order-2 lg:order-1">
            <div className="relative">
              {/* Main Dark Glass Card */}
              <div className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 rounded-[32px] p-8 sm:p-10 shadow-soft-xl border border-white/10 text-white overflow-hidden">
                {/* Subtle Grid Dots */}
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #FDB813 1.5px, transparent 0)`,
                    backgroundSize: '28px 28px',
                  }}
                />

                <div className="relative z-10 space-y-8">
                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-primary text-xs font-bold">
                    <Award className="w-4 h-4 text-primary" />
                    <span>#1 Layanan Antar & Titip Beli Kalirejo</span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
                      Dipercaya Ratusan Warga <span className="gradient-text">Setiap Hari</span>
                    </h3>
                    <p className="text-white/70 text-sm sm:text-base leading-relaxed font-medium">
                      JSS hadir memberikan solusi layanan suruhan & transportasi lokal yang jujur, cepat, dan transparan di seluruh pelosok Kecamatan Kalirejo.
                    </p>
                  </div>

                  {/* Stat Highlights */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <p className="text-2xl sm:text-3xl font-black text-primary mb-1">100%</p>
                      <p className="text-xs text-white/70 font-medium">Driver Lokal Berpengalaman</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <p className="text-2xl sm:text-3xl font-black text-white mb-1">&lt; 15m</p>
                      <p className="text-xs text-white/70 font-medium">Estimasi Tiba Penjemputan</p>
                    </div>
                  </div>

                  {/* Trust Footer Line */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10 text-xs text-white/70 font-medium">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                    <span>Semua driver teridentifikasi resmi & terpantau sistem.</span>
                  </div>
                </div>
              </div>

              {/* Floating Speed Pill */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-4 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-soft-xl border border-secondary-200/80 hidden sm:flex items-center gap-3 z-20"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-secondary-900" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary-900">Respon Super Cepat</p>
                  <p className="text-[10px] text-secondary-500 font-medium">Konfirmasi Otomatis</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Text Content */}
          <div className="order-1 lg:order-2">
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-secondary-900 text-xs font-bold uppercase tracking-wider mb-4">
                <HeartHandshake className="w-3.5 h-3.5 text-secondary-900" />
                Mengapa Memilih JSS
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-secondary-900 leading-[1.15] mb-6 tracking-tight text-balance">
                Pengalaman Layanan Cepat, <br />
                <span className="gradient-text">Transparan & Terpercaya</span>
              </h2>
              <p className="text-secondary-600 text-base sm:text-lg leading-relaxed mb-8 font-medium">
                {BRAND.name} (JSS) menghubungkan warga Kalirejo dengan layanan transportasi, kurir paket, dan titip belanjaan pasar modern tanpa kerumitan.
              </p>
            </motion.div>

            {/* Key Differentiators */}
            <motion.div variants={containerVariants} className="space-y-4 mb-10">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Tarif Transparan Tanpa Biaya Tersembunyi',
                  desc: 'Hitung estimasi jarak & ongkir secara presisi berdasarkan rute tercepat.',
                },
                {
                  icon: Users,
                  title: 'Driver Warga Asli Kalirejo',
                  desc: 'Memahami rute, gang, dan lokasi seluruh desa di Kecamatan Kalirejo secara mendalam.',
                },
                {
                  icon: Zap,
                  title: 'Respon Cepat & Layanan 24 Jam',
                  desc: 'Pemesanan dapat langsung terhubung ke WhatsApp dan sistem pemesanan online.',
                },
              ].map((item, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <div className="flex gap-4 p-4.5 rounded-2xl bg-white/80 backdrop-blur-xl shadow-soft border border-secondary-200/60 hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-secondary-900" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-secondary-900 mb-1">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-secondary-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
              <Link href="/order" className="btn-primary text-sm px-6 py-3.5 flex items-center gap-2 shadow-golden rounded-2xl">
                <span>Pesan Layanan Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/coverage" className="btn-outline text-sm px-6 py-3.5 rounded-2xl">
                Cek Area Coverage
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
