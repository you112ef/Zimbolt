// app/components/chat/Chat.client.tsx

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import type { UnifiedMessage } from '~/types/unifiedmessage'; // Changed to lowercase
import { useChat } from 'ai/react';
import { useAnimate } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { cssTransition } from 'react-toastify/dist/utils';
import { useMessageParser, usePromptEnhancer, useShortcuts, useSnapScroll } from '~/lib/hooks';
import { useChatHistory } from '~/lib/persistence';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/components/workbench/Workbench.client'; // Changed import path
import {
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  PROMPT_COOKIE_KEY,
  PROVIDER_LIST,
} from '~/utils/constants';
import { cubicEasingFn } from '~/utils/easings';
import { createScopedLogger, renderLogger } from '~/utils/logger';
import BaseChat from './BaseChat/BaseChat';
import Cookies from 'js-cookie';
import { debounce } from '~/utils/debounce';
import { useSettings } from '~/lib/hooks/useSettings';
import type { ProviderInfo } from '~/types/model';
import { useSearchParams } from '@remix-run/react';
import { createSampler } from '~/utils/sampler';
import { getTemplates, selectStarterTemplate } from '~/utils/selectStarterTemplate';
import withErrorBoundary from '~/components/ui/withErrorBoundary'; // HOC

// -------------- 1) Custom Types for closeButton & icon --------------
type CustomCloseProps = {
  closeToast?: () => void;
};
type CustomIconProps = {
  type?: 'success' | 'error'; // Restricted to known types
};

// -------------- 2) If you'd like a custom transition --------------
const toastAnimation = cssTransition({
  enter: 'animated fadeInRight',
  exit: 'animated fadeOutRight',
}) as any; 
// ^ Type assertion to avoid TS error if your installed react-toastify version lacks a matching type

const logger = createScopedLogger('Chat');

// Type guard function
function isValidRole(role: any): role is 'system' | 'user' | 'assistant' | 'data' {
  return ['system', 'user', 'assistant', 'data'].includes(role);
}

// -------------------- Chat Component --------------------
function ChatComponent() {
  renderLogger.trace('Chat');

  const { ready, initialMessages, storeMessageHistory, importChat, exportChat } = useChatHistory();
  const title = useStore(description);

  useEffect(() => {
    // Re-load messages after mount
    workbenchStore.setReloadedMessages(initialMessages.map((m) => m.id));
  }, [initialMessages]);

  return (
    <>
      {ready && (
        <ChatImpl
          initialMessages={initialMessages.filter(
            (msg): msg is UnifiedMessage & { role: NonNullable<UnifiedMessage['role']> } => msg.role !== undefined && isValidRole(msg.role)
          )}
          exportChat={exportChat}
          storeMessageHistory={storeMessageHistory}
          importChat={importChat}
          // Removed description prop as BaseChat does not expect it
        />
      )}

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        pauseOnFocusLoss={true}
        transition={toastAnimation}
        closeButton={({ closeToast }: CustomCloseProps) => (
          <button className="Toastify__close-button" onClick={closeToast}>
            <div className="i-ph:x text-lg" />
          </button>
        )}
        icon={({ type }: CustomIconProps) => {
          switch (type) {
            case 'success':
              return <div className="i-ph:check-bold text-bolt-elements-icon-success text-2xl" />;
            case 'error':
              return <div className="i-ph:warning-circle-bold text-bolt-elements-icon-error text-2xl" />;
            default:
              return undefined;
          }
        }}
      />
    </>
  );
}

// -------------------- Chat Fallback and Error Handler --------------------
const chatFallback = (
  <div className="error-fallback p-4 bg-red-100 text-red-700 rounded">
    <p>Chat interface failed to load.</p>
  </div>
);

const handleChatError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Error in Chat:', error, errorInfo);
  /*
   * Optionally send to Sentry or another reporting service:
   * Sentry.captureException(error, { extra: errorInfo });
   */
};

// Wrap ChatComponent with an error boundary
const Chat = withErrorBoundary(ChatComponent, {
  fallback: chatFallback,
  onError: handleChatError,
});

export default Chat;

// -------------------- ChatImpl --------------------
const processSampledMessages = createSampler(
  (options: {
    messages: UnifiedMessage[];
    initialMessages: UnifiedMessage[];
    isLoading: boolean;
    parseMessages: (messages: UnifiedMessage[], isLoading: boolean) => void;
    storeMessageHistory: (messages: UnifiedMessage[]) => Promise<void>;
  }) => {
    const { messages, initialMessages, isLoading, parseMessages, storeMessageHistory } = options;
    parseMessages(messages, isLoading);

    if (messages.length > initialMessages.length) {
      storeMessageHistory(messages).catch((error) => toast.error(error.message));
    }
  },
  50
);

interface ChatProps {
  initialMessages: UnifiedMessage[];
  storeMessageHistory: (messages: UnifiedMessage[]) => Promise<void>;
  importChat: (description: string, messages: UnifiedMessage[]) => Promise<void>;
  exportChat: () => void;
}

export const ChatImpl = memo(function ChatImpl({
  initialMessages,
  storeMessageHistory,
  importChat,
  exportChat,
}: ChatProps) {
  useShortcuts();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [chatStarted, setChatStarted] = useState(initialMessages.length > 0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imageDataList, setImageDataList] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [fakeLoading, setFakeLoading] = useState(false);

  const files = useStore(workbenchStore.files);
  const actionAlert = useStore(workbenchStore.alert);
  const { activeProviders, promptId, autoSelectTemplate, contextOptimizationEnabled } = useSettings();

  // Model and provider from cookies
  const [model, setModel] = useState(() => {
    const savedModel = Cookies.get('selectedModel');
    return savedModel || DEFAULT_MODEL;
  });
  const [provider, setProvider] = useState<ProviderInfo>(() => {
    const savedProvider = Cookies.get('selectedProvider');
    return (PROVIDER_LIST.find((p) => p.name === savedProvider) || DEFAULT_PROVIDER) as ProviderInfo;
  });

  const { showChat } = useStore(chatStore);
  const [animationScope, animate] = useAnimate();

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  // useChat from 'ai/react'
  const {
    messages: aiMessages,
    isLoading,
    input,
    handleInputChange,
    setInput,
    stop,
    append,
    setMessages,
    reload,
  } = useChat({
    api: '/api/chat',
    body: {
      apiKeys,
      files,
      promptId,
      contextOptimization: contextOptimizationEnabled,
    },
    sendExtraMessageFields: true,
    onError: (error) => {
      logger.error('Request failed\n\n', error);
      toast.error(
        'There was an error processing your request: ' + (error.message ? error.message : 'No details were returned')
      );
    },
    onFinish: (message, response) => {
      const usage = response.usage;
      if (usage) {
        console.log('Token usage:', usage);
      }
      logger.debug('Finished streaming');
    },
    initialMessages,
    initialInput: Cookies.get(PROMPT_COOKIE_KEY) || '',
  });

  // Prompt from URL (?prompt=)
  useEffect(() => {
    const prompt = searchParams.get('prompt');
    if (prompt) {
      setSearchParams({});
      runAnimation();
      append({
        id: `${Date.now()}`,
        role: 'user',
        content: `[Model: ${model}]\n\n[Provider: ${provider.name}]\n\n${prompt}`,
      });
    }
  }, [model, provider, searchParams]);

  const { enhancingPrompt, enhancePrompt, resetEnhancer } = usePromptEnhancer();
  const { parsedMessages, parseMessages } = useMessageParser();

  const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

  useEffect(() => {
    chatStore.setKey('started', initialMessages.length > 0);
  }, [initialMessages]);

  // Process new messages in small batches
  useEffect(() => {
    processSampledMessages({
      messages: aiMessages,
      initialMessages,
      isLoading,
      parseMessages,
      storeMessageHistory,
    });
  }, [aiMessages, isLoading, parseMessages]);

  // Auto-resize the textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
    textarea.style.overflowY = scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
  }, [input]);

  // Animate intro/fade out
  const runAnimation = async () => {
    if (chatStarted) return;

    await Promise.all([
      animate('#examples', { opacity: 0, display: 'none' }, { duration: 0.1 }),
      animate('#intro', { opacity: 0, flex: 1 }, { duration: 0.2, ease: cubicEasingFn }),
    ]);

    chatStore.setKey('started', true);
    setChatStarted(true);
  };

  // Send a message
  const sendMessage = async (_event: React.UIEvent, messageInput?: string) => {
    const _input = messageInput || input;
    if (_input.length === 0 || isLoading) return;

    await workbenchStore.saveAllFiles();
    const fileModifications = workbenchStore.getFileModifications(); // Ensure correct method name

    chatStore.setKey('aborted', false);
    runAnimation();

    // Auto-select a starter template if first message & autoSelectTemplate
    if (!chatStarted && _input && autoSelectTemplate) {
      setFakeLoading(true);

      setMessages([
        {
          id: `${Date.now()}`,
          role: 'user',
          content: `[Model: ${model}]\n\n[Provider: ${provider.name}]\n\n${_input}`,
        },
        ...imageDataList.map((imageData, index) => ({
          id: `${Date.now()}-${index}`,
          role: 'data',
          content: imageData,
        })),
      ]);

      const { template, title } = await selectStarterTemplate({
        message: _input,
        model,
        provider,
      });

      if (template !== 'blank') {
        const temResp = await getTemplates(template, title);
        if (temResp) {
          const { assistantMessage, userMessage } = temResp;

          setMessages([
            {
              id: `${Date.now()}`,
              role: 'user',
              content: _input,
            },
            {
              id: `${Date.now() + 1}`,
              role: 'assistant',
              content: assistantMessage,
            },
            {
              id: `${Date.now() + 2}`,
              role: 'user',
              content: `[Model: ${model}]\n\n[Provider: ${provider.name}]\n\n${userMessage}`,
              annotations: ['hidden'],
            },
          ]);

          reload();
          setFakeLoading(false);
          return;
        } else {
          // If no template response
          setMessages([
            {
              id: `${Date.now()}`,
              role: 'user',
              content: `[Model: ${model}]\n\n[Provider: ${provider.name}]\n\n${_input}`,
            },
            ...imageDataList.map((imageData, index) => ({
              id: `${Date.now()}-${index}`,
              role: 'data',
              content: imageData,
            })),
          ]);
          reload();
          setFakeLoading(false);
          return;
        }
      } else {
        // Template is 'blank'
        setMessages([
          {
            id: `${Date.now()}`,
            role: 'user',
            content: `[Model: ${model}]\n\n[Provider: ${provider.name}]\n\n${_input}`,
          },
          ...imageDataList.map((imageData, index) => ({
            id: `${Date.now()}-${index}`,
            role: 'data',
            content: imageData,
          })),
        ]);
        reload();
        setFakeLoading(false);
        return;
      }
    }

    // Otherwise, normal conversation
    if (fileModifications !== undefined) {
      append({
        id: `${Date.now()}`,
        role: 'user',
        content: `[Model: ${model}]\n\n[Provider: ${provider.name}]\n\n${_input}`,
      });
      workbenchStore.resetAllFileModifications();
    } else {
      append({
        id: `${Date.now()}`,
        role: 'user',
        content: `[Model: ${model}]\n\n[Provider: ${provider.name}]\n\n${_input}`,
      });
    }

    setInput('');
    Cookies.remove(PROMPT_COOKIE_KEY);

    // Cleanup
    setUploadedFiles([]);
    setImageDataList([]);
    resetEnhancer();
    textareaRef.current?.blur();
  };

  // Track textarea change
  const onTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(event);
  };

  // Debounce caching prompt in cookies
  const debouncedCachePrompt = useCallback(
    debounce((event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const trimmedValue = event.target.value.trim();
      Cookies.set(PROMPT_COOKIE_KEY, trimmedValue, { expires: 30 });
    }, 1000),
    []
  );

  // Snap scrolling
  const [messageRef, scrollRef] = useSnapScroll();

  // Load stored API keys
  useEffect(() => {
    const storedApiKeys = Cookies.get('apiKeys');
    if (storedApiKeys) {
      setApiKeys(JSON.parse(storedApiKeys));
    }
  }, []);

  // Model/Provider updates
  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    Cookies.set('selectedModel', newModel, { expires: 30 });
  };

  const handleProviderChange = (newProvider: ProviderInfo) => {
    setProvider(newProvider);
    Cookies.set('selectedProvider', newProvider.name, { expires: 30 });
  };

  return (
    <BaseChat
      ref={animationScope}
      textareaRef={textareaRef}
      input={input}
      showChat={showChat}
      chatStarted={chatStarted}
      isStreaming={isLoading || fakeLoading}
      enhancingPrompt={enhancingPrompt}
      sendMessage={sendMessage}
      model={model}
      setModel={handleModelChange}
      provider={provider}
      setProvider={handleProviderChange}
      providerList={activeProviders}
      messageRef={messageRef}
      scrollRef={scrollRef}
      handleInputChange={(e) => {
        onTextareaChange(e);
        debouncedCachePrompt(e);
      }}
      handleStop={stop} // or abort
      importChat={importChat}
      exportChat={exportChat}
      messages={aiMessages.map((message, i) => {
        if (!isValidRole(message.role)) {
          console.warn(`Invalid role detected: ${message.role}`);
          return null;
        }

        return {
          id: message.id || `${Date.now()}-${i}`,
          role: message.role,
          content: typeof message.content === 'string' 
            ? message.content 
            : message.content.map((c: { type: string; text?: string; image?: string }) => ({
                type: c.type,
                text: c.text,
                image: c.image,
              })),
          sender: message.role === 'user' ? 'user' : 'assistant',
          timestamp: message.timestamp || new Date().toISOString(),
          annotations: message.annotations,
        } as UnifiedMessage;
      }).filter(Boolean) as UnifiedMessage[]}
      enhancePrompt={() => {
        enhancePrompt(
          input,
          (newInput) => {
            setInput(newInput);
            if (textareaRef.current) {
              textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
            }
          },
          model,
          provider,
          apiKeys
        );
      }}
      uploadedFiles={uploadedFiles}
      setUploadedFiles={setUploadedFiles}
      imageDataList={imageDataList}
      setImageDataList={setImageDataList}
      actionAlert={actionAlert}
      clearAlert={() => workbenchStore.clearAlert()}
    />
  );
});
