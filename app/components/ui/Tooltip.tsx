// app/components/ui/Tooltip.tsx

import * as Tooltip from '@radix-ui/react-tooltip';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';
import withErrorBoundary from '~/components/ui/withErrorBoundary'; // Import the HOC

interface TooltipProps {
  tooltip: React.ReactNode;
  children: ReactElement;
  sideOffset?: number;
  className?: string;
  arrowClassName?: string;
  tooltipStyle?: React.CSSProperties;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
  delay?: number;
}

/**
 * Original WithTooltip component renamed to WithTooltipComponent
 */
const WithTooltipComponent = forwardRef(
  (
    {
      tooltip,
      children,
      sideOffset = 5,
      className = '',
      arrowClassName = '',
      tooltipStyle = {},
      position = 'top',
      maxWidth = 250,
      delay = 0,
    }: TooltipProps,
    _ref: ForwardedRef<HTMLElement>,
  ) => {
    return (
      <Tooltip.Root delayDuration={delay}>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={position}
            className={`
              z-[2000]
              px-2.5
              py-1.5
              max-h-[300px]
              select-none
              rounded-md
              bg-bolt-elements-background-depth-3
              text-bolt-elements-textPrimary
              text-sm
              leading-tight
              shadow-lg
              animate-in
              fade-in-0
              zoom-in-95
              data-[state=closed]:animate-out
              data-[state=closed]:fade-out-0
              data-[state=closed]:zoom-out-95
              ${className}
            `}
            sideOffset={sideOffset}
            style={{
              maxWidth,
              ...tooltipStyle,
            }}
          >
            <div className="break-words">{tooltip}</div>
            <Tooltip.Arrow
              className={`
                fill-bolt-elements-background-depth-3
                ${arrowClassName}
              `}
              width={12}
              height={6}
            />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  },
);

/**
 * Fallback UI specific to Tooltip
 */
const tooltipFallback = (
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

/**
 * Optional error handler for Tooltip
 */
const handleTooltipError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in Tooltip:', error, errorInfo);
  // Optionally, send error details to a monitoring service like Sentry
  // Sentry.captureException(error, { extra: errorInfo });
};

/**
 * Wrapped WithTooltip component with Error Boundary
 */
const WithTooltip = withErrorBoundary(WithTooltipComponent, {
  fallback: tooltipFallback,
  onError: handleTooltipError,
});

export default WithTooltip;
