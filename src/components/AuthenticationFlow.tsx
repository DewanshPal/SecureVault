'use client';

import React, { useState } from 'react';
import { useAuth } from '@/helper/AuthContext';
import AuthForm from '@/components/AuthForm';
import TwoFactorVerification from '@/components/TwoFactorVerification';
import VaultDashboard from '@/components/VaultDashboard';

export default function AuthenticationFlow() {
  const { user, login, isLoading } = useAuth();
  const [authState, setAuthState] = useState<'login' | 'register' | '2fa'>('login');
  const [pendingAuth, setPendingAuth] = useState<{ email: string; password: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleAuthSubmit = async (email: string, password: string, name?: string) => {
    setIsAuthLoading(true);
    
    try {
      if (authState === 'register') {
        // Handle registration logic here if needed
        // For now, just switch to login
        setAuthState('login');
        return { success: false, error: 'Registration not implemented in this flow' };
      } else {
        // Handle login
        const result = await login(email, password);
        
        if (result.requiresTwoFactor) {
          setPendingAuth({ email, password });
          setAuthState('2fa');
          return { success: false, requiresTwoFactor: true };
        }
        
        return result;
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handle2FAVerification = async (code: string, isBackupCode: boolean = false) => {
    if (!pendingAuth) {
      return { success: false, error: 'No pending authentication' };
    }

    setIsAuthLoading(true);

    try {
      const result = await login(
        pendingAuth.email, 
        pendingAuth.password,
        isBackupCode ? undefined : code,
        isBackupCode ? code : undefined
      );

      if (result.success) {
        setPendingAuth(null);
        setAuthState('login');
      }

      return result;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleBackTo2FA = () => {
    setPendingAuth(null);
    setAuthState('login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <VaultDashboard />;
  }

  if (authState === '2fa' && pendingAuth) {
    return (
      <TwoFactorVerification
        email={pendingAuth.email}
        password={pendingAuth.password}
        onVerify={handle2FAVerification}
        onBack={handleBackTo2FA}
        isLoading={isAuthLoading}
      />
    );
  }

  return (
    <AuthForm 
      isLogin={authState === 'login'}
      onToggleMode={() => setAuthState(authState === 'login' ? 'register' : 'login')}
      onSubmit={handleAuthSubmit}
      isLoading={isAuthLoading}
    />
  );
}
