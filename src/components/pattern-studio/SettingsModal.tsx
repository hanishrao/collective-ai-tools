import { Globe, Settings, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LLM_PROVIDERS, type LLMProvider } from './types';

function ProviderGrid({
  value,
  onChange,
}: {
  value: LLMProvider;
  onChange: (provider: LLMProvider) => void;
}) {
  return (
    <div className='grid grid-cols-3 gap-2'>
      {LLM_PROVIDERS.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`py-2 text-xs rounded border transition-colors capitalize ${
            value === p
              ? 'bg-primary/10 border-primary text-primary font-bold'
              : 'bg-background border-border text-muted-foreground hover:border-muted-foreground/50'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function CredentialFields({
  provider,
  apiKey,
  baseUrl,
  modelName,
  onApiKeyChange,
  onBaseUrlChange,
  onModelChange,
}: {
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  modelName: string;
  onApiKeyChange: (value: string) => void;
  onBaseUrlChange: (value: string) => void;
  onModelChange: (value: string) => void;
}) {
  const showBaseUrl = provider === 'deepseek' || provider === 'custom';

  return (
    <div className='space-y-4'>
      <div>
        <label className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block'>
          {provider === 'ollama' ? 'Server URL' : 'API Key'}
        </label>
        {provider === 'ollama' ? (
          <Input
            value={baseUrl}
            onChange={e => onBaseUrlChange(e.target.value)}
            className='bg-background border-border text-foreground font-mono text-xs'
            placeholder='http://localhost:11434/v1'
          />
        ) : (
          <Input
            value={apiKey}
            onChange={e => onApiKeyChange(e.target.value)}
            type='password'
            className='bg-background border-border text-foreground font-mono text-xs'
            placeholder='sk-...'
          />
        )}
      </div>

      {showBaseUrl && (
        <div>
          <label className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block'>
            Base URL
          </label>
          <Input
            value={baseUrl}
            onChange={e => onBaseUrlChange(e.target.value)}
            className='bg-background border-border text-foreground font-mono text-xs'
            placeholder='https://api.deepseek.com'
          />
        </div>
      )}

      <div>
        <label className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block'>
          Model Name
        </label>
        <Input
          value={modelName}
          onChange={e => onModelChange(e.target.value)}
          className='bg-background border-border text-foreground font-mono text-xs'
          placeholder='gpt-4o'
        />
      </div>
    </div>
  );
}

export function SettingsModal({
  open,
  provider,
  apiKey,
  baseUrl,
  modelName,
  onProviderChange,
  onApiKeyChange,
  onBaseUrlChange,
  onModelChange,
  onSave,
  onClose,
}: {
  open: boolean;
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  modelName: string;
  onProviderChange: (provider: LLMProvider) => void;
  onApiKeyChange: (value: string) => void;
  onBaseUrlChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4'>
      <div className='bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-lg font-bold text-foreground flex items-center gap-2'>
            <Settings className='w-4 h-4' /> API Settings
          </h2>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='space-y-6'>
          <div className='p-3 bg-blue-900/20 text-blue-300 text-[10px] rounded border border-blue-900/50'>
            Keys are stored in your browser&rsquo;s LocalStorage and are never
            sent to our servers.
          </div>

          <div>
            <label className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block'>
              Provider
            </label>
            <ProviderGrid value={provider} onChange={onProviderChange} />
          </div>

          {provider === 'ollama' && (
            <div className='p-3 bg-yellow-900/10 text-yellow-500 text-[10px] rounded border border-yellow-900/30 flex gap-2'>
              <Globe className='w-4 h-4 shrink-0' />
              <div>
                Ensure your Ollama server is running with{' '}
                <code>OLLAMA_ORIGINS=&quot;*&quot;</code> to allow browser
                access.
              </div>
            </div>
          )}

          <CredentialFields
            provider={provider}
            apiKey={apiKey}
            baseUrl={baseUrl}
            modelName={modelName}
            onApiKeyChange={onApiKeyChange}
            onBaseUrlChange={onBaseUrlChange}
            onModelChange={onModelChange}
          />

          <div className='flex items-center justify-end gap-3 mt-6'>
            <Button variant='ghost' onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onSave}
              className='bg-blue-600 hover:bg-blue-500 text-white'
            >
              Save & Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
