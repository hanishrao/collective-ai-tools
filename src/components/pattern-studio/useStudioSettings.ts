import { useCallback, useState } from 'react';
import { LLMService, PROVIDER_DEFAULTS } from '../../lib/llmService';
import { applyProviderDefaults } from './helpers';
import type { LLMProvider } from './types';

export function useStudioSettings() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [llmProvider, setLlmProvider] = useState<LLMProvider>('openai');
  const [baseUrl, setBaseUrl] = useState('');
  const [modelName, setModelName] = useState('');

  const hydrate = useCallback(() => {
    const config = LLMService.getConfig();
    setApiKey(config.apiKey);
    setLlmProvider(config.provider);
    setBaseUrl(config.baseUrl || '');
    setModelName(
      config.model || PROVIDER_DEFAULTS[config.provider].model || ''
    );
  }, []);

  const saveSettings = () => {
    LLMService.saveConfig({
      provider: llmProvider,
      apiKey,
      baseUrl,
      model: modelName,
    });
    setIsSettingsOpen(false);
  };

  const changeProvider = (provider: LLMProvider) => {
    setLlmProvider(provider);
    const defs = applyProviderDefaults(provider);
    if (defs.baseUrl !== undefined) setBaseUrl(defs.baseUrl);
    if (defs.model !== undefined) setModelName(defs.model);
  };

  return {
    isSettingsOpen,
    setIsSettingsOpen,
    apiKey,
    setApiKey,
    llmProvider,
    baseUrl,
    setBaseUrl,
    modelName,
    setModelName,
    hydrate,
    saveSettings,
    changeProvider,
  };
}
