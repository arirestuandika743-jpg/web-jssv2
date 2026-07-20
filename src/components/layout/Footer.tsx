'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  MessageCircle,
  ArrowUpRight,
  Heart,
  Sparkles,
  Clock,
} from 'lucide-react';
import { BRAND } from '@/lib/constants';

const footerLinks = {
  layanan: [
    { label: 'Ojek (Antar Orang)', href: '/order?category=ride' },
    { label: 'Titip Belanja Pasar', href: '/order?category=shopping' },
    { label: 'Antar Makanan', href: '/order?category=food' },
    { label: 'Beli Obat Apotek', href: '/order?category=medicine' },
    { label: 'Kirim Dokumen', href: '/order?category=documents' },
    { label: 'Antar Paket Barang', href: '/order?category=packages' },
  ],
  perusahaan: [
    { label: 'Beranda', href: '/' },
    { label: 'Tentang Kami', href: '/#about' },
    { label: 'Area Layanan', href: '/coverage' },
    { label: 'Cara Kerja', href: '/#cara-kerja' },
    { label: 'Kontak', href: '/contact' },
  ],
  bantuan: [
    { label: 'FAQ', href: '/#faq' },
    { label: 'Testimoni', href: '/#testimoni' },
    { label: 'Syarat & Ketentuan', href: '/contact' },
    { label: 'Kebijakan Privasi', href: '/contact' },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-secondary-900 text-white overflow-hidden pt-12">
      {/* Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative container-padding z-10">
        {/* Top CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mb-16"
        >
          <div className="bg-gradient-to-r from-primary via-primary-500 to-accent rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-golden-lg">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary-900/10 text-secondary-900 text-xs font-extrabold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Respon Super Cepat
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-secondary-900 mb-2 leading-tight">
                Siap Pesan Driver JSS Hari Ini?
              </h3>
              <p className="text-secondary-900/80 font-medium text-sm md:text-base">
                Isi form booking instan online atau tanyakan langsung pada WhatsApp admin kami.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link
                href="/order"
                className="btn-secondary text-sm font-bold whitespace-nowrap flex items-center justify-center gap-2 py-4 px-8 rounded-2xl shadow-xl"
              >
                Pesan Sekarang
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href={`https://wa.me/${BRAND.phone}`}
                target="_blank"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-secondary-900 font-bold text-sm rounded-2xl py-4 px-7 transition-all whitespace-nowrap flex items-center justify-center gap-2 border border-white/20"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Admin
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer Grid Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-golden">
                <span className="text-secondary-900 font-black text-xl">JSS</span>
              </div>
              <div>
                <span className="font-extrabold text-xl text-white block leading-none">{BRAND.shortName} Kalirejo</span>
                <span className="text-[11px] text-white/50 font-medium">Jasa Suruh & Ojek Terpercaya</span>
              </div>
            </Link>

            <p className="text-white/60 text-sm leading-relaxed max-w-sm font-medium">
              {BRAND.description}
            </p>

            <div className="space-y-3 pt-2">
              <a
                href={`tel:+${BRAND.phone}`}
                className="flex items-center gap-3 text-xs md:text-sm text-white/70 hover:text-primary transition-colors font-medium"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                {BRAND.phoneFormatted}
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                className="flex items-center gap-3 text-xs md:text-sm text-white/70 hover:text-primary transition-colors font-medium"
              >
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                {BRAND.email}
              </a>
              <div className="flex items-center gap-3 text-xs md:text-sm text-white/70 font-medium">
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
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5 text-primary">Layanan JSS</h4>
            <ul className="space-y-3">
              {footerLinks.layanan.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-white/60 hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5 text-primary">Navigasi</h4>
            <ul className="space-y-3">
              {footerLinks.perusahaan.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-white/60 hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5 text-primary">Bantuan & Info</h4>
            <ul className="space-y-3 mb-6">
              {footerLinks.bantuan.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm text-white/60 hover:text-white transition-colors font-medium"
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
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-primary hover:text-secondary-900 flex items-center justify-center text-white transition-all"
                aria-label="Instagram JSS Kalirejo"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://tiktok.com/@${BRAND.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-primary hover:text-secondary-900 flex items-center justify-center text-white transition-all"
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
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-white flex items-center justify-center text-white transition-all"
                aria-label="WhatsApp JSS Kalirejo"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 text-xs text-white/50 font-medium">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} {BRAND.name}. Dibuat dengan
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            untuk warga Kalirejo, Lampung Tengah.
          </p>
          <p>Solusi Kurir & Transportasi Lokal #1</p>
        </div>
      </div>
    </footer>
  );
}
