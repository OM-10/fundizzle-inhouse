import React from 'react';
import { FiUsers, FiHome, FiGlobe, FiCpu } from 'react-icons/fi';

const categories = [
  {
    icon: FiUsers,
    title: 'Hiring & Training',
    description: 'Invest in your employees with the help of grant funding that can support hiring and training initiatives.',
    number: '2',
  },
  {
    icon: FiHome,
    title: 'Infrastructure & Facilities',
    description: 'Grant funding is available for new construction, facility upgrades, equipment, retrofits, expansions and more.',
    number: '3',
  },
  {
    icon: FiGlobe,
    title: 'Environmental Upgrades',
    description: 'Reduce your carbon footprint and improve efficiency with the help of government grant programs.',
    number: '4',
  },
  {
    icon: FiCpu,
    title: 'Innovation & Technology',
    description: 'Invest in innovative technology, research, development and more with the help of government grant programs.',
    number: '5',
  },
];

export const FundingCategories: React.FC = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            GRANT FUNDING IS AN ESSENTIAL TOOL FOR A GROWING ORGANIZATION
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Billions of government funding dollars are available each year to help organizations achieve key initiatives
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 text-center group hover:-translate-y-2">
              {/* Number Badge */}
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                {category.number}
              </div>
              
              {/* Icon */}
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-100 transition-colors duration-300">
                <category.icon className="w-8 h-8 text-gray-600 group-hover:text-primary-600 transition-colors duration-300" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {category.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 