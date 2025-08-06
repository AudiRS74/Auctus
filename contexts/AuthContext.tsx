import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ user?: User; error?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('User restored from storage:', parsedUser);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError('Failed to restore session');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: Date.now().toString(),
        name: email.split('@')[0] || 'Demo Trader',
        email: email
      };

      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      console.log('User signed in successfully:', mockUser);
      return { user: mockUser };
    } catch (error) {
      const errorMessage = 'Sign in failed. Please try again.';
      setError(errorMessage);
      console.error('Sign in error:', error);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setError(null);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Sign out failed');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    signIn,
    signOut,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}