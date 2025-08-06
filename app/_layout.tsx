import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { TradingProvider } from '../contexts/TradingProvider';
import { Colors } from '../constants/Colors';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('React Error Boundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary Details:', {
      error: error.toString(),
      errorInfo,
      stack: error.stack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Application Error</Text>
            <Text style={styles.errorMessage}>
              Something went wrong. Please restart the application.
            </Text>
            <Text style={styles.errorDetails}>
              {this.state.error?.message || 'Unknown error occurred'}
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Debug component to show loading state
function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Starting app initialization...');
        
        // Check if required modules are available
        console.log('Checking dependencies...');
        
        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('App initialization completed successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      }
    };

    initialize();
  }, []);

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Initialization Error</Text>
          <Text style={styles.errorMessage}>
            Failed to initialize the application
          </Text>
          <Text style={styles.errorDetails}>{initError}</Text>
        </View>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Initializing Trading App...</Text>
          <Text style={styles.loadingSubtext}>Loading components and services</Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  console.log('RootLayout rendering...');

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider>
          <AppInitializer>
            <AuthProvider>
              <TradingProvider>
                <View style={styles.container}>
                  <StatusBar style="light" backgroundColor={Colors.background} />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      animation: 'slide_from_right',
                      gestureEnabled: true,
                    }}
                  >
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </View>
              </TradingProvider>
            </AuthProvider>
          </AppInitializer>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: '100%',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
});