import React, { createContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { googleAuth } from '../services/googleAuth';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  accountType: 'demo' | 'live';
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: { name: string; email: string; avatar?: string }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('@trading_app_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Update last login
        const updatedUser = {
          ...parsedUser,
          lastLogin: new Date(),
          createdAt: new Date(parsedUser.createdAt),
        };
        setUser(updatedUser);
        await AsyncStorage.setItem('@trading_app_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Demo authentication - accept any valid email/password format
      if (!email.includes('@') || email.length < 5) {
        throw new Error('Invalid email format');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Create demo user
      const newUser: User = {
        id: Date.now().toString(),
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email,
        accountType: 'demo',
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      setUser(newUser);
      await AsyncStorage.setItem('@trading_app_user', JSON.stringify(newUser));
      
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      const googleUser = await googleAuth.signIn();
      
      const newUser: User = {
        id: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.photo,
        accountType: 'demo',
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      setUser(newUser);
      await AsyncStorage.setItem('@trading_app_user', JSON.stringify(newUser));
      
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Basic validation
      if (!email.includes('@') || email.length < 5) {
        throw new Error('Invalid email format');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      if (name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters');
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: name.trim(),
        email,
        accountType: 'demo',
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      setUser(newUser);
      await AsyncStorage.setItem('@trading_app_user', JSON.stringify(newUser));
      
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('@trading_app_user');
      await AsyncStorage.removeItem('@trading_app_mt5_config');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profile: { name: string; email: string; avatar?: string }) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser: User = {
        ...user,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar || user.avatar,
        lastLogin: new Date(),
      };

      setUser(updatedUser);
      await AsyncStorage.setItem('@trading_app_user', JSON.stringify(updatedUser));
      
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}