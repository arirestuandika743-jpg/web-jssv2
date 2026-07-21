'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  Clock,
  MessageCircle,
  User,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '@/services/chatService';
import { notificationService } from '@/services/notificationService';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/courier' },
  { icon: ClipboardList, label: 'Order', href: '/courier/orders' },
  { icon: Clock, label: 'Riwayat', href: '/courier/history' },
  { icon: MessageCircle, label: 'Chat', href: '/courier/chat' },
  { icon: User, label: 'Profil', href: '/courier/profile' },
];

export default function CourierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadChat, setUnreadChat] = useState(0);
  const [unreadNotif, setUnreadNotif] = useState(0);

  useEffect(() => {
    if (user?.id) {
      chatService.getUnreadCount(user.id).then(setUnreadChat);
      notificationService.getUnreadCount(user.id).then(setUnreadNotif);
    }
  }, [user?.id, pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-900 via-secondary-800 to-secondary-900 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation Bar (Mobile-first like Grab) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        {/* Glass effect background */}
        <div className="bg-secondary-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
          <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/courier' && pathname.startsWith(item.href));
              const isChat = item.href === '/courier/chat';
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center py-2 px-3 min-w-[60px]"
                >
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className={cn(
                      'flex flex-col items-center gap-0.5 transition-all duration-200',
                      isActive ? 'text-primary' : 'text-white/40'
                    )}
                  >
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -top-1 w-6 h-1 bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    <div className="relative">
                      <item.icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_8px_rgba(253,184,19,0.5)]')} />
                      {/* Badge for chat */}
                      {isChat && unreadChat > 0 && (
                        <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white">{unreadChat > 9 ? '9+' : unreadChat}</span>
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      'text-[10px] font-medium mt-0.5',
                      isActive ? 'text-primary font-semibold' : 'text-white/40'
                    )}>
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
          {/* Safe area for iOS */}
          <div className="h-safe-area-bottom" />
        </div>
      </nav>
    </div>
  );
}
