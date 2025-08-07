import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error details for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
    };

    console.error('Error boundary details:', errorDetails);
  }

  handleRetry = () => {
    console.log('ErrorBoundary: Attempting retry...');
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleReload = () => {
    console.log('ErrorBoundary: Reloading app...');
    
    // In development, you might want to reload the app
    // In production, this would typically restart the app or navigate to home
    if (__DEV__) {
      // For development, just retry
      this.handleRetry();
    } else {
      // In production, you might implement app restart logic
      this.handleRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      const {
        fallbackTitle = 'Something went wrong',
        fallbackMessage = 'An unexpected error occurred. Please try again.',
      } = this.props;

      const { error, errorInfo, retryCount } = this.state;

      return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="error-outline"
                size={80}
                color={Colors.error}
              />
            </View>

            <Text style={styles.title}>{fallbackTitle}</Text>
            <Text style={styles.message}>{fallbackMessage}</Text>

            {retryCount > 0 && (
              <View style={styles.retryInfo}>
                <Text style={styles.retryText}>
                  Retry attempt: {retryCount}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={this.handleRetry}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="refresh"
                  size={20}
                  color={Colors.textPrimary}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={this.handleReload}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="restart-alt"
                  size={20}
                  color={Colors.primary}
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Reload App
                </Text>
              </TouchableOpacity>
            </View>

            {__DEV__ && error && (
              <View style={styles.debugContainer}>
                <TouchableOpacity
                  style={styles.debugToggle}
                  onPress={() => {
                    // Toggle debug info visibility
                  }}
                >
                  <Text style={styles.debugToggleText}>
                    Debug Information
                  </Text>
                  <MaterialIcons
                    name="expand-more"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>

                <View style={styles.debugContent}>
                  <Text style={styles.debugTitle}>Error:</Text>
                  <Text style={styles.debugText}>{error.message}</Text>

                  {error.stack && (
                    <>
                      <Text style={styles.debugTitle}>Stack Trace:</Text>
                      <Text style={styles.debugText}>{error.stack}</Text>
                    </>
                  )}

                  {errorInfo?.componentStack && (
                    <>
                      <Text style={styles.debugTitle}>Component Stack:</Text>
                      <Text style={styles.debugText}>
                        {errorInfo.componentStack}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 50,
    backgroundColor: Colors.error + '20',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  retryInfo: {
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  retryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
  debugContainer: {
    marginTop: 40,
    width: '100%',
    maxWidth: 400,
  },
  debugToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  debugToggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginRight: 8,
  },
  debugContent: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  debugTitle: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    lineHeight: 16,
  },
});

export default ErrorBoundary;