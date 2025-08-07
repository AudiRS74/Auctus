import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '../constants/Colors';
import { TextStyles } from '../constants/Typography';

export default function NotFound() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.card]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <MaterialIcons name="error-outline" size={120} color={Colors.textMuted} />
          
          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.subtitle}>
            The trading terminal page you're looking for doesn't exist or has been moved.
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => router.replace('/(tabs)')}
              style={styles.homeButton}
              buttonColor={Colors.primary}
              textColor={Colors.background}
              icon="home"
              labelStyle={styles.buttonText}
            >
              Return to Trading Terminal
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.backButton}
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
    paddingHorizontal: 24,
  },
  title: {
    ...TextStyles.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginTop: 32,
    marginBottom: 16,
  },
  subtitle: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  homeButton: {
    borderRadius: 12,
    paddingVertical: 6,
  },
  backButton: {
    borderRadius: 12,
    paddingVertical: 6,
    borderColor: Colors.primary,
  },
  buttonText: {
    ...TextStyles.button,
    fontSize: 16,
  },
});