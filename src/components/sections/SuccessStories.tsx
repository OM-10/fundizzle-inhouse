import React from 'react';
import { Button } from '@/components/ui/Button';

const successStories = [
  {
    company: 'Client Company A',
    description: 'This is a placeholder for a real client success story. Highlight a key achievement or impact here.',
    metric: {
      amount: 'Amount/Impact',
      description: 'Brief description of the result or funding secured.',
    },
    cta: 'READ THE FULL STORY',
  },
  {
    company: 'Client Company B',
    description: 'This is a placeholder for a real client success story. Highlight a key achievement or impact here.',
    metric: {
      amount: 'Amount/Impact',
      description: 'Brief description of the result or funding secured.',
    },
    cta: 'READ THE FULL STORY',
  },
  {
    company: 'Client Company C',
    description: 'This is a placeholder for a real client success story. Highlight a key achievement or impact here.',
    metric: {
      amount: 'Amount/Impact',
      description: 'Brief description of the result or funding secured.',
    },
    cta: 'READ THE FULL STORY',
  },
];

export const SuccessStories: React.FC = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Client Success Stories
          </h2>
        </div>

        <div className="space-y-16">
          {successStories.map((story, index) => (
            <div key={index} className="bg-gray-50 rounded-3xl p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
                {/* Company Info */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-4">
                    {story.company}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{story.description}</p>
                  <Button variant="outline" size="sm">
                    {story.cta}
                  </Button>
                </div>

                {/* Success Metric */}
                <div className="lg:col-span-3 flex flex-col items-center justify-center">
                  <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                    {story.metric.amount}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {story.metric.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 