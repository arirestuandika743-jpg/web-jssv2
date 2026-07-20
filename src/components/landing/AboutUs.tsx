'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Users, Zap, HeartHandshake, ArrowRight, Award } from 'lucide-react';
import Link from 'next/link';
import { BRAND } from '@/lib/constants';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';

export function AboutUs() {
  return (
    <section id="about" className="section-padding bg-gradient-to-b from-white via-background to-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Visual Illustration */}
          <FadeIn direction="left" className="order-2 lg:order-1">
            <div className="relative">
              {/* Main Container Card */}
              <div className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 rounded-[32px] p-8 md:p-10 shadow-soft-xl border border-white/10 text-white overflow-hidden">
                {/* Decorative Grid */}
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #FDB813 1px, transparent 0)`,
                    backgroundSize: '30px 30px',
                  }}
                />

                <div className="relative z-10 space-y-8">
                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-primary text-xs font-semibold">
                    <Award className="w-4 h-4 text-primary" />
                    <span>Layanan Pengantaran Asli Kalirejo</span>
                  </div>

                  <div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                      Solusi Transportasi & Suruhan <span className="gradient-text">Nomor 1</span>
                    </h3>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed">
                      JSS didirikan untuk menjawab kebutuhan warga Kalirejo akan kurir & ojek cepat, jujur, dan harga terjangkau. Dari antar jemput penumpang hingga titip belanjaan pasar, driver kami siap melayani.
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <p className="text-2xl md:text-3xl font-black text-primary mb-1">100%</p>
                      <p className="text-xs text-white/70 font-medium">Driver Warga Lokal Kalirejo</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <p className="text-2xl md:text-3xl font-black text-white mb-1">15-30m</p>
                      <p className="text-xs text-white/70 font-medium">Rata-rata Sampai Tujuan</p>
                    </div>
                  </div>

                  {/* Trust Footer line */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10 text-xs text-white/60">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Semua driver terverifikasi resmi & beridentitas jelas.</span>
                  </div>
                </div>
              </div>

              {/* Floating Badges */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-4 glass-card rounded-2xl p-4 shadow-soft-lg border border-primary/20 hidden sm:flex items-center gap-3 bg-white/90"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary-900">Respon Super Cepat</p>
                  <p className="text-[10px] text-secondary-500">Konfirmasi via WhatsApp</p>
                </div>
              </motion.div>
            </div>
          </FadeIn>

          {/* Right Text Content */}
          <div className="order-1 lg:order-2">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4">
                <HeartHandshake className="w-4 h-4" />
                Tentang Kami
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary-900 leading-tight mb-6">
                Lebih Dari Sekadar <br />
                <span className="gradient-text">Jasa Suruh & Ojek</span>
              </h2>
              <p className="text-secondary-600 text-base md:text-lg leading-relaxed mb-8">
                {BRAND.name} (JSS) hadir sebagai partner andalan sehari-hari. Kami menghubungkan penjual, pembeli, penumpang, dan warga di Kalirejo dengan sistem pemesanan modern yang transparan tanpa antri.
              </p>
            </FadeIn>

            {/* Feature Points */}
            <StaggerContainer className="space-y-4 mb-10">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Transparan & Tanpa Biaya Tersembunyi',
                  desc: 'Hitung tarif otomatis via Peta Google/OpenStreetMap sesuai jarak aktual per kilometer.',
                },
                {
                  icon: Users,
                  title: 'Driver Lokal Ramah & Berpengalaman',
                  desc: 'Mengenal seluruh jalan, desa, dan gang di Kecamatan Kalirejo dengan cepat dan presisi.',
                },
                {
                  icon: Zap,
                  title: 'Pemesanan Fleksibel 24/7',
                  desc: 'Form booking mudah dengan integrasi langsung WhatsApp resmi JSS Kalirejo.',
                },
              ].map((item, idx) => (
                <StaggerItem key={idx}>
                  <div className="flex gap-4 p-4 rounded-2xl bg-white shadow-soft border border-secondary-100 hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-secondary-900 mb-1">{item.title}</h4>
                      <p className="text-xs md:text-sm text-secondary-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeIn delay={0.4}>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/order" className="btn-primary text-sm px-6 py-3.5 flex items-center gap-2 shadow-golden">
                  Pesan Layanan Sekarang
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/coverage" className="btn-outline text-sm px-6 py-3.5">
                  Cek Area Coverage
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
