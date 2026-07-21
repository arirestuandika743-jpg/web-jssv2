'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Truck,
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: ShoppingCart, label: 'Pesanan', href: '/admin/orders' },
  { icon: Users, label: 'Pelanggan', href: '/admin/customers' },
  { icon: Truck, label: 'Driver', href: '/admin/drivers' },
  { icon: Settings, label: 'Pengaturan', href: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col bg-secondary-900 text-white sticky top-0 h-screen overflow-hidden z-30"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-golden">
            <Image src="/logo-jss.png" alt="JSS Logo" width={40} height={40} className="w-full h-full object-cover" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <p className="font-bold text-lg leading-tight">JSS</p>
                <p className="text-[10px] text-white/50">Admin Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-button transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary text-secondary-900'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                <link.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-secondary-900')} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-secondary-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                    {link.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-button text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }}>
              <ChevronLeft className="w-5 h-5" />
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs">
                  Tutup
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-secondary-900 text-white z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-secondary-900 font-bold text-sm">J</span>
                  </div>
                  <span className="font-bold">JSS Admin</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-button transition-all',
                        isActive
                          ? 'bg-primary text-secondary-900'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-white/10">
                <Link href="/" className="flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white text-sm">
                  <LogOut className="w-4 h-4" />
                  Keluar
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-secondary-100 h-16 flex items-center px-4 md:px-8 gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-10 h-10 rounded-button flex items-center justify-center hover:bg-secondary-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-secondary-600" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Cari pesanan, pelanggan..."
                className="w-full pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-100 rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 rounded-button flex items-center justify-center hover:bg-secondary-100 transition-colors">
              <Bell className="w-5 h-5 text-secondary-500" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
              <span className="text-xs font-bold text-secondary-900">A</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
