import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function SignIn() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('demo@trader.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSignIn = async () => {
    if (!email || !password) {
      showAlert('Missing Information', 'Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      showAlert('Sign In Failed', message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Button
            mode="text"
            onPress={() => router.back()}
            textColor={Colors.textSecondary}
            icon="arrow-back"
            labelStyle={styles.backButtonText}
          >
            Back
          </Button>
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <MaterialIcons name="login" size={48} color={Colors.primary} />
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Welcome back to TradingPro</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
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
              onChangeText={setPassword}
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

            <Button
              mode="contained"
              onPress={handleSignIn}
              loading={loading}
              disabled={loading}
              style={styles.signInButton}
              buttonColor={Colors.primary}
              textColor={Colors.background}
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
              Don't have an account? Sign Up
            </Button>

            <Button
              mode="outlined"
              onPress={() => router.replace('/(tabs)')}
              style={styles.demoButton}
              textColor={Colors.secondary}
              icon="play-arrow"
              labelStyle={styles.buttonText}
            >
              Continue as Demo User
            </Button>
          </View>
        </View>

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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButtonText: {
    ...Typography.body2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: Colors.inputBackground,
  },
  signInButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginTop: 16,
  },
  demoButton: {
    borderRadius: 12,
    borderColor: Colors.secondary,
    paddingVertical: 4,
    marginTop: 8,
  },
  buttonText: {
    ...Typography.button,
    fontSize: 16,
  },
  linkText: {
    ...Typography.body2,
    textAlign: 'center',
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