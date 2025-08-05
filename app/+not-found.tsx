import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Gradients } from '../constants/Colors';
import { Typography } from '../constants/Typography';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <MaterialIcons name="error-outline" size={120} color={Colors.textMuted} />
          
          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.subtitle}>
            The page you're looking for does not exist or has been moved.
          </Text>
          
          <View style={styles.buttons}>
            <Button
              mode="contained"
              onPress={() => router.replace('/(tabs)')}
              style={styles.primaryButton}
              buttonColor={Colors.primary}
              textColor={Colors.background}
              icon="home"
              labelStyle={styles.buttonText}
            >
              Go to Dashboard
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.secondaryButton}
              textColor={Colors.primary}
              icon="arrow-back"
              labelStyle={styles.buttonText}
            >
              Go Back
            </Button>
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginTop: 32,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    maxWidth: 300,
  },
  buttons: {
    gap: 16,
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  secondaryButton: {
    borderRadius: 12,
    borderColor: Colors.primary,
    paddingVertical: 4,
  },
  buttonText: {
    ...Typography.button,
    fontSize: 16,
  },
});