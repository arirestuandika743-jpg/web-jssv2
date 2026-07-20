'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { FAQS, BRAND } from '@/lib/constants';
import { FadeIn } from '@/components/layout/PageTransition';
import { cn } from '@/lib/utils';

function FAQItem({ faq, index }: { faq: typeof FAQS[number]; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <FadeIn delay={index * 0.05}>
      <motion.div
        className={cn(
          'bg-white rounded-[22px] overflow-hidden transition-all duration-300 border',
          isOpen
            ? 'shadow-soft-lg border-primary/40 ring-2 ring-primary/20'
            : 'shadow-soft border-secondary-100 hover:border-secondary-300'
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-4 p-6 text-left"
          aria-expanded={isOpen}
        >
          <span className="text-base font-bold text-secondary-900 pr-2">
            {faq.question}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300',
              isOpen ? 'bg-primary text-secondary-900 shadow-golden' : 'bg-secondary-100 text-secondary-500'
            )}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="px-6 pb-6 pt-0">
                <div className="h-px bg-secondary-100 mb-4" />
                <p className="text-sm md:text-base text-secondary-600 leading-relaxed font-medium">
                  {faq.answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </FadeIn>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="section-padding bg-gradient-to-b from-white via-background to-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container-padding relative z-10">
        {/* Section Header */}
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-4 h-4 text-primary-600" />
            Tanya Jawab (FAQ)
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary-900 mb-5">
            Pertanyaan yang <br />
            <span className="gradient-text">Sering Ditanyakan</span>
          </h2>
          <p className="text-base md:text-lg text-secondary-600 leading-relaxed font-medium">
            Temukan informasi lengkap mengenai cara kerja, estimasi ongkir, dan jaminan keamanan layanan kami.
          </p>
        </FadeIn>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {FAQS.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </div>

        {/* Still have questions CTA */}
        <FadeIn delay={0.3} className="mt-14 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-[24px] bg-white border border-secondary-200 shadow-soft max-w-xl mx-auto text-left">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0 text-secondary-900">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-secondary-900 mb-1">Masih punya pertanyaan lain?</h4>
              <p className="text-xs text-secondary-500 font-medium">Tim customer care JSS Kalirejo siap menjawab pesan Anda 24/7.</p>
            </div>
            <Link
              href={`https://wa.me/${BRAND.phone}`}
              target="_blank"
              className="btn-primary text-xs font-bold px-5 py-3 rounded-xl whitespace-nowrap"
            >
              Tanya via WA
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
