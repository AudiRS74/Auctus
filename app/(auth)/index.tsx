import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

const { width, height } = Dimensions.get('window');

export default function AuthIndex() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={Gradients.primary}
        style={styles.background}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="trending-up" size={64} color={Colors.primary} />
            </View>
            <Text style={styles.appTitle}>TradingPro</Text>
            <Text style={styles.appSubtitle}>Advanced MT5 Trading Platform</Text>
          </View>

          {/* Features Section */}
          <Card style={styles.featuresCard}>
            <Card.Content style={styles.featuresContent}>
              <Text style={styles.featuresTitle}>Professional Trading Features</Text>
              
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <MaterialIcons name="show-chart" size={24} color={Colors.primary} />
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>Real-time Charts</Text>
                    <Text style={styles.featureDescription}>Advanced TradingView integration</Text>
                  </View>
                </View>
                
                <View style={styles.featureItem}>
                  <MaterialIcons name="smart-toy" size={24} color={Colors.primary} />
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>Automated Trading</Text>
                    <Text style={styles.featureDescription}>AI-powered trading strategies</Text>
                  </View>
                </View>
                
                <View style={styles.featureItem}>
                  <MaterialIcons name="analytics" size={24} color={Colors.primary} />
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>Advanced Analytics</Text>
                    <Text style={styles.featureDescription}>Professional market analysis</Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <Button
              mode="contained"
              onPress={() => router.push('/(auth)/signin')}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="login"
            >
              Sign In
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => router.push('/(auth)/signup')}
              style={styles.secondaryButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.secondaryButtonLabel}
              icon="account-plus"
            >
              Create Account
            </Button>

            <View style={styles.demoSection}>
              <Text style={styles.demoText}>
                Start with demo trading - no real money required
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: 40,
  },
  logoContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    elevation: 8,
  },
  appTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  appSubtitle: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  featuresCard: {
    backgroundColor: Colors.surface + 'E6',
    borderRadius: 16,
    elevation: 4,
    marginBottom: 40,
  },
  featuresContent: {
    padding: 24,
  },
  featuresTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  actionSection: {
    paddingBottom: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  secondaryButton: {
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    ...Typography.button,
    color: Colors.background,
    fontWeight: '600',
  },
  secondaryButtonLabel: {
    ...Typography.button,
    color: Colors.primary,
    fontWeight: '600',
  },
  demoSection: {
    paddingTop: 16,
    alignItems: 'center',
  },
  demoText: {
    ...Typography.body2,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});