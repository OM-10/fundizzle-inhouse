import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { FiUsers, FiTrendingUp, FiHeart, FiGlobe } from 'react-icons/fi';

const benefits = [
  {
    icon: <FiUsers className="w-8 h-8 text-primary-600 mb-3" />,
    title: 'Inclusive Team',
    description: 'Supportive, collaborative, and diverse environment where everyone belongs.'
  },
  {
    icon: <FiTrendingUp className="w-8 h-8 text-primary-600 mb-3" />,
    title: 'Growth Opportunities',
    description: 'We encourage learning and provide opportunities for professional development.'
  },
  {
    icon: <FiHeart className="w-8 h-8 text-primary-600 mb-3" />,
    title: 'Meaningful Impact',
    description: 'Work on projects that make a real difference for organizations and communities.'
  },
  {
    icon: <FiGlobe className="w-8 h-8 text-primary-600 mb-3" />,
    title: 'Global Mission',
    description: 'Be part of a mission-driven company with a vision for positive change.'
  },
];

export default function CareersPage() {
  return (
    <Layout title="Careers - FUNDizzle" description="Join the FUNDizzle team. See our culture, benefits, and how to apply.">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container-custom text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Careers at FUNDizzle
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join a passionate team dedicated to helping organizations secure funding and make a difference. We value innovation, collaboration, and growth.
          </p>
        </div>
      </section>

      {/* Culture & Benefits Section */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Culture & Benefits</h2>
          <p className="text-gray-700 text-lg mb-10 max-w-2xl mx-auto">
            At FUNDizzle, we believe in fostering a positive, inclusive, and growth-oriented workplace. Here are some of the things that make our culture special:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow duration-200">
                {benefit.icon}
                <div className="font-semibold text-gray-900 mb-2">{benefit.title}</div>
                <div className="text-gray-600 text-sm">{benefit.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* No Openings Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Openings</h2>
          <p className="text-lg text-gray-700 mb-6">
            We currently do not have any open positions. However, we are always interested in connecting with talented individuals!
          </p>
          <p className="text-gray-600 mb-6">
            If you would like to be considered for future opportunities, please send your resume and a brief introduction to <a href="mailto:careers@fundizzle.com" className="text-primary-600 hover:text-primary-700 font-medium">careers@fundizzle.com</a>.
          </p>
          <a href="mailto:careers@fundizzle.com" className="font-semibold rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2 px-8 py-4 text-lg bg-primary-600 hover:bg-primary-700 text-white">
            Send Resume
          </a>
        </div>
      </section>
    </Layout>
  );
} 