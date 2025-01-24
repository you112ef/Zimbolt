// app/components/chat/BaseChat/ModelSettingsPanel.tsx
import React from 'react';
import type { ProviderInfo } from '~/types/model';
import { ModelSelector } from '~/components/chat/ModelSelector';
import { APIKeyManager } from '~/components/chat/APIKeyManager';

interface ModelSettingsPanelProps {
  model?: string;
  setModel?: (m: string) => void;
  modelList: any[];
  provider?: ProviderInfo;
  setProvider?: (p: ProviderInfo) => void;
  providerList: ProviderInfo[];
  apiKeys: Record<string, string>;
  onApiKeysChange: (providerName: string, apiKey: string) => void;
  isModelLoading?: string;
}

export function ModelSettingsPanel({
  model,
  setModel,
  modelList,
  provider,
  setProvider,
  providerList,
  apiKeys,
  onApiKeysChange,
  isModelLoading,
}: ModelSettingsPanelProps) {
  if (!providerList || providerList.length === 0) {
    return null;
  }

  return (
    <div className="bg-bolt-elements-background-depth-2 p-3 rounded-lg border border-bolt-elements-borderColor relative w-full max-w-chat mx-auto z-prompt">
      <ModelSelector
        model={model}
        setModel={setModel}
        modelList={modelList}
        provider={provider}
        setProvider={setProvider}
        providerList={providerList}
        apiKeys={apiKeys}
        modelLoading={isModelLoading}
      />
      {provider && (
        <APIKeyManager
          provider={provider}
          apiKey={apiKeys[provider.name] || ''}
          setApiKey={(key: string) => onApiKeysChange(provider.name, key)}
        />
      )}
    </div>
  );
}
