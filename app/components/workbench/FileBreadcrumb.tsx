// app/components/workbench/FileBreadcrumb.tsx

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import type { FileMap } from '~/lib/stores/files'; // Correctly importing FileMap from centralized store
import { classNames } from '~/utils/classNames';
import { WORK_DIR } from '~/utils/constants';
import { cubicEasingFn } from '~/utils/easings';
import { renderLogger } from '~/utils/logger';
import FileTree from './FileTree';
import withErrorBoundary from '~/components/ui/withErrorBoundary'; // Importing the HOC

const WORK_DIR_REGEX = new RegExp(
  `^${WORK_DIR
    .split('/')
    .slice(0, -1)
    .join('/')
    .replaceAll('/', '\\/')}/`
);

/**
 * Props for the FileBreadcrumb component.
 */
interface FileBreadcrumbProps {
  files?: FileMap;
  pathSegments?: string[];
  onFileSelect?: (filePath: string) => void;
}

/**
 * FileBreadcrumbComponent renders a breadcrumb navigation for the active file path,
 * allowing users to navigate through different segments of the file hierarchy.
 */
const FileBreadcrumbComponent = memo<FileBreadcrumbProps>(
  ({ files, pathSegments = [], onFileSelect }) => {
    renderLogger.trace('FileBreadcrumb');

    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const contextMenuRef = useRef<HTMLDivElement | null>(null);
    const segmentRefs = useRef<(HTMLSpanElement | null)[]>([]);

    /**
     * Handles the click event on a breadcrumb segment.
     * Toggles the active index to show or hide the context menu.
     *
     * @param index - The index of the clicked segment.
     */
    const handleSegmentClick = (index: number) => {
      setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    /**
     * Closes the context menu when clicking outside of it.
     */
    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (
          activeIndex !== null &&
          !contextMenuRef.current?.contains(event.target as Node) &&
          !segmentRefs.current.some((ref) => ref?.contains(event.target as Node))
        ) {
          setActiveIndex(null);
        }
      };

      document.addEventListener('mousedown', handleOutsideClick);

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }, [activeIndex]);

    // If no files are provided or no path segments exist, render nothing.
    if (files === undefined || pathSegments.length === 0) {
      return null;
    }

    return (
      <div className="flex">
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;

          // Construct the path up to the current segment.
          const path = pathSegments.slice(0, index).join('/');

          // Skip rendering segments that are outside the WORK_DIR.
          if (!WORK_DIR_REGEX.test(path)) {
            return null;
          }

          const isActive = activeIndex === index;

          return (
            <div key={index} className="relative flex items-center">
              <DropdownMenu.Root open={isActive} modal={false}>
                <DropdownMenu.Trigger asChild>
                  <span
                    ref={(ref) => {
                      segmentRefs.current[index] = ref; // Changed to block body to prevent returning ref
                    }}
                    className={classNames('flex items-center gap-1.5 cursor-pointer shrink-0', {
                      'text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary':
                        !isActive,
                      'text-bolt-elements-textPrimary underline': isActive,
                      'pr-4': isLast,
                    })}
                    onClick={() => handleSegmentClick(index)}
                  >
                    {isLast && <div className="i-ph:file-duotone" />}
                    {segment}
                  </span>
                </DropdownMenu.Trigger>
                {index > 0 && !isLast && (
                  <span className="i-ph:caret-right inline-block mx-1" />
                )}
                <AnimatePresence>
                  {isActive && (
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="z-file-tree-breadcrumb"
                        asChild
                        align="start"
                        side="bottom"
                        avoidCollisions={false}
                      >
                        <motion.div
                          ref={contextMenuRef}
                          initial="close"
                          animate="open"
                          exit="close"
                          variants={contextMenuVariants}
                        >
                          <div className="rounded-lg overflow-hidden">
                            <div className="max-h-[50vh] min-w-[300px] overflow-scroll bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor shadow-sm rounded-lg">
                              <FileTree
                                files={files}
                                hideRoot
                                rootFolder={path}
                                collapsed
                                allowFolderSelection
                                selectedFile={`${path}/${segment}`}
                                onFileSelect={(filePath) => {
                                  setActiveIndex(null);
                                  onFileSelect?.(filePath);
                                }}
                              />
                            </div>
                          </div>
                          <DropdownMenu.Arrow className="fill-bolt-elements-borderColor" />
                        </motion.div>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  )}
                </AnimatePresence>
              </DropdownMenu.Root>
            </div>
          );
        })}
      </div>
    );
  }
);

/**
 * Variants for the context menu animation using Framer Motion.
 */
const contextMenuVariants: Variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: cubicEasingFn,
    },
  },
  close: {
    y: 6,
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: cubicEasingFn,
    },
  },
};

/**
 * Fallback UI specific to FileBreadcrumb.
 * Displays a user-friendly error message and a button to reload the page.
 */
const fileBreadcrumbFallback = (
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
 * Handles errors that occur within the FileBreadcrumb component.
 *
 * @param error - The error that was thrown.
 * @param errorInfo - Additional information about the error.
 */
const handleFileBreadcrumbError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in FileBreadcrumb:', error, errorInfo);

  /*
   * Optionally, send error details to a monitoring service like Sentry
   * Sentry.captureException(error, { extra: errorInfo });
   */
};

/**
 * Wrapped FileBreadcrumb component with an Error Boundary to catch and handle rendering errors.
 */
const FileBreadcrumb = withErrorBoundary(FileBreadcrumbComponent, {
  fallback: fileBreadcrumbFallback,
  onError: handleFileBreadcrumbError,
});

export { FileBreadcrumb };
