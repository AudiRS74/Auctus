import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary: Caught error:', error);
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary Details:', {
      error: error.toString(),
      errorInfo,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <MaterialIcons name="error-outline" size={64} color={Colors.error} />
            <Text style={styles.title}>
              {this.props.fallbackTitle || 'Something went wrong'}
            </Text>
            <Text style={styles.message}>
              {this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'}
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.debugText}>
                  {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text style={styles.debugStack}>
                    {this.state.error.stack.substring(0, 500)}...
                  </Text>
                )}
              </View>
            )}
            
            <Button
              mode="contained"
              onPress={this.handleReset}
              style={styles.resetButton}
              buttonColor={Colors.primary}
              textColor={Colors.background}
              icon="refresh"
            >
              Try Again
            </Button>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: '100%',
  },
  title: {
    ...Typography.h5,
    color: Colors.error,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  message: {
    ...Typography.body1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  debugInfo: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    maxWidth: '100%',
    width: '100%',
  },
  debugTitle: {
    ...Typography.body2,
    color: Colors.error,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    marginBottom: 8,
  },
  debugStack: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 10,
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 4,
    borderRadius: 8,
  },
});