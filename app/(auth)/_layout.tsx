import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';

export default function AuthLayout() {
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    console.log('AuthLayout - Auth State:', {
      isAuthenticated,
      hasUser: !!user,
      loading,
      userEmail: user?.email,
    });
  }, [isAuthenticated, user, loading]);

  // Show loading state while checking authentication
  if (loading) {
    console.log('AuthLayout - Still loading auth state');
    return <View style={styles.loading} />;
  }

  // Redirect to tabs if already authenticated
  if (isAuthenticated && user) {
    console.log('AuthLayout - User authenticated, redirecting to tabs');
    return <Redirect href="/(tabs)" />;
  }

  console.log('AuthLayout - Showing auth stack');
  
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});