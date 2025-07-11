import React from 'react';

const clients = [
  'Client A',
  'Client B',
  'Client C',
  'Client D',
  'Client E',
  'Client F',
  'Client G',
];

export const ClientLogos: React.FC = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          A sample of our clients
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center">
          {clients.map((client, index) => (
            <div key={index} className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 h-24 flex items-center justify-center">
                <span className="text-gray-600 font-semibold text-sm">
                  {client}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 