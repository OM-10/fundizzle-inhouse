import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const TechnologySection: React.FC = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            FUNDIZZLE'S TECHNOLOGY
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Discover the most recent grant programs in our database using our AI-powered grant matching tool.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Fundizzle uses proprietary technology to simplify the grant process, connecting clients to funding to solve their most important challenges and save time.
          </p>
          <Link href="/about/contact">
            <Button size="lg">
              LET'S CHAT
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}; 