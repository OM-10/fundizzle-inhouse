import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { FiUser, FiCalendar, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function ProfilePage() {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    date_of_birth: '',
    gender: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch existing user details
  const fetchUserDetails = async () => {
    try {
      const authToken = session?.access_token;
      
      if (!authToken) {
        console.log('No auth token available');
        setIsLoading(false);
        return;
      }

      console.log('Making GET request to:', `${BASE_URL}/get-user-details`);
      console.log('Auth token available:', !!authToken);
      
      const response = await fetch(`${BASE_URL}/get-user-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const userData = await response.json();
        console.log('Fetched user data:', userData);
        
        // Populate form with existing data
        setFormData({
          fname: userData.fname || '',
          lname: userData.lname || '',
          date_of_birth: userData.date_of_birth || '',
          gender: userData.gender || ''
        });
      } else if (response.status === 404) {
        // User profile doesn't exist yet, keep form empty
        console.log('No existing profile found');
      } else {
        console.error('Error fetching user details:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user details on component mount
  React.useEffect(() => {
    console.log('useEffect triggered, session:', !!session, 'token:', !!session?.access_token);
    if (session?.access_token) {
      fetchUserDetails();
    } else {
      console.log('No session or token, setting loading to false');
      setIsLoading(false);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    // Validate required fields
    if (!formData.fname.trim() || !formData.lname.trim()) {
      setSubmitMessage({ type: 'error', text: 'First name and last name are required.' });
      setIsSubmitting(false);
      return;
    }

    // Handle empty date of birth and other empty fields
    const dataToSend: any = {
      fname: formData.fname.trim(),
      lname: formData.lname.trim(),
    };
    
    // Only include date_of_birth if it's not empty
    if (formData.date_of_birth.trim() !== '') {
      dataToSend.date_of_birth = formData.date_of_birth;
    }
    
    // Only include gender if it's not empty
    if (formData.gender.trim() !== '') {
      dataToSend.gender = formData.gender;
    }

    try {
      // Get auth token from session
      const authToken = session?.access_token;
      
      if (!authToken) {
        setSubmitMessage({ type: 'error', text: 'No authentication token available. Please log in again.' });
        return;
      }

      console.log('Original formData:', formData);
      console.log('Processed dataToSend:', dataToSend);
      console.log('date_of_birth value:', dataToSend.date_of_birth);
      console.log('date_of_birth type:', typeof dataToSend.date_of_birth);
      
      const response = await fetch(`${BASE_URL}/save-user-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitMessage({ type: 'success', text: 'Profile updated successfully!' });
        console.log('Profile saved:', result);
        
        // Refresh user details after successful update
        await fetchUserDetails();
      } else {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        setSubmitMessage({ type: 'error', text: errorData.message || errorData.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSubmitMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Profile" description="Update your profile information">
      <div className="min-h-[60vh] bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-8">
              <FiUser className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Profile Information</h1>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading profile...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label htmlFor="fname" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="fname"
                    name="fname"
                    value={formData.fname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Enter your first name"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lname" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lname"
                    name="lname"
                    value={formData.lname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Birth */}
                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiUserCheck className="w-5 h-5 mr-2" />
                      Update Profile
                    </>
                  )}
                </button>
              </div>

              {/* Success/Error Message */}
              {submitMessage && (
                <div className={`mt-4 p-4 rounded-lg ${
                  submitMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {submitMessage.text}
                </div>
              )}
            </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 