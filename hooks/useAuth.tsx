import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    // Return safe defaults instead of throwing
    return {
      user: null,
      isAuthenticated: false,
      signIn: async () => ({ error: 'Authentication not available' }),
      signOut: async () => {},
      updateProfile: async () => {},
      loading: false,
      error: 'Authentication context not found',
      logout: async () => {},
      initialized: false,
    };
  }
  
  return context;
}