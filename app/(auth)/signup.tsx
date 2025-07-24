import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      Alert.alert(
        'Registration Successful',
        'A verification email has been sent to your email address. Please check your inbox.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Google sign up failed');
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
          <Text style={styles.title}>Create Account</Text>
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
                primary: '#00C896',
                outline: '#475569',
                onSurfaceVariant: '#94A3B8',
              }
            }}
          />

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

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
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
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
            style={styles.signUpButton}
            labelStyle={styles.buttonText}
          >
            Create Account
          </Button>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          <Button
            mode="outlined"
            onPress={handleGoogleSignUp}
            disabled={loading}
            style={styles.googleButton}
            labelStyle={styles.googleButtonText}
            icon="google"
          >
            Continue with Google
          </Button>

          <Button
            mode="text"
            onPress={() => router.push('/(auth)/signin')}
            labelStyle={styles.linkText}
          >
            Already have an account? Sign In
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
  signUpButton: {
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