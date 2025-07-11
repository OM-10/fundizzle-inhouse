import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { FiUser } from 'react-icons/fi';

const teamMembers = [
  {
    name: 'Karth',
    title: 'Software Engineer',
    description: 'The brains behind the execution.',
  },
  {
    name: 'Amy',
    title: 'CEO',
    description: 'Expert in process optimization and client success.',
  },
  {
    name: 'Allie',
    title: 'CTO',
    description: 'Visionary leader with a passion for helping organizations secure funding.',
  },
  {
    name: 'Om',
    title: 'Software Engineer',
    description: 'The brains behind the execution.',
  },
];

export default function OurTeamPage() {
  return (
    <Layout title="Our Team - FUNDizzle" description="Meet the FUNDizzle team, dedicated to helping you secure government grants.">
      <section className="section-padding bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container-custom text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Meet the people behind FUNDizzle. Our team is dedicated to your funding success.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <FiUser className="w-12 h-12 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <div className="text-primary-600 font-medium mb-2">{member.title}</div>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
} 