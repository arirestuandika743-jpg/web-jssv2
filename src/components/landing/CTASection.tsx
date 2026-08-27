'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Phone, Sparkles, ShieldCheck, Zap, Bike } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export function CTASection() {
  return (
    <section className="section-padding relative overflow-hidden transform-gpu">
      {/* Cinematic Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[140px]" />
      </div>

      <div className="container-padding relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white rounded-[32px] p-8 md:p-14 text-gray-900 shadow-soft-xl border border-gray-200 overflow-hidden"
        >
          {/* Subtle Grid Overlay */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #F5B900 1.5px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold shadow-soft-xs">
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Siap Melayani 24 Jam di Kalirejo</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-950 leading-tight tracking-tight text-balance">
                BUTUH BANTUAN?<br />
                <span className="gradient-text">JSS YANG ANTAR.</span>
              </h2>

              <p className="text-gray-500 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                Pesan layanan JSS dengan mudah untuk kebutuhanmu di Kalirejo. Tarif transparan dan kurir standby cepat.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-gray-500 font-bold">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Driver Terverifikasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Respon Instan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bike className="w-4 h-4 text-amber-500" />
                  <span>Armada Standby</span>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="lg:col-span-4 flex flex-col gap-4 justify-center items-stretch lg:items-end">
              <Link
                href="/order"
                className="btn-primary w-full sm:w-auto text-sm md:text-base font-bold px-8 py-4 flex items-center justify-center gap-3 rounded-2xl group shadow-golden"
              >
                <span>PESAN SEKARANG</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={`https://wa.me/${BRAND.phone}`}
                target="_blank"
                className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-250 text-gray-700 text-xs font-bold px-7 py-3.5 flex items-center justify-center gap-2 rounded-2xl transition-all shadow-soft-xs"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Chat WhatsApp Admin</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

