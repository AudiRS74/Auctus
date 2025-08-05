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

export default function SignUp() {
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      await register(email.trim(), password, name.trim());
      showAlert('Account Created', 'Your demo trading account has been created successfully!', () => {
        router.replace('/(tabs)');
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      showAlert('Registration Failed', message);
    }
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join the professional trading community</Text>
              </View>
            </View>

            {/* Registration Form */}
            <Card style={styles.formCard}>
              <LinearGradient
                colors={[Colors.secondary + '10', Colors.surface]}
                style={styles.formGradient}
              >
                <View style={styles.formContent}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Full Name"
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        setError('');
                      }}
                      mode="outlined"
                      autoCapitalize="words"
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
                      left={<TextInput.Icon icon="account" iconColor={Colors.textMuted} />}
                    />

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

                    <TextInput
                      label="Confirm Password"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        setError('');
                      }}
                      mode="outlined"
                      secureTextEntry={!showConfirmPassword}
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
                      left={<TextInput.Icon icon="lock-check" iconColor={Colors.textMuted} />}
                      right={
                        <TextInput.Icon 
                          icon={showConfirmPassword ? "eye-off" : "eye"} 
                          iconColor={Colors.textMuted}
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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

                  <Button
                    mode="contained"
                    onPress={handleRegister}
                    loading={loading}
                    disabled={loading}
                    style={styles.registerButton}
                    buttonColor={Colors.secondary}
                    textColor={Colors.background}
                    icon="account-plus"
                    labelStyle={styles.buttonText}
                  >
                    {loading ? 'Creating Account...' : 'Create Demo Account'}
                  </Button>
                </View>
              </LinearGradient>
            </Card>

            {/* Benefits Card */}
            <Card style={styles.benefitsCard}>
              <Card.Content style={styles.benefitsContent}>
                <Text style={styles.benefitsTitle}>What you get:</Text>
                
                <View style={styles.benefitsList}>
                  <View style={styles.benefitItem}>
                    <MaterialIcons name="account-balance-wallet" size={20} color={Colors.bullish} />
                    <Text style={styles.benefitText}>$10,000 virtual trading balance</Text>
                  </View>
                  
                  <View style={styles.benefitItem}>
                    <MaterialIcons name="trending-up" size={20} color={Colors.primary} />
                    <Text style={styles.benefitText}>Real-time market data from TradingView</Text>
                  </View>
                  
                  <View style={styles.benefitItem}>
                    <MaterialIcons name="psychology" size={20} color={Colors.secondary} />
                    <Text style={styles.benefitText}>AI-powered trading automation</Text>
                  </View>
                  
                  <View style={styles.benefitItem}>
                    <MaterialIcons name="bar-chart" size={20} color={Colors.accent} />
                    <Text style={styles.benefitText}>Professional trading tools & charts</Text>
                  </View>
                  
                  <View style={styles.benefitItem}>
                    <MaterialIcons name="school" size={20} color={Colors.textSecondary} />
                    <Text style={styles.benefitText}>Educational trading environment</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text 
                  style={styles.footerLink}
                  onPress={() => router.push('/(auth)/signin')}
                >
                  Sign in here
                </Text>
              </Text>
              
              <Text style={styles.disclaimerText}>
                By creating an account, you agree to use this demo platform for educational purposes only.
                No real money transactions will be processed.
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
  registerButton: {
    borderRadius: 12,
    paddingVertical: 6,
  },
  buttonText: {
    ...Typography.button,
    fontSize: 16,
  },
  benefitsCard: {
    backgroundColor: Colors.surface,
    marginBottom: 24,
  },
  benefitsContent: {
    paddingVertical: 16,
  },
  benefitsTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    ...Typography.body2,
    color: Colors.textPrimary,
    flex: 1,
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