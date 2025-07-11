import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { FiClock } from 'react-icons/fi';

export default function NonprofitsPage() {
  return (
    <Layout title="For Businesses - Coming Soon" description="This page is under construction.">
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg w-full flex flex-col items-center animate-fade-in">
          <FiClock className="w-16 h-16 text-primary-600 mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Coming Soon</h1>
          <p className="text-lg text-gray-600 mb-2">Our team is working on this page.</p>
          <p className="text-gray-500">Please check back later!</p>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </Layout>
  );
} 