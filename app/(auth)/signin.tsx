import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function SignIn() {
  const { login, loginWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('demo@trader.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      await login(email.trim(), password);
      showAlert('Login Successful', 'Welcome to the professional trading terminal!', () => {
        router.replace('/(tabs)');
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      showAlert('Login Failed', message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle();
      showAlert('Google Login Successful', 'Welcome to the professional trading terminal!', () => {
        router.replace('/(tabs)');
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setError(message);
      showAlert('Google Login Failed', message);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@trader.com');
    setPassword('demo123');
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={Gradients.trading}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Access your professional trading terminal</Text>
              </View>
            </View>

            {/* Demo Info Banner */}
            <Card style={styles.demoBanner}>
              <Card.Content style={styles.demoBannerContent}>
                <View style={styles.demoBannerHeader}>
                  <MaterialIcons name="info" size={20} color={Colors.primary} />
                  <Text style={styles.demoBannerTitle}>Demo Trading Mode</Text>
                </View>
                <Text style={styles.demoBannerText}>
                  Use demo credentials for instant access to the trading platform
                </Text>
                <Button
                  mode="text"
                  onPress={fillDemoCredentials}
                  textColor={Colors.primary}
                  icon="auto-fix-high"
                  compact
                  style={styles.autofillButton}
                >
                  Auto-fill Demo Credentials
                </Button>
              </Card.Content>
            </Card>

            {/* Login Form */}
            <Card style={styles.formCard}>
              <LinearGradient
                colors={[Colors.primary + '10', Colors.surface]}
                style={styles.formGradient}
              >
                <View style={styles.formContent}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Email Address"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setError('');
                      }}
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                      theme={{
                        colors: {
                          primary: Colors.primary,
                          onSurface: Colors.textPrimary,
                          outline: Colors.border,
                          surface: Colors.inputBackground,
                        }
                      }}
                      textColor={Colors.textPrimary}
                      left={<TextInput.Icon icon="email" iconColor={Colors.textMuted} />}
                    />

                    <TextInput
                      label="Password"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        setError('');
                      }}
                      mode="outlined"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      theme={{
                        colors: {
                          primary: Colors.primary,
                          onSurface: Colors.textPrimary,
                          outline: Colors.border,
                          surface: Colors.inputBackground,
                        }
                      }}
                      textColor={Colors.textPrimary}
                      left={<TextInput.Icon icon="lock" iconColor={Colors.textMuted} />}
                      right={
                        <TextInput.Icon 
                          icon={showPassword ? "eye-off" : "eye"} 
                          iconColor={Colors.textMuted}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                    />
                  </View>

                  {error ? (
                    <View style={styles.errorContainer}>
                      <MaterialIcons name="error" size={20} color={Colors.error} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <View style={styles.buttonContainer}>
                    <Button
                      mode="contained"
                      onPress={handleLogin}
                      loading={loading}
                      disabled={loading}
                      style={styles.loginButton}
                      buttonColor={Colors.primary}
                      textColor={Colors.background}
                      icon="login"
                      labelStyle={styles.buttonText}
                    >
                      {loading ? 'Signing In...' : 'Sign In to Terminal'}
                    </Button>

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>or</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <Button
                      mode="outlined"
                      onPress={handleGoogleLogin}
                      disabled={loading}
                      style={styles.googleButton}
                      textColor={Colors.primary}
                      icon="google"
                      labelStyle={styles.buttonText}
                    >
                      Continue with Google
                    </Button>
                  </View>
                </View>
              </LinearGradient>
            </Card>

            {/* Demo Credentials Help */}
            <Card style={styles.helpCard}>
              <Card.Content style={styles.helpContent}>
                <View style={styles.helpHeader}>
                  <MaterialIcons name="help" size={20} color={Colors.accent} />
                  <Text style={styles.helpTitle}>Demo Account Credentials</Text>
                </View>
                <View style={styles.credentialsList}>
                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialLabel}>Email:</Text>
                    <Text style={styles.credentialValue}>demo@trader.com</Text>
                  </View>
                  <View style={styles.credentialItem}>
                    <Text style={styles.credentialLabel}>Password:</Text>
                    <Text style={styles.credentialValue}>demo123</Text>
                  </View>
                </View>
                <Text style={styles.helpNote}>
                  These credentials provide access to a $10,000 demo trading account with real-time market data.
                </Text>
              </Card.Content>
            </Card>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text 
                  style={styles.footerLink}
                  onPress={() => router.push('/(auth)/signup')}
                >
                  Create one now
                </Text>
              </Text>
              
              <Text style={styles.disclaimerText}>
                This is a demo trading platform for educational purposes only.
                No real money is involved in any transactions.
              </Text>
            </View>
          </View>
        </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  demoBanner: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    marginBottom: 24,
  },
  demoBannerContent: {
    paddingVertical: 16,
  },
  demoBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoBannerTitle: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  demoBannerText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  autofillButton: {
    alignSelf: 'flex-start',
  },
  formCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 8,
  },
  formGradient: {
    borderRadius: 16,
  },
  formContent: {
    padding: 24,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.inputBackground,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    padding: 12,
    backgroundColor: Colors.error + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  errorText: {
    ...Typography.body2,
    color: Colors.error,
    flex: 1,
  },
  buttonContainer: {
    gap: 16,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.body2,
    color: Colors.textMuted,
    marginHorizontal: 16,
  },
  googleButton: {
    borderRadius: 12,
    paddingVertical: 6,
    borderColor: Colors.primary,
  },
  buttonText: {
    ...Typography.button,
    fontSize: 16,
  },
  helpCard: {
    backgroundColor: Colors.surface,
    marginBottom: 24,
  },
  helpContent: {
    paddingVertical: 16,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpTitle: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginLeft: 8,
  },
  credentialsList: {
    gap: 8,
    marginBottom: 12,
  },
  credentialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  credentialLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  credentialValue: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  helpNote: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  footerText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
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