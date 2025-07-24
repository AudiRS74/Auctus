import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function LandingPage() {
  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#334155']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.logo}>📈 TradingBot Pro</Text>
          <Text style={styles.subtitle}>
            Advanced MT5 Trading Platform with AI-Powered Analytics
          </Text>
          
          <View style={styles.features}>
            <Text style={styles.feature}>• Real-time MT5 integration</Text>
            <Text style={styles.feature}>• Advanced technical indicators</Text>
            <Text style={styles.feature}>• Automated trading bots</Text>
            <Text style={styles.feature}>• Risk management tools</Text>
          </View>

          <View style={styles.buttons}>
            <Button
              mode="contained"
              onPress={() => router.push('/(auth)/signin')}
              style={styles.primaryButton}
              labelStyle={styles.buttonText}
            >
              Sign In
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.push('/(auth)/signup')}
              style={styles.secondaryButton}
              labelStyle={styles.secondaryButtonText}
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
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00C896',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  features: {
    marginBottom: 40,
  },
  feature: {
    color: '#94A3B8',
    fontSize: 16,
    marginVertical: 4,
  },
  buttons: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#00C896',
    paddingVertical: 8,
  },
  secondaryButton: {
    borderColor: '#00C896',
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#00C896',
  },
});