import type { LLMProvider } from '../../lib/llmService';
import type { FabricItem, FabricPattern } from '../../lib/fabricPatterns';

export type FilterSource = 'all' | 'fabric' | 'anthropic';
export type MobileTab = 'sidebar' | 'input' | 'output';
export type AlertType = 'success' | 'error' | 'info';

export interface AlertConfig {
  open: boolean;
  title: string;
  message: string;
  type: AlertType;
}

export interface ConfirmConfig {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export interface ImportPattern {
  title: string;
  content: string;
}

export interface LibraryResult {
  patterns: FabricItem[];
  strategies: FabricItem[];
  isError: boolean;
}

export const FILTER_SOURCES: FilterSource[] = ['all', 'fabric', 'anthropic'];

export const LLM_PROVIDERS: LLMProvider[] = [
  'openai',
  'anthropic',
  'gemini',
  'deepseek',
  'ollama',
  'custom',
];

export const TEXT_FILE_EXT = /\.(md|js|ts|tsx|jsx|json|py|html|css|txt)$/;

export const CLOSED_ALERT: AlertConfig = {
  open: false,
  title: '',
  message: '',
  type: 'info',
};

export const CLOSED_CONFIRM: ConfirmConfig = {
  open: false,
  title: '',
  message: '',
  onConfirm: () => {},
};

export type { FabricItem, FabricPattern, LLMProvider };
