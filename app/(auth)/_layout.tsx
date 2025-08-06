import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  // Redirect to tabs if user becomes authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/(tabs)/');
    }
  }, [isAuthenticated, loading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1A1A1A' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}