import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      const message = 'Please fill in all fields';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    if (password.length < 6) {
      const message = 'Password must be at least 6 characters long';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.background, Colors.surface]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="trending-up" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>Auctus</Text>
            <Text style={styles.tagline}>Join the Professional Trading Platform</Text>
          </View>

          {/* Sign Up Form */}
          <Card style={styles.card}>
            <LinearGradient
              colors={[Colors.surface, Colors.cardElevated]}
              style={styles.cardGradient}
            >
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Create Account</Text>
                <Text style={styles.formSubtitle}>Start your trading journey today</Text>
              </View>
              
              <View style={styles.form}>
                <TextInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
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
                  secureTextEntry
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
                  right={<TextInput.Icon icon="eye" iconColor={Colors.textMuted} />}
                />
                
                <View style={styles.passwordHint}>
                  <MaterialIcons name="info" size={16} color={Colors.textMuted} />
                  <Text style={styles.passwordHintText}>
                    Minimum 6 characters required
                  </Text>
                </View>
                
                <Button
                  mode="contained"
                  onPress={handleSignUp}
                  loading={loading}
                  disabled={loading}
                  style={styles.primaryButton}
                  buttonColor={Colors.primary}
                  textColor={Colors.background}
                  labelStyle={styles.buttonLabel}
                >
                  Create Account
                </Button>
                
                <View style={styles.terms}>
                  <Text style={styles.termsText}>
                    By creating an account, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </View>
                
                <Button
                  mode="text"
                  onPress={() => router.push('/(auth)/signin')}
                  disabled={loading}
                  style={styles.linkButton}
                  textColor={Colors.primary}
                  labelStyle={styles.linkButtonLabel}
                >
                  Already have an account? Sign In
                </Button>
              </View>
            </LinearGradient>
          </Card>

          {/* Features */}
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Why choose Auctus?</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <MaterialIcons name="security" size={16} color={Colors.bullish} />
                <Text style={styles.featureText}>Bank-level security</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="analytics" size={16} color={Colors.primary} />
                <Text style={styles.featureText}>Advanced analytics</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="support" size={16} color={Colors.accent} />
                <Text style={styles.featureText}>24/7 support</Text>
              </View>
            </View>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  appName: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  tagline: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    elevation: 12,
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 32,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  formTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formSubtitle: {
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
  passwordHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 8,
  },
  passwordHintText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginTop: 8,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonLabel: {
    ...Typography.button,
    fontSize: 16,
  },
  terms: {
    marginTop: 8,
  },
  termsText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  linkButton: {
    marginTop: 16,
  },
  linkButtonLabel: {
    ...Typography.body2,
  },
  features: {
    alignItems: 'center',
    marginTop: 32,
  },
  featuresTitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  featuresList: {
    flexDirection: 'row',
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});