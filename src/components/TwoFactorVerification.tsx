'use client';

import React, { useState } from 'react';
import { Shield, AlertCircle, Key } from 'lucide-react';

interface TwoFactorVerificationProps {
  email: string;
  password: string;
  onVerify: (code: string, isBackupCode?: boolean) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
  isLoading: boolean;
}

export default function TwoFactorVerification({ 
  email, 
  password, 
  onVerify, 
  onBack, 
  isLoading 
}: TwoFactorVerificationProps) {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError('');
    const result = await onVerify(code.trim(), useBackupCode);
    
    if (!result.success) {
      setError(result.error || 'Invalid code');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (useBackupCode) {
      // Allow alphanumeric for backup codes
      setCode(value.toUpperCase().slice(0, 8));
    } else {
      // Only numbers for TOTP codes
      setCode(value.replace(/\D/g, '').slice(0, 6));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter the verification code from your authenticator app
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Signing in as: <span className="font-medium">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="sr-only">
                {useBackupCode ? 'Backup Code' : 'Verification Code'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {useBackupCode ? (
                    <Key className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Shield className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  id="code"
                  name="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 bg-white dark:bg-gray-800 text-center text-lg font-mono"
                  placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
                  maxLength={useBackupCode ? 8 : 6}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setCode('');
                  setError('');
                }}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {useBackupCode ? 'Use authenticator app' : 'Use backup code'}
              </button>
              
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Back to login
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading || code.length < (useBackupCode ? 4 : 6)}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                `Verify ${useBackupCode ? 'Backup Code' : 'Code'}`
              )}
            </button>

            {useBackupCode && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> Each backup code can only be used once.
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
