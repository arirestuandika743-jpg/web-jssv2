'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { STATS } from '@/lib/constants';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { Zap, ShieldCheck, MapPin, MessageSquare, Award } from 'lucide-react';

/** Animated counter hook */
function useAnimatedCounter(end: number, duration: number = 2000, shouldStart: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, shouldStart]);

  return count;
}

function StatCard({ stat, index }: { stat: typeof STATS[number]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const animatedValue = useAnimatedCounter(stat.value, 2000, isInView);

  return (
    <FadeIn delay={index * 0.1}>
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.04, transition: { duration: 0.3 } }}
        className="relative bg-white rounded-[24px] p-7 text-center shadow-soft border border-secondary-100 hover:shadow-soft-xl transition-all"
      >
        <div className="text-4xl md:text-5xl font-black text-secondary-900 mb-2 font-outfit">
          {animatedValue.toLocaleString('id-ID')}
          <span className="gradient-text">{stat.suffix}</span>
        </div>
        <p className="text-xs md:text-sm text-secondary-600 font-bold uppercase tracking-wider">
          {stat.label}
        </p>
      </motion.div>
    </FadeIn>
  );
}

export function Stats() {
  const BENEFITS = [
    {
      icon: Zap,
      title: 'Respon Cepat 10-15 Menit',
      description: 'Driver standby siap dipanggil kapan saja untuk penjemputan kilat di area Kalirejo.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: ShieldCheck,
      title: 'Tarif Peta Transparan',
      description: 'Dihitung otomatis per kilometer via Google OSRM. Tanpa biaya tersembunyi atau mark-up.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: MapPin,
      title: 'Driver Warga Asli Kalirejo',
      description: 'Setiap driver mengenal seluk-beluk gang, jalan pintas, dan pasar lokal secara presisi.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: MessageSquare,
      title: 'Booking Instan via WhatsApp',
      description: 'Format pemesanan otomatis langsung terhubung ke WhatsApp official JSS Kalirejo.',
      color: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <section id="keunggulan" className="section-padding bg-gradient-to-b from-white via-background to-white relative overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] -translate-y-1/2 pointer-events-none" />

      <div className="container-padding relative z-10">
        {/* Section Header */}
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Award className="w-4 h-4 text-primary-600" />
            Keunggulan Utama
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary-900 mb-5">
            Kenapa Warga Memilih <br />
            <span className="gradient-text">Jasa Suruh Kalirejo (JSS)?</span>
          </h2>
          <p className="text-base md:text-lg text-secondary-600 leading-relaxed font-medium">
            Komitmen kami adalah memberikan layanan kurir & transportasi yang paling amanah, jujur, dan efisien.
          </p>
        </FadeIn>

        {/* Counter Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {STATS.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* Benefit Cards Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((benefit, idx) => {
            const IconComp = benefit.icon;
            return (
              <StaggerItem key={idx}>
                <motion.div
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                  className="bg-white rounded-[24px] p-7 shadow-soft border border-secondary-100 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full group"
                >
                  <div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComp className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-xs md:text-sm text-secondary-500 leading-relaxed font-medium">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
