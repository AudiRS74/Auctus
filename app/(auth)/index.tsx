import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function AuthLanding() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <MaterialIcons name="trending-up" size={80} color={Colors.primary} />
            <Text style={styles.title}>TradingPro</Text>
            <Text style={styles.subtitle}>Professional Trading Platform</Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <MaterialIcons name="show-chart" size={32} color={Colors.bullish} />
              <Text style={styles.featureText}>Real-time Charts</Text>
            </View>
            <View style={styles.feature}>
              <MaterialIcons name="smart-toy" size={32} color={Colors.accent} />
              <Text style={styles.featureText}>AI Automation</Text>
            </View>
            <View style={styles.feature}>
              <MaterialIcons name="analytics" size={32} color={Colors.secondary} />
              <Text style={styles.featureText}>Advanced Analysis</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <Button
              mode="contained"
              onPress={() => router.push('/(tabs)')}
              style={styles.primaryButton}
              buttonColor={Colors.primary}
              textColor={Colors.background}
              icon="play-arrow"
              labelStyle={styles.buttonText}
            >
              Start Demo Trading
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => router.push('/(auth)/signin')}
              style={styles.secondaryButton}
              textColor={Colors.primary}
              icon="login"
              labelStyle={styles.buttonText}
            >
              Sign In
            </Button>
            
            <Button
              mode="text"
              onPress={() => router.push('/(auth)/signup')}
              textColor={Colors.textSecondary}
              labelStyle={styles.linkText}
            >
              Create Account
            </Button>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 60,
  },
  feature: {
    alignItems: 'center',
  },
  featureText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  buttons: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  secondaryButton: {
    borderRadius: 12,
    borderColor: Colors.primary,
    paddingVertical: 4,
  },
  buttonText: {
    ...Typography.button,
    fontSize: 16,
  },
  linkText: {
    ...Typography.body2,
  },
});