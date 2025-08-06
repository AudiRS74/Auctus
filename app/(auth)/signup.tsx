import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Card, Checkbox } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function SignUp() {
  const { register, loginWithGoogle, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields', [{ text: 'OK' }]);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match', [{ text: 'OK' }]);
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the Terms & Conditions', [{ text: 'OK' }]);
      return;
    }

    try {
      await register(email, password, name);
      // Navigation is handled automatically by the auth routing logic
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An error occurred during registration',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await loginWithGoogle();
      // Navigation is handled automatically by the auth routing logic
    } catch (error) {
      Alert.alert(
        'Google Sign Up Failed',
        error instanceof Error ? error.message : 'An error occurred during Google sign up',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient colors={Gradients.primary} style={styles.background}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Button
              mode="text"
              onPress={() => router.back()}
              icon="arrow-left"
              textColor={Colors.textSecondary}
              style={styles.backButton}
            >
              Back
            </Button>
            
            <View style={styles.headerContent}>
              <MaterialIcons name="trending-up" size={48} color={Colors.primary} />
              <Text style={styles.headerTitle}>Create Account</Text>
              <Text style={styles.headerSubtitle}>Join thousands of successful traders</Text>
            </View>
          </View>

          {/* Registration Form */}
          <Card style={styles.formCard}>
            <Card.Content style={styles.formContent}>
              <Text style={styles.formTitle}>Sign Up</Text>
              
              <View style={styles.form}>
                <TextInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  autoCapitalize="words"
                  left={<TextInput.Icon icon="account" />}
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email" />}
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  mode="outlined"
                  secureTextEntry={!showConfirmPassword}
                  left={<TextInput.Icon icon="lock-check" />}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? "eye-off" : "eye"}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                  style={styles.input}
                  disabled={loading}
                />

                <View style={styles.checkboxContainer}>
                  <Checkbox
                    status={acceptTerms ? 'checked' : 'unchecked'}
                    onPress={() => setAcceptTerms(!acceptTerms)}
                    color={Colors.primary}
                  />
                  <Text style={styles.checkboxText}>
                    I accept the{' '}
                    <Text style={styles.linkText}>Terms & Conditions</Text>
                    {' '}and{' '}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  style={styles.signUpButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  loading={loading}
                  disabled={loading}
                  icon="account-plus"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  mode="outlined"
                  onPress={handleGoogleSignUp}
                  style={styles.googleButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.googleButtonLabel}
                  disabled={loading}
                  icon="google"
                >
                  Continue with Google
                </Button>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Already have an account?{' '}
                  <Text 
                    style={styles.footerLink}
                    onPress={() => router.push('/(auth)/signin')}
                  >
                    Sign in
                  </Text>
                </Text>
              </View>

              {/* Demo Info */}
              <View style={styles.demoInfo}>
                <MaterialIcons name="info" size={20} color={Colors.primary} />
                <View style={styles.demoTextContainer}>
                  <Text style={styles.demoTitle}>Demo Trading Account</Text>
                  <Text style={styles.demoDescription}>
                    Your account starts with demo trading. No real money required to get started.
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: Colors.surface + 'F0',
    borderRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  formContent: {
    padding: 24,
  },
  formTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: Colors.background,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    gap: 8,
  },
  checkboxText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    ...Typography.button,
    color: Colors.background,
    fontWeight: '600',
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
    borderColor: Colors.border,
    borderRadius: 12,
  },
  googleButtonLabel: {
    ...Typography.button,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary + '15',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  demoTextContainer: {
    flex: 1,
  },
  demoTitle: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  demoDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});