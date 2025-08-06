import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  icon?: string;
}

export function LoadingScreen({ 
  message = 'Loading...', 
  submessage,
  icon = 'hourglass-empty'
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons 
          name={icon as any} 
          size={64} 
          color={Colors.primary} 
          style={styles.icon} 
        />
        <ActivityIndicator 
          size="large" 
          color={Colors.primary} 
          style={styles.spinner}
        />
        <Text style={styles.message}>{message}</Text>
        {submessage && (
          <Text style={styles.submessage}>{submessage}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 24,
  },
  message: {
    ...Typography.h6,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  submessage: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});