import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

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
        window.alert(message);
      } else {
        Alert.alert('Validation Error', message);
      }
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace('/(tabs)');
    } catch (error) {
      const message = 'Sign up failed. Please try again.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Sign Up Error', message);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Auctus Trading Platform</Text>

          <View style={styles.form}>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />
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
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
              style={styles.signUpButton}
              contentStyle={styles.buttonContent}
            >
              Create Account
            </Button>
          </View>

          <Button
            mode="text"
            onPress={() => router.push('/(auth)/signin')}
            style={styles.switchButton}
          >
            Already have an account? Sign in
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
  signUpButton: {
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