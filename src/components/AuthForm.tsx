'use client';

import React, { useState } from 'react';
import { useAuth } from '@/helper/AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

interface AuthFormProps {
  isLogin: boolean;
  onToggleMode: () => void;
  onSubmit?: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string; requiresTwoFactor?: boolean }>;
  isLoading?: boolean;
}

export default function AuthForm({ isLogin, onToggleMode, onSubmit, isLoading: externalLoading }: AuthFormProps) {
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const finalIsLoading = externalLoading || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (onSubmit) {
        // Use external submit handler
        const result = await onSubmit(formData.email, formData.password, formData.name);
        if (!result.success && !result.requiresTwoFactor) {
          setError(result.error || 'Authentication failed');
        }
      } else {
        // Use default auth context
        if (isLogin) {
          const result = await login(formData.email, formData.password);
          if (!result.success) {
            setError(result.error || 'Login failed');
          }
        } else {
          if (!formData.name.trim()) {
            setError('Name is required');
            setIsLoading(false);
            return;
          }
          const result = await register(formData.email, formData.password, formData.name);
          if (!result.success) {
            setError(result.error || 'Registration failed');
          }
        }
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      
      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 float-animation"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-200 dark:bg-purple-900 rounded-full opacity-20 float-animation" style={{animationDelay: '1s'}}></div>
      
      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Modern card with glass effect */}
        <div className="glass modern-card p-8 space-y-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">
              {isLogin ? 'Welcome Back' : 'Join SecureVault'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? "Sign in to access your secure vault" : 'Create your account to get started'}
            </p>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={onToggleMode}
                className="font-medium gradient-text hover:opacity-80 transition-opacity"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="modern-input"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="modern-input pl-12"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center justify-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="modern-input pl-12 pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="modern-alert bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={finalIsLoading}
                className="modern-button w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {finalIsLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    <Lock className="w-5 h-5 mr-2" />
                    {isLogin ? 'Sign in to Vault' : 'Create Secure Account'}
                  </span>
                )}
              </button>
            </div>

            {!isLogin && (
              <div className="modern-alert bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Privacy First Security</p>
                  <p className="text-sm opacity-90 mt-1">All your vault data is encrypted on your device before being sent to our servers. We cannot see your passwords or personal information.</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
