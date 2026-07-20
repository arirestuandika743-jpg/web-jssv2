import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { AboutUs } from '@/components/landing/AboutUs';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Stats } from '@/components/landing/Stats';
import { CoveragePreview } from '@/components/landing/CoveragePreview';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureCards />
      <AboutUs />
      <HowItWorks />
      <Stats />
      <CoveragePreview />
      <Testimonials />
      <FAQ />
    </>
  );
}
