import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { FiUpload, FiUser, FiFileText, FiTarget, FiTrendingUp, FiSettings, FiLogOut } from 'react-icons/fi';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTotalGrantsCount } from '@/utils/grantsApi';

const dashboardFeatures = [
  {
    icon: FiUser,
    title: 'Profile Management',
    description: 'View and edit your personal and professional information',
    href: '/dashboard/profile',
    color: 'bg-green-100 text-green-600',
    bgColor: 'hover:bg-green-50',
  },
  {
    icon: FiUpload,
    title: 'LinkedIn Import',
    description: 'Upload your LinkedIn PDF to automatically populate your profile',
    href: '/dashboard/linkedin-import',
    color: 'bg-blue-100 text-blue-600',
    bgColor: 'hover:bg-blue-50',
  },
  {
    icon: FiUser,
    title: 'ORCID Import',
    description: 'Import your research profile from ORCID for academic projects',
    href: '/dashboard/orcid-import',
    color: 'bg-emerald-100 text-emerald-600',
    bgColor: 'hover:bg-emerald-50',
  },
  {
    icon: FiTarget,
    title: 'Grant Matching',
    description: 'Find grants that match your profile and interests',
    href: '/dashboard/grants',
    color: 'bg-purple-100 text-purple-600',
    bgColor: 'hover:bg-purple-50',
  },
  {
    icon: FiFileText,
    title: 'My Grants',
    description: 'View your liked, disliked, and saved grants',
    href: '/dashboard/my-grants',
    color: 'bg-orange-100 text-orange-600',
    bgColor: 'hover:bg-orange-50',
  },
  {
    icon: FiSettings,
    title: 'Settings',
    description: 'Manage your account settings and preferences',
    href: '/dashboard/user-settings',
    color: 'bg-gray-100 text-gray-600',
    bgColor: 'hover:bg-gray-50',
  },
];

export default function DashboardPage() {
  // All hooks must be at the top, before any return
  const { user, loading: authLoading } = useRequireAuth();
  const { signOut } = useAuth();
  const [totalGrants, setTotalGrants] = useState<number>(0);
  const [loadingGrants, setLoadingGrants] = useState<boolean>(false);
  const [grantsError, setGrantsError] = useState<string | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const hasFetched = useRef(false);

  // Helper function to get auth token
  const getAuthToken = async (): Promise<string | null> => {
    if (typeof window !== 'undefined') {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    }
    return null;
  };

  // Fetch profile completion
  const fetchProfileCompletion = async () => {
    try {
      setLoadingProfile(true);
      const authToken = await getAuthToken();
      
      if (!authToken) {
        console.error('No auth token available');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile-complete`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile completion');
      }

      const data = await response.json();
      if (data.profile_score !== undefined) {
        setProfileCompletion(data.profile_score);
      }
    } catch (error) {
      console.error('Error fetching profile completion:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    // Only fetch once per session when user becomes available
    if (!user || hasFetched.current) return;
    hasFetched.current = true;

    let attempts = 0;
    const maxAttempts = 3;

    const fetchWithRetry = async () => {
      setLoadingGrants(true);
      setGrantsError(null);
      while (attempts < maxAttempts) {
        try {
          const response = await fetchTotalGrantsCount();
          if (response.success) {
            setTotalGrants(response.total);
            setGrantsError(null);
            break;
          } else {
            attempts++;
            if (attempts >= maxAttempts) {
              setGrantsError('Failed to fetch total grants.');
              setTotalGrants(0);
            }
          }
        } catch (err) {
          attempts++;
          if (attempts >= maxAttempts) {
            setGrantsError('Failed to fetch total grants.');
            setTotalGrants(0);
          }
        }
      }
      setLoadingGrants(false);
    };

    fetchWithRetry();
    fetchProfileCompletion();
  }, [user]);

  // Now do conditional returns
  if (authLoading) {
    return (
      <Layout title="Dashboard - Fundizzle">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Layout
      title="Dashboard - Fundizzle"
      description="Manage your grant funding journey from your personalized dashboard."
    >
      <div className="min-h-screen bg-gray-50">

        {/* Quick Stats */}
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Completion</p>
                  {loadingProfile ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <p className="text-2xl font-bold text-gray-900">Loading...</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{profileCompletion}%</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Grants</p>
                  {loadingGrants ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      <p className="text-2xl font-bold text-gray-900">Loading...</p>
                    </div>
                  ) : grantsError ? (
                    <p className="text-2xl font-bold text-red-600">{grantsError}</p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{totalGrants.toLocaleString()}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiTarget className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {totalGrants > 0 ? 'Browse all available grants' : 'Complete your profile to see matches'}
              </p>
            </div>
          </div>

          {/* Dashboard Features Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {dashboardFeatures.map((feature, index) => (
                <Link key={index} href={feature.href}>
                  <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md ${feature.bgColor} cursor-pointer`}>
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 