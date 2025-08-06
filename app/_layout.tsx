import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Slot, SplashScreen, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../contexts/AuthContext';
import { TradingProvider } from '../contexts/TradingProvider';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/Colors';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Inner component that handles routing logic
function RootLayoutInner() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Hide splash screen once auth state is determined
      SplashScreen.hideAsync();
      
      // Navigate to appropriate screen based on auth state
      if (isAuthenticated) {
        // User is logged in, navigate to tabs
        router.replace('/(tabs)/');
      } else {
        // User is not logged in, navigate to auth
        router.replace('/(auth)/');
      }
    }
  }, [isAuthenticated, loading]);

  // Show nothing while determining auth state and navigating
  if (loading) {
    return null;
  }

  return <Slot />;
}

export default function RootLayout() {
  const paperTheme = {
    colors: {
      primary: Colors.primary,
      onPrimary: Colors.background,
      secondary: Colors.secondary,
      onSecondary: Colors.background,
      background: Colors.background,
      onBackground: Colors.textPrimary,
      surface: Colors.surface,
      onSurface: Colors.textPrimary,
      surfaceVariant: Colors.cardElevated,
      onSurfaceVariant: Colors.textSecondary,
      outline: Colors.border,
      error: Colors.error,
      onError: Colors.background,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <TradingProvider>
          <StatusBar 
            style={Platform.OS === 'ios' ? 'light' : 'light'} 
            backgroundColor={Colors.background}
          />
          <RootLayoutInner />
        </TradingProvider>
      </AuthProvider>
    </PaperProvider>
  );
}