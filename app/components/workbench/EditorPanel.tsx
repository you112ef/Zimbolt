// app/components/workbench/EditorPanel.tsx

import React, { memo, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeMirrorEditor from '~/components/editor/codemirror/CodeMirrorEditor';
import type {
  EditorDocument,
  EditorSettings,
  OnChangeCallback as OnEditorChange,
  OnSaveCallback as OnEditorSave,
  OnScrollCallback as OnEditorScroll,
} from '~/components/editor/codemirror/CodeMirrorEditor';
import { PanelHeader } from '~/components/ui/PanelHeader';
import { PanelHeaderButton } from '~/components/ui/PanelHeaderButton';
import { FileBreadcrumb } from './FileBreadcrumb';
import FileTree from './FileTree';
import type { FileMap } from '~/lib/stores/files';
import { TerminalTabs } from './terminal/TerminalTabs';
import { themeStore } from '~/lib/stores/theme';
import { WORK_DIR } from '~/utils/constants';
import { renderLogger } from '~/utils/logger';
import { classNames } from '~/utils/classNames';
import withErrorBoundary from '~/components/ui/withErrorBoundary';
import { workbenchStore } from '~/lib/stores/workbench';
import { isMobile } from '~/utils/mobile'; // Added missing import

/**
 * Props for the EditorPanel component.
 */
interface EditorPanelProps {
  files?: FileMap;
  unsavedFiles?: Set<string>;
  editorDocument?: EditorDocument;
  selectedFile?: string | undefined;
  isStreaming?: boolean;
  onEditorChange?: OnEditorChange;
  onEditorScroll?: OnEditorScroll;
  onFileSelect?: (value?: string) => void;
  onFileSave?: OnEditorSave;
  onFileReset?: () => void;
}

const DEFAULT_TERMINAL_SIZE = 30;
const DEFAULT_EDITOR_SIZE = 100 - DEFAULT_TERMINAL_SIZE;

const editorSettings: EditorSettings = { tabSize: 2 };

/**
 * EditorPanelComponent renders the main editor interface, including the file tree,
 * editor area, and terminal tabs with resizable panels.
 */
const EditorPanelComponent = memo(
  ({
    files,
    unsavedFiles,
    editorDocument,
    selectedFile,
    isStreaming,
    onFileSelect,
    onEditorChange,
    onEditorScroll,
    onFileSave,
    onFileReset,
  }: EditorPanelProps) => {
    renderLogger.trace('EditorPanel');

    const theme = useStore(themeStore);
    const showTerminal = useStore(workbenchStore.showTerminal);

    const activeFileSegments = useMemo(() => {
      if (!editorDocument) {
        return undefined;
      }
      return editorDocument.filePath.split('/');
    }, [editorDocument]);

    const activeFileUnsaved = useMemo(() => {
      return editorDocument !== undefined && unsavedFiles?.has(editorDocument.filePath);
    }, [editorDocument, unsavedFiles]);

    return (
      <PanelGroup direction="vertical">
        <Panel defaultSize={showTerminal ? DEFAULT_EDITOR_SIZE : 100} minSize={20}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize={20} minSize={10} collapsible>
              <div className="flex flex-col border-r border-bolt-elements-borderColor h-full">
                <PanelHeader>
                  <div className="i-ph:tree-structure-duotone shrink-0" />
                  Files
                </PanelHeader>
                <FileTree
                  className="h-full"
                  files={files}
                  hideRoot
                  unsavedFiles={unsavedFiles}
                  rootFolder={WORK_DIR}
                  selectedFile={selectedFile}
                  onFileSelect={onFileSelect}
                />
              </div>
            </Panel>
            <PanelResizeHandle />
            <Panel className="flex flex-col" defaultSize={80} minSize={20}>
              <PanelHeader className="overflow-x-auto">
                {activeFileSegments?.length && (
                  <div className="flex items-center flex-1 text-sm">
                    <FileBreadcrumb
                      pathSegments={activeFileSegments}
                      files={files}
                      onFileSelect={onFileSelect}
                    />
                    {activeFileUnsaved && (
                      <div className="flex gap-1 ml-auto -mr-1.5">
                        <PanelHeaderButton onClick={onFileSave}>
                          <div className="i-ph:floppy-disk-duotone" />
                          Save
                        </PanelHeaderButton>
                        <PanelHeaderButton onClick={onFileReset}>
                          <div className="i-ph:clock-counter-clockwise-duotone" />
                          Reset
                        </PanelHeaderButton>
                      </div>
                    )}
                  </div>
                )}
              </PanelHeader>
              <div className="h-full flex-1 overflow-hidden">
                <CodeMirrorEditor
                  theme={theme}
                  editable={!isStreaming && editorDocument !== undefined}
                  settings={editorSettings}
                  doc={editorDocument}
                  autoFocusOnDocumentChange={!isMobile()} /* Now using imported function */
                  onScroll={onEditorScroll}
                  onChange={onEditorChange}
                  onSave={onFileSave}
                />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle />
        <TerminalTabs />
      </PanelGroup>
    );
  }
);

/**
 * Fallback UI displayed when the EditorPanel component fails to render.
 */
const editorPanelFallback = (
  <div className="error-fallback p-4 bg-red-100 text-red-700 rounded">
    <p>Editor Panel failed to load.</p>
  </div>
);

/**
 * Handles errors that occur within the EditorPanel component.
 *
 * @param error - The error that was thrown.
 * @param errorInfo - Additional information about the error.
 */
const handleEditorPanelError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in EditorPanel:', error, errorInfo);

  /*
   * Optionally, report to an external service like Sentry
   * Sentry.captureException(error, { extra: errorInfo });
   */
};

/**
 * Wraps the EditorPanelComponent with an error boundary to catch and handle rendering errors.
 */
const EditorPanel = withErrorBoundary(EditorPanelComponent, {
  fallback: editorPanelFallback,
  onError: handleEditorPanelError,
});

export default EditorPanel;
