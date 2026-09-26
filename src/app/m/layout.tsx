'use client';

import React from 'react';
import BottomNav from '@/components/mobile/BottomNav';
import InternetChecker from '@/components/mobile/InternetChecker';
import '@/app/mobile.css';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <InternetChecker>
      <div className="jss-mobile-app">
        {children}
        <BottomNav mode="customer" />
      </div>
    </InternetChecker>
  );
}
