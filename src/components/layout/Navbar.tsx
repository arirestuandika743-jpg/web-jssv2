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
    { label: 'Beranda', href: '/' },
    { label: 'Layanan', href: '/#layanan' },
    { label: 'Keunggulan', href: '/#keunggulan' },
    { label: 'Cara Kerja', href: '/#cara-kerja' },
    { label: 'Area Layanan', href: '/coverage' },
    { label: 'Testimoni', href: '/#testimoni' },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 transform-gpu',
          isScrolled
            ? 'bg-white/85 backdrop-blur-2xl shadow-soft border-b border-secondary-200/50 py-3'
            : 'bg-transparent py-5 sm:py-6'
        )}
      >
        <div className="container-padding">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden shadow-golden transition-all duration-300 group-hover:scale-105">
                <Image
                  src="/logo-jss.png"
                  alt="JSS Logo"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                  priority
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl text-secondary-900 leading-none tracking-tight">
                    {BRAND.shortName}
                  </span>
                  <Badge variant="primary" size="sm">
                    Kalirejo
                  </Badge>
                </div>
                <span className="text-[11px] font-medium text-secondary-500 mt-0.5 hidden sm:inline-block">
                  Transport & Titip Beli Express
                </span>
              </div>
            </Link>

            {/* Middle Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/75 backdrop-blur-xl px-4 py-1.5 rounded-full border border-secondary-200/50 shadow-soft">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-300',
                      isActive
                        ? 'text-secondary-900 bg-white shadow-soft'
                        : 'text-secondary-600 hover:text-secondary-900 hover:bg-white/60'
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
                    <Button variant="secondary" size="sm" leftIcon={<UserIcon className="w-3.5 h-3.5 text-primary" />}>
                      {user.role === 'admin' || user.role === 'super_admin' ? 'Admin' : 'Dashboard'}
                    </Button>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-all"
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
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-secondary-900" />}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 text-secondary-900" />}
                >
                  Order Now
                </Button>
              </Link>
            </div>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-2xl bg-white/80 border border-secondary-200 backdrop-blur-lg shadow-soft"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-5 h-5 text-secondary-900" /> : <Menu className="w-5 h-5 text-secondary-900" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto p-6 pt-20 flex flex-col justify-between z-10">
            <div>
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-secondary-900 to-secondary-800 text-white space-y-1">
                <Badge variant="success" size="sm" dot>
                  Driver Standby 24/7
                </Badge>
                <p className="text-sm font-bold text-white mt-1">JSS Kalirejo</p>
                <p className="text-xs text-white/60">Express Delivery & Transport</p>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-secondary-800 hover:bg-primary/10 transition-all"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-secondary-400" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-secondary-100 space-y-2">
              <Link href="/order" onClick={() => setIsOpen(false)}>
                <Button variant="primary" fullWidth size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Order Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
