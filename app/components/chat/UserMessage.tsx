// app/components/chat/UserMessage.tsx

/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import React from 'react';
import { MODEL_REGEX, PROVIDER_REGEX } from '~/utils/constants';
import { Markdown } from './Markdown';
import withErrorBoundary from '~/components/ui/withErrorBoundary'; // Import the HOC

interface UserMessageProps {
  content: string | Array<{ type: string; text?: string; image?: string }>;
}

// Step 2: Define the original component separately
function UserMessageComponent({ content }: UserMessageProps) {
  if (Array.isArray(content)) {
    const textItem = content.find((item) => item.type === 'text');
    const textContent = stripMetadata(textItem?.text || '');
    const images = content.filter((item) => item.type === 'image' && item.image);

    return (
      <div className="overflow-hidden pt-[4px]">
        <div className="flex flex-col gap-4">
          {textContent && <Markdown html>{textContent}</Markdown>}
          {images.map((item, index) => (
            <img
              key={index}
              src={item.image}
              alt={`Image ${index + 1}`}
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: '512px', objectFit: 'contain' }}
            />
          ))}
        </div>
      </div>
    );
  }

  const textContent = stripMetadata(content);

  return (
    <div className="overflow-hidden pt-[4px]">
      <Markdown html>{textContent}</Markdown>
    </div>
  );
}

function stripMetadata(content: string) {
  return content.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '');
}

// Step 3: Create a fallback UI specific to this component
const userMessageFallback = (
  <div className="error-fallback p-4 bg-red-100 text-red-700 rounded">
    <p>Failed to display user message.</p>
  </div>
);

// Step 4: Define an error handler (optional)
const handleUserMessageError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in UserMessage:', error, errorInfo);

  /*
   * Optionally, report to an external service like Sentry
   * Sentry.captureException(error, { extra: errorInfo });
   */
};

// Step 5: Wrap the component with the HOC
const UserMessage = withErrorBoundary(UserMessageComponent, {
  fallback: userMessageFallback,
  onError: handleUserMessageError,
});

// Step 6: Export the wrapped component
export default UserMessage;
