import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);
  // Add password matching state variables
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);

  useEffect(() => {
    // Set a flag to prevent automatic redirects during password reset
    localStorage.setItem('isPasswordReset', 'true');
    
    // Check if we have a valid session (user clicked reset link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidToken(true);
      } else {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };

    checkSession();

    // Clean up flag when component unmounts
    return () => {
      localStorage.removeItem('isPasswordReset');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Password updated successfully! Redirecting to login...');
        // Remove the flag and sign out the user after password reset
        localStorage.removeItem('isPasswordReset');
        await supabase.auth.signOut();
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
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

    // Real-time password matching validation
    if (name === 'password' || name === 'confirmPassword') {
      const password = name === 'password' ? value : formData.password;
      const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;
      const match = password === confirmPassword;
      setPasswordsMatch(match);
      setShowPasswordMismatch(
        confirmPassword.length >= 5 && !match
      );
    }
  };

  if (!isValidToken && !error) {
    return (
      <Layout title="Reset Password - Fundizzle" description="Reset your Fundizzle account password.">
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

  return (
    <Layout title="Reset Password - Fundizzle" description="Reset your Fundizzle account password.">
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset your password</h2>
            <p className="text-gray-600 mb-6">Enter your new password below.</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            {error && !isValidToken ? (
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Request new reset link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
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

                {/* Reset Button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading || !formData.password || !formData.confirmPassword || !passwordsMatch}
                  className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? 'Updating...' : 'Reset Password'}
                </Button>
              </form>
            )}

            {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
            {error && isValidToken && <p className="mt-4 text-red-600 text-center">{error}</p>}

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <Link 
                href="/auth/login" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 