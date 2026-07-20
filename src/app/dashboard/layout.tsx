'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  MapPin,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const dashboardLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ShoppingCart, label: 'Riwayat Pesanan', href: '/dashboard/orders' },
  { icon: MapPin, label: 'Alamat Tersimpan', href: '/dashboard/addresses' },
  { icon: UserIcon, label: 'Profil', href: '/dashboard/profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'U';

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container-padding py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-full flex items-center justify-between bg-white rounded-card p-4 shadow-soft mb-4"
            >
              <span className="font-semibold text-secondary-900">Menu Dashboard</span>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <motion.div
              initial={false}
              animate={{ height: mobileMenuOpen ? 'auto' : typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'auto' : 0 }}
              className="overflow-hidden lg:!h-auto"
            >
              <div className="bg-white rounded-card shadow-soft p-4 space-y-1 sticky top-24">
                {/* User info */}
                <div className="flex items-center gap-3 p-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-secondary-900">{userInitials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-secondary-900 truncate">{user?.name || 'Pengguna'}</p>
                    <p className="text-xs text-secondary-400 truncate">{user?.email || 'Belum masuk'}</p>
                  </div>
                </div>

                <div className="h-px bg-secondary-100 mb-2" />

                {dashboardLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-button transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-secondary-900'
                          : 'text-secondary-500 hover:bg-secondary-50 hover:text-secondary-900'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <link.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                        <span className="text-sm font-medium">{link.label}</span>
                      </div>
                      <ChevronRight className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-secondary-300')} />
                    </Link>
                  );
                })}

                <div className="h-px bg-secondary-100 my-2" />

                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-button text-left text-secondary-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Keluar</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
