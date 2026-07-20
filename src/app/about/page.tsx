'use client';

import { motion } from 'framer-motion';
import {
  Heart,
  Target,
  Eye,
  Rocket,
  Users,
  Shield,
  Clock,
  Award,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { BRAND } from '@/lib/constants';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';

const values = [
  {
    icon: Shield,
    title: 'Amanah',
    description: 'Kami menjaga setiap barang yang dititipkan seperti milik sendiri. Keamanan adalah prioritas utama kami.',
  },
  {
    icon: Clock,
    title: 'Tepat Waktu',
    description: 'Waktu Anda berharga. Kami berkomitmen mengantar pesanan secepat mungkin tanpa mengorbankan keamanan.',
  },
  {
    icon: Heart,
    title: 'Melayani Sepenuh Hati',
    description: 'Setiap pelanggan adalah keluarga. Kami melayani dengan senyum dan dedikasi penuh.',
  },
  {
    icon: Award,
    title: 'Profesional',
    description: 'Driver terlatih, proses transparan, dan komunikasi yang jelas. Standar profesional untuk layanan lokal.',
  },
];

const whyChooseUs = [
  'Driver terverifikasi dan terpercaya',
  'Tarif transparan tanpa biaya tersembunyi',
  'Layanan setiap hari 07.00 - 21.00 WIB',
  'Respon cepat via WhatsApp',
  'Garansi keamanan barang',
  'Jangkauan area yang luas',
  'Proses pemesanan mudah',
  'Customer support responsif',
];

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="pt-24 pb-0">
        {/* Hero */}
        <section className="section-padding bg-gradient-to-b from-primary-50/50 to-background relative overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container-padding relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <FadeIn>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary-700 text-sm font-semibold rounded-full mb-6">
                  <Sparkles className="w-4 h-4" />
                  Tentang Kami
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-6 leading-tight">
                  Kami Hadir untuk{' '}
                  <span className="gradient-text">Memudahkan</span>{' '}
                  Hidup Anda
                </h1>
                <p className="text-lg text-secondary-500 leading-relaxed mb-8">
                  {BRAND.name} lahir dari semangat untuk memberikan solusi pengiriman dan jasa titip beli yang mudah, cepat, dan terjangkau bagi masyarakat Kecamatan Kalirejo dan sekitarnya.
                </p>
                <p className="text-secondary-500 leading-relaxed">
                  Didirikan pada tahun {BRAND.founded}, kami memahami bahwa di daerah kecamatan, akses terhadap layanan delivery modern masih terbatas. Itulah mengapa kami hadir — membawa standar layanan delivery premium ke tingkat lokal, dengan sentuhan personal yang hanya bisa diberikan oleh anak daerah.
                </p>
              </FadeIn>

              <FadeIn direction="right">
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary to-primary-600 rounded-[28px] p-8 md:p-10 text-secondary-900 shadow-golden-lg">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-300/20 rounded-full blur-xl" />

                    <div className="relative space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-secondary-900/15 rounded-2xl flex items-center justify-center">
                          <Rocket className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-3xl font-extrabold">2024</p>
                          <p className="text-sm font-medium opacity-80">Tahun Berdiri</p>
                        </div>
                      </div>

                      <div className="h-px bg-secondary-900/10" />

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-3xl font-extrabold">2500+</p>
                          <p className="text-sm font-medium opacity-80">Pesanan Selesai</p>
                        </div>
                        <div>
                          <p className="text-3xl font-extrabold">1200+</p>
                          <p className="text-sm font-medium opacity-80">Pelanggan Puas</p>
                        </div>
                        <div>
                          <p className="text-3xl font-extrabold">15+</p>
                          <p className="text-sm font-medium opacity-80">Driver Aktif</p>
                        </div>
                        <div>
                          <p className="text-3xl font-extrabold">6</p>
                          <p className="text-sm font-medium opacity-80">Desa Terjangkau</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="section-padding bg-white">
          <div className="container-padding">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <FadeIn>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-card p-8 md:p-10 text-white h-full"
                >
                  <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                    <Eye className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Visi</h2>
                  <p className="text-white/70 leading-relaxed text-lg">
                    Menjadi layanan delivery dan jasa titip beli nomor satu di Kecamatan Kalirejo yang terpercaya, inovatif, dan memberikan kemudahan bagi seluruh lapisan masyarakat.
                  </p>
                </motion.div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-card p-8 md:p-10 shadow-soft-lg border border-secondary-100 h-full"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary-900 mb-4">Misi</h2>
                  <ul className="space-y-3">
                    {[
                      'Menyediakan layanan pengiriman yang cepat, aman, dan terjangkau',
                      'Memberdayakan tenaga kerja lokal sebagai mitra driver',
                      'Memberikan pengalaman pelanggan terbaik melalui teknologi',
                      'Memperluas jangkauan layanan ke seluruh desa di Kalirejo',
                      'Membangun kepercayaan melalui layanan yang konsisten',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-secondary-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="section-padding bg-background">
          <div className="container-padding">
            <FadeIn className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Nilai Kami
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                Prinsip yang <span className="gradient-text">Kami Pegang</span>
              </h2>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <StaggerItem key={index}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-card p-7 shadow-soft hover:shadow-soft-lg transition-all duration-300 text-center h-full"
                  >
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <value.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-2">{value.title}</h3>
                    <p className="text-sm text-secondary-500 leading-relaxed">{value.description}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="section-padding bg-secondary-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="container-padding relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <FadeIn>
                <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary text-sm font-semibold rounded-full mb-6">
                  Keunggulan
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Kenapa Harus <span className="gradient-text">JSS?</span>
                </h2>
                <p className="text-white/60 leading-relaxed mb-8">
                  Kami tidak hanya mengantar barang, kami membangun kepercayaan. Setiap pesanan adalah amanah yang kami jaga dengan sepenuh hati.
                </p>
                <Link href="/order" className="btn-primary inline-flex items-center gap-2">
                  Mulai Pesan
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </FadeIn>

              <StaggerContainer className="space-y-3">
                {whyChooseUs.map((item, index) => (
                  <StaggerItem key={index}>
                    <div className="flex items-center gap-3 p-4 rounded-card bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-white/80 font-medium">{item}</span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </section>

        {/* Team CTA */}
        <section className="section-padding bg-background">
          <div className="container-padding">
            <FadeIn className="text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                Bergabung Bersama Kami
              </h2>
              <p className="text-secondary-500 mb-8">
                Tertarik menjadi mitra driver JSS? Hubungi kami dan mulai penghasilan tambahan Anda!
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/contact" className="btn-primary">
                  Hubungi Kami
                </Link>
                <Link href="/order" className="btn-outline">
                  Pesan Sekarang
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
