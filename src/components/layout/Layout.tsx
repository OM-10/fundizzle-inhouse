import React, { ReactNode } from 'react';
import Head from 'next/head';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Fundizzle - AI-powered Grant Matching Software',
  description = 'Discover and secure grant funding with USA\'s leading AI-powered platform. GrantMatch connects organizations to funding opportunities using AI technology.',
  keywords = 'grants, funding, government grants, AI-powered, Canada, small business, municipalities, corporations',
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="FUNDizzle" />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="FUNDizzle" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://fundizzle.com" />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}; 