import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';

export default function AuthWelcomeScreen() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="hourglass-empty" size={48} color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <MaterialIcons name="trending-up" size={80} color={Colors.primary} />
          <Text style={styles.appName}>TradingPro</Text>
          <Text style={styles.tagline}>Professional Trading Platform</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <MaterialIcons name="show-chart" size={24} color={Colors.bullish} />
            <Text style={styles.featureText}>Real-time Market Data</Text>
          </View>
          <View style={styles.feature}>
            <MaterialIcons name="smart-toy" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Automated Trading</Text>
          </View>
          <View style={styles.feature}>
            <MaterialIcons name="analytics" size={24} color={Colors.accent} />
            <Text style={styles.featureText}>Advanced Analytics</Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push('/(auth)/signin')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Secure • Professional • Reliable
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 60,
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});