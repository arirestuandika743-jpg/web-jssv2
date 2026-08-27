import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import 'leaflet/dist/leaflet.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Jasa Suruh Kalirejo — Layanan Antar Jemput & Titip Beli #1 di Kalirejo',
    template: '%s | Jasa Suruh Kalirejo',
  },
  description:
    'Layanan antar jemput & titip beli terpercaya di Kecamatan Kalirejo, Lampung Tengah. Pesan makanan, belanja, obat, kirim dokumen & paket. Cepat, aman, terjangkau!',
  keywords: [
    'jasa suruh kalirejo',
    'jasa antar kalirejo',
    'jasa titip beli kalirejo',
    'delivery kalirejo',
    'kurir kalirejo',
    'lampung tengah delivery',
    'antar jemput kalirejo',
  ],
  authors: [{ name: 'Jasa Suruh Kalirejo' }],
  creator: 'Jasa Suruh Kalirejo',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://jasasuruhkalirejo.com',
    siteName: 'Jasa Suruh Kalirejo',
    title: 'Jasa Suruh Kalirejo — Layanan Antar Jemput & Titip Beli #1',
    description:
      'Layanan antar jemput & titip beli terpercaya di Kecamatan Kalirejo. Cepat, aman, terjangkau!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Jasa Suruh Kalirejo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jasa Suruh Kalirejo',
    description: 'Layanan antar jemput & titip beli terpercaya di Kalirejo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://jasasuruhkalirejo.com'),
  manifest: '/manifest.json',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Jasa Suruh Kalirejo (JSS)',
  image: 'https://jasasuruhkalirejo.com/og-image.png',
  '@id': 'https://jasasuruhkalirejo.com',
  url: 'https://jasasuruhkalirejo.com',
  telephone: '+62882020705153',
  priceRange: 'Rp5.000 - Rp50.000',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kecamatan Kalirejo',
    addressLocality: 'Lampung Tengah',
    addressRegion: 'Lampung',
    addressCountry: 'ID',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -5.2275,
    longitude: 104.9601,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  sameAs: [
    'https://instagram.com/jasasuruhkalirejo',
    'https://tiktok.com/@jasasuruhkalirejo',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#FFFFFF" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-primary focus:text-secondary-900 focus:font-bold focus:rounded-xl focus:shadow-golden"
        >
          Langsung ke konten utama
        </a>
        <AuthProvider>
          <Navbar />
          <main id="main-content" className="min-h-screen">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                borderRadius: '14px',
                fontFamily: 'var(--font-inter)',
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                color: '#202124',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
