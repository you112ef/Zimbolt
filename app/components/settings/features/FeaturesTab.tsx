// app/components/settings/features/FeaturesTab.tsx

import React from 'react';
import { Switch } from '~/components/ui/Switch';
import { PromptLibrary } from '~/lib/common/prompt-library';
import { useSettings } from '~/lib/hooks/useSettings';
import withErrorBoundary from '~/components/ui/withErrorBoundary'; // Import the HOC

interface FeaturesTabProps {
  // Define any additional props if necessary
}

const FeaturesTabComponent: React.FC<FeaturesTabProps> = () => {
  const {
    debug,
    enableDebugMode,
    isLocalModel,
    enableLocalModels,
    enableEventLogs,
    isLatestBranch,
    enableLatestBranch,
    promptId,
    setPromptId,
    autoSelectTemplate,
    setAutoSelectTemplate,
    enableContextOptimization,
    contextOptimizationEnabled,
  } = useSettings();

  const handleToggle = (enabled: boolean) => {
    enableDebugMode(enabled);
    enableEventLogs(enabled);
  };

  return (
    <div className="p-4 bg-bolt-elements-bg-depth-2 border border-bolt-elements-borderColor rounded-lg mb-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">Optional Features</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-bolt-elements-textPrimary">Debug Features</span>
            <Switch className="ml-auto" checked={debug} onCheckedChange={handleToggle} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-bolt-elements-textPrimary">Use Main Branch</span>
              <p className="text-xs text-bolt-elements-textTertiary">
                Check for updates against the main branch instead of stable
              </p>
            </div>
            <Switch className="ml-auto" checked={isLatestBranch} onCheckedChange={enableLatestBranch} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-bolt-elements-textPrimary">Auto Select Code Template</span>
              <p className="text-xs text-bolt-elements-textTertiary mb-4">
                Let Bolt select the best starter template for your project.
              </p>
            </div>
            <Switch className="ml-auto" checked={autoSelectTemplate} onCheckedChange={setAutoSelectTemplate} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-bolt-elements-textPrimary">Use Context Optimization</span>
              <p className="text-sm text-bolt-elements-textSecondary">
                redact file contents form chat and puts the latest file contents on the system prompt
              </p>
            </div>
            <Switch
              className="ml-auto"
              checked={contextOptimizationEnabled}
              onCheckedChange={enableContextOptimization}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 border-t border-bolt-elements-borderColor pt-4">
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">Experimental Features</h3>
        <p className="text-sm text-bolt-elements-textSecondary mb-10">
          Disclaimer: Experimental features may be unstable and are subject to change.
        </p>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-bolt-elements-textPrimary">Experimental Providers</span>
            <Switch className="ml-auto" checked={isLocalModel} onCheckedChange={enableLocalModels} />
          </div>
          <p className="text-xs text-bolt-elements-textTertiary mb-4">
            Enable experimental providers such as Ollama, LMStudio, and OpenAILike.
          </p>
        </div>
        <div className="flex items-start justify-between pt-4 mb-2 gap-2">
          <div className="flex-1 max-w-[200px]">
            <span className="text-bolt-elements-textPrimary">Prompt Library</span>
            <p className="text-xs text-bolt-elements-textTertiary mb-4">
              Choose a prompt from the library to use as the system prompt.
            </p>
          </div>
          <select
            value={promptId}
            onChange={(e) => setPromptId(e.target.value)}
            className="flex-1 p-2 ml-auto rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus transition-all text-sm min-w-[100px]"
          >
            {PromptLibrary.getList().map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// Step 3: Create a fallback UI specific to this component
const featuresTabFallback = (
  <div className="error-fallback p-4 bg-red-100 text-red-700 rounded flex flex-col items-center justify-center min-h-screen">
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

// Step 4: Define an error handler (optional)
const handleFeaturesTabError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in FeaturesTab:', error, errorInfo);

  /*
   * Optionally, send error details to a monitoring service like Sentry
   * Sentry.captureException(error, { extra: errorInfo });
   */
};

// Step 5: Wrap the component with the HOC
const FeaturesTab = withErrorBoundary(FeaturesTabComponent, {
  fallback: featuresTabFallback,
  onError: handleFeaturesTabError,
});

// Step 6: Export the wrapped component
export default FeaturesTab;
