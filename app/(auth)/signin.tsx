import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Sign in failed');
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
      Alert.alert('Error', error instanceof Error ? error.message : 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor="#CBD5E1"
            onPress={() => router.back()}
          />
          <Text style={styles.title}>Welcome Back</Text>
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
                primary: '#00C896',
                outline: '#475569',
                onSurfaceVariant: '#94A3B8',
              }
            }}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            theme={{
              colors: {
                primary: '#00C896',
                outline: '#475569',
                onSurfaceVariant: '#94A3B8',
              }
            }}
          />

          <Button
            mode="contained"
            onPress={handleSignIn}
            loading={loading}
            disabled={loading}
            style={styles.signInButton}
            labelStyle={styles.buttonText}
          >
            Sign In
          </Button>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          <Button
            mode="outlined"
            onPress={handleGoogleSignIn}
            disabled={loading}
            style={styles.googleButton}
            labelStyle={styles.googleButtonText}
            icon="google"
          >
            Continue with Google
          </Button>

          <Button
            mode="text"
            onPress={() => router.push('/(auth)/signup')}
            labelStyle={styles.linkText}
          >
            Don't have an account? Sign Up
          </Button>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginLeft: 8,
  },
  form: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
  },
  signInButton: {
    backgroundColor: '#00C896',
    paddingVertical: 8,
    marginTop: 24,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#475569',
  },
  dividerText: {
    color: '#94A3B8',
    paddingHorizontal: 16,
  },
  googleButton: {
    borderColor: '#475569',
    paddingVertical: 8,
  },
  googleButtonText: {
    color: '#CBD5E1',
    fontSize: 16,
  },
  linkText: {
    color: '#00C896',
    fontSize: 16,
    marginTop: 16,
  },
});