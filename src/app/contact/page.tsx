'use client';

import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Instagram,
  Clock,
  Send,
  ArrowUpRight,
} from 'lucide-react';
import { BRAND } from '@/lib/constants';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';

const contactMethods = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: BRAND.phoneFormatted,
    href: `https://wa.me/${BRAND.phone}`,
    description: 'Chat langsung dengan admin',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
  {
    icon: Phone,
    label: 'Telepon',
    value: BRAND.phoneFormatted,
    href: `tel:+${BRAND.phone}`,
    description: 'Hubungi kami langsung',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    icon: Mail,
    label: 'Email',
    value: BRAND.email,
    href: `mailto:${BRAND.email}`,
    description: 'Kirim email kepada kami',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: `@${BRAND.instagram}`,
    href: `https://instagram.com/${BRAND.instagram}`,
    description: 'Follow Instagram kami',
    color: 'bg-pink-500',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
  },
];

const socialLinks = [
  {
    label: 'Instagram',
    icon: Instagram,
    href: `https://instagram.com/${BRAND.instagram}`,
    color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400',
  },
  {
    label: 'TikTok',
    icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.12V9.01a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.3 6.34 6.34 0 009.49 21.64a6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.18z" />
      </svg>
    ),
    href: `https://tiktok.com/@${BRAND.tiktok}`,
    color: 'hover:bg-black',
  },
  {
    label: 'WhatsApp',
    icon: MessageCircle,
    href: `https://wa.me/${BRAND.phone}`,
    color: 'hover:bg-green-500',
  },
];

import dynamic from 'next/dynamic';
import { MAP_CENTER, MAP_ZOOM } from '@/lib/constants';

const ReusableMap = dynamic(() => import('@/components/map/ReusableMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-secondary-500 text-xs font-medium">Memuat Peta...</p>
      </div>
    </div>
  ),
});

export default function ContactPage() {
  return (
    <PageTransition>
      <div className="pt-24 pb-0">
        {/* Hero */}
        <section className="section-padding bg-gradient-to-b from-primary-50/50 to-background relative overflow-hidden">
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container-padding relative z-10 text-center">
            <FadeIn>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary-700 text-sm font-semibold rounded-full mb-6">
                <Phone className="w-4 h-4" />
                Hubungi Kami
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
                Ada Pertanyaan?{' '}
                <span className="gradient-text">Hubungi Kami</span>
              </h1>
              <p className="text-lg text-secondary-500 max-w-2xl mx-auto">
                Kami selalu siap membantu Anda. Hubungi kami melalui WhatsApp, telepon, email, atau kunjungi media sosial kami.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="container-padding -mt-8">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactMethods.map((method, index) => (
              <StaggerItem key={index}>
                <motion.a
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="block bg-white rounded-card p-6 shadow-soft hover:shadow-soft-xl transition-all duration-300 group h-full"
                >
                  <div className={`w-12 h-12 ${method.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <method.icon className={`w-6 h-6 ${method.textColor}`} />
                  </div>

                  <h3 className="text-lg font-bold text-secondary-900 mb-1 flex items-center gap-2">
                    {method.label}
                    <ArrowUpRight className="w-4 h-4 text-secondary-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm font-medium text-primary-700 mb-1">{method.value}</p>
                  <p className="text-xs text-secondary-400">{method.description}</p>
                </motion.a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Details + Map */}
        <section className="section-padding">
          <div className="container-padding">
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Business Info */}
              <FadeIn>
                <div className="bg-white rounded-card p-8 shadow-soft h-full">
                  <h2 className="text-2xl font-bold text-secondary-900 mb-6">Informasi Bisnis</h2>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 mb-1">Alamat</p>
                        <p className="text-secondary-500 text-sm">{BRAND.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 mb-1">Jam Operasional</p>
                        <p className="text-secondary-500 text-sm">Setiap hari, 07.00 - 21.00 WIB</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Send className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 mb-1">Respon Time</p>
                        <p className="text-secondary-500 text-sm">Biasanya membalas dalam 5 menit</p>
                      </div>
                    </div>
                  </div>

                  {/* Social media */}
                  <div className="mt-8 pt-6 border-t border-secondary-100">
                    <p className="text-sm font-semibold text-secondary-900 mb-4">Ikuti Kami</p>
                    <div className="flex gap-3">
                      {socialLinks.map((social, i) => (
                        <a
                          key={i}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-11 h-11 rounded-xl bg-secondary-100 flex items-center justify-center text-secondary-500 hover:text-white transition-all duration-300 ${social.color}`}
                          aria-label={social.label}
                        >
                          <social.icon className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp CTA */}
                  <div className="mt-8">
                    <a
                      href={`https://wa.me/${BRAND.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full text-center flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Chat via WhatsApp
                    </a>
                  </div>
                </div>
              </FadeIn>

              {/* Map */}
              <FadeIn delay={0.1}>
                <div className="bg-white rounded-card shadow-soft overflow-hidden h-full min-h-[400px]">
                  <ReusableMap
                    center={MAP_CENTER}
                    zoom={MAP_ZOOM}
                    markers={[
                      {
                        position: MAP_CENTER,
                        title: BRAND.name,
                        description: BRAND.address,
                        type: 'center',
                      },
                    ]}
                    height="400px"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
