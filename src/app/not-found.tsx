'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { PageTransition, FadeIn } from '@/components/layout/PageTransition';

export default function NotFound() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4">
        <FadeIn className="text-center max-w-md">
          {/* 404 number */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className="relative mb-8"
          >
            <span className="text-[120px] md:text-[180px] font-extrabold text-secondary-100 leading-none select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-primary" />
              </div>
            </div>
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-secondary-500 mb-8">
            Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan.
          </p>

          <div className="flex gap-3 justify-center">
            <Link href="/" className="btn-primary flex items-center gap-2">
              <Home className="w-4 h-4" />
              Beranda
            </Link>
            <button onClick={() => window.history.back()} className="btn-outline flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
