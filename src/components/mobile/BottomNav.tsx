'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface BottomNavProps {
  mode?: 'customer' | 'courier';
}

// Customer nav items
const customerNav: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/m',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    id: 'orders',
    label: 'Pesanan',
    href: '/m/orders',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
  },
  {
    id: 'promo',
    label: 'Promo',
    href: '/m/promo',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20,12 20,22 4,22 4,12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    id: 'account',
    label: 'Akun',
    href: '/m/account',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

// Courier nav items
const courierNav: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/m/courier',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    id: 'orders',
    label: 'Order',
    href: '/m/courier/orders',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16,8 20,8 23,11 23,16 16,16 16,8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'earnings',
    label: 'Pendapatan',
    href: '/m/courier/earnings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    id: 'account',
    label: 'Akun',
    href: '/m/courier/account',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav({ mode = 'customer' }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const navItems = mode === 'courier' ? courierNav : customerNav;

  const getActiveTab = () => {
    for (const item of navItems) {
      if (pathname === item.href) return item.id;
      if (item.href !== '/m' && item.href !== '/m/courier' && pathname.startsWith(item.href)) return item.id;
    }
    return navItems[0].id;
  };

  const activeTab = getActiveTab();

  return (
    <nav className="jss-bottom-nav">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => router.push(item.href)}
            className={`jss-bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <div className="jss-bottom-nav-icon">
              {item.icon}
            </div>
            <span className="jss-bottom-nav-label">{item.label}</span>
            {isActive && <div className="jss-bottom-nav-indicator" />}
          </button>
        );
      })}

      <style jsx>{`
        .jss-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-around;
          height: 64px;
          background: #0A0A0A;
          border-top: 1px solid rgba(255, 215, 0, 0.15);
          padding-bottom: env(safe-area-inset-bottom, 0);
          z-index: 1000;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .jss-bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          flex: 1;
          height: 100%;
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          color: rgba(255, 255, 255, 0.45);
          padding: 0;
        }

        .jss-bottom-nav-item.active {
          color: #FFD700;
        }

        .jss-bottom-nav-item:active {
          transform: scale(0.92);
        }

        .jss-bottom-nav-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .jss-bottom-nav-item.active .jss-bottom-nav-icon {
          transform: translateY(-2px);
        }

        .jss-bottom-nav-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: all 0.2s ease;
        }

        .jss-bottom-nav-item.active .jss-bottom-nav-label {
          font-weight: 700;
          font-size: 10.5px;
        }

        .jss-bottom-nav-indicator {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 3px;
          background: #FFD700;
          border-radius: 0 0 4px 4px;
        }
      `}</style>
    </nav>
  );
}
