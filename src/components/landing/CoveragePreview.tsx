'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, CheckCircle2, Navigation2, Compass } from 'lucide-react';
import { COVERAGE_AREAS } from '@/lib/constants';

export function CoveragePreview() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section id="area-layanan" className="section-padding relative overflow-hidden transform-gpu">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary/[0.025] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="container-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Details & Villages */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <Compass className="w-3.5 h-3.5" />
                Area Operasional JSS
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight text-balance">
                Jangkauan Antar Jemput di <br />
                <span className="gradient-text">Kecamatan Kalirejo</span>
              </h2>
              <p className="text-sm md:text-base text-white/40 mb-8 leading-relaxed font-medium">
                Driver JSS siap melayani pengantaran penumpang, paket, dan titip beli di seluruh desa se-Kecamatan Kalirejo dan wilayah perbatasan sekitarnya.
              </p>
            </motion.div>

            {/* Village Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-2 gap-3 mb-10">
              {COVERAGE_AREAS.map((area, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-primary/30 transition-all">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${area.isMain ? 'text-primary' : 'text-emerald-400'}`} />
                    <div className="flex items-center justify-between w-full pr-1">
                      <span className="text-xs sm:text-sm font-bold text-white/80">{area.name}</span>
                      {area.isMain && (
                        <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                          Pusat
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
              <Link
                href="/coverage"
                className="btn-primary inline-flex items-center gap-2.5 text-xs font-bold px-7 py-4 rounded-2xl shadow-golden"
              >
                <span>Buka Peta Interaktif</span>
                <ArrowRight className="w-4 h-4 text-secondary-900" />
              </Link>
              <Link
                href="/order"
                className="bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-bold px-6 py-4 rounded-2xl border border-white/[0.08] transition-all"
              >
                Pesan Driver Ke Lokasi
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Visual Simulated Map Radar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-[#11161C] via-[#0B0F14] to-[#07090C] border border-white/[0.08] overflow-hidden shadow-cinema-xl p-6 flex flex-col justify-between">
                {/* Map Grid Radar Background */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,201,40,0.2) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,201,40,0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: '28px 28px',
                  }}
                />

                {/* Top Radar Status Bar */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-[#07090C]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/[0.08] text-[10px] sm:text-xs text-white/80 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    GPS Radar Active
                  </div>
                  <span className="text-[10px] text-primary font-mono font-bold">Kalirejo Hub</span>
                </div>

                {/* Center Animated Pin Icon */}
                <div className="relative z-10 my-auto text-center">
                  <div className="relative inline-block">
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/30 rounded-full blur-xl"
                    />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-golden border-4 border-[#07090C] mx-auto">
                      <Navigation2 className="w-9 h-9 text-secondary-900 animate-bounce" />
                    </div>
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-4">Kecamatan Kalirejo</h4>
                  <p className="text-xs text-white/60 font-medium">Pusat Hub Kurir & Driver JSS</p>
                </div>

                {/* Bottom Radius Card */}
                <div className="relative z-10 bg-white/[0.04] backdrop-blur-md rounded-2xl p-3.5 border border-white/[0.06] flex items-center justify-between text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Jangkauan ~20 KM</span>
                  </div>
                  <span className="text-primary font-bold">Ready 24/7</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
