import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FiArrowRight } from 'react-icons/fi';

export const HeroSection: React.FC = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="lg:pr-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Fundizzle can help you find and secure grant funding to help you grow.
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Fundizzle is the industry leader in securing funding for a wide variety of organizations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/login">
                <Button size="lg" className="text-lg">
                  GET STARTED
                  <FiArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/about/contact">
                <Button variant="secondary" size="lg" className="text-lg">
                  LET'S CHAT
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image/Graphic */}
          <div className="relative">
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">AI-Powered Matching</h3>
                    <p className="text-primary-100">Smart grant discovery</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Thousands of Grants Available</h3>
                    <p className="text-primary-100">Funding programs from a wide variety of organizations</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Personalized Results</h3>
                    <p className="text-primary-100">Tailored to your profile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 