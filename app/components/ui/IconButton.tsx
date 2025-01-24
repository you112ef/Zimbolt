// app/components/ui/IconButton.tsx

import React, { memo, forwardRef, type ForwardedRef } from 'react';
import { classNames } from '~/utils/classNames';
import withErrorBoundary from '~/components/ui/withErrorBoundary'; // Ensure this path is correct

type IconSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface BaseIconButtonProps {
  size?: IconSize;
  className?: string;
  iconClassName?: string;
  disabledClassName?: string;
  title?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

type IconButtonWithoutChildrenProps = {
  icon: React.ReactNode;
  children?: undefined;
} & BaseIconButtonProps;

type IconButtonWithChildrenProps = {
  icon?: undefined;
  children: React.ReactNode;
} & BaseIconButtonProps;

type IconButtonProps = IconButtonWithoutChildrenProps | IconButtonWithChildrenProps;

/**
 * Original IconButton component renamed to IconButtonComponent
 */
const IconButtonComponent = memo(
  forwardRef<HTMLButtonElement, IconButtonProps>(
    (
      { icon, size = 'xl', className, iconClassName, disabledClassName, disabled = false, title, onClick, children },
      ref: ForwardedRef<HTMLButtonElement>
    ) => {
      return (
        <button
          ref={ref}
          className={classNames(
            'flex items-center justify-center bg-transparent enabled:hover:text-bolt-elements-item-contentActive rounded-md p-1 enabled:hover:bg-bolt-elements-item-backgroundActive disabled:cursor-not-allowed',
            disabled ? 'opacity-30' : undefined,
            disabled && disabledClassName ? disabledClassName : undefined,
            className
          )}
          title={title}
          disabled={disabled}
          onClick={(event) => {
            if (disabled) {
              return;
            }

            onClick?.(event);
          }}
        >
          {children ? children : <span className={classNames(getIconSize(size), iconClassName)}>{icon}</span>}
        </button>
      );
    }
  )
);

/**
 * Helper function to determine icon size classes
 */
function getIconSize(size: IconSize) {
  switch (size) {
    case 'sm':
      return 'text-sm';
    case 'md':
      return 'text-md';
    case 'lg':
      return 'text-lg';
    case 'xl':
      return 'text-xl';
    case 'xxl':
      return 'text-2xl';
    default:
      return 'text-xl';
  }
}

/**
 * Fallback UI specific to IconButton
 */
const iconButtonFallback = (
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

/**
 * Optional error handler for IconButton
 */
const handleIconButtonError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in IconButton:', error, errorInfo);

  /*
   * Optionally, send error details to a monitoring service like Sentry
   * Sentry.captureException(error, { extra: errorInfo });
   */
};

/**
 * Wrapped IconButton component with Error Boundary
 */
const IconButton = withErrorBoundary(IconButtonComponent, {
  fallback: iconButtonFallback,
  onError: handleIconButtonError,
});

export { IconButton };
