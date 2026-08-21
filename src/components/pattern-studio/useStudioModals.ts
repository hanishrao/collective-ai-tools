import { useState, type MouseEvent } from 'react';
import {
  buildLocalPattern,
  customPatternItem,
  persistLocalPattern,
  postPrompt,
  removeLocalPattern,
  saveSuccessMessage,
} from './helpers';
import {
  CLOSED_ALERT,
  CLOSED_CONFIRM,
  type AlertConfig,
  type ConfirmConfig,
  type FabricItem,
  type FabricPattern,
} from './types';

type ModalDeps = {
  systemPrompt: string;
  activeItem: FabricItem | null;
  selectItem: (item: FabricItem) => void;
  setCustomPatterns: (patterns: FabricPattern[]) => void;
  setActiveItem: (item: FabricItem | null) => void;
  setSystemPrompt: (value: string) => void;
};

export function useStudioModals({
  systemPrompt,
  activeItem,
  selectItem,
  setCustomPatterns,
  setActiveItem,
  setSystemPrompt,
}: ModalDeps) {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newPatternName, setNewPatternName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(CLOSED_ALERT);
  const [confirmConfig, setConfirmConfig] =
    useState<ConfirmConfig>(CLOSED_CONFIRM);

  const initSave = () => {
    if (!systemPrompt) return;
    setNewPatternName(
      activeItem?.type === 'custom' ? activeItem.name : 'My New Pattern'
    );
    setIsSaveModalOpen(true);
  };

  const confirmSavePattern = async () => {
    if (!newPatternName) return;

    try {
      const ok = await postPrompt({
        title: newPatternName,
        content: systemPrompt,
        isPublic,
      });

      if (!ok) {
        setAlertConfig({
          open: true,
          title: 'Sync Warning',
          message: 'Failed to save to server, saved locally only.',
          type: 'error',
        });
        return;
      }

      const pattern = buildLocalPattern(
        newPatternName,
        systemPrompt,
        isPublic ? 'Public user pattern' : 'Private user pattern'
      );
      setCustomPatterns(persistLocalPattern(pattern));
      selectItem(customPatternItem(pattern.id));
      setIsSaveModalOpen(false);
      setNewPatternName('');
      setIsPublic(false);
      setAlertConfig({
        open: true,
        title: 'Success',
        message: saveSuccessMessage(isPublic),
        type: 'success',
      });
    } catch (e) {
      console.error('Save failed', e);
      const pattern = buildLocalPattern(
        newPatternName,
        systemPrompt,
        'Local (Offline)'
      );
      setCustomPatterns(persistLocalPattern(pattern));
      setIsSaveModalOpen(false);
      setAlertConfig({
        open: true,
        title: 'Offline Mode',
        message: 'Network error. Pattern saved locally.',
        type: 'error',
      });
    }
  };

  const deleteCustomPattern = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmConfig({
      open: true,
      title: 'Delete Pattern',
      message:
        'Are you sure you want to delete this pattern? This cannot be undone.',
      onConfirm: () => {
        setCustomPatterns(removeLocalPattern(id));
        if (activeItem?.name === id) {
          setActiveItem(null);
          setSystemPrompt('');
        }
        setConfirmConfig(prev => ({ ...prev, open: false }));
      },
    });
  };

  return {
    isSaveModalOpen,
    newPatternName,
    setNewPatternName,
    isPublic,
    setIsPublic,
    alertConfig,
    confirmConfig,
    initSave,
    confirmSavePattern,
    deleteCustomPattern,
    closeAlert: () => setAlertConfig(prev => ({ ...prev, open: false })),
    closeConfirm: () => setConfirmConfig(prev => ({ ...prev, open: false })),
    closeSaveModal: () => setIsSaveModalOpen(false),
  };
}
