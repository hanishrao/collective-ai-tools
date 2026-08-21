import { AnthropicService } from '../../lib/anthropicPrompts';
import { CustomPatternService } from '../../lib/customPatternService';
import {
  FabricService,
  STATIC_PATTERNS,
  type FabricItem,
  type FabricPattern,
} from '../../lib/fabricPatterns';
import { PROVIDER_DEFAULTS, type LLMProvider } from '../../lib/llmService';
import {
  TEXT_FILE_EXT,
  type FilterSource,
  type ImportPattern,
  type LibraryResult,
} from './types';

export function isAnthropicPath(path: string): boolean {
  return path.startsWith('anthropic_');
}

export function matchesSearch(name: string, searchTerm: string): boolean {
  return name.toLowerCase().includes(searchTerm.toLowerCase());
}

export function filterPatterns(
  patterns: FabricItem[],
  searchTerm: string,
  filterSource: FilterSource
): FabricItem[] {
  return patterns.filter(p => {
    if (!matchesSearch(p.name, searchTerm)) return false;
    const anthropic = isAnthropicPath(p.path);
    if (filterSource === 'fabric') return !anthropic;
    if (filterSource === 'anthropic') return anthropic;
    return true;
  });
}

export function filterStrategies(
  strategies: FabricItem[],
  searchTerm: string,
  filterSource: FilterSource
): FabricItem[] {
  return strategies.filter(s => {
    if (!matchesSearch(s.name, searchTerm)) return false;
    return filterSource !== 'anthropic';
  });
}

export function filterCustomPatterns(
  patterns: FabricPattern[],
  searchTerm: string
): FabricPattern[] {
  return patterns.filter(p => matchesSearch(p.title, searchTerm));
}

export function importedFabricItem(title: string): FabricItem {
  return {
    name: title,
    path: 'imported',
    type: 'custom',
    url: '',
  };
}

export function untitledPattern(): FabricItem {
  return {
    name: 'Untitled Pattern',
    path: 'new',
    type: 'custom',
    url: '',
  };
}

export function customPatternItem(id: string): FabricItem {
  return {
    name: id,
    path: `custom/${id}`,
    type: 'custom',
    url: '',
  };
}

export function toPatternId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_');
}

export function buildLocalPattern(
  name: string,
  systemPrompt: string,
  description: string
): FabricPattern {
  return {
    id: toPatternId(name),
    title: name,
    description,
    systemPrompt,
    userPromptTemplate: '',
    type: 'custom',
  };
}

export function saveSuccessMessage(isPublic: boolean): string {
  return isPublic
    ? 'Pattern submitted! It will appear in the community feed after approval.'
    : 'Pattern saved to your personal library!';
}

export function isReadableDropFile(file: File): boolean {
  return file.type.startsWith('text/') || TEXT_FILE_EXT.test(file.name);
}

export async function readDroppedFiles(
  files: File[],
  existingInput: string
): Promise<{ content: string; skipped: string[] }> {
  let content = existingInput ? `${existingInput}\n\n` : '';
  const skipped: string[] = [];

  for (const file of files) {
    if (!isReadableDropFile(file)) {
      skipped.push(file.name);
      continue;
    }

    try {
      const text = await file.text();
      content += `--- FILE: ${file.name} ---\n${text}\n\n`;
    } catch (err) {
      console.error('Failed to read file:', file.name, err);
    }
  }

  return { content, skipped };
}

export function applyProviderDefaults(provider: LLMProvider): {
  baseUrl?: string;
  model?: string;
} {
  return PROVIDER_DEFAULTS[provider];
}

export async function fetchRemoteLibrary(): Promise<LibraryResult> {
  const [pats, strats, anthropicPrompts] = await Promise.all([
    FabricService.getPatterns(),
    FabricService.getStrategies(),
    AnthropicService.getPrompts(),
  ]);

  if (pats.length === 0 && strats.length === 0) {
    return {
      isError: true,
      strategies: [],
      patterns: [
        ...STATIC_PATTERNS.map(
          p =>
            ({
              name: p.id,
              path: `data/patterns/${p.id}`,
              type: 'dir',
              url: '',
            }) as FabricItem
        ),
        ...anthropicPrompts,
      ],
    };
  }

  return {
    isError: false,
    patterns: [...pats, ...anthropicPrompts],
    strategies: strats,
  };
}

async function loadRemoteContent(item: FabricItem): Promise<string> {
  if (item.type === 'dir') {
    return FabricService.getPatternContent(item.name);
  }
  return FabricService.getStrategyContent(item.name);
}

function loadCustomContent(
  item: FabricItem,
  customPatterns: FabricPattern[]
): string {
  if (item.path.startsWith('anthropic_')) {
    return AnthropicService.getPromptContent(item.path);
  }
  return customPatterns.find(p => p.id === item.name)?.systemPrompt ?? '';
}

export async function resolveItemContent(
  item: FabricItem,
  customPatterns: FabricPattern[],
  isError: boolean
): Promise<string> {
  let content =
    item.type === 'custom'
      ? loadCustomContent(item, customPatterns)
      : await loadRemoteContent(item);

  if (!content && isError) {
    const staticPat = STATIC_PATTERNS.find(p => p.id === item.name);
    if (staticPat) content = staticPat.systemPrompt;
  }

  return content || '// Failed to load content.';
}

export async function postPrompt(body: {
  title: string;
  content: string;
  isPublic: boolean;
}): Promise<boolean> {
  const res = await fetch('/api/prompts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: body.title,
      content: body.content,
      description: 'Created in Pattern Studio',
      tags: [] as string[],
      isPublic: body.isPublic,
    }),
  });
  return res.ok;
}

export function persistLocalPattern(pattern: FabricPattern): FabricPattern[] {
  CustomPatternService.savePattern(pattern);
  return CustomPatternService.getPatterns();
}

export function removeLocalPattern(id: string): FabricPattern[] {
  CustomPatternService.deletePattern(id);
  return CustomPatternService.getPatterns();
}

export function parseImportPattern(state: unknown): ImportPattern | undefined {
  if (!state || typeof state !== 'object') return undefined;
  return (state as { importPattern?: ImportPattern }).importPattern;
}
