// app/components/chat/UserMessage.tsx
import React from 'react';
import { MODEL_REGEX, PROVIDER_REGEX } from '~/utils/constants';
import { Markdown } from './Markdown';
import withErrorBoundary from '~/components/ui/withErrorBoundary';

interface UserMessageProps {
  content: string | Array<{ type: string; text?: string; image?: string }>;
}

function UserMessageComponent({ content }: UserMessageProps) {
  const stripMetadata = (content: string) => {
    return content.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '');
  };

  if (Array.isArray(content)) {
    const textItem = content.find((item) => item.type === 'text');
    const textContent = textItem?.text ? stripMetadata(textItem.text) : '';
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

const userMessageFallback = (
  <div className="error-fallback p-4 bg-red-100 text-red-700 rounded">
    <p>Failed to display user message.</p>
  </div>
);

const handleUserMessageError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in UserMessage:', error, errorInfo);
  // Sentry integration would go here
};

// Wrap with error boundary and export as named export
export const UserMessage = withErrorBoundary(UserMessageComponent, {
  fallback: userMessageFallback,
  onError: handleUserMessageError,
});