import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { TradingProvider } from '@/contexts/TradingContext';
import { StatusBar } from 'expo-status-bar';

const theme = {
  colors: {
    primary: '#8B5CF6',
    secondary: '#FF6B6B',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    onSurface: '#CBD5E1',
    error: '#EF4444',
    success: '#10B981',
    accent: '#00C896',
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <TradingProvider>
            <StatusBar style="light" backgroundColor="#0F172A" />
            <Stack screenOptions={{ 
              headerShown: false,
              title: 'Auctus'
            }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </TradingProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}