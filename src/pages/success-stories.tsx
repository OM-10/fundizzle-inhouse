import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { SuccessStories } from '@/components/sections/SuccessStories';
import { Testimonials } from '@/components/sections/Testimonials';
import { ClientLogos } from '@/components/sections/ClientLogos';

export default function SuccessStoriesPage() {
  return (
    <Layout title="Success Stories - FUNDizzle" description="See examples of our client success stories and testimonials.">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container-custom text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Success Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore how our clients have achieved their goals. These are sample placeholders for real success stories, testimonials, and client partnerships.
          </p>
        </div>
      </section>
      <SuccessStories />
      <Testimonials />
      <ClientLogos />
    </Layout>
  );
} 