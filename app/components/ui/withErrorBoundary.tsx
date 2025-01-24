// app/components/ui/withErrorBoundary.tsx

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface WithErrorBoundaryOptions {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

const withErrorBoundary = <P extends object>(
  wrappedComponent: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): React.FC<P> => {
  const { fallback, onError } = options;

  return (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {React.createElement(wrappedComponent, props)}
    </ErrorBoundary>
  );
};

export default withErrorBoundary;
