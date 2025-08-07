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
  updateProfile: (profile: Partial<User>) => Promise<void>;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>; // Alias for signOut
  initialized: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    initializeAuth();
    
    return () => {
      setIsMounted(false);
    };
  }, []);

  const initializeAuth = async () => {
    try {
      if (!isMounted) return;
      
      console.log('AuthContext: Initializing authentication...');
      setLoading(true);
      setError(null);

      // Add a small delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100));

      const userData = await AsyncStorage.getItem('user');
      if (userData && isMounted) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setUser(parsedUser);
            console.log('AuthContext: User restored from storage:', parsedUser.email);
          } else {
            console.warn('AuthContext: Invalid user data found, clearing storage');
            await AsyncStorage.removeItem('user');
          }
        } catch (parseError) {
          console.error('AuthContext: Error parsing stored user data:', parseError);
          await AsyncStorage.removeItem('user');
        }
      } else {
        console.log('AuthContext: No stored user found');
      }
    } catch (error) {
      console.error('AuthContext: Error during initialization:', error);
      if (isMounted) {
        setError('Failed to initialize authentication');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        setInitialized(true);
        console.log('AuthContext: Authentication initialization complete');
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Sign in attempt for:', email);
      setLoading(true);
      setError(null);

      // Input validation
      if (!email?.trim()) {
        const errorMsg = 'Email is required';
        setError(errorMsg);
        return { error: errorMsg };
      }

      if (!email.includes('@')) {
        const errorMsg = 'Please enter a valid email address';
        setError(errorMsg);
        return { error: errorMsg };
      }

      if (!password) {
        const errorMsg = 'Password is required';
        setError(errorMsg);
        return { error: errorMsg };
      }

      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!isMounted) return { error: 'Component unmounted' };

      // Create demo user
      const mockUser: User = {
        id: Date.now().toString(),
        name: email.split('@')[0]?.charAt(0).toUpperCase() + email.split('@')[0]?.slice(1) || 'Demo User',
        email: email.trim().toLowerCase()
      };

      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      if (isMounted) {
        setUser(mockUser);
        console.log('AuthContext: User signed in successfully:', mockUser.email);
      }
      
      return { user: mockUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed. Please try again.';
      if (isMounted) {
        setError(errorMessage);
      }
      console.error('AuthContext: Sign in error:', error);
      return { error: errorMessage };
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Signing out user');
      setLoading(true);
      
      await AsyncStorage.removeItem('user');
      
      if (isMounted) {
        setUser(null);
        setError(null);
        console.log('AuthContext: User signed out successfully');
      }
    } catch (error) {
      console.error('AuthContext: Sign out error:', error);
      if (isMounted) {
        setError('Sign out failed');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const updateProfile = async (profile: Partial<User>) => {
    try {
      console.log('AuthContext: Updating profile');
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No user signed in');
      }

      const updatedUser: User = {
        ...user,
        ...profile,
        id: user.id, // Keep original ID
      };

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (isMounted) {
        setUser(updatedUser);
        console.log('AuthContext: Profile updated successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      if (isMounted) {
        setError(errorMessage);
      }
      console.error('AuthContext: Profile update error:', error);
      throw error;
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    signIn,
    signOut,
    updateProfile,
    loading,
    error,
    logout: signOut, // Alias for compatibility
    initialized,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}