'use client';

import { useState, useEffect } from 'react';
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
const StoryProgressTracker = dynamic(
  () => import('@/components/landing/StoryProgressTracker').then((m) => m.StoryProgressTracker),
  { ssr: false }
);
const CinematicAtmosphere = dynamic(
  () => import('@/components/landing/cinematic/CinematicAtmosphere').then((m) => m.CinematicAtmosphere),
  { ssr: false }
);

export default function HomePage() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      const sections = ['hero', 'layanan', 'keunggulan', 'cara-kerja', 'area-layanan', 'testimoni'];

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            setCurrentStage(i);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen overflow-x-hidden relative transform-gpu">
      {/* Premium Cinematic Atmospheric Overlay (Sunlight Flare, Floating Leaves, Wind Lines) */}
      <CinematicAtmosphere />

      {/* Scroll Story Progress Tracker */}
      <StoryProgressTracker currentStage={currentStage} />

      {/* 1. Hero Section */}
      <div id="hero">
        <HeroSection />
      </div>

      {/* 2. Services Section */}
      <div id="layanan">
        <FeatureCards />
      </div>

      {/* 3. Why Choose JSS Section */}
      <div id="keunggulan">
        <AboutUs />
      </div>

      {/* 4. How It Works Section */}
      <div id="cara-kerja">
        <HowItWorks />
      </div>

      {/* 5. Coverage Area Section */}
      <div id="area-layanan">
        <CoveragePreview />
      </div>

      {/* 6. Testimonials Section */}
      <div id="testimoni">
        <Testimonials />
      </div>

      {/* 7. CTA Section */}
      <CTASection />
    </div>
  );
}
