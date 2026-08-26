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
    <section id="testimoni" className="section-padding relative overflow-hidden transform-gpu">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/[0.025] rounded-full blur-[140px] -translate-y-1/2 pointer-events-none" />

      <div className="container-padding relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <MessageSquareHeart className="w-3.5 h-3.5" />
            Testimoni Pelanggan
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight text-balance">
            Dipercaya Oleh Pengguna{' '}
            <span className="gradient-text">Se-Kalirejo</span>
          </h2>
          <p className="text-sm md:text-base text-white/40 leading-relaxed font-medium">
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
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-500 flex flex-col justify-between h-full group hover:-translate-y-1.5">
                <div>
                  {/* Quote Header & Star Rating */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
                      <Quote className="w-4 h-4 fill-primary/20 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.08]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                           key={i}
                           className={`w-3 h-3 ${
                             i < testimonial.rating
                               ? 'text-primary fill-primary'
                               : 'text-white/10'
                           }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6 font-medium">
                    &quot;{testimonial.text}&quot;
                  </p>
                </div>

                {/* Customer Info */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-extrabold text-secondary-900 text-xs shadow-golden flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{testimonial.name}</p>
                    <p className="text-[10px] text-white/30 truncate">{testimonial.location}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Terverifikasi</span>
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
