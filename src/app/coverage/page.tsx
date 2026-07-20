'use client';

import { motion } from 'framer-motion';
import { MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { COVERAGE_AREAS, MAP_CENTER } from '@/lib/constants';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import OsmCoverageMap from '@/components/coverage/OsmCoverageMap';

export default function CoveragePage() {
  return (
    <PageTransition>
      <div className="pt-24 pb-16">
        {/* Hero */}
        <section className="section-padding bg-gradient-to-b from-primary-50/50 to-background relative overflow-hidden">
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container-padding relative z-10">
            <FadeIn className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary-700 text-sm font-semibold rounded-full mb-6">
                <MapPin className="w-4 h-4" />
                Area Layanan
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
                Jangkauan Layanan{' '}
                <span className="gradient-text">Kami</span>
              </h1>
              <p className="text-lg text-secondary-500 max-w-2xl mx-auto">
                Kami melayani Kecamatan Kalirejo dan desa-desa sekitarnya di Lampung Tengah. Cek apakah lokasi Anda sudah terjangkau layanan kami.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Map Section */}
        <section className="container-padding -mt-8">
          <FadeIn>
            <div className="bg-white rounded-card shadow-soft-lg overflow-hidden">
              <OsmCoverageMap />
            </div>
          </FadeIn>
        </section>

        {/* Area Cards */}
        <section className="section-padding">
          <div className="container-padding">
            <FadeIn className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-3">
                Desa & Kelurahan Terjangkau
              </h2>
              <p className="text-secondary-500">Pilih area Anda untuk melihat detail layanan</p>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {COVERAGE_AREAS.map((area, index) => (
                <StaggerItem key={index}>
                  <motion.div
                    whileHover={{ y: -5, transition: { duration: 0.3 } }}
                    className={`relative overflow-hidden rounded-card p-6 transition-all duration-300 ${
                      area.isMain
                        ? 'bg-gradient-to-br from-primary to-primary-600 text-secondary-900 shadow-golden'
                        : 'bg-white shadow-soft hover:shadow-soft-lg'
                    }`}
                  >
                    {area.isMain && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-secondary-900/20 backdrop-blur-sm rounded-full text-[10px] font-bold text-secondary-900">
                        PUSAT
                      </div>
                    )}

                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                      area.isMain ? 'bg-secondary-900/15' : 'bg-primary/10'
                    }`}>
                      <MapPin className={`w-6 h-6 ${area.isMain ? 'text-secondary-900' : 'text-primary'}`} />
                    </div>

                    <h3 className={`text-xl font-bold mb-1 ${area.isMain ? 'text-secondary-900' : 'text-secondary-900'}`}>
                      {area.name}
                    </h3>
                    <p className={`text-sm mb-4 ${area.isMain ? 'text-secondary-900/70' : 'text-secondary-500'}`}>
                      {area.description}
                    </p>

                    <div className={`flex items-center gap-2 text-sm font-medium ${
                      area.isMain ? 'text-secondary-900' : 'text-emerald-600'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                      Layanan tersedia
                    </div>

                    <div className={`mt-3 text-xs ${area.isMain ? 'text-secondary-900/60' : 'text-secondary-400'}`}>
                      Radius layanan: ~{area.radius} km
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Outside Area Notice */}
        <section className="container-padding pb-16">
          <FadeIn>
            <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-card p-6 md:p-8 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-secondary-900 mb-2">
                Lokasi Anda di Luar Area?
              </h3>
              <p className="text-secondary-600 mb-4">
                Maaf, wilayah di luar area layanan kami belum tersedia saat ini. Kami terus memperluas jangkauan untuk melayani lebih banyak daerah.
              </p>
              <p className="text-sm text-amber-700 font-medium">
                Hubungi kami untuk request area baru! 📞
              </p>
            </div>
          </FadeIn>
        </section>
      </div>
    </PageTransition>
  );
}
