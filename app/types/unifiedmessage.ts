// app/types/unifiedmessage.ts

export type UnifiedMessage = {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'data';
  content: string | Array<{ type: string; text?: string; image?: string }>;
  sender?: string;
  timestamp?: string;
  annotations?: string[];

  // Add any additional properties required by @ai-sdk/ui-utils
};

// Alias Message to UnifiedMessage
export type Message = UnifiedMessage;
