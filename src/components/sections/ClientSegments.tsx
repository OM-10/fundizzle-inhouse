import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FiArrowRight, FiBriefcase, FiUsers, FiTrendingUp } from 'react-icons/fi';

const segments = [
  {
    id: 'small-business',
    title: 'SMALL BUSINESSES',
    icon: FiBriefcase,
    headline: '60% of Canadian small businesses have never applied for a government grant. We can help!',
    description: 'Government grants help fund a range of innovative projects, from expansions and retrofits to hiring initiatives and equipment purchases. The problem facing Canadian small businesses is that government grant programs are difficult to discover. We have developed the leading, AI-powered grants platform to help businesses identify and pursue funding opportunities to evolve their enterprises.',
    cta: 'Discover the GrantMatch Hub!',
    href: '/solutions/small-business',
  },
  {
    id: 'municipalities',
    title: 'MUNICIPALITIES',
    icon: FiUsers,
    headline: 'GrantMatch can help you secure meaningful grant funding for your community.',
    description: 'The municipal funding sector presents a unique set of challenges. Municipal managers often play many roles, and pursuing grant opportunities across all civic departments can be a monumental task. GrantMatch has the experience and knowledge to maximize your community\'s funding intake and record of approval.',
    cta: 'LEARN MORE',
    href: '/solutions/municipalities',
  },
  {
    id: 'large-corporations',
    title: 'LARGE CORPORATIONS',
    icon: FiTrendingUp,
    headline: 'Access grants and incentives to make your next large capital investment go further.',
    description: 'If your organization is considering a major capital investment, such as a new plant, expansion, or significant job creation during a business growth phase, GrantMatch can help develop a proactive grant strategy to accelerate your growth.',
    cta: 'LEARN MORE',
    href: '/solutions/large-business',
  },
];

export const ClientSegments: React.FC = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            UNCOVER FUNDING PROGRAMS AVAILABLE TO YOUR SECTOR
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            GrantMatch supports public and private sector organizations of all sizes
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {segments.map((segment) => (
            <div key={segment.id} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <segment.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{segment.title}</h3>
              </div>
              
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                {segment.headline}
              </h4>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {segment.description}
              </p>
              
              <Link href={segment.href}>
                <Button variant="secondary" className="w-full justify-center">
                  {segment.cta}
                  <FiArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 