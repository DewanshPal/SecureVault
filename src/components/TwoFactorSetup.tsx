'use client';

import React, { useState } from 'react';
import { useAuth } from '@/helper/AuthContext';
import { X, Copy, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { copyToClipboardWithClear, showNotification } from '@/lib/clipboard';

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface SetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export default function TwoFactorSetup({ isOpen, onClose, onComplete }: TwoFactorSetupProps) {
  const { token } = useAuth();
  const [step, setStep] = useState<'setup' | 'verify' | 'backup' | 'complete'>('setup');
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const startSetup = async () => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSetupData(data);
        setStep('verify');
      } else {
        setError(data.error || 'Failed to setup 2FA');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!token || !verificationCode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          token: verificationCode.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('backup');
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const finishSetup = () => {
    setStep('complete');
    setTimeout(() => {
      onComplete();
      onClose();
      resetState();
    }, 2000);
  };

  const resetState = () => {
    setStep('setup');
    setSetupData(null);
    setVerificationCode('');
    setError('');
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const copyBackupCodes = async () => {
    if (!setupData?.backupCodes) return;
    
    const codesText = setupData.backupCodes.join('\n');
    const success = await copyToClipboardWithClear(codesText, 30);
    
    if (success) {
      showNotification('Backup codes copied! Save them securely.', 'success');
    }
  };

  const copyManualKey = async () => {
    if (!setupData?.manualEntryKey) return;
    
    const success = await copyToClipboardWithClear(setupData.manualEntryKey, 15);
    
    if (success) {
      showNotification('Manual entry key copied!', 'success');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Setup Two-Factor Authentication</span>
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'setup' && (
            <div className="space-y-4">
              <div className="text-center">
                <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Secure Your Account
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Two-factor authentication adds an extra layer of security to your account. 
                  You'll need your phone to log in.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What you'll need:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• An authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>• Your phone or device to scan a QR code</li>
                  <li>• A secure place to store backup codes</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <button
                onClick={startSetup}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Shield size={18} />
                    <span>Start Setup</span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'verify' && setupData && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Scan QR Code
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Use your authenticator app to scan this QR code
                </p>
              </div>

              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border">
                  <img 
                    src={setupData.qrCode} 
                    alt="2FA QR Code" 
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Manual Entry Key (if you can't scan)
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono break-all">
                    {setupData.manualEntryKey}
                  </code>
                  <button
                    onClick={copyManualKey}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter verification code from your authenticator app
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg font-mono"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <button
                onClick={verifyAndEnable}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : (
                  'Verify & Enable 2FA'
                )}
              </button>
            </div>
          )}

          {step === 'backup' && setupData && (
            <div className="space-y-6">
              <div className="text-center">
                <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Save Your Backup Codes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  These codes can be used to access your account if you lose your authenticator device. 
                  Store them securely!
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">Backup Codes</h4>
                  <button
                    onClick={copyBackupCodes}
                    className="flex items-center space-x-1 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                  >
                    <Copy size={16} />
                    <span className="text-sm">Copy All</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  {setupData.backupCodes.map((code, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-2 rounded border">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Important:</strong> Each backup code can only be used once. 
                  Store them in a secure location like a password manager.
                </p>
              </div>

              <button
                onClick={finishSetup}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                I've Saved My Backup Codes
              </button>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                2FA Enabled Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your account is now protected with two-factor authentication.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
