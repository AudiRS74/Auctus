import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';

export default function AuthIndex() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    console.log('AuthIndex - State:', { isAuthenticated, loading });
  }, [isAuthenticated, loading]);

  if (loading) {
    return <View style={styles.loading} />;
  }

  if (isAuthenticated) {
    console.log('AuthIndex - Redirecting to tabs (user authenticated)');
    return <Redirect href="/(tabs)" />;
  }

  console.log('AuthIndex - Redirecting to signin (user not authenticated)');
  return <Redirect href="/(auth)/signin" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});