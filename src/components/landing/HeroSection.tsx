'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Navigation,
  Star,
  CheckCircle2,
  Bike,
  ShoppingBag,
} from 'lucide-react';
import { BRAND } from '@/lib/constants';

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-b from-primary-50/70 via-background to-white pt-24 lg:pt-28 pb-16">
      {/* Dynamic Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px] animate-pulse-soft" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
        
        {/* Subtle Dots Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #111 1px, transparent 0)`,
            backgroundSize: '36px 36px',
          }}
        />

        {/* Decorative Floating Shapes */}
        <motion.div
          animate={{ y: [-12, 12, -12], rotate: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-[12%] w-16 h-16 rounded-3xl bg-gradient-to-br from-primary via-primary-500 to-accent opacity-20 hidden lg:block shadow-golden"
        />
        <motion.div
          animate={{ y: [12, -12, 12], rotate: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-[8%] w-12 h-12 rounded-full bg-gradient-to-br from-secondary-900 to-secondary-700 opacity-15 hidden lg:block"
        />
      </div>

      <div className="container-padding relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column (7 Cols) */}
          <div className="lg:col-span-7 max-w-2xl">
            {/* Top Live Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-xl border border-primary/30 shadow-soft mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-secondary-900">
                  Driver Kalirejo Standby • 15 Menit Sampai
                </span>
                <Sparkles className="w-3.5 h-3.5 text-primary-600" />
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.6rem] font-extrabold text-secondary-900 leading-[1.1] mb-6 text-balance tracking-tight"
            >
              Mau Nitip atau Bepergian?{' '}
              <span className="relative inline-block">
                <span className="gradient-text">JSS Siap Antar!</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 240 12" fill="none">
                  <path d="M2 8C60 2 180 2 238 8" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-secondary-600 mb-9 leading-relaxed max-w-xl font-medium"
            >
              Layanan Ojek Online, Titip Belanja Pasar, Antar Makanan, dan Kurir Paket Terpercaya di Kecamatan Kalirejo & Sekitarnya. Cepat, Transparan, & Terjangkau!
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10"
            >
              <Link
                href="/order"
                className="btn-primary text-base font-bold px-8 py-4 flex items-center justify-center gap-3 shadow-golden hover:scale-[1.02] transition-all rounded-2xl"
              >
                Pesan Sekarang
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/order#pricing"
                className="btn-outline text-base font-bold px-8 py-4 flex items-center justify-center gap-2 rounded-2xl bg-white/80 backdrop-blur-md"
              >
                Hitung Estimasi Ongkir
              </Link>
            </motion.div>

            {/* Trust Markers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4 border-t border-secondary-200/60 grid grid-cols-3 gap-3 max-w-lg"
            >
              {[
                { icon: Clock, title: 'Super Cepat', subtitle: '15-30m Sampai' },
                { icon: ShieldCheck, title: '100% Aman', subtitle: 'Driver Terverifikasi' },
                { icon: MapPin, title: 'Jangkauan Luas', subtitle: 'Seluruh Kalirejo' },
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <badge.icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary-900 leading-tight">{badge.title}</p>
                    <p className="text-[10px] text-secondary-500 font-medium">{badge.subtitle}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Visual Glass Card (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative mt-6 lg:mt-0"
          >
            <div className="relative mx-auto max-w-md">
              {/* Outer Glowing Border */}
              <div className="relative bg-white/90 backdrop-blur-2xl rounded-[32px] p-7 shadow-2xl border border-white/60">
                {/* Header Strip */}
                <div className="flex items-center justify-between pb-5 border-b border-secondary-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-golden">
                      <Bike className="w-5 h-5 text-secondary-900" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-secondary-900">Simulasi Pemesanan</h4>
                      <p className="text-[11px] text-secondary-500">Hitung Jarak Otomatis (OSRM)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    Sistem Aktif
                  </span>
                </div>

                {/* Route Timeline */}
                <div className="py-5 space-y-4">
                  {/* Pickup */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-semibold text-secondary-400 uppercase tracking-wider">Lokasi Penjemputan</span>
                      <p className="text-xs font-bold text-secondary-900">Pasar Kalirejo (Depan Masjid)</p>
                    </div>
                  </div>

                  {/* Dotted Line */}
                  <div className="pl-4 -my-2 flex items-center gap-2">
                    <div className="w-0.5 h-6 border-l-2 border-dashed border-primary-400" />
                    <span className="text-[10px] font-bold text-primary-600 bg-primary/10 px-2 py-0.5 rounded-full">
                      Jarak ~3.2 KM (Rute Tercepat)
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Navigation className="w-4 h-4 text-primary-700" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-semibold text-secondary-400 uppercase tracking-wider">Titik Tujuan</span>
                      <p className="text-xs font-bold text-secondary-900">Desa Srimulyo, Kalirejo</p>
                    </div>
                  </div>
                </div>

                {/* Price Box */}
                <div className="bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-900 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] text-white/60 font-semibold block uppercase">Total Estimasi Tarif</span>
                    <span className="text-2xl font-black text-primary">Rp 12.000</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 font-bold block flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3 h-3" /> Siap Meluncur
                    </span>
                    <span className="text-xs text-white/80 font-semibold">ETA ~6 Menit</span>
                  </div>
                </div>

                {/* CTA inside card */}
                <Link
                  href="/order"
                  className="mt-4 btn-primary w-full py-3 text.center font-bold text-xs flex items-center justify-center gap-2 rounded-xl"
                >
                  Pesan Rute Ini Sekarang
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Floating Testimonial Pill */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-5 -left-6 bg-white rounded-2xl p-3.5 shadow-soft-xl border border-secondary-100 flex items-center gap-3 max-w-[210px]"
              >
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-bold text-secondary-900 text-xs shadow-golden">
                  RS
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-[11px] font-bold text-secondary-900 leading-none">&quot;Pesen ojek 5m dateng!&quot;</p>
                  <p className="text-[9px] text-secondary-400 mt-0.5">— Rina S, Kalirejo</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
