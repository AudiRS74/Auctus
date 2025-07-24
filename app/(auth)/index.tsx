import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function AuthIndex() {
  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <MaterialIcons name="trending-up" size={64} color="#00C896" />
            <Text style={styles.title}>Auctus Trading</Text>
            <Text style={styles.subtitle}>Advanced Trading Platform</Text>
          </View>

          <View style={styles.buttons}>
            <Button
              mode="contained"
              onPress={() => router.push('/(auth)/signin')}
              style={styles.signInButton}
              contentStyle={styles.buttonContent}
            >
              Sign In
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.push('/(auth)/signup')}
              style={styles.signUpButton}
              contentStyle={styles.buttonContent}
            >
              Create Account
            </Button>
          </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
  },
  buttons: {
    width: '100%',
    gap: 16,
  },
  signInButton: {
    backgroundColor: '#00C896',
  },
  signUpButton: {
    borderColor: '#00C896',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});