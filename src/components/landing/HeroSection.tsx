'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Clock, ShieldCheck, MapPin, ChevronRight, Zap } from 'lucide-react';
import { DriverSlot } from './DriverSlot';
import { DriverJourney } from './DriverJourney';

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as const, // Smooth Apple/Linear easing curve
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary-50/60 via-background to-white pt-24 lg:pt-28 pb-16 transform-gpu">
      {/* Dynamic Mesh Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-12 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] transform-gpu animate-pulse-soft" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-accent/15 rounded-full blur-[120px] transform-gpu animate-pulse-soft" style={{ animationDelay: '2s' }} />
        
        {/* Subtle Subtle Grid Dots Pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #111 1.5px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="container-padding relative z-10 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* Left Hero Content (7 Cols) */}
          <div className="lg:col-span-7 max-w-2xl">
            {/* Live Status Pill */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-xl border border-primary/30 shadow-soft mb-6 hover:border-primary/50 transition-colors">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-secondary-900 tracking-tight">
                  Driver Standby Kalirejo • Estimasi Sampai &lt; 15 Mnt
                </span>
                <Zap className="w-3.5 h-3.5 text-primary-600 fill-primary-600" />
              </div>
            </motion.div>

            {/* Large Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.8rem] font-extrabold text-secondary-900 leading-[1.08] mb-6 tracking-tight text-balance"
            >
              Solusi Layanan Antar & Titip Beli{' '}
              <span className="relative inline-block">
                <span className="gradient-text">Kalirejo Express.</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 260 12" fill="none">
                  <path d="M2 8C70 2 200 2 258 8" stroke="#FDB813" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>

            {/* Short Sub-headline */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-secondary-600 mb-9 leading-relaxed max-w-xl font-medium"
            >
              Ojek online, antar makanan, titip belaja pasar, hingga kirim paket & dokumen serba cepat, transparan, dan terpercaya di Kecamatan Kalirejo.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10"
            >
              <Link
                href="/order"
                className="btn-primary text-base font-bold px-8 py-4 flex items-center justify-center gap-3 shadow-golden hover:scale-[1.02] active:scale-100 transition-all rounded-2xl"
              >
                <Sparkles className="w-5 h-5 text-secondary-900" />
                <span>Pesan Sekarang</span>
                <ArrowRight className="w-5 h-5 text-secondary-900" />
              </Link>

              <Link
                href="/#layanan"
                className="btn-outline text-base font-bold px-8 py-4 flex items-center justify-center gap-2 rounded-2xl bg-white/80 backdrop-blur-md hover:bg-secondary-900 hover:text-white transition-all"
              >
                <span>Lihat Layanan</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Trust Markers */}
            <motion.div
              variants={itemVariants}
              className="pt-6 border-t border-secondary-200/60 grid grid-cols-3 gap-3 max-w-lg"
            >
              {[
                { icon: Clock, title: 'Super Cepat', subtitle: '15-30m Sampai' },
                { icon: ShieldCheck, title: '100% Aman', subtitle: 'Driver Terverifikasi' },
                { icon: MapPin, title: 'Jangkauan Luas', subtitle: 'Seluruh Kalirejo' },
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <badge.icon className="w-4 h-4 text-secondary-900" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary-900 leading-tight">{badge.title}</p>
                    <p className="text-[10px] text-secondary-500 font-medium">{badge.subtitle}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Reserved Slot for Animated JSS Driver (5 Cols) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 relative mt-6 lg:mt-0"
          >
            {/* The DriverSlot Component hosts the animated JSS Driver mascot */}
            <DriverSlot>
              <DriverJourney />
            </DriverSlot>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
