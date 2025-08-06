import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth must be used within AuthProvider');
    // Return fallback values to prevent crashes
    return {
      user: null,
      isAuthenticated: false,
      signIn: async () => ({ user: null, error: 'Auth not initialized' }),
      signOut: async () => {},
      loading: false,
      error: 'Auth context not found'
    };
  }
  return context;
}