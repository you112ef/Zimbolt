// app/components/chat/BaseChat/BaseChat.tsx

import React, { forwardRef, useCallback, useEffect, useState, type RefObject } from 'react';
import type { UnifiedMessage } from '~/types/unifiedmessage'; // Changed to lowercase
import { ClientOnly } from 'remix-utils/client-only';
import Cookies from 'js-cookie';
import * as Tooltip from '@radix-ui/react-tooltip';

import Menu from '~/components/sidebar/Menu.client';
import Workbench from '~/components/workbench/Workbench.client'; // Correct import path
import { classNames } from '~/utils/classNames';
import { MODEL_LIST, PROVIDER_LIST, initializeModelList } from '~/utils/constants';
import Messages from '~/components/chat/Messages.client';
import { APIKeyManager, getApiKeysFromCookies } from '~/components/chat/APIKeyManager';
import { IconButton } from '~/components/ui/IconButton'; // Named import
import SendButton from '~/components/chat/SendButton';
import ExportChatButton from '~/components/chat/chatExportAndImport/ExportChatButton';
import ImportButtons from '~/components/chat/chatExportAndImport/ImportButtons';
import { ExamplePrompts } from '~/components/chat/ExamplePrompts';
import GitCloneButton from '~/components/chat/GitCloneButton';
import FilePreview from '~/components/chat/FilePreview';
import { ModelSelector } from '~/components/chat/ModelSelector';
import StarterTemplates from '~/components/chat/StarterTemplates';
import ChatAlert from '~/components/chat/ChatAlert';

import type { ActionAlert } from '~/types/actions';
import type { IProviderSetting, ProviderInfo } from '~/types/model';
import { LLMManager } from '~/lib/modules/llm/manager';
import { getStringEnv } from '~/utils/env';

import styles from './BaseChat.module.scss';
import { SpeechRecognitionManager } from './SpeechRecognitionManager';
import { FileUploadManager } from './FileUploadManager';
import { ModelSettingsPanel } from './ModelSettingsPanel';
import { ChatFooter } from './ChatFooter';
import { ScreenshotStateManager } from '~/components/chat/ScreenshotStateManager';

// Import your own custom Ref types from refs.ts
import type { RefCallback as CustomRefCallback } from '~/types/refs';

const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: RefObject<HTMLTextAreaElement>;
  messageRef?: CustomRefCallback<HTMLDivElement>;
  scrollRef?: CustomRefCallback<HTMLDivElement>;

  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  model?: string;
  setModel?: (model: string) => void;
  provider?: ProviderInfo;
  setProvider?: (provider: ProviderInfo) => void;
  providerList?: ProviderInfo[];
  input?: string;
  enhancingPrompt?: boolean;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  sendMessage?: (event: React.UIEvent<HTMLTextAreaElement>, messageInput?: string) => void;
  handleStop?: () => void;
  importChat?: (description: string, messages: UnifiedMessage[]) => Promise<void>; // Use UnifiedMessage
  exportChat?: () => void;
  uploadedFiles?: File[];
  setUploadedFiles?: (files: File[]) => void;
  imageDataList?: string[];
  setImageDataList?: (dataList: string[]) => void;
  messages?: UnifiedMessage[]; // Use UnifiedMessage
  actionAlert?: ActionAlert;
  clearAlert?: () => void;
}

const BaseChat = forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      model,
      setModel,
      provider,
      setProvider,
      providerList,
      input = '',
      enhancingPrompt,
      handleInputChange,
      enhancePrompt,
      sendMessage,
      handleStop,
      importChat,
      exportChat,
      uploadedFiles = [],
      setUploadedFiles,
      imageDataList = [],
      setImageDataList,
      messages = [],
      actionAlert,
      clearAlert,
    }: BaseChatProps,
    ref
  ) => {
    // Control textarea max-height
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

    // State for API keys and model list
    const [apiKeys, setApiKeys] = useState<Record<string, string>>(getApiKeysFromCookies());
    const [modelList, setModelList] = useState<typeof MODEL_LIST>(MODEL_LIST);
    const [isModelSettingsCollapsed, setIsModelSettingsCollapsed] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState<string | undefined>('all');

    // Retrieve provider settings from cookies
    const getProviderSettings = useCallback(() => {
      let providerSettings: Record<string, IProviderSetting> | undefined;

      try {
        const savedProviderSettings = Cookies.get('providers');

        if (savedProviderSettings) {
          const parsed = JSON.parse(savedProviderSettings);

          if (typeof parsed === 'object' && parsed !== null) {
            providerSettings = parsed;
          }
        }
      } catch (error) {
        console.error('Error loading Provider Settings from cookies:', error);
        Cookies.remove('providers'); // clear invalid data
      }

      return providerSettings;
    }, []);

    // On mount, load API keys and initialize model list
    useEffect(() => {
      const providerSettings = getProviderSettings();
      let parsedApiKeys: Record<string, string> | undefined;

      try {
        parsedApiKeys = getApiKeysFromCookies();
        setApiKeys(parsedApiKeys);
      } catch (error) {
        console.error('Error loading API keys from cookies:', error);
        Cookies.remove('apiKeys');
      }

      setIsModelLoading('all');
      initializeModelList({
        apiKeys: parsedApiKeys,
        providerSettings,
      })
        .then((initializedModels) => {
          setModelList(initializedModels);
        })
        .catch((err) => {
          console.error('Error initializing model list:', err);
        })
        .finally(() => {
          setIsModelLoading(undefined);
        });
    }, [getProviderSettings, providerList]);

    // Update API keys for a specific provider
    const onApiKeysChange = async (providerName: string, apiKey: string) => {
      const newApiKeys = { ...apiKeys, [providerName]: apiKey };
      setApiKeys(newApiKeys);
      Cookies.set('apiKeys', JSON.stringify(newApiKeys));

      const stringEnv = getStringEnv(import.meta.env);
      const providerInstance = LLMManager.getInstance(stringEnv).getProvider(providerName) as ProviderInfo;

      if (providerInstance && providerInstance.getDynamicModels) {
        setIsModelLoading(providerName);

        try {
          const providerSettings = getProviderSettings();
          const staticModels = providerInstance.staticModels;
          const dynamicModels = await providerInstance.getDynamicModels(newApiKeys, providerSettings, stringEnv);

          setModelList((prev: typeof MODEL_LIST) => {
            const filteredOut = prev.filter((x: { provider: string }) => x.provider !== providerName);
            return [...filteredOut, ...staticModels, ...dynamicModels];
          });
        } catch (error) {
          console.error('Error loading dynamic models:', error);
        }
        setIsModelLoading(undefined);
      }
    };

    // Helper to handle sending a message
    const handleSendMessage = (event: React.UIEvent<HTMLTextAreaElement>, messageInput?: string) => {
      if (sendMessage) {
        sendMessage(event, messageInput);
      }
    };

    // Console log to verify components are defined
    useEffect(() => {
      console.log('Menu:', Menu);
      console.log('Workbench:', Workbench);
      console.log('Messages:', Messages);
      console.log('APIKeyManager:', APIKeyManager);
      console.log('IconButton:', IconButton);
      console.log('SendButton:', SendButton);
      console.log('ExportChatButton:', ExportChatButton);
      console.log('ImportButtons:', ImportButtons);
      console.log('ExamplePrompts:', ExamplePrompts);
      console.log('GitCloneButton:', GitCloneButton);
      console.log('FilePreview:', FilePreview);
      console.log('ModelSelector:', ModelSelector);
      console.log('StarterTemplates:', StarterTemplates);
      console.log('ChatAlert:', ChatAlert);
      console.log('SpeechRecognitionManager:', SpeechRecognitionManager);
      console.log('FileUploadManager:', FileUploadManager);
      console.log('ModelSettingsPanel:', ModelSettingsPanel);
      console.log('ChatFooter:', ChatFooter);
      console.log('ScreenshotStateManager:', ScreenshotStateManager);
    }, []);

    const baseChat = (
      <div
        ref={ref}
        className={classNames(styles.BaseChat, 'relative flex h-full w-full overflow-hidden')}
        data-chat-visible={showChat}
      >
        <ClientOnly fallback={<div>Loading...</div>}>{() => <Menu />}</ClientOnly>
        <div ref={scrollRef} className="flex flex-col lg:flex-row overflow-y-auto w-full h-full">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow lg:min-w-[var(--chat-min-width)] h-full')}>
            {/* Intro Section (only if !chatStarted) */}
            {!chatStarted && (
              <div id="intro" className="mt-[16vh] max-w-chat mx-auto text-center px-4 lg:px-0">
                <h1 className="text-3xl lg:text-6xl font-bold text-bolt-elements-textPrimary mb-4 animate-fade-in">
                  Build with Zimbolt
                </h1>
                <p className="text-md lg:text-xl mb-8 text-bolt-elements-textSecondary animate-fade-in animation-delay-200">
                  Empowering Creators, Simplifying Solutions.
                </p>
              </div>
            )}

            {/* Main Chat Section */}
            <div className={classNames('pt-6 px-2 sm:px-6', { 'h-full flex flex-col': chatStarted })}>
              {/* Messages */}
              <ClientOnly fallback={<div>Loading...</div>}>
                {() =>
                  chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className="flex flex-col w-full flex-1 max-w-chat pb-6 mx-auto z-1"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null
                }
              </ClientOnly>

              {/* Prompt / Action Area */}
              <div
                className={classNames('flex flex-col gap-4 w-full max-w-chat mx-auto z-prompt mb-6', {
                  'sticky bottom-2': chatStarted,
                })}
              >
                {/* Chat Alert (if any) */}
                <div className="bg-bolt-elements-background-depth-2">
                  {actionAlert && (
                    <ChatAlert
                      alert={actionAlert}
                      clearAlert={() => clearAlert?.()}
                      postMessage={(message: string) => {
                        sendMessage?.({} as React.UIEvent<HTMLTextAreaElement>, message);
                        clearAlert?.();
                      }}
                    />
                  )}
                </div>

                {/* Model Settings Panel (collapsible) */}
                {!isModelSettingsCollapsed && (
                  <ModelSettingsPanel
                    model={model}
                    setModel={setModel}
                    modelList={modelList}
                    provider={provider}
                    setProvider={setProvider}
                    providerList={providerList || PROVIDER_LIST}
                    apiKeys={apiKeys}
                    onApiKeysChange={onApiKeysChange}
                    isModelLoading={isModelLoading}
                  />
                }

                {/* File Preview */}
                <FilePreview
                  files={uploadedFiles}
                  imageDataList={imageDataList}
                  onRemove={(index: number) => {
                    setUploadedFiles?.(uploadedFiles.filter((_, i) => i !== index));
                    setImageDataList?.(imageDataList.filter((_, i) => i !== index));
                  }}
                />

                {/* Screenshot Manager */}
                <ScreenshotStateManager
                  setUploadedFiles={setUploadedFiles}
                  setImageDataList={setImageDataList}
                  uploadedFiles={uploadedFiles}
                  imageDataList={imageDataList}
                />

                {/* File Upload Manager (drag & drop, paste, etc.) */}
                <FileUploadManager
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                  imageDataList={imageDataList}
                  setImageDataList={setImageDataList}
                />

                {/* Speech Recognition Manager */}
                <SpeechRecognitionManager
                  isStreaming={isStreaming}
                  handleStop={handleStop}
                  handleInputChange={handleInputChange}
                  sendMessage={sendMessage}
                />

                {/* Footer with Textarea, Buttons, Prompt Enhancement, etc. */}
                <ChatFooter
                  textareaRef={textareaRef}
                  input={input}
                  handleInputChange={handleInputChange}
                  handleStop={handleStop}
                  handleSendMessage={handleSendMessage}
                  isStreaming={isStreaming}
                  TEXTAREA_MIN_HEIGHT={TEXTAREA_MIN_HEIGHT}
                  TEXTAREA_MAX_HEIGHT={TEXTAREA_MAX_HEIGHT}
                  enhancePrompt={enhancePrompt}
                  enhancingPrompt={enhancingPrompt}
                  model={model}
                  isModelSettingsCollapsed={isModelSettingsCollapsed}
                  setIsModelSettingsCollapsed={setIsModelSettingsCollapsed}
                  providerList={providerList}
                  uploadedFiles={uploadedFiles}
                  exportChat={exportChat}
                />
              </div>

              {/* Extra UI if chat hasn't started */}
              {!chatStarted && (
                <div className="flex flex-col justify-center gap-5">
                  <div className="flex justify-center gap-2">
                    <ImportButtons importChat={importChat} />
                    <GitCloneButton importChat={importChat} />
                  </div>
                  <ExamplePrompts
                    sendMessage={(event: React.UIEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLButtonElement>, messageInput?: string) => {
                      if (isStreaming) {
                        handleStop?.();
                        return;
                      }

                      handleSendMessage(event as React.UIEvent<HTMLTextAreaElement>, messageInput);
                    }}
                  />
                  <StarterTemplates />
                </div>
              )}

              {/* Workbench */}
              <ClientOnly fallback={<div>Loading...</div>}>
                {() => <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />}
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      // @ts-ignore - Tooltip.Root might not require children in some versions
      <Tooltip.Root delayDuration={200}>
        {baseChat}
      </Tooltip.Root>
    );
  }
);

export default BaseChat;
