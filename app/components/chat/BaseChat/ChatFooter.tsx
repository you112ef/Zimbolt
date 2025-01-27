// app/components/chat/BaseChat/ChatFooter.tsx

'use client';

import React from 'react';
import { IconButton } from '~/components/ui/IconButton'; // Named export
import SendButton from '../SendButton'; // Default import
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { Sparkle, CaretDown, CaretRight, Spinner, ArrowRight } from 'phosphor-react'; // Import necessary icons

interface ChatFooterProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  input: string;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleStop?: () => void;
  handleSendMessage: (event: React.UIEvent<HTMLTextAreaElement>, messageInput?: string) => void;
  isStreaming?: boolean;
  TEXTAREA_MIN_HEIGHT: number;
  TEXTAREA_MAX_HEIGHT: number;
  enhancePrompt?: () => void;
  enhancingPrompt?: boolean;
  model?: string;
  isModelSettingsCollapsed: boolean;
  setIsModelSettingsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  providerList?: any[];
  uploadedFiles?: File[];
  exportChat?: () => void;
}

export function ChatFooter(props: ChatFooterProps) {
  const {
    textareaRef,
    input,
    handleInputChange,
    handleStop,
    handleSendMessage,
    isStreaming,
    TEXTAREA_MIN_HEIGHT,
    TEXTAREA_MAX_HEIGHT,
    enhancePrompt,
    enhancingPrompt,
    model,
    isModelSettingsCollapsed,
    setIsModelSettingsCollapsed,
    providerList,
    uploadedFiles = [],
    exportChat,
  } = props;

  // Debugging statements
  console.log('IconButton:', IconButton);
  console.log('SendButton:', SendButton);

  // Triggered by the send button
  const onSendClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isStreaming) {
      // If streaming, "Stop" the output
      handleStop?.();
      return;
    }

    // Only send if there's content or uploaded files
    if (input.trim().length > 0 || uploadedFiles.length > 0) {
      handleSendMessage(event as unknown as React.UIEvent<HTMLTextAreaElement>);
    }
  };

  return (
    <div className="relative shadow-xs border border-bolt-elements-borderColor backdrop-blur rounded-lg bg-bolt-elements-background-depth-2 p-3">
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          className={classNames(
            'w-full pl-4 pt-4 pr-16 outline-none resize-none text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent text-sm',
            'transition-all duration-200 hover:border-bolt-elements-focus'
          )}
          style={{
            minHeight: TEXTAREA_MIN_HEIGHT,
            maxHeight: TEXTAREA_MAX_HEIGHT,
          }}
          placeholder="How can Bolt help you today?"
          translate="no"
          value={input}
          onChange={(e) => handleInputChange?.(e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (e.shiftKey) {
                return; // allow multi-line
              }

              e.preventDefault();

              if (isStreaming) {
                handleStop?.();
                return;
              }

              if (!(e.nativeEvent as any).isComposing) {
                handleSendMessage(e, undefined);
              }
            }
          }}
        />
        <SendButton
          show={input.trim().length > 0 || isStreaming || uploadedFiles.length > 0}
          isStreaming={isStreaming}
          disabled={!providerList || providerList.length === 0}
          onClick={onSendClick}
        />
      </div>

      {/* Footer row with icons */}
      <div className="flex justify-between items-center text-sm mt-2">
        <div className="flex gap-1 items-center">
          {/* Enhance Prompt */}
          <IconButton
            title="Enhance prompt"
            disabled={!input || enhancingPrompt}
            className={classNames('transition-all', {
              'opacity-100': enhancingPrompt,
            })}
            onClick={() => {
              enhancePrompt?.();
              toast.success('Prompt enhanced!');
            }}
          >
            {enhancingPrompt ? (
              <Spinner size={20} weight="bold" className="text-bolt-elements-loader-progress animate-spin" />
            ) : (
              <Sparkle size={20} weight="bold" />
            )}
          </IconButton>

          {/* Export Chat */}
          {exportChat && (
            <IconButton title="Export Chat" onClick={exportChat}>
              {/* Using Phosphor's ArrowRight icon as a placeholder */}
              <ArrowRight size={20} weight="bold" />
            </IconButton>
          )}

          {/* Toggle Model Settings */}
          <IconButton
            title="Model Settings"
            className={classNames('transition-all flex items-center gap-1', {
              'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent': isModelSettingsCollapsed,
              'bg-bolt-elements-item-backgroundDefault text-bolt-elements-item-contentDefault':
                !isModelSettingsCollapsed,
            })}
            onClick={() => setIsModelSettingsCollapsed((prev) => !prev)}
            disabled={!providerList || providerList.length === 0}
          >
            {isModelSettingsCollapsed ? (
              <CaretRight size={20} weight="bold" className="text-lg" />
            ) : (
              <CaretDown size={20} weight="bold" className="text-lg" />
            )}
            {isModelSettingsCollapsed ? <span className="text-xs">{model}</span> : <span />}
          </IconButton>
        </div>

        {/* Shift+Enter hint */}
        {input.trim().length > 3 && (
          <div className="text-xs text-bolt-elements-textTertiary">
            Use <kbd className="kdb px-1.5 py-0.5 rounded bg-bolt-elements-background-depth-2">Shift</kbd> +{' '}
            <kbd className="kdb px-1.5 py-0.5 rounded bg-bolt-elements-background-depth-2">Enter</kbd> for a new line
          </div>
        )}
      </div>
    </div>
  );
}
