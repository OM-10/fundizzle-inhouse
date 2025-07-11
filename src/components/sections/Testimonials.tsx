import React from 'react';
import { FiMessageCircle } from 'react-icons/fi';

const testimonials = [
  {
    quote: "This is a placeholder for a real client testimonial. Share a positive experience here.",
    author: "Client Name A",
    title: "Title/Role, Company A",
  },
  {
    quote: "This is a placeholder for a real client testimonial. Share a positive experience here.",
    author: "Client Name B",
    title: "Title/Role, Company B",
  },
  {
    quote: "This is a placeholder for a real client testimonial. Share a positive experience here.",
    author: "Client Name C",
    title: "Title/Role, Company C",
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            What our clients say
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-6">
                <FiMessageCircle className="w-6 h-6 text-primary-600" />
              </div>
              
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="font-semibold text-gray-900">
                  {testimonial.author}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {testimonial.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 