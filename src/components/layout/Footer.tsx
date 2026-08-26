'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  MessageCircle,
  Heart,
  Clock,
} from 'lucide-react';
import { BRAND } from '@/lib/constants';

const footerLinks = {
  layanan: [
    { label: 'Antar Makanan', href: '/order?category=food' },
    { label: 'Antar Paket Barang', href: '/order?category=packages' },
    { label: 'Titip Belanja Pasar', href: '/order?category=shopping' },
    { label: 'Titip Beli Obat', href: '/order?category=medicine' },
    { label: 'Kirim Dokumen', href: '/order?category=documents' },
    { label: 'Ojek Online', href: '/order?category=ride' },
  ],
  perusahaan: [
    { label: 'Beranda', href: '/' },
    { label: 'Layanan', href: '/#layanan' },
    { label: 'Cara Kerja', href: '/#cara-kerja' },
    { label: 'Keunggulan', href: '/#keunggulan' },
    { label: 'Area Coverage', href: '/coverage' },
  ],
  bantuan: [
    { label: 'Testimoni', href: '/#testimoni' },
    { label: 'Kontak Admin', href: '/contact' },
    { label: 'Syarat & Ketentuan', href: '/contact' },
    { label: 'Kebijakan Privasi', href: '/contact' },
  ],
};

export function Footer() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const isDashboardPage = pathname?.startsWith('/dashboard');
  const isCourierPage = pathname?.startsWith('/courier');

  if (isAdminPage || isDashboardPage || isCourierPage) return null;

  return (
    <footer className="relative bg-[#07090C] text-white overflow-hidden pt-20 border-t border-white/[0.04] transform-gpu">
      {/* Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>

      <div className="relative container-padding z-10">
        {/* Footer Grid Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-golden flex-shrink-0">
                <Image src="/logo-jss.png" alt="JSS Logo" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white block leading-none tracking-tight">
                  {BRAND.shortName} Kalirejo
                </span>
                <span className="text-[10px] text-white/40 font-medium">Jasa Suruh & Ojek Terpercaya</span>
              </div>
            </Link>

            <p className="text-white/50 text-xs md:text-sm leading-relaxed max-w-sm font-medium">
              {BRAND.description}
            </p>

            <div className="space-y-3.5 pt-2">
              <a
                href={`tel:+${BRAND.phone}`}
                className="flex items-center gap-3 text-xs md:text-sm text-white/50 hover:text-primary transition-colors font-medium"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                {BRAND.phoneFormatted}
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                className="flex items-center gap-3 text-xs md:text-sm text-white/50 hover:text-primary transition-colors font-medium"
              >
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                {BRAND.email}
              </a>
              <div className="flex items-center gap-3 text-xs md:text-sm text-white/50 font-medium">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                {BRAND.address}
              </div>
              <div className="flex items-center gap-3 text-xs text-emerald-400 font-bold">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Layanan Operasional 24 Jam Nonstop
              </div>
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-5 text-primary">Layanan JSS</h4>
            <ul className="space-y-3">
              {footerLinks.layanan.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-white/40 hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-5 text-primary">Navigasi</h4>
            <ul className="space-y-3">
              {footerLinks.perusahaan.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-white/40 hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-5 text-primary">Bantuan & Info</h4>
            <ul className="space-y-3 mb-6">
              {footerLinks.bantuan.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-white/40 hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href={`https://instagram.com/${BRAND.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-primary hover:text-secondary-900 flex items-center justify-center text-white transition-all"
                aria-label="Instagram JSS Kalirejo"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://tiktok.com/@${BRAND.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-primary hover:text-secondary-900 flex items-center justify-center text-white transition-all"
                aria-label="TikTok JSS Kalirejo"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.12V9.01a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.3 6.34 6.34 0 009.49 21.64a6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.18z" />
                </svg>
              </a>
              <a
                href={`https://wa.me/${BRAND.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-emerald-500/20 hover:text-emerald-400 flex items-center justify-center text-white transition-all"
                aria-label="WhatsApp JSS Kalirejo"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 text-xs text-white/40 font-medium">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} {BRAND.name}. Dibuat dengan
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline animate-pulse" />
            untuk warga Kalirejo, Lampung Tengah.
          </p>
          <p>Solusi Kurir & Transportasi Lokal #1</p>
        </div>
      </div>
    </footer>
  );
}
