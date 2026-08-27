'use client';

import { motion } from 'framer-motion';
import { MousePointerClick, Calculator, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    step: '01', title: 'Pilih Layanan',
    description: 'Tentukan jenis kebutuhan dan pilih lokasi jemput & tujuan.',
    icon: MousePointerClick,
  },
  {
    step: '02', title: 'Tentukan Pesanan',
    description: 'Isi detail pesanan dan sistem menghitung ongkir secara otomatis.',
    icon: Calculator,
  },
  {
    step: '03', title: 'Kurir Memproses',
    description: 'Order terkirim ke admin WhatsApp JSS dan kurir memproses pesanan.',
    icon: MessageSquare,
  },
  {
    step: '04', title: 'Pesanan Sampai',
    description: 'Kurir terdekat di Kalirejo mengantarkan pesanan tepat waktu.',
    icon: CheckCircle2,
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="section-padding relative overflow-hidden transform-gpu">
      {/* Ambient glows */}
      <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[160px] pointer-events-none" />

      <div className="container-padding relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-wider mb-5">
            Cara Kerja JSS
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-5 tracking-tight text-balance">
            Pesan dalam{' '}
            <span className="gradient-text">4 Langkah Mudah</span>
          </h2>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed font-medium">
            Tanpa perlu download aplikasi. Cukup pesan langsung dari browser smartphone kamu.
          </p>
        </motion.div>

        {/* Steps Grid with connecting line */}
        <div className="relative">
          {/* Connecting Line (desktop only) */}
          <div className="hidden lg:block absolute top-[60px] left-[12.5%] right-[12.5%] h-[1px]">
            <div className="w-full h-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {STEPS.map((stepItem, index) => {
              const IconComp = stepItem.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:bg-gray-50/50 hover:border-amber-400 shadow-soft-xs transition-all duration-500 group h-full">
                    {/* Step Number */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <IconComp className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-3xl font-black text-gray-200 group-hover:text-amber-500/30 transition-colors">
                        {stepItem.step}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {stepItem.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      {stepItem.description}
                    </p>

                    {/* Footer */}
                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                      <span>Langkah {stepItem.step}</span>
                      <ArrowRight className="w-3 h-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 text-center"
        >
          <Link
            href="/order"
            className="btn-primary inline-flex items-center gap-3 text-sm font-bold px-8 py-4 rounded-2xl group"
          >
            <span>Mulai Buat Pesanan</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

