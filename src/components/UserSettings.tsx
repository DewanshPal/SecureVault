'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/helper/AuthContext';
import { X, Shield, ShieldCheck, Settings, AlertTriangle } from 'lucide-react';
import TwoFactorSetup from './TwoFactorSetup';
import { showNotification } from '@/lib/clipboard';

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSettings({ isOpen, onClose }: UserSettingsProps) {
  const { user, token } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);

  // Check 2FA status
  const check2FAStatus = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/auth/2fa/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIs2FAEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      check2FAStatus();
    }
  }, [isOpen, token]);

  const handleDisable2FA = async () => {
    if (!disableCode.trim() || !token) return;

    setIsDisabling2FA(true);

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          token: disableCode.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIs2FAEnabled(false);
        setShowDisableForm(false);
        setDisableCode('');
        showNotification('2FA disabled successfully', 'success');
      } else {
        showNotification(data.error || 'Failed to disable 2FA', 'error');
      }
    } catch (error) {
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsDisabling2FA(false);
    }
  };

  const handle2FASetupComplete = () => {
    setIs2FAEnabled(true);
    setShow2FASetup(false);
    check2FAStatus(); // Refresh status
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Settings className="h-6 w-6" />
              <span>Account Settings</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Information</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{user?.name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {is2FAEnabled ? (
                        <ShieldCheck className="h-8 w-8 text-green-600" />
                      ) : (
                        <Shield className="h-8 w-8 text-gray-400" />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {is2FAEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security to your account'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        is2FAEnabled 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                      }`}>
                        {is2FAEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {is2FAEnabled ? (
                    <div className="space-y-3">
                      {!showDisableForm ? (
                        <button
                          onClick={() => setShowDisableForm(true)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
                        >
                          Disable 2FA
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertTriangle className="h-5 w-5 text-amber-600" />
                              <span className="font-medium text-amber-800 dark:text-amber-200">
                                Disable Two-Factor Authentication
                              </span>
                            </div>
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                              Enter your current 2FA code to disable two-factor authentication.
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={disableCode}
                              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-center"
                              maxLength={6}
                            />
                            <button
                              onClick={handleDisable2FA}
                              disabled={isDisabling2FA || disableCode.length !== 6}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
                            >
                              {isDisabling2FA ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                'Disable'
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setShowDisableForm(false);
                                setDisableCode('');
                              }}
                              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-md transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Protect your account with an authenticator app like Google Authenticator or Authy.
                      </p>
                      <button
                        onClick={() => setShow2FASetup(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        Enable 2FA
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Security Notice</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• All your vault data is encrypted on your device before being sent to our servers</li>
                <li>• We cannot see your passwords or personal information</li>
                <li>• Enable 2FA for maximum account security</li>
                <li>• Keep your backup codes in a secure location</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      <TwoFactorSetup
        isOpen={show2FASetup}
        onClose={() => setShow2FASetup(false)}
        onComplete={handle2FASetupComplete}
      />
    </>
  );
}
