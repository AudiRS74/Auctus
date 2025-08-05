import React, { createContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-login for demo - check if user data exists in storage
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('demoUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } else {
        // Set default demo user
        const demoUser: User = {
          id: 'demo-user-001',
          email: 'demo@trader.com',
          name: 'Demo Trader',
          avatar: undefined
        };
        setUser(demoUser);
        await AsyncStorage.setItem('demoUser', JSON.stringify(demoUser));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      // Set default demo user if storage fails
      const demoUser: User = {
        id: 'demo-user-001',
        email: 'demo@trader.com',
        name: 'Demo Trader',
        avatar: undefined
      };
      setUser(demoUser);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Demo login - simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        avatar: undefined
      };
      
      setUser(user);
      await AsyncStorage.setItem('demoUser', JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // Demo registration - simulate user creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        avatar: undefined
      };
      
      setUser(user);
      await AsyncStorage.setItem('demoUser', JSON.stringify(user));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('demoUser');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem('demoUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}