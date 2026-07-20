'use client';

import { FadeIn } from '@/components/layout/PageTransition';
import { Settings, Bell, Shield, Palette, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Pengaturan</h1>
        <p className="text-secondary-500 mt-1">Konfigurasi aplikasi</p>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="bg-white rounded-card shadow-soft divide-y divide-secondary-100">
          {[
            { icon: Globe, label: 'Informasi Bisnis', desc: 'Nama, alamat, nomor telepon', value: 'JSS Kalirejo' },
            { icon: Bell, label: 'Notifikasi', desc: 'Atur notifikasi pesanan', value: 'Aktif' },
            { icon: Shield, label: 'Keamanan', desc: 'Password dan autentikasi', value: 'Diperbarui' },
            { icon: Palette, label: 'Tampilan', desc: 'Tema dan warna', value: 'Default' },
            { icon: Settings, label: 'Umum', desc: 'Zona waktu, bahasa', value: 'ID / WIB' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-5 hover:bg-secondary-50/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-secondary-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-secondary-900">{item.label}</p>
                  <p className="text-xs text-secondary-400">{item.desc}</p>
                </div>
              </div>
              <span className="text-sm text-secondary-400">{item.value}</span>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
