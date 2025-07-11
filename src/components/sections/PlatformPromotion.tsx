import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FiArrowRight, FiTarget, FiDatabase, FiCpu } from 'react-icons/fi';

const features = [
  {
    icon: FiTarget,
    title: 'AI-Powered Grant Matching',
    description: 'Get personalized funding opportunities using advanced AI algorithms.',
  },
  {
    icon: FiDatabase,
    title: 'Comprehensive Grant Database',
    description: 'Access thousands of grants from government, foundations, and private sources all in one place.',
  },
  {
    icon: FiCpu,
    title: 'Effortless Profile Import',
    description: 'Import your profile from LinkedIn or ORCID and get matched in minutes.',
  },
];

export const PlatformPromotion: React.FC = () => {
  return (
    <section className="section-padding bg-primary-600 text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Discover the Easiest Way to Find Funding
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Fundizzle is the smart, inclusive platform for researchers, nonprofits, and organizations seeking funding.
            </p>
            
            <div className="bg-white/10 rounded-2xl p-6 mb-8">
              <h3 className="text-2xl font-bold mb-4">
                Fundizzle connects you to the right grants fast.
              </h3>
              <p className="text-primary-100">
                Our platform uses AI to analyze your profile and recommend the best funding opportunities from a vast, always-updated database. Whether you are a researcher, nonprofit, or business, Fundizzle makes grant discovery simple and effective.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <Button variant="secondary" size="lg">
                  Get Started Free
                  <FiArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-white/10 rounded-xl">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-primary-100">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}; 