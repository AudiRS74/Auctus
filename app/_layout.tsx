import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../contexts/AuthContext';
import { TradingProvider } from '../contexts/TradingProvider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after layout is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <PaperProvider>
      <AuthProvider>
        <TradingProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </TradingProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
</Stack>

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after layout is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <PaperProvider>
      <AuthProvider>
        <TradingProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </TradingProvider>
      </AuthProvider>
    </PaperProvider>
  );
}