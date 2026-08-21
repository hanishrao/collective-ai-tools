/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import { MobileNav } from './pattern-studio/MobileNav';
import { AlertModal, ConfirmModal, SaveModal } from './pattern-studio/modals';
import { PatternSidebar } from './pattern-studio/Sidebar';
import { SettingsModal } from './pattern-studio/SettingsModal';
import { usePatternStudio } from './pattern-studio/usePatternStudio';
import { Workbench } from './pattern-studio/Workbench';

export default function PatternStudio() {
  const { settings, library, run, modals, createNew } = usePatternStudio();

  return (
    <div className='min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row'>
      <MobileNav
        mobileTab={library.mobileTab}
        onChange={library.setMobileTab}
      />
      <PatternSidebar
        mobileTab={library.mobileTab}
        filterSource={library.filterSource}
        searchTerm={library.searchTerm}
        isLoading={library.isLoading}
        isError={library.isError}
        customPatterns={library.customPatterns}
        visibleCustomPatterns={library.visibleCustomPatterns}
        filteredPatterns={library.filteredPatterns}
        filteredStrategies={library.filteredStrategies}
        activeItem={library.activeItem}
        onFilterChange={library.setFilterSource}
        onSearchChange={library.setSearchTerm}
        onOpenSettings={() => settings.setIsSettingsOpen(true)}
        onCreateNew={createNew}
        onSelect={library.selectItem}
        onDelete={modals.deleteCustomPattern}
      />
      <Workbench
        mobileTab={library.mobileTab}
        isDragging={run.isDragging}
        userInput={run.userInput}
        onUserInputChange={run.setUserInput}
        onDragOver={run.handleDragOver}
        onDragLeave={run.handleDragLeave}
        onDrop={run.handleDrop}
        loadingContent={library.loadingContent}
        activeItem={library.activeItem}
        showOutput={run.showOutput}
        output={run.output}
        isRunning={run.isRunning}
        systemPrompt={library.systemPrompt}
        copied={run.copied}
        onHideOutput={() => run.setShowOutput(false)}
        onPipeOutput={run.pipeOutput}
        onRun={run.runPattern}
        onCopy={run.copyToClipboard}
        onSystemPromptChange={library.setSystemPrompt}
        onSave={modals.initSave}
      />
      <AlertModal
        open={modals.alertConfig.open}
        title={modals.alertConfig.title}
        message={modals.alertConfig.message}
        type={modals.alertConfig.type}
        onClose={modals.closeAlert}
      />
      <ConfirmModal
        open={modals.confirmConfig.open}
        title={modals.confirmConfig.title}
        message={modals.confirmConfig.message}
        onConfirm={modals.confirmConfig.onConfirm}
        onCancel={modals.closeConfirm}
      />
      <SaveModal
        open={modals.isSaveModalOpen}
        name={modals.newPatternName}
        isPublic={modals.isPublic}
        onNameChange={modals.setNewPatternName}
        onPublicChange={modals.setIsPublic}
        onSave={modals.confirmSavePattern}
        onClose={modals.closeSaveModal}
      />
      <SettingsModal
        open={settings.isSettingsOpen}
        provider={settings.llmProvider}
        apiKey={settings.apiKey}
        baseUrl={settings.baseUrl}
        modelName={settings.modelName}
        onProviderChange={settings.changeProvider}
        onApiKeyChange={settings.setApiKey}
        onBaseUrlChange={settings.setBaseUrl}
        onModelChange={settings.setModelName}
        onSave={settings.saveSettings}
        onClose={() => settings.setIsSettingsOpen(false)}
      />
    </div>
  );
}
