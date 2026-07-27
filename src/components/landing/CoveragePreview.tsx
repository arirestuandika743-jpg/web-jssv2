'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, CheckCircle2, Navigation2, Compass } from 'lucide-react';
import { COVERAGE_AREAS } from '@/lib/constants';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';

export function CoveragePreview() {
  return (
    <section id="area-layanan" className="section-padding bg-secondary-900 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #FDB813 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="container-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-white/10">
                <Compass className="w-4 h-4 text-primary" />
                Area Operasional Resmi
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                Jangkauan Layanan di <br />
                <span className="gradient-text">Kecamatan Kalirejo</span>
              </h2>
              <p className="text-base md:text-lg text-white/70 mb-8 leading-relaxed font-medium">
                Sistem pengantaran kami menjangkau seluruh desa di Kecamatan Kalirejo dan batas wilayah sekitarnya. Pengantaran dijamin cepat dengan rute navigasi optimal.
              </p>
            </FadeIn>

            {/* Village Grid */}
            <StaggerContainer className="grid grid-cols-2 gap-3 mb-10">
              {COVERAGE_AREAS.map((area, index) => (
                <StaggerItem key={index}>
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/40 transition-all">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${area.isMain ? 'text-primary' : 'text-emerald-400'}`} />
                    <div className="flex items-center justify-between w-full pr-1">
                      <span className="text-xs md:text-sm font-bold text-white">{area.name}</span>
                      {area.isMain && (
                        <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                          Pusat
                        </span>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeIn delay={0.3}>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/coverage"
                  className="btn-primary inline-flex items-center gap-2.5 text-xs font-bold px-7 py-4 rounded-2xl shadow-golden"
                >
                  Buka Peta Interaktif Lengkap
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/order"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-6 py-4 rounded-2xl border border-white/15 transition-all"
                >
                  Pesan Driver Ke Lokasi Saya
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Visual Simulated Map */}
          <FadeIn direction="right">
            <div className="relative">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-secondary-800 via-secondary-900 to-black border border-white/15 overflow-hidden shadow-2xl p-6 flex flex-col justify-between">
                  {/* Map Grid Background */}
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(253,184,19,0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(253,184,19,0.3) 1px, transparent 1px)
                      `,
                      backgroundSize: '28px 28px',
                    }}
                  />

                  {/* Top Map Status Pill */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-secondary-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs text-white/80 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      GPS Live Radar Kalirejo
                    </div>
                    <span className="text-[10px] text-primary font-mono font-bold">5.2760° S, 104.9825° E</span>
                  </div>

                  {/* Center Visual Pins */}
                  <div className="relative z-10 my-auto text-center">
                    <div className="relative inline-block">
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-primary/40 rounded-full blur-xl"
                      />
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-golden border-4 border-secondary-900 mx-auto">
                        <Navigation2 className="w-9 h-9 text-secondary-900 animate-bounce" />
                      </div>
                    </div>
                    <h4 className="text-base font-extrabold text-white mt-4">Kecamatan Kalirejo</h4>
                    <p className="text-xs text-white/60 font-medium">Pusat Operasional Kurir & Ojek JSS</p>
                  </div>

                  {/* Bottom Coverage Summary Footer */}
                  <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center justify-between text-xs text-white/80">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>Radius Operasional ~20 KM</span>
                    </div>
                    <span className="text-primary font-bold">100% Terjangkau</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
