'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, MapPin, Zap, UtensilsCrossed, Package, ShoppingBag, Pill } from 'lucide-react';
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
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-semibold text-white/60 tracking-tight">
                  Driver Standby Kalirejo
                </span>
                <Zap className="w-3 h-3 text-primary fill-primary" />
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] font-black text-white leading-[1.05] mb-6 tracking-tight"
            >
              BUTUH APA?{' '}
              <br />
              <span className="gradient-text">JSS</span>{' '}
              <span className="text-white">YANG ANTAR.</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-white/50 mb-10 leading-relaxed max-w-md font-medium"
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
              className="pt-6 border-t border-white/[0.06] grid grid-cols-3 gap-4 max-w-md"
            >
              {[
                { icon: Zap, title: 'Super Cepat', subtitle: '15-30m Sampai' },
                { icon: ShieldCheck, title: '100% Aman', subtitle: 'Driver Terverifikasi' },
                { icon: MapPin, title: 'Kalirejo', subtitle: 'Jangkauan Luas' },
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/10">
                    <badge.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white/80 leading-tight">{badge.title}</p>
                    <p className="text-[9px] text-white/30 font-medium">{badge.subtitle}</p>
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

              {/* 3D Motorcycle SVG Scene */}
              <motion.div
                style={isMobile ? {} : { x: motoX, y: motoY }}
                className="relative z-10"
              >
                <MotorcycleScene />
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
                    className="absolute top-[5%] right-[-5%] glass-cinema-subtle px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
                    style={{ transform: 'translateZ(40px)' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                      <UtensilsCrossed className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white">Makanan</p>
                      <p className="text-[9px] text-white/30">Mulai Rp5.000</p>
                    </div>
                  </motion.div>

                  {/* Card 2 — Paket */}
                  <motion.div
                    animate={{ y: [6, -6, 6] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute bottom-[15%] left-[-10%] glass-cinema-subtle px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
                    style={{ transform: 'translateZ(30px)' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                      <Package className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white">Paket</p>
                      <p className="text-[9px] text-white/30">Kirim Cepat</p>
                    </div>
                  </motion.div>

                  {/* Card 3 — Belanja */}
                  <motion.div
                    animate={{ y: [-5, 10, -5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute bottom-[5%] right-[5%] glass-cinema-subtle px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
                    style={{ transform: 'translateZ(50px)' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white">Belanja</p>
                      <p className="text-[9px] text-white/30">Titip Beli</p>
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

/* ── Premium SVG Motorcycle Scene ── */
function MotorcycleScene() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
        {/* Ground shadow */}
        <ellipse cx="200" cy="340" rx="140" ry="18" fill="url(#groundShadow)" opacity="0.4" />

        {/* Delivery Box */}
        <g transform="translate(155, 120)">
          {/* Box body */}
          <rect x="0" y="0" width="90" height="70" rx="8" fill="#171D24" stroke="rgba(255,201,40,0.3)" strokeWidth="1.5" />
          <rect x="0" y="0" width="90" height="20" rx="8" fill="#1D232D" />
          <rect x="0" y="12" width="90" height="8" fill="#1D232D" />
          {/* JSS Label */}
          <text x="45" y="50" textAnchor="middle" fill="#FFC928" fontSize="16" fontWeight="800" fontFamily="Inter, sans-serif">JSS</text>
          {/* Strap */}
          <rect x="35" y="-8" width="20" height="8" rx="4" fill="#FFC928" opacity="0.8" />
        </g>

        {/* Motorcycle Body */}
        <g transform="translate(100, 200)">
          {/* Frame */}
          <path d="M40 80 L80 30 L160 30 L180 60 L160 80 Z" fill="#171D24" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          {/* Tank */}
          <path d="M80 30 L120 20 L160 30 L140 45 L100 45 Z" fill="#1D232D" />
          {/* Engine block */}
          <rect x="90" y="50" width="50" height="30" rx="6" fill="#11161C" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          {/* Exhaust */}
          <path d="M150 70 L190 75 L195 72 L190 68 L150 65 Z" fill="#2A3240" />
          <circle cx="195" cy="71" r="3" fill="#FFC928" opacity="0.3" />

          {/* Seat */}
          <path d="M85 25 Q100 10 140 12 Q160 14 170 25 L150 30 L90 30 Z" fill="#232A36" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

          {/* Headlight - JSS warm yellow */}
          <circle cx="180" cy="45" r="8" fill="#FFC928" opacity="0.15" />
          <circle cx="180" cy="45" r="5" fill="#FFC928" opacity="0.4" />
          <circle cx="180" cy="45" r="3" fill="#FFC928" opacity="0.8" />
          {/* Headlight beam */}
          <path d="M188 42 L230 30 L230 60 L188 48 Z" fill="url(#headlightBeam)" opacity="0.12" />

          {/* Tail light */}
          <circle cx="35" cy="75" r="4" fill="#EF4444" opacity="0.6" />
          <circle cx="35" cy="75" r="2" fill="#EF4444" opacity="0.9" />

          {/* Front Wheel */}
          <circle cx="175" cy="95" r="30" fill="none" stroke="#2A3240" strokeWidth="8" />
          <circle cx="175" cy="95" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <circle cx="175" cy="95" r="8" fill="#1D232D" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          {/* Spokes */}
          <line x1="175" y1="67" x2="175" y2="73" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="175" y1="117" x2="175" y2="123" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="147" y1="95" x2="153" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="197" y1="95" x2="203" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Rear Wheel */}
          <circle cx="40" cy="95" r="30" fill="none" stroke="#2A3240" strokeWidth="8" />
          <circle cx="40" cy="95" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <circle cx="40" cy="95" r="8" fill="#1D232D" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          {/* Spokes */}
          <line x1="40" y1="67" x2="40" y2="73" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="40" y1="117" x2="40" y2="123" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="12" y1="95" x2="18" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="62" y1="95" x2="68" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Front Fork */}
          <line x1="165" y1="35" x2="175" y2="65" stroke="#2A3240" strokeWidth="4" strokeLinecap="round" />
          {/* Handlebar */}
          <line x1="155" y1="28" x2="178" y2="28" stroke="#2A3240" strokeWidth="3" strokeLinecap="round" />
          {/* Mirror */}
          <circle cx="180" cy="25" r="4" fill="#11161C" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

          {/* Chain */}
          <line x1="50" y1="92" x2="100" y2="72" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

          {/* Kickstand shadow */}
          <line x1="100" y1="95" x2="85" y2="125" stroke="rgba(255,255,255,0.03)" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Route line decoration */}
        <path d="M50 350 Q120 320 200 330 Q280 340 350 310" stroke="#FFC928" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.2" fill="none" />
        <circle cx="50" cy="350" r="4" fill="#FFC928" opacity="0.3" />
        <circle cx="350" cy="310" r="4" fill="#FFC928" opacity="0.3" />

        {/* Gradients */}
        <defs>
          <radialGradient id="groundShadow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#000" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="headlightBeam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFC928" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFC928" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
