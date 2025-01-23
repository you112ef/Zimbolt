// app/components/ui/ErrorBoundary.tsx

import React, { Component, ReactNode } from 'react';
import type { ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state to display fallback UI on the next render
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the console
    console.error('Uncaught error:', error, errorInfo);

    // Invoke the optional onError handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Optionally, send error details to a monitoring service like Sentry
    // Example:
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  render() {
    if (this.state.hasError) {
      // Render the custom fallback UI if provided, else default fallback
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <div className="error-boundary flex flex-col items-center justify-center min-h-screen bg-red-100 p-8">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Something Went Wrong</h1>
          <p className="text-lg text-red-500 mb-6">
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
