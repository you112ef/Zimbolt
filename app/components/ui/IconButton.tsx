// app/components/ui/IconButton.tsx

import { memo, forwardRef, type ForwardedRef } from 'react';
import { classNames } from '~/utils/classNames';
import withErrorBoundary from '~/components/ui/withErrorBoundary'; // Import the HOC

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
  icon: string;
  children?: undefined;
} & BaseIconButtonProps;

type IconButtonWithChildrenProps = {
  icon?: undefined;
  children: string | JSX.Element | JSX.Element[];
} & BaseIconButtonProps;

type IconButtonProps = IconButtonWithoutChildrenProps | IconButtonWithChildrenProps;

/**
 * Original IconButton component renamed to IconButtonComponent
 */
const IconButtonComponent = memo(
  forwardRef(
    (
      {
        icon,
        size = 'xl',
        className,
        iconClassName,
        disabledClassName,
        disabled = false,
        title,
        onClick,
        children,
      }: IconButtonProps,
      ref: ForwardedRef<HTMLButtonElement>,
    ) => {
      return (
        <button
          ref={ref}
          className={classNames(
            'flex items-center text-bolt-elements-item-contentDefault bg-transparent enabled:hover:text-bolt-elements-item-contentActive rounded-md p-1 enabled:hover:bg-bolt-elements-item-backgroundActive disabled:cursor-not-allowed',
            {
              [classNames('opacity-30', disabledClassName)]: disabled,
            },
            className,
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
          {children ? children : <div className={classNames(icon, getIconSize(size), iconClassName)}></div>}
        </button>
      );
    },
  ),
);

/**
 * Helper function to determine icon size classes
 */
function getIconSize(size: IconSize) {
  if (size === 'sm') {
    return 'text-sm';
  } else if (size === 'md') {
    return 'text-md';
  } else if (size === 'lg') {
    return 'text-lg';
  } else if (size === 'xl') {
    return 'text-xl';
  } else {
    return 'text-2xl';
  }
}

/**
 * Fallback UI specific to IconButton
 */
const iconButtonFallback = (
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
 * Optional error handler for IconButton
 */
const handleIconButtonError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in IconButton:', error, errorInfo);
  // Optionally, send error details to a monitoring service like Sentry
  // Sentry.captureException(error, { extra: errorInfo });
};

/**
 * Wrapped IconButton component with Error Boundary
 */
const IconButton = withErrorBoundary(IconButtonComponent, {
  fallback: iconButtonFallback,
  onError: handleIconButtonError,
});

export { IconButton };
