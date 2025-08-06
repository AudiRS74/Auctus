import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingScreen } from './LoadingScreen';

interface SafeComponentWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  loadingMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  onRetry?: () => void;
  fallbackComponent?: React.ReactNode;
}

export function SafeComponentWrapper({
  children,
  loading = false,
  error = null,
  loadingMessage = 'Loading...',
  errorTitle,
  errorMessage,
  onRetry,
  fallbackComponent,
}: SafeComponentWrapperProps) {
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
    onRetry?.();
  };

  if (loading) {
    return <LoadingScreen message={loadingMessage} />;
  }

  if (error) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    return (
      <ErrorBoundary
        key={resetKey}
        fallbackTitle={errorTitle || 'Loading Error'}
        fallbackMessage={errorMessage || error}
        onReset={handleReset}
      >
        {children}
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      key={resetKey}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
}