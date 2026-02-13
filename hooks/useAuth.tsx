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
      signIn: () => Promise.resolve({ error: 'Authentication not available' }),
      signOut: () => Promise.resolve(),
      updateProfile: () => Promise.resolve(),
      loading: false,
      error: 'Authentication context not found',
      logout: () => Promise.resolve(),
      initialized: false,
    };
  }
  
  return context;
}