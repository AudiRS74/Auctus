import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { TradingProvider } from '../contexts/TradingProvider';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Colors } from '../constants/Colors';

// App Initializer Component
function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    initialize();
    
    return () => {
      setIsMounted(false);
    };
  }, []);

  const initialize = async () => {
    try {
      console.log('App: Starting initialization...');
      
      // Check if required modules are available
      console.log('App: Checking dependencies...');
      
      // Simulate initialization delay for proper loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isMounted) return;
      
      console.log('App: Initialization completed successfully');
      setIsInitialized(true);
    } catch (error) {
      console.error('App: Initialization failed:', error);
      if (isMounted) {
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      }
    }
  };

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
      <LoadingScreen 
        message="Initializing Trading App..."
        submessage="Loading components and services"
        icon="hourglass-empty"
      />
    );
  }

  return <>{children}</>;
}

// Context Provider Wrapper
function ContextProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallbackTitle="Context Error" fallbackMessage="Failed to initialize app contexts">
      <AuthProvider>
        <ErrorBoundary fallbackTitle="Trading Service Error" fallbackMessage="Failed to initialize trading services">
          <TradingProvider>
            {children}
          </TradingProvider>
        </ErrorBoundary>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  console.log('RootLayout: Rendering...');

  return (
    <ErrorBoundary 
      fallbackTitle="Application Error" 
      fallbackMessage="A critical error occurred. Please restart the application."
    >
      <SafeAreaProvider>
        <PaperProvider>
          <AppInitializer>
            <ContextProviders>
              <View style={styles.container}>
                <StatusBar style="light" backgroundColor={Colors.background} />
                <ErrorBoundary fallbackTitle="Navigation Error" fallbackMessage="Navigation system encountered an error">
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
                </ErrorBoundary>
              </View>
            </ContextProviders>
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