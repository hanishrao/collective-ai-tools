import { useCallback, useState, type DragEvent } from 'react';
import { LLMService } from '../../lib/llmService';
import { readDroppedFiles } from './helpers';
import type { FabricItem, MobileTab } from './types';

type RunDeps = {
  systemPrompt: string;
  setSystemPrompt: (value: string) => void;
  setActiveItem: (item: FabricItem | null) => void;
  apiKey: string;
  setIsSettingsOpen: (open: boolean) => void;
  setMobileTab: (tab: MobileTab) => void;
};

export function useStudioRun({
  systemPrompt,
  setSystemPrompt,
  setActiveItem,
  apiKey,
  setIsSettingsOpen,
  setMobileTab,
}: RunDeps) {
  const [userInput, setUserInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const runPattern = async () => {
    if (!systemPrompt || !userInput || !apiKey) {
      if (!apiKey) setIsSettingsOpen(true);
      return;
    }

    setIsRunning(true);
    setShowOutput(true);
    setMobileTab('output');
    setOutput('');

    try {
      await LLMService.streamCompletion(systemPrompt, userInput, chunk => {
        setOutput(prev => prev + chunk);
      });
    } catch (e: unknown) {
      setOutput(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const pipeOutput = () => {
    if (!output) return;
    setUserInput(output);
    setSystemPrompt('');
    setActiveItem(null);
    setShowOutput(false);
    setMobileTab('input');
  };

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const { content, skipped } = await readDroppedFiles(files, userInput);
      skipped.forEach(name => {
        alert(`Skipped ${name}: Binary files not supported yet.`);
      });
      setUserInput(content);
    },
    [userInput]
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${systemPrompt}\n\n${userInput}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetInput = () => {
    setUserInput('');
    setShowOutput(false);
  };

  return {
    userInput,
    setUserInput,
    copied,
    isDragging,
    output,
    isRunning,
    showOutput,
    setShowOutput,
    runPattern,
    pipeOutput,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    copyToClipboard,
    resetInput,
  };
}
