import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePatternLibrary } from './usePatternLibrary';
import { useStudioModals } from './useStudioModals';
import { useStudioRun } from './useStudioRun';
import { useStudioSettings } from './useStudioSettings';

export function usePatternStudio() {
  const location = useLocation();
  const settings = useStudioSettings();
  const library = usePatternLibrary();
  const run = useStudioRun({
    systemPrompt: library.systemPrompt,
    setSystemPrompt: library.setSystemPrompt,
    setActiveItem: library.setActiveItem,
    apiKey: settings.apiKey,
    setIsSettingsOpen: settings.setIsSettingsOpen,
    setMobileTab: library.setMobileTab,
  });
  const modals = useStudioModals({
    systemPrompt: library.systemPrompt,
    activeItem: library.activeItem,
    selectItem: library.selectItem,
    setCustomPatterns: library.setCustomPatterns,
    setActiveItem: library.setActiveItem,
    setSystemPrompt: library.setSystemPrompt,
  });

  useEffect(() => {
    void library.loadLibrary();
    settings.hydrate();
    library.applyImport(location.state);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matches original location.state trigger
  }, [location.state]);

  const createNew = () => {
    library.createNew();
    run.resetInput();
  };

  return { settings, library, run, modals, createNew };
}
