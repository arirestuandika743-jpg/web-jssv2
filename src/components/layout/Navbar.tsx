'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, Sparkles, User as UserIcon, LogOut } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function Navbar() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const isAdminPage = pathname.startsWith('/admin');
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isCourierPage = pathname.startsWith('/courier');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (isAdminPage || isDashboardPage || isCourierPage) return null;

  const navItems = [
    { label: 'Layanan', href: '/#layanan' },
    { label: 'Cara Kerja', href: '/#cara-kerja' },
    { label: 'Tentang', href: '/#keunggulan' },
    { label: 'Area Layanan', href: '/coverage' },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 transform-gpu bg-white',
          isScrolled
            ? 'py-2 shadow-soft border-b border-gray-100'
            : 'py-3 sm:py-4 border-b border-transparent'
        )}
      >
        <div className="container-padding">
          <div className="flex items-center justify-between gap-4 px-2">
            {/* Left: Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-soft transition-all duration-300 group-hover:scale-105">
                <Image
                  src="/logo-jss.png"
                  alt="JSS Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-gray-900 leading-none tracking-tight">
                    {BRAND.shortName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Kalirejo
                  </span>
                </div>
                <span className="text-[10px] font-medium text-gray-400 mt-0.5 hidden sm:inline-block">
                  Transport & Kurir Express
                </span>
              </div>
            </Link>

            {/* Middle Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 bg-gray-50 px-1.5 py-1 rounded-xl border border-gray-100">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300',
                      isActive
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              {user ? (
                <>
                  <Link href={user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/dashboard/orders'}>
                    <Button variant="secondary" size="sm" leftIcon={<UserIcon className="w-3.5 h-3.5 text-amber-600" />}>
                      {user.role === 'admin' || user.role === 'super_admin' ? 'Admin' : 'Dashboard'}
                    </Button>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all border border-gray-200 hover:border-red-200"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="glass" size="sm">
                      Register
                    </Button>
                  </Link>
                </>
              )}

              <Link href="/order">
                <button className="btn-primary text-xs font-bold px-5 py-2.5 flex items-center gap-2 rounded-xl">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pesan Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-soft-xs"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-gray-900 border-l border-gray-800 shadow-xl overflow-y-auto p-6 pt-20 flex flex-col justify-between z-10">
            <div>
              <div className="mb-6 p-4 rounded-2xl bg-gray-800 border border-gray-700 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400">Driver Standby 24/7</span>
                </div>
                <p className="text-sm font-bold text-white mt-1">JSS Kalirejo</p>
                <p className="text-xs text-gray-400">Express Delivery & Transport</p>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800 space-y-2">
              <Link href="/order" onClick={() => setIsOpen(false)}>
                <button className="btn-primary w-full text-sm font-bold py-3.5 flex items-center justify-center gap-2 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                  Pesan Sekarang
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
