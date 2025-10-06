'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateEncryptionKey } from '@/lib/encryption';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  encryptionKey: string | null;
  isLoading: boolean;
  login: (email: string, password: string, twoFactorToken?: string, backupCode?: string) => Promise<{ success: boolean; error?: string; requiresTwoFactor?: boolean }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedEncryptionKey = localStorage.getItem('encryptionKey');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setEncryptionKey(storedEncryptionKey);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, twoFactorToken?: string, backupCode?: string) => {
    try {
      const requestBody: any = { email, password };
      
      if (twoFactorToken) {
        requestBody.twoFactorToken = twoFactorToken;
      } else if (backupCode) {
        requestBody.backupCode = backupCode;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if 2FA is required
        if (data.requiresTwoFactor) {
          return { success: false, requiresTwoFactor: true };
        }

        const userEncryptionKey = generateEncryptionKey(password, email);
        
        setUser(data.user);
        setToken(data.token);
        setEncryptionKey(userEncryptionKey);
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('encryptionKey', userEncryptionKey);
        
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        const userEncryptionKey = generateEncryptionKey(password, email);
        
        setUser(data.user);
        setToken(data.token);
        setEncryptionKey(userEncryptionKey);
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('encryptionKey', userEncryptionKey);
        
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setEncryptionKey(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('encryptionKey');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      encryptionKey,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
