import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { updateUserPassword, verifyCurrentPassword } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Add password matching state variables
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);

  // Redirect if not logged in (only after loading is complete)
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    // Validate current password
    if (!formData.currentPassword) {
      setError('Current password is required');
      setIsLoading(false);
      return;
    }

    // Verify current password
    try {
      const { error: verifyError } = await verifyCurrentPassword(
        user?.email || '',
        formData.currentPassword
      );

      if (verifyError) {
        setError('Current password is incorrect');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      setError('Failed to verify current password');
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    // Update password
    try {
      const { error } = await updateUserPassword(formData.newPassword);

      if (error) {
        setError(error.message);
      } else {
        setMessage('Password updated successfully!');
        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        // Reset password matching states
        setPasswordsMatch(true);
        setShowPasswordMismatch(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Real-time password matching validation (same as signup page)
    if (name === 'newPassword' || name === 'confirmPassword') {
      const newPassword = name === 'newPassword' ? value : formData.newPassword;
      const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;
      const match = newPassword === confirmPassword;
      setPasswordsMatch(match);
      setShowPasswordMismatch(
        confirmPassword.length >= 5 && !match
      );
    }
  };

  if (loading) {
    return (
      <Layout title="Change Password - Fundizzle" description="Change your Fundizzle account password.">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Loading...</h2>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout title="Change Password - Fundizzle" description="Change your Fundizzle account password.">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Redirecting...</h2>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Change Password - Fundizzle" description="Change your Fundizzle account password.">
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Change your password</h2>
            <p className="text-gray-600 mb-6">Enter your current password and new password below.</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password Field */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Mismatch Warning */}
              {showPasswordMismatch && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}

              {/* Update Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword || !passwordsMatch}
                className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>

            {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

            {/* Back to Dashboard Link */}
            <div className="mt-6 text-center">
              <Link 
                href="/dashboard" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 