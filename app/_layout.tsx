import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../contexts/AuthContext';
import { TradingProvider } from '../contexts/TradingProvider';
import { Colors } from '../constants/Colors';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after app loads
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
          <Slot />
        </TradingProvider>
      </AuthProvider>
    </PaperProvider>
  );
}