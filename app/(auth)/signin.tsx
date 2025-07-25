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

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      const message = 'Please enter both email and password';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign in failed';
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
            <Text style={styles.tagline}>Professional Trading Platform</Text>
          </View>

          {/* Sign In Form */}
          <Card style={styles.card}>
            <LinearGradient
              colors={[Colors.surface, Colors.cardElevated]}
              style={styles.cardGradient}
            >
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Welcome Back</Text>
                <Text style={styles.formSubtitle}>Sign in to your trading account</Text>
              </View>
              
              <View style={styles.form}>
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
                />
                
                <Button
                  mode="contained"
                  onPress={handleSignIn}
                  loading={loading}
                  disabled={loading}
                  style={styles.primaryButton}
                  buttonColor={Colors.primary}
                  textColor={Colors.background}
                  labelStyle={styles.buttonLabel}
                >
                  Sign In
                </Button>
                
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
                
                <Button
                  mode="outlined"
                  onPress={handleGoogleSignIn}
                  loading={loading}
                  disabled={loading}
                  style={styles.googleButton}
                  textColor={Colors.textPrimary}
                  labelStyle={styles.buttonLabel}
                  icon="google"
                >
                  Continue with Google
                </Button>
                
                <Button
                  mode="text"
                  onPress={() => router.push('/(auth)/signup')}
                  disabled={loading}
                  style={styles.linkButton}
                  textColor={Colors.primary}
                  labelStyle={styles.linkButtonLabel}
                >
                  Don't have an account? Sign Up
                </Button>
              </View>
            </LinearGradient>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Secure trading platform with advanced analytics
            </Text>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    ...Typography.caption,
    color: Colors.textMuted,
    paddingHorizontal: 16,
  },
  googleButton: {
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 4,
  },
  linkButton: {
    marginTop: 16,
  },
  linkButtonLabel: {
    ...Typography.body2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});