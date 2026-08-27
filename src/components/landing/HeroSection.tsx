'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, ShieldCheck, MapPin, UtensilsCrossed, Package, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, mouseX, mouseY]);

  // Parallax transforms
  const bgX = useTransform(mouseX, [0, 1], [-8, 8]);
  const bgY = useTransform(mouseY, [0, 1], [-6, 6]);
  const motoX = useTransform(mouseX, [0, 1], [-15, 15]);
  const motoY = useTransform(mouseY, [0, 1], [-12, 12]);
  const cardX = useTransform(mouseX, [0, 1], [20, -20]);
  const cardY = useTransform(mouseY, [0, 1], [15, -15]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 lg:pt-32 pb-20 transform-gpu">
      {/* Ambient warm glow behind hero */}
      <motion.div
        style={isMobile ? {} : { x: bgX, y: bgY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-primary/[0.05] rounded-full blur-[160px] animate-pulse-soft" />
        <div className="absolute bottom-[5%] right-[15%] w-[400px] h-[400px] bg-accent/[0.04] rounded-full blur-[140px] animate-pulse-soft" style={{ animationDelay: '3s' }} />
      </motion.div>

      <div className="container-padding relative z-10 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-12 gap-12 lg:gap-6 items-center"
        >
          {/* Left Hero Content */}
          <div className="lg:col-span-6 max-w-xl">
            {/* Live Status Pill */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 mb-7 shadow-soft-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-semibold text-amber-800 tracking-tight">
                  Driver Standby Kalirejo
                </span>
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] font-black text-gray-900 leading-[1.05] mb-6 tracking-tight"
            >
              BUTUH APA?{' '}
              <br />
              <span className="gradient-text">JSS</span>{' '}
              <span className="text-gray-900">YANG ANTAR.</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-gray-500 mb-10 leading-relaxed max-w-md font-medium"
            >
              Pesan makanan, kirim paket, belanja, atau kebutuhan lainnya dengan mudah di Kalirejo.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12"
            >
              <Link
                href="/order"
                className="btn-primary text-sm sm:text-base font-bold px-8 py-4 flex items-center justify-center gap-3 rounded-2xl group"
              >
                <span>PESAN SEKARANG</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/#layanan"
                className="btn-outline text-sm sm:text-base font-semibold px-8 py-4 flex items-center justify-center gap-2 rounded-2xl"
              >
                <span>LIHAT LAYANAN</span>
              </Link>
            </motion.div>

            {/* Trust Markers */}
            <motion.div
              variants={itemVariants}
              className="pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 max-w-md"
            >
              {[
                { icon: Zap, title: 'Super Cepat', subtitle: '15-30m Sampai' },
                { icon: ShieldCheck, title: '100% Aman', subtitle: 'Driver Terverifikasi' },
                { icon: MapPin, title: 'Kalirejo', subtitle: 'Jangkauan Luas' },
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200">
                    <badge.icon className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-800 leading-tight">{badge.title}</p>
                    <p className="text-[9px] text-gray-400 font-medium">{badge.subtitle}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: 3D Motorcycle Scene */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-6 relative mt-8 lg:mt-0 perspective-container"
          >
            <div className="relative w-full max-w-lg mx-auto">
              {/* Ambient glow behind motorcycle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[80%] h-[80%] bg-primary/[0.06] rounded-full blur-[100px] animate-glow-pulse" />
              </div>

              {/* Realistic JSS Courier Image */}
              <motion.div
                style={isMobile ? {} : { x: motoX, y: motoY }}
                className="relative z-10 flex items-center justify-center"
              >
                <div className="relative w-full aspect-[360/220] rounded-2xl overflow-hidden border border-gray-200 shadow-soft-xl bg-white">
                  <Image
                    src="/hero-courier.png"
                    alt="JSS Delivery Courier"
                    fill
                    sizes="(max-width: 1024px) 100%, 500px"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                </div>
              </motion.div>

              {/* Floating Service Cards (different Z-depths) */}
              {!isMobile && (
                <motion.div
                  style={{ x: cardX, y: cardY }}
                  className="absolute inset-0 pointer-events-none z-20"
                >
                  {/* Card 1 — Makanan */}
                  <motion.div
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[5%] right-[-5%] bg-white shadow-soft border border-gray-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
                    style={{ transform: 'translateZ(40px)' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-800">Makanan</p>
                      <p className="text-[9px] text-gray-400">Mulai Rp5.000</p>
                    </div>
                  </motion.div>

                  {/* Card 2 — Paket */}
                  <motion.div
                    animate={{ y: [6, -6, 6] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute bottom-[15%] left-[-10%] bg-white shadow-soft border border-gray-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
                    style={{ transform: 'translateZ(30px)' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center border border-violet-200">
                      <Package className="w-4 h-4 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-800">Paket</p>
                      <p className="text-[9px] text-gray-400">Kirim Cepat</p>
                    </div>
                  </motion.div>

                  {/* Card 3 — Belanja */}
                  <motion.div
                    animate={{ y: [-5, 10, -5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute bottom-[5%] right-[5%] bg-white shadow-soft border border-gray-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
                    style={{ transform: 'translateZ(50px)' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-800">Belanja</p>
                      <p className="text-[9px] text-gray-400">Titip Beli</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
