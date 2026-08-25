'use client';

import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle2, MessageSquareHeart } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/constants';

export function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section id="testimoni" className="section-padding bg-gradient-to-b from-white via-background to-white relative overflow-hidden transform-gpu">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px] -translate-y-1/2 pointer-events-none" />

      <div className="container-padding relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-secondary-900 text-xs font-bold uppercase tracking-wider mb-4">
            <MessageSquareHeart className="w-3.5 h-3.5 text-secondary-900" />
            Testimoni Pelanggan
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary-900 mb-5 tracking-tight text-balance">
            Dipercaya Oleh Pengguna{' '}
            <span className="gradient-text">Se-Kalirejo</span>
          </h2>
          <p className="text-base md:text-lg text-secondary-600 leading-relaxed font-medium">
            Simak ulasan asli dari pelanggan yang telah merasakan kecepatan, keamanan, dan keramahan driver JSS.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-7 shadow-soft border border-secondary-200/60 hover:shadow-soft-xl transition-all duration-500 flex flex-col justify-between h-full group hover:-translate-y-1.5">
                <div>
                  {/* Quote Header & Star Rating */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-secondary-900">
                      <Quote className="w-5 h-5 fill-primary/40 text-secondary-900" />
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < testimonial.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-secondary-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm md:text-base text-secondary-700 leading-relaxed mb-6 font-medium">
                    &quot;{testimonial.text}&quot;
                  </p>
                </div>

                {/* Customer Info */}
                <div className="pt-4 border-t border-secondary-100/80 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-extrabold text-secondary-900 text-sm shadow-golden flex-shrink-0">
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
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
