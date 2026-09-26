'use client';

import React, { useState, useEffect } from 'react';

interface InternetCheckerProps {
  children: React.ReactNode;
}

export default function InternetChecker({ children }: InternetCheckerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    // Check initial state
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) setShowOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOnline(true);
      setShowOffline(false);
      window.location.reload();
    }
  };

  if (showOffline) {
    return (
      <div className="jss-offline">
        <div className="jss-offline-content">
          <div className="jss-offline-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
              <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0122.56 9" />
              <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
              <path d="M8.53 16.11a6 6 0 016.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
          </div>
          <h2 className="jss-offline-title">Tidak Ada Koneksi Internet</h2>
          <p className="jss-offline-text">
            Silakan periksa koneksi internet Anda dan coba lagi.
          </p>
          <button className="jss-offline-btn" onClick={handleRetry}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23,4 23,10 17,10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
            Coba Lagi
          </button>
        </div>

        <style jsx>{`
          .jss-offline {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #0A0A0A;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 24px;
          }
          .jss-offline-content {
            text-align: center;
            max-width: 320px;
          }
          .jss-offline-icon {
            margin-bottom: 24px;
            opacity: 0.8;
          }
          .jss-offline-title {
            color: #FFFFFF;
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 12px;
            letter-spacing: -0.02em;
          }
          .jss-offline-text {
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            line-height: 1.5;
            margin: 0 0 32px;
          }
          .jss-offline-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 32px;
            background: #FFD700;
            color: #0A0A0A;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .jss-offline-btn:active {
            transform: scale(0.96);
            background: #E6C200;
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
