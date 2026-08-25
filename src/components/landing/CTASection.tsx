'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Phone, Sparkles, ShieldCheck, Zap, Bike } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-b from-white via-amber-50/40 to-white relative overflow-hidden transform-gpu">
      <div className="container-padding relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 rounded-[36px] p-8 md:p-14 text-white shadow-2xl overflow-hidden border border-white/10"
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />

          {/* Grid Overlay */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #FDB813 1.5px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-primary text-xs font-extrabold shadow-sm">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span>Siap Melayani 24 Jam di Kalirejo</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight text-balance">
                Butuh Antar Jemput atau Titip Belanjaan? <br />
                <span className="gradient-text">JSS Siap Meluncur Sekarang!</span>
              </h2>

              <p className="text-white/70 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                Pesan layanan ojek online & kurir instan se-Kecamatan Kalirejo dengan tarif transparan dan respon super cepat.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-white/80 font-bold">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Driver Terverifikasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Respon Instan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bike className="w-4 h-4 text-primary" />
                  <span>Armada Standby</span>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="lg:col-span-4 flex flex-col gap-4 justify-center items-stretch lg:items-end">
              <Link
                href="/order"
                className="btn-primary w-full sm:w-auto text-base md:text-lg font-black px-9 py-5 flex items-center justify-center gap-3 shadow-golden hover:scale-[1.04] active:scale-100 transition-all rounded-2xl group"
              >
                <span>Pesan Sekarang</span>
                <ArrowRight className="w-5 h-5 text-secondary-900 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={`https://wa.me/${BRAND.phone}`}
                target="_blank"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-extrabold px-8 py-4 flex items-center justify-center gap-2.5 rounded-2xl backdrop-blur-md transition-all shadow-md"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Chat WhatsApp Admin</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
