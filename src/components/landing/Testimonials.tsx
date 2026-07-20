'use client';

import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle2, MessageSquareHeart } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/constants';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';

export function Testimonials() {
  return (
    <section id="testimoni" className="section-padding bg-gradient-to-b from-white via-background to-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] -translate-y-1/2 pointer-events-none" />

      <div className="container-padding relative z-10">
        {/* Section Header */}
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4">
            <MessageSquareHeart className="w-4 h-4 text-primary-600" />
            Kata Pelanggan
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary-900 mb-5">
            Pengalaman Nyata Dari{' '}
            <span className="gradient-text">Warga Kalirejo</span>
          </h2>
          <p className="text-base md:text-lg text-secondary-600 leading-relaxed font-medium">
            Ratusan ulasan positif setiap bulan dari pelanggan yang puas dengan kecepatan & keramahan driver JSS.
          </p>
        </FadeIn>

        {/* Testimonials Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="relative bg-white rounded-[24px] p-7 shadow-soft border border-secondary-100 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full group"
              >
                <div>
                  {/* Quote Header */}
                  <div className="flex items-center justify-between mb-4">
                    <Quote className="w-8 h-8 text-primary/30 group-hover:text-primary transition-colors" />
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? 'text-primary fill-primary'
                              : 'text-secondary-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm md:text-base text-secondary-700 leading-relaxed mb-6 font-medium italic">
                    &quot;{testimonial.text}&quot;
                  </p>
                </div>

                {/* Customer Info */}
                <div className="pt-4 border-t border-secondary-100 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-extrabold text-secondary-900 text-sm shadow-golden flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-secondary-900 truncate">
                        {testimonial.name}
                      </p>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-secondary-400 font-medium truncate">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
