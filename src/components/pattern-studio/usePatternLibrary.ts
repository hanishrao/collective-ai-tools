import { useCallback, useState } from 'react';
import { CustomPatternService } from '../../lib/customPatternService';
import {
  fetchRemoteLibrary,
  filterCustomPatterns,
  filterPatterns,
  filterStrategies,
  importedFabricItem,
  parseImportPattern,
  resolveItemContent,
  untitledPattern,
} from './helpers';
import type {
  FabricItem,
  FabricPattern,
  FilterSource,
  MobileTab,
} from './types';

export function usePatternLibrary() {
  const [patterns, setPatterns] = useState<FabricItem[]>([]);
  const [strategies, setStrategies] = useState<FabricItem[]>([]);
  const [customPatterns, setCustomPatterns] = useState<FabricPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSource, setFilterSource] = useState<FilterSource>('all');
  const [activeItem, setActiveItem] = useState<FabricItem | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [isError, setIsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileTab, setMobileTab] = useState<MobileTab>('sidebar');

  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await fetchRemoteLibrary();
      setPatterns(result.patterns);
      setStrategies(result.strategies);
      setIsError(result.isError);
    } catch (e) {
      console.error('Load failed', e);
      setIsError(true);
    }
    setCustomPatterns(CustomPatternService.getPatterns());
    setIsLoading(false);
  }, []);

  const applyImport = useCallback((state: unknown) => {
    const imported = parseImportPattern(state);
    if (!imported) return;
    setActiveItem(importedFabricItem(imported.title));
    setSystemPrompt(imported.content);
    setMobileTab('input');
  }, []);

  const selectItem = async (item: FabricItem) => {
    setActiveItem(item);
    setLoadingContent(true);
    setSystemPrompt('');
    if (window.innerWidth < 768) setMobileTab('input');

    const content = await resolveItemContent(item, customPatterns, isError);
    setSystemPrompt(content);
    setLoadingContent(false);
  };

  const createNew = () => {
    setActiveItem(untitledPattern());
    setSystemPrompt('');
  };

  return {
    customPatterns,
    setCustomPatterns,
    visibleCustomPatterns: filterCustomPatterns(customPatterns, searchTerm),
    filteredPatterns: filterPatterns(patterns, searchTerm, filterSource),
    filteredStrategies: filterStrategies(strategies, searchTerm, filterSource),
    isLoading,
    filterSource,
    setFilterSource,
    activeItem,
    setActiveItem,
    systemPrompt,
    setSystemPrompt,
    loadingContent,
    isError,
    searchTerm,
    setSearchTerm,
    mobileTab,
    setMobileTab,
    loadLibrary,
    applyImport,
    selectItem,
    createNew,
  };
}
