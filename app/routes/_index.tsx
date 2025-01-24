// app/routes/_index.tsx

import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import BaseChat from '~/components/chat/BaseChat/BaseChat';
import Chat from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import withErrorBoundary from '~/components/ui/withErrorBoundary'; // Import the HOC

export const meta: MetaFunction = () => {
  return [{ title: 'Bolt' }, { name: 'description', content: 'Talk with Bolt, an AI assistant from StackBlitz' }];
};

export const loader = () => json({});

/**
 * Original Index component renamed to IndexComponent
 */
const IndexComponent: React.FC = () => {
  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
};

// Define a fallback UI for the Index route if desired (optional)
const indexFallback = (
  <div className="error-boundary flex flex-col items-center justify-center min-h-screen bg-red-100 p-8">
    <h1 className="text-3xl font-bold text-red-600 mb-4">Something Went Wrong</h1>
    <p className="text-lg text-red-500 mb-6">We're sorry for the inconvenience. Please try refreshing the page.</p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
    >
      Reload Page
    </button>
  </div>
);

// Optional: Define an error handler for the Index route
const handleIndexError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in Index route:', error, errorInfo);

  /*
   * Optionally, send error details to a monitoring service like Sentry
   * Sentry.captureException(error, { extra: errorInfo });
   */
};

// Wrap the Index component with the Error Boundary HOC
const Index = withErrorBoundary(IndexComponent, {
  fallback: indexFallback,
  onError: handleIndexError,
});

export default Index;
