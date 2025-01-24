// app/entry.client.tsx

import { RemixBrowser } from '@remix-run/react';
import { startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import withErrorBoundary from './components/ui/withErrorBoundary';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Define a fallback UI for hydration errors if desired (optional)
const hydrationFallback = (
  <div className="error-boundary flex flex-col items-center justify-center min-h-screen bg-red-100 p-8">
    <h1 className="text-3xl font-bold text-red-600 mb-4">Hydration Error</h1>
    <p className="text-lg text-red-500 mb-6">
      There was a problem loading the application. Please try refreshing the page.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
    >
      Reload Page
    </button>
  </div>
);

// Optional: Define an error handler for hydration errors
const handleHydrationError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Hydration error:', error, errorInfo);

  /*
   * Optionally, send error details to a monitoring service like Sentry
   * Sentry.captureException(error, { extra: errorInfo });
   */
};

// Wrap the RemixBrowser with the Error Boundary HOC
const HydratedApp = withErrorBoundary(RemixBrowser, {
  fallback: hydrationFallback,
  onError: handleHydrationError,
});

startTransition(() => {
  hydrateRoot(document.getElementById('root')!, <HydratedApp />);
});
