// app/components/editor/codemirror/BinaryContent.tsx

import React from 'react';
import withErrorBoundary from '~/components/ui/withErrorBoundary';

// Component implementation
function BinaryContentComponent() {
  return (
    <div className="flex items-center justify-center absolute inset-0 z-10 text-sm bg-tk-elements-app-backgroundColor text-tk-elements-app-textColor">
      File format cannot be displayed.
    </div>
  );
}

// Fallback UI
const binaryContentFallback = (
  <div className="error-fallback p-4 bg-red-100 text-red-700 rounded">
    <p>Unable to display binary file content.</p>
  </div>
);

// Error handler
const handleBinaryContentError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in BinaryContent:', error, errorInfo);
  // Add error reporting logic here if needed
};

// Create wrapped component
export const BinaryContent = withErrorBoundary(BinaryContentComponent, {
  fallback: binaryContentFallback,
  onError: handleBinaryContentError,
});