import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      const message = 'Please fill in all fields';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Validation Error', message);
      }
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      const message = 'Sign in failed. Please try again.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Sign In Error', message);
      }
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
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <View style={styles.form}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />
            <Button
              mode="contained"
              onPress={handleSignIn}
              loading={loading}
              disabled={loading}
              style={styles.signInButton}
              contentStyle={styles.buttonContent}
            >
              Sign In
            </Button>
          </View>

          <Button
            mode="text"
            onPress={() => router.push('/(auth)/signup')}
            style={styles.switchButton}
          >
            {"Don't have an account? Sign up"}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#334155',
  },
  signInButton: {
    backgroundColor: '#00C896',
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  switchButton: {
    alignSelf: 'center',
  },
});