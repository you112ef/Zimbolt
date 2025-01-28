// app/components/ui/Tooltip.tsx

import React, { type ReactNode, type CSSProperties, type ErrorInfo } from 'react';
import {
  Root as RadixTooltipRoot,
  Trigger as RadixTooltipTrigger,
  Portal as RadixTooltipPortal,
  Content as RadixTooltipContent,
  Arrow as RadixTooltipArrow,
} from '@radix-ui/react-tooltip';
import withErrorBoundary from '~/components/ui/withErrorBoundary';

interface TooltipProps {
  tooltip: ReactNode;
  children: ReactNode;
  sideOffset?: number;
  className?: string;
  arrowClassName?: string;
  tooltipStyle?: CSSProperties;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
  delay?: number;
}

function WithTooltipComponent({
  tooltip,
  children,
  sideOffset = 5,
  className = '',
  arrowClassName = '',
  tooltipStyle = {},
  position = 'top',
  maxWidth = 250,
  delay = 0,
}: TooltipProps) {
  return (
    <RadixTooltipRoot delayDuration={delay}>
      <RadixTooltipTrigger asChild>
        {children}
      </RadixTooltipTrigger>
      <RadixTooltipPortal>
        <RadixTooltipContent
          side={position}
          sideOffset={sideOffset}
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
          style={{
            maxWidth,
            ...tooltipStyle,
          }}
        >
          <div className="break-words">{tooltip}</div>
          <RadixTooltipArrow
            className={`fill-bolt-elements-background-depth-3 ${arrowClassName}`}
            width={12}
            height={6}
          />
        </RadixTooltipContent>
      </RadixTooltipPortal>
    </RadixTooltipRoot>
  );
}

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

function handleTooltipError(error: Error, errorInfo: ErrorInfo) {
  console.error('Error in Tooltip:', error, errorInfo);
  // Optional error reporting logic here
}

const WithTooltip = withErrorBoundary(WithTooltipComponent, {
  fallback: tooltipFallback,
  onError: handleTooltipError,
});

export default WithTooltip;
