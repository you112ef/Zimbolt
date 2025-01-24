// app/components/editor/codemirror/BinaryContent.tsx

import React from 'react';
import withErrorBoundary from '~/components/ui/withErrorBoundary'; // Import the HOC

// Step 2: Define the original component separately
function BinaryContentComponent() {
  return (
    <div className="flex items-center justify-center absolute inset-0 z-10 text-sm bg-tk-elements-app-backgroundColor text-tk-elements-app-textColor">
      File format cannot be displayed.
    </div>
  );
}

// Step 3: Create a fallback UI specific to this component
const binaryContentFallback = (
  <div className="error-fallback p-4 bg-red-100 text-red-700 rounded">
    <p>Unable to display binary file content.</p>
  </div>
);

// Step 4: Define an error handler (optional)
const handleBinaryContentError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in BinaryContent:', error, errorInfo);

  /*
   * Optionally, report to an external service like Sentry
   * Sentry.captureException(error, { extra: errorInfo });
   */
};

// Step 5: Wrap the component with the HOC
const BinaryContent = withErrorBoundary(BinaryContentComponent, {
  fallback: binaryContentFallback,
  onError: handleBinaryContentError,
});

// Step 6: Export the wrapped component
export default BinaryContent;
