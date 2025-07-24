import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function NotFound() {
  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <MaterialIcons name="error-outline" size={64} color="#EF4444" />
          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.subtitle}>
            The page you are looking for does not exist.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.replace('/(tabs)')}
            style={styles.homeButton}
          >
            Go to Dashboard
          </Button>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
  },
  homeButton: {
    backgroundColor: '#00C896',
  },
});