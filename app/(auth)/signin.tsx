import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

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
      setLoading(false);    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (error) {
      const message = 'Google sign in failed. Please try again.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Google Sign In Error', message);
      }
    } finally {
      setGoogleLoading(false);
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
            />            <Button
              mode="contained"
              onPress={handleSignIn}
              loading={loading}
              disabled={loading || googleLoading}
              style={styles.signInButton}
              contentStyle={styles.buttonContent}
            >
              Sign In
            </Button>
            
            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <Divider style={styles.divider} />
            </View>

            <Button
              mode="outlined"
              onPress={handleGoogleSignIn}
              loading={googleLoading}
              disabled={loading || googleLoading}
              style={styles.googleButton}
              contentStyle={styles.buttonContent}
              icon={() => <MaterialIcons name="account-circle" size={20} color="#4285F4" />}
            >
              Continue with Google
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
  },  buttonContent: {
    paddingVertical: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    backgroundColor: '#475569',
  },
  dividerText: {
    color: '#94A3B8',
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    borderColor: '#4285F4',
    borderWidth: 1,
  },
  switchButton: {
    alignSelf: 'center',
  },
});