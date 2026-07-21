'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, ChevronRight, Sparkles, Navigation, LogOut, User as UserIcon } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Detect admin/dashboard pages to hide navbar
  const isAdminPage = pathname.startsWith('/admin');
  const isDashboardPage = pathname.startsWith('/dashboard');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (isAdminPage || isDashboardPage) return null;

  const navItems = [
    { label: 'Beranda', href: '/' },
    { label: 'Layanan', href: '/#layanan' },
    { label: 'Tentang Kami', href: '/#about' },
    { label: 'Cara Kerja', href: '/#cara-kerja' },
    { label: 'Keunggulan', href: '/#keunggulan' },
    { label: 'Area Layanan', href: '/coverage' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-white/80 backdrop-blur-2xl shadow-soft border-b border-secondary-200/50 py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="container-padding">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-golden transition-all duration-300 group-hover:scale-105">
                <Image src="/logo-jss.png" alt="JSS Logo" width={44} height={44} className="w-full h-full object-cover" priority />
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-secondary-900 leading-none">
                    {BRAND.shortName}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-secondary-900 uppercase tracking-wider">
                    Kalirejo
                  </span>
                </div>
                <span className="text-[11px] font-medium text-secondary-500 mt-0.5">
                  Transport & Kurir Express
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center gap-1 bg-secondary-900/5 backdrop-blur-md p-1.5 rounded-full border border-secondary-900/5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative px-4 py-2 text-xs font-bold rounded-full transition-all duration-300',
                      isActive
                        ? 'text-secondary-900 bg-white shadow-soft'
                        : 'text-secondary-600 hover:text-secondary-900 hover:bg-white/50'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href={`https://wa.me/${BRAND.phone}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-secondary-700 hover:text-secondary-900 rounded-full hover:bg-secondary-100 transition-colors"
              >
                <Phone className="w-4 h-4 text-primary-600" />
                <span>WhatsApp Admin</span>
              </Link>

              {user ? (
                <>
                  {user.role === 'admin' || user.role === 'super_admin' ? (
                    <Link
                      href="/admin"
                      className="px-5 py-2.5 bg-secondary-900 hover:bg-secondary-800 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      Panel Admin
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/orders"
                      className="px-5 py-2.5 bg-secondary-900 hover:bg-secondary-800 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      Dashboard Saya
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-all"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-2.5 border border-secondary-900 hover:bg-secondary-900 hover:text-white rounded-full text-xs font-bold text-secondary-900 transition-all"
                >
                  Masuk / Daftar
                </Link>
              )}

              <Link
                href="/order"
                className="btn-primary text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-golden hover:scale-[1.02] active:scale-100 transition-all"
              >
                <Sparkles className="w-4 h-4 text-secondary-900" />
                Pesan Sekarang
                <ChevronRight className="w-4 h-4 text-secondary-900" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden relative w-11 h-11 flex items-center justify-center rounded-2xl bg-white/80 border border-secondary-200 backdrop-blur-lg shadow-soft hover:bg-white transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-secondary-900" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-secondary-900" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-secondary-900/60 backdrop-blur-md z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-85 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full p-6 pt-20">
                {/* Brand Banner inside Mobile Menu */}
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-secondary-900 to-secondary-800 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-semibold text-emerald-400">Driver Online & Ready</span>
                  </div>
                  <p className="text-sm font-bold text-white">JSS Kalirejo</p>
                  <p className="text-xs text-white/60">Solusi kirim & antar tercepat di Kalirejo</p>
                </div>

                {/* Nav Links */}
                <div className="flex-1 flex flex-col gap-1.5">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold text-secondary-800 hover:bg-primary/10 hover:text-secondary-900 transition-all"
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-secondary-400" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                 {/* Mobile Bottom CTA */}
                <div className="pt-6 border-t border-secondary-100 space-y-3">
                  {user ? (
                    <>
                      {user.role === 'admin' || user.role === 'super_admin' ? (
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="w-full text-center py-3.5 bg-secondary-900 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                        >
                          <UserIcon className="w-4 h-4" />
                          Panel Admin (Kelola Kurir)
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard/orders"
                          onClick={() => setIsOpen(false)}
                          className="w-full text-center py-3.5 bg-secondary-900 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                        >
                          <UserIcon className="w-4 h-4" />
                          Dashboard Saya (Beri Rating)
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                        className="w-full text-center py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar Akun
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center py-3.5 border border-secondary-900 text-secondary-900 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
                    >
                      Masuk / Daftar Akun
                    </Link>
                  )}

                  <Link
                    href="/order"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary w-full text-center py-4 flex items-center justify-center gap-2 shadow-golden text-sm font-bold"
                  >
                    <Sparkles className="w-4 h-4" />
                    Pesan Sekarang
                  </Link>
                  <Link
                    href={`https://wa.me/${BRAND.phone}`}
                    target="_blank"
                    className="btn-outline w-full text-center py-3.5 flex items-center justify-center gap-2 text-xs font-bold"
                  >
                    <Phone className="w-4 h-4" />
                    Hubungi WhatsApp
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
