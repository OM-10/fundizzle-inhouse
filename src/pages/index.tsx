import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/sections/HeroSection';
import { TechnologySection } from '@/components/sections/TechnologySection';
import { ClientSegments } from '@/components/sections/ClientSegments';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { FundingCategories } from '@/components/sections/FundingCategories';
import { SuccessStories } from '@/components/sections/SuccessStories';
import { ClientLogos } from '@/components/sections/ClientLogos';
import { PlatformPromotion } from '@/components/sections/PlatformPromotion';
import { Testimonials } from '@/components/sections/Testimonials';

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <TechnologySection />
      <PlatformPromotion />
    </Layout>
  );
} 