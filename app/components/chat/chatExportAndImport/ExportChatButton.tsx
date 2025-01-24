// app/components/chat/chatExportAndImport/ExportChatButton.tsx

import React from 'react';
import { DownloadSimple } from 'phosphor-react'; // Import the specific icon from phosphor-react
import WithTooltip from '~/components/ui/Tooltip';
import { IconButton } from '~/components/ui/IconButton';
import withErrorBoundary from '~/components/ui/withErrorBoundary'; // Import the HOC

// Step 2: Define the original component separately
const ExportChatButtonComponent = ({ exportChat }: { exportChat?: () => void }) => {
  return (
    <WithTooltip tooltip="Export Chat">
      <IconButton title="Export Chat" onClick={() => exportChat?.()}>
        <DownloadSimple size={24} /> {/* Use the icon component */}
      </IconButton>
    </WithTooltip>
  );
};

// Step 3: Create a fallback UI specific to this component
const exportChatButtonFallback = (
  <div className="error-fallback p-4 bg-red-100 text-red-700 rounded">
    <p>Export functionality is currently unavailable.</p>
  </div>
);

// Step 4: Define an error handler (optional)
const handleExportChatButtonError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in ExportChatButton:', error, errorInfo);

  /*
   * Optionally, report to an external service like Sentry
   * Sentry.captureException(error, { extra: errorInfo });
   */
};

// Step 5: Wrap the component with the HOC
const ExportChatButton = withErrorBoundary(ExportChatButtonComponent, {
  fallback: exportChatButtonFallback,
  onError: handleExportChatButtonError,
});

// Step 6: Export the wrapped component
export default ExportChatButton;
