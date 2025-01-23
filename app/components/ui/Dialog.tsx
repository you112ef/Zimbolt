// app/components/ui/Dialog.tsx

import * as RadixDialog from '@radix-ui/react-dialog';
import { motion, type Variants } from 'framer-motion';
import React, { memo, type ReactNode } from 'react';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';
import { IconButton } from './IconButton';
import withErrorBoundary from '~/components/ui/withErrorBoundary'; // Import the HOC

export { Close as DialogClose, Root as DialogRoot } from '@radix-ui/react-dialog';

const transition = {
  duration: 0.15,
  ease: cubicEasingFn,
};

export const dialogBackdropVariants = {
  closed: {
    opacity: 0,
    transition,
  },
  open: {
    opacity: 1,
    transition,
  },
} satisfies Variants;

export const dialogVariants = {
  closed: {
    x: '-50%',
    y: '-40%',
    scale: 0.96,
    opacity: 0,
    transition,
  },
  open: {
    x: '-50%',
    y: '-50%',
    scale: 1,
    opacity: 1,
    transition,
  },
} satisfies Variants;

interface DialogButtonProps {
  type: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
  onClick?: (event: React.UIEvent) => void;
}

/**
 * Original DialogButton component renamed to DialogButtonComponent
 */
const DialogButtonComponent = memo(
  ({
    type,
    children,
    onClick,
  }: DialogButtonProps) => {
    return (
      <button
        className={classNames(
          'inline-flex h-[35px] items-center justify-center rounded-lg px-4 text-sm leading-none focus:outline-none',
          {
            'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover':
              type === 'primary',
            'bg-bolt-elements-button-secondary-background text-bolt-elements-button-secondary-text hover:bg-bolt-elements-button-secondary-backgroundHover':
              type === 'secondary',
            'bg-bolt-elements-button-danger-background text-bolt-elements-button-danger-text hover:bg-bolt-elements-button-danger-backgroundHover':
              type === 'danger',
          },
        )}
        onClick={onClick}
      >
        {children}
      </button>
    );
  },
);

/**
 * Original DialogTitle component renamed to DialogTitleComponent
 */
const DialogTitleComponent = memo(({ className, children, ...props }: RadixDialog.DialogTitleProps) => {
  return (
    <RadixDialog.Title
      className={classNames(
        'px-5 py-4 flex items-center justify-between border-b border-bolt-elements-borderColor text-lg font-semibold leading-6 text-bolt-elements-textPrimary',
        className,
      )}
      {...props}
    >
      {children}
    </RadixDialog.Title>
  );
});

/**
 * Original DialogDescription component renamed to DialogDescriptionComponent
 */
const DialogDescriptionComponent = memo(({ className, children, ...props }: RadixDialog.DialogDescriptionProps) => {
  return (
    <RadixDialog.Description
      className={classNames('px-5 py-4 text-bolt-elements-textPrimary text-md', className)}
      {...props}
    >
      {children}
    </RadixDialog.Description>
  );
});

interface DialogProps {
  children: ReactNode | ReactNode[];
  className?: string;
  onBackdrop?: (event: React.UIEvent) => void;
  onClose?: (event: React.UIEvent) => void;
}

/**
 * Original Dialog component renamed to DialogComponent
 */
const DialogComponent = memo(({ className, children, onBackdrop, onClose }: DialogProps) => {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay onClick={onBackdrop} asChild>
        <motion.div
          className="bg-black/50 fixed inset-0 z-max"
          initial="closed"
          animate="open"
          exit="closed"
          variants={dialogBackdropVariants}
        />
      </RadixDialog.Overlay>
      <RadixDialog.Content asChild>
        <motion.div
          className={classNames(
            'fixed top-[50%] left-[50%] z-max max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] border border-bolt-elements-borderColor rounded-lg bg-bolt-elements-background-depth-2 shadow-lg focus:outline-none overflow-hidden',
            className,
          )}
          initial="closed"
          animate="open"
          exit="closed"
          variants={dialogVariants}
        >
          {children}
          <RadixDialog.Close asChild onClick={onClose}>
            <IconButton icon="i-ph:x" className="absolute top-[10px] right-[10px]" />
          </RadixDialog.Close>
        </motion.div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});

/**
 * Fallback UI specific to Dialog
 */
const dialogFallback = (
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
 * Optional error handler for Dialog
 */
const handleDialogError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in Dialog:', error, errorInfo);
  // Optionally, send error details to a monitoring service like Sentry
  // Sentry.captureException(error, { extra: errorInfo });
};

/**
 * Wrapped DialogButton component with Error Boundary
 */
const DialogButton = withErrorBoundary(DialogButtonComponent, {
  fallback: dialogFallback,
  onError: handleDialogError,
});

/**
 * Wrapped DialogTitle component with Error Boundary
 */
const DialogTitle = withErrorBoundary(DialogTitleComponent, {
  fallback: dialogFallback,
  onError: handleDialogError,
});

/**
 * Wrapped DialogDescription component with Error Boundary
 */
const DialogDescription = withErrorBoundary(DialogDescriptionComponent, {
  fallback: dialogFallback,
  onError: handleDialogError,
});

/**
 * Wrapped Dialog component with Error Boundary
 */
const Dialog = withErrorBoundary(DialogComponent, {
  fallback: dialogFallback,
  onError: handleDialogError,
});

export { DialogButton, DialogDescription, DialogTitle, Dialog };
