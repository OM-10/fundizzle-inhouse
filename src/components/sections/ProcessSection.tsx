import React from 'react';
import { Button } from '@/components/ui/Button';
import { FiCheckCircle, FiUsers, FiTarget, FiTrendingUp } from 'react-icons/fi';

const features = [
  {
    icon: FiCheckCircle,
    title: 'Expert Team',
    description: 'Our team of funding experts brings years of experience in government grant programs.',
  },
  {
    icon: FiTarget,
    title: 'Targeted Matching',
    description: 'AI-powered technology matches your organization with the most relevant funding opportunities.',
  },
  {
    icon: FiUsers,
    title: 'Personalized Support',
    description: 'Dedicated support throughout the entire application process from start to finish.',
  },
  {
    icon: FiTrendingUp,
    title: 'Proven Results',
    description: 'Track record of successful grant applications and funding approvals for our clients.',
  },
];

export const ProcessSection: React.FC = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              START-TO-FINISH GRANT FUNDING SUPPORT
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Government funding is challenging to secure. Our team is here to help.
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              We offer a unique approach that combines the knowledge and expertise of our team of funding experts with leading data and grant-matching software.
            </p>
            <Button size="lg">
              LET'S CHAT
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}; 