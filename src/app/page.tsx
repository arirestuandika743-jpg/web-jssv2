'use client';

import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/landing/HeroSection';

const FeatureCards = dynamic(() => import('@/components/landing/FeatureCards').then((m) => m.FeatureCards), {
  ssr: true,
});
const AboutUs = dynamic(() => import('@/components/landing/AboutUs').then((m) => m.AboutUs), {
  ssr: true,
});
const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks').then((m) => m.HowItWorks), {
  ssr: true,
});
const CoveragePreview = dynamic(() => import('@/components/landing/CoveragePreview').then((m) => m.CoveragePreview), {
  ssr: true,
});
const Testimonials = dynamic(() => import('@/components/landing/Testimonials').then((m) => m.Testimonials), {
  ssr: true,
});
const CTASection = dynamic(() => import('@/components/landing/CTASection').then((m) => m.CTASection), {
  ssr: true,
});
const CinematicBackground = dynamic(
  () => import('@/components/landing/cinematic/CinematicBackground').then((m) => m.CinematicBackground),
  { ssr: false }
);

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen overflow-x-hidden relative transform-gpu">
      {/* Premium Cinematic Background Layer */}
      <CinematicBackground />

      {/* 1. Hero Section */}
      <div id="hero" className="relative z-10">
        <HeroSection />
      </div>

      {/* 2. Services Section */}
      <div id="layanan" className="relative z-10">
        <FeatureCards />
      </div>

      {/* 3. How It Works Section */}
      <div id="cara-kerja" className="relative z-10">
        <HowItWorks />
      </div>

      {/* 4. Why Choose JSS Section */}
      <div id="keunggulan" className="relative z-10">
        <AboutUs />
      </div>

      {/* 5. Coverage Area Section */}
      <div id="area-layanan" className="relative z-10">
        <CoveragePreview />
      </div>

      {/* 6. Testimonials Section */}
      <div id="testimoni" className="relative z-10">
        <Testimonials />
      </div>

      {/* 7. CTA Section */}
      <div className="relative z-10">
        <CTASection />
      </div>
    </div>
  );
}
