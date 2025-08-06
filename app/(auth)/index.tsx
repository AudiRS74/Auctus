import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function AuthIndex() {
  const { isAuthenticated, loading } = useAuth();
  const [showDemoInfo, setShowDemoInfo] = useState(false);

  // Cross-platform alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      const Alert = require('react-native').Alert;
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="trending-up" size={64} color={Colors.primary} />
          <Text style={styles.loadingText}>Loading MT5 Terminal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDemoLogin = () => {
    setShowDemoInfo(true);
  };

  const proceedToDemoLogin = () => {
    setShowDemoInfo(false);
    router.push('/(auth)/signin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={Gradients.trading}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.logoBackground}
              >
                <MaterialIcons name="trending-up" size={48} color={Colors.background} />
              </LinearGradient>
              <Text style={styles.logoText}>MT5 Pro Demo</Text>
            </View>
            <Text style={styles.tagline}>Professional Trading Terminal</Text>
          </View>

          {/* Features */}
          <Card style={styles.featuresCard}>
            <Card.Content style={styles.featuresContent}>
              <Text style={styles.featuresTitle}>Professional Trading Platform</Text>
              
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <MaterialIcons name="analytics" size={24} color={Colors.primary} />
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>Real Market Data</Text>
                    <Text style={styles.featureDescription}>Live prices from TradingView</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <MaterialIcons name="auto-awesome" size={24} color={Colors.secondary} />
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>AI Trading Automation</Text>
                    <Text style={styles.featureDescription}>6 professional strategy templates</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <MaterialIcons name="security" size={24} color={Colors.accent} />
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>MT5 Integration</Text>
                    <Text style={styles.featureDescription}>Authentic demo server connection</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <MaterialIcons name="show-chart" size={24} color={Colors.bullish} />
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>Professional Charts</Text>
                    <Text style={styles.featureDescription}>TradingView embedded widgets</Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleDemoLogin}
              style={styles.primaryButton}
              buttonColor={Colors.primary}
              textColor={Colors.background}
              icon="login"
              labelStyle={styles.buttonText}
            >
              Access Demo Account
            </Button>

            <Button
              mode="outlined"
              onPress={() => router.push('/(auth)/signup')}
              style={styles.secondaryButton}
              textColor={Colors.primary}
              icon="account-plus"
              labelStyle={styles.buttonText}
            >
              Create New Account
            </Button>

            <Button
              mode="text"
              onPress={() => showAlert('Live Trading', 'Live trading is not available in this demo version. This app demonstrates professional MT5 trading features using simulated data.')}
              style={styles.textButton}
              textColor={Colors.textMuted}
              icon="info"
              labelStyle={styles.textButtonLabel}
              compact
            >
              Live Trading Info
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Demo Version • Educational Purpose Only
            </Text>
            <Text style={styles.disclaimerText}>
              This is a demonstration of professional trading features. No real money is involved.
            </Text>
          </View>
        </View>

        {/* Demo Info Modal */}
        <Modal visible={showDemoInfo} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={[Colors.primary + '15', Colors.surface]}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <MaterialIcons name="info" size={32} color={Colors.primary} />
                  <Text style={styles.modalTitle}>Demo Trading Account</Text>
                </View>

                <View style={styles.modalContent}>
                  <Text style={styles.modalDescription}>
                    You're about to access a professional MT5 demo trading environment with:
                  </Text>

                  <View style={styles.demoFeatures}>
                    <View style={styles.demoFeature}>
                      <MaterialIcons name="account-balance-wallet" size={20} color={Colors.bullish} />
                      <Text style={styles.demoFeatureText}>$10,000 virtual balance</Text>
                    </View>
                    <View style={styles.demoFeature}>
                      <MaterialIcons name="trending-up" size={20} color={Colors.accent} />
                      <Text style={styles.demoFeatureText}>Real-time market prices</Text>
                    </View>
                    <View style={styles.demoFeature}>
                      <MaterialIcons name="psychology" size={20} color={Colors.secondary} />
                      <Text style={styles.demoFeatureText}>AI trading automation</Text>
                    </View>
                    <View style={styles.demoFeature}>
                      <MaterialIcons name="bar-chart" size={20} color={Colors.primary} />
                      <Text style={styles.demoFeatureText}>Professional trading tools</Text>
                    </View>
                  </View>

                  <View style={styles.credentialsInfo}>
                    <Text style={styles.credentialsTitle}>Quick Demo Credentials:</Text>
                    <Text style={styles.credentialsText}>Email: demo@trader.com</Text>
                    <Text style={styles.credentialsText}>Password: demo123</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowDemoInfo(false)}
                    style={styles.modalCancelButton}
                    textColor={Colors.textSecondary}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={proceedToDemoLogin}
                    style={styles.modalProceedButton}
                    buttonColor={Colors.primary}
                    textColor={Colors.background}
                    icon="arrow-right"
                  >
                    Continue
                  </Button>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* Cross-platform Alert Modal */}
        {Platform.OS === 'web' && (
          <Modal visible={alertConfig.visible} transparent animationType="fade">
            <View style={styles.alertOverlay}>
              <View style={styles.alertContainer}>
                <Text style={styles.alertTitle}>{alertConfig.title}</Text>
                <Text style={styles.alertMessage}>{alertConfig.message}</Text>
                <TouchableOpacity
                  style={styles.alertButton}
                  onPress={() => {
                    alertConfig.onOk?.();
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <Text style={styles.alertButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  tagline: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  featuresCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    elevation: 8,
    marginBottom: 32,
  },
  featuresContent: {
    padding: 24,
  },
  featuresTitle: {
    ...Typography.h5,
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
    fontWeight: '500',
    marginBottom: 2,
  },
  featureDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 6,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 6,
    borderColor: Colors.primary,
  },
  textButton: {
    alignSelf: 'center',
  },
  buttonText: {
    ...Typography.button,
    fontSize: 16,
  },
  textButtonLabel: {
    ...Typography.body2,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '500',
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 16,
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 8,
  },
  modalContent: {
    marginBottom: 24,
  },
  modalDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  demoFeatures: {
    gap: 12,
    marginBottom: 20,
  },
  demoFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  demoFeatureText: {
    ...Typography.body2,
    color: Colors.textPrimary,
  },
  credentialsInfo: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  credentialsTitle: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 8,
  },
  credentialsText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderColor: Colors.border,
  },
  modalProceedButton: {
    flex: 1,
  },
  // Cross-platform alert styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 12,
    minWidth: 300,
    maxWidth: '90%',
  },
  alertTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  alertButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 80,
  },
  alertButtonText: {
    ...Typography.body2,
    color: Colors.background,
    fontWeight: '500',
  },
});