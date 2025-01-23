// app/components/settings/connections/ConnectionsTab.tsx

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { logStore } from '~/lib/stores/logs';
import withErrorBoundary from '~/components/ui/withErrorBoundary'; // Import the HOC

interface GitHubUserResponse {
  login: string;
  id: number;
  [key: string]: any; // for other properties we don't explicitly need
}

interface ConnectionsTabProps {
  // Define any additional props if necessary
}

const ConnectionsTabComponent: React.FC<ConnectionsTabProps> = () => {
  const [githubUsername, setGithubUsername] = useState(Cookies.get('githubUsername') || '');
  const [githubToken, setGithubToken] = useState(Cookies.get('githubToken') || '');
  const [isConnected, setIsConnected] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Check if credentials exist and verify them
    if (githubUsername && githubToken) {
      verifyGitHubCredentials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyGitHubCredentials = async () => {
    setIsVerifying(true);

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      });

      if (response.ok) {
        const data = (await response.json()) as GitHubUserResponse;

        if (data.login === githubUsername) {
          setIsConnected(true);
          return true;
        }
      }

      setIsConnected(false);

      return false;
    } catch (error) {
      console.error('Error verifying GitHub credentials:', error);
      setIsConnected(false);

      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!githubUsername || !githubToken) {
      toast.error('Please provide both GitHub username and token');
      return;
    }

    setIsVerifying(true);

    const isValid = await verifyGitHubCredentials();

    if (isValid) {
      Cookies.set('githubUsername', githubUsername);
      Cookies.set('githubToken', githubToken);
      logStore.logSystem('GitHub connection settings updated', {
        username: githubUsername,
        hasToken: !!githubToken,
      });
      toast.success('GitHub credentials verified and saved successfully!');
      Cookies.set('git:github.com', JSON.stringify({ username: githubToken, password: 'x-oauth-basic' }));
      setIsConnected(true);
    } else {
      toast.error('Invalid GitHub credentials. Please check your username and token.');
    }
  };

  const handleDisconnect = () => {
    Cookies.remove('githubUsername');
    Cookies.remove('githubToken');
    Cookies.remove('git:github.com');
    setGithubUsername('');
    setGithubToken('');
    setIsConnected(false);
    logStore.logSystem('GitHub connection removed');
    toast.success('GitHub connection removed successfully!');
  };

  return (
    <div className="p-4 mb-4 border border-bolt-elements-borderColor rounded-lg bg-bolt-elements-background-depth-3">
      <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-4">GitHub Connection</h3>
      <div className="flex mb-4">
        <div className="flex-1 mr-2">
          <label className="block text-sm text-bolt-elements-textSecondary mb-1">GitHub Username:</label>
          <input
            type="text"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            disabled={isVerifying}
            className="w-full bg-white dark:bg-bolt-elements-background-depth-4 relative px-2 py-1.5 rounded-md focus:outline-none placeholder-bolt-elements-textTertiary text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary border border-bolt-elements-borderColor disabled:opacity-50"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-bolt-elements-textSecondary mb-1">Personal Access Token:</label>
          <input
            type="password"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            disabled={isVerifying}
            className="w-full bg-white dark:bg-bolt-elements-background-depth-4 relative px-2 py-1.5 rounded-md focus:outline-none placeholder-bolt-elements-textTertiary text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary border border-bolt-elements-borderColor disabled:opacity-50"
          />
        </div>
      </div>
      <div className="flex mb-4 items-center">
        {!isConnected ? (
          <button
            onClick={handleSaveConnection}
            disabled={isVerifying || !githubUsername || !githubToken}
            className="bg-bolt-elements-button-primary-background rounded-lg px-4 py-2 mr-2 transition-colors duration-200 hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isVerifying ? (
              <>
                <div className="i-ph:spinner animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Connect'
            )}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="bg-bolt-elements-button-danger-background rounded-lg px-4 py-2 mr-2 transition-colors duration-200 hover:bg-bolt-elements-button-danger-backgroundHover text-bolt-elements-button-danger-text"
          >
            Disconnect
          </button>
        )}
        {isConnected && (
          <span className="text-sm text-green-600 flex items-center">
            <div className="i-ph:check-circle mr-1" />
            Connected to GitHub
          </span>
        )}
      </div>
    </div>
  );
}

// Step 3: Create a fallback UI specific to this component
const connectionsTabFallback = (
  <div className="error-fallback p-4 bg-red-100 text-red-700 rounded flex flex-col items-center justify-center min-h-screen">
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

// Step 4: Define an error handler (optional)
const handleConnectionsTabError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in ConnectionsTab:', error, errorInfo);
  // Optionally, send error details to a monitoring service like Sentry
  // Sentry.captureException(error, { extra: errorInfo });
};

// Step 5: Wrap the component with the HOC
const ConnectionsTab = withErrorBoundary(ConnectionsTabComponent, {
  fallback: connectionsTabFallback,
  onError: handleConnectionsTabError,
});

// Step 6: Export the wrapped component
export default ConnectionsTab;
