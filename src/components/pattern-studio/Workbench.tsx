import {
  ArrowRightCircle,
  BookOpen,
  Check,
  Copy,
  FileText,
  Play,
  RefreshCw,
  Save,
  Upload,
} from 'lucide-react';
import type { DragEvent } from 'react';
import { Button } from '../ui/button';
import type { FabricItem, MobileTab } from './types';

function InputPanel({
  mobileTab,
  isDragging,
  userInput,
  onUserInputChange,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  mobileTab: MobileTab;
  isDragging: boolean;
  userInput: string;
  onUserInputChange: (value: string) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}) {
  return (
    <div
      role='region'
      aria-label='File drop zone'
      className={`
                    flex-1 flex-col border-r border-border bg-background relative group transition-colors
                    ${isDragging ? 'bg-primary/5' : ''}
                    ${mobileTab === 'input' ? 'flex' : 'hidden md:flex'}
                `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className='p-3 border-b border-border flex items-center justify-between bg-muted/30'>
        <span className='text-xs font-mono font-medium text-muted-foreground flex items-center gap-2'>
          <div className='w-1.5 h-1.5 rounded-full bg-yellow-500'></div>{' '}
          INPUT_DATA
        </span>

        {isDragging && (
          <span className='text-xs text-blue-400 animate-pulse font-mono flex items-center gap-2'>
            <Upload className='w-3 h-3' /> DROP FILES HERE
          </span>
        )}
      </div>

      <div className='flex-1 relative'>
        <textarea
          className={`absolute inset-0 w-full h-full bg-transparent p-6 resize-none focus:outline-hidden font-mono text-sm text-foreground placeholder:text-muted-foreground/30 z-10 ${isDragging ? 'pointer-events-none' : ''}`}
          placeholder='Paste your content here (article, code, email)... or dragging files directly.'
          value={userInput}
          onChange={e => onUserInputChange(e.target.value)}
          spellCheck={false}
        />

        {!userInput && !isDragging && (
          <div className='absolute inset-0 flex items-center justify-center pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity'>
            <div className='text-gray-800 flex flex-col items-center gap-2'>
              <FileText className='w-12 h-12' />
              <span className='text-xs font-mono'>DROP FILES HERE</span>
            </div>
          </div>
        )}

        {isDragging && (
          <div className='absolute inset-0 flex items-center justify-center pointer-events-none bg-blue-500/5 z-0 border-2 border-blue-500/50 border-dashed m-4 rounded-lg'>
            <div className='text-blue-400 flex flex-col items-center gap-4'>
              <Upload className='w-12 h-12 animate-bounce' />
              <span className='text-sm font-bold tracking-widest'>
                RELEASE TO UPLOAD
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OutputToolbar({
  loadingContent,
  activeItem,
  showOutput,
  output,
  isRunning,
  systemPrompt,
  userInput,
  copied,
  onHideOutput,
  onPipeOutput,
  onRun,
  onCopy,
}: {
  loadingContent: boolean;
  activeItem: FabricItem | null;
  showOutput: boolean;
  output: string;
  isRunning: boolean;
  systemPrompt: string;
  userInput: string;
  copied: boolean;
  onHideOutput: () => void;
  onPipeOutput: () => void;
  onRun: () => void;
  onCopy: () => void;
}) {
  const label = loadingContent
    ? 'FETCHING...'
    : activeItem
      ? `PROMPT: ${activeItem.name.toUpperCase()}`
      : 'SELECT_PATTERN';

  return (
    <div className='p-3 border-b border-border flex items-center justify-between bg-muted/30'>
      <span className='text-xs font-mono font-medium text-muted-foreground flex items-center gap-2'>
        <div className='w-1.5 h-1.5 rounded-full bg-green-500'></div>
        {label}
        {showOutput && (
          <div className='ml-4 flex gap-2'>
            <button
              onClick={onHideOutput}
              className='px-2 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground text-[10px]'
            >
              Back
            </button>
            <span className='text-green-500'>OUTPUT</span>
          </div>
        )}
      </span>
      <div className='flex gap-2'>
        {showOutput && output && (
          <Button
            onClick={onPipeOutput}
            size='sm'
            className='h-7 text-xs gap-1 bg-secondary hover:bg-secondary/80 text-foreground border-none transition-all'
            title='Use Output as Next Input'
          >
            <ArrowRightCircle className='w-3 h-3' />{' '}
            <span className='hidden sm:inline'>Pipe to Input</span>
          </Button>
        )}
        <Button
          onClick={onRun}
          size='sm'
          className='h-7 text-xs gap-2 bg-green-600 hover:bg-green-500 text-white border-none shadow-xs transition-all'
          disabled={loadingContent || !systemPrompt || !userInput || isRunning}
        >
          {isRunning ? (
            <RefreshCw className='w-3 h-3 animate-spin' />
          ) : (
            <Play className='w-3 h-3 fill-current' />
          )}
          {isRunning ? 'RUNNING...' : 'RUN'}
        </Button>
        <Button
          onClick={onCopy}
          size='sm'
          className='h-7 text-xs gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-xs transition-all'
          disabled={loadingContent || !systemPrompt}
        >
          {copied ? (
            <Check className='w-3 h-3' />
          ) : (
            <Copy className='w-3 h-3' />
          )}
          {copied ? 'COPIED' : 'COPY'}
        </Button>
      </div>
    </div>
  );
}

function PromptEditor({
  systemPrompt,
  userInput,
  onSystemPromptChange,
  onSave,
}: {
  systemPrompt: string;
  userInput: string;
  onSystemPromptChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <>
      <div className='selection:bg-primary/20 selection:text-primary relative group/prompt'>
        <div className='flex items-center justify-between border-b border-border pb-2 mb-4'>
          <span className='text-muted-foreground select-none text-[10px] tracking-widest uppercase'>
            System Instructions
          </span>
          <Button
            onClick={onSave}
            variant='ghost'
            size='sm'
            className='h-5 text-[10px] text-muted-foreground hover:text-yellow-600 dark:hover:text-yellow-500 gap-1'
          >
            <Save className='w-3 h-3' /> Save to My Patterns
          </Button>
        </div>

        <textarea
          className='w-full bg-transparent resize-none focus:outline-hidden text-emerald-600 dark:text-emerald-500/90 h-[300px]'
          value={systemPrompt}
          onChange={e => onSystemPromptChange(e.target.value)}
          placeholder='Enter system instructions here...'
        />
      </div>

      <div className='mt-8 pt-8 border-t border-border border-dashed'>
        <span className='text-muted-foreground block mb-4 select-none text-[10px] tracking-widest uppercase'>
          User Context
        </span>
        <div className='whitespace-pre-wrap text-foreground'>
          {userInput || (
            <span className='text-muted-foreground/50 italic'>
              {'// Waiting for input...'}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

function OutputBody({
  loadingContent,
  showOutput,
  output,
  systemPrompt,
  userInput,
  onSystemPromptChange,
  onSave,
}: {
  loadingContent: boolean;
  showOutput: boolean;
  output: string;
  systemPrompt: string;
  userInput: string;
  onSystemPromptChange: (value: string) => void;
  onSave: () => void;
}) {
  if (loadingContent) {
    return (
      <div className='h-full flex items-center justify-center text-gray-600 gap-2'>
        <RefreshCw className='w-4 h-4 animate-spin' /> Fetching raw content...
      </div>
    );
  }

  if (showOutput) {
    return (
      <div className='h-full flex flex-col'>
        <div className='whitespace-pre-wrap text-emerald-600 dark:text-emerald-300 selection:bg-emerald-100 dark:selection:bg-emerald-900 leading-6'>
          {output || (
            <span className='text-muted-foreground/30 animate-pulse'>
              Waiting for stream...
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <PromptEditor
      systemPrompt={systemPrompt}
      userInput={userInput}
      onSystemPromptChange={onSystemPromptChange}
      onSave={onSave}
    />
  );
}

export function Workbench({
  mobileTab,
  isDragging,
  userInput,
  onUserInputChange,
  onDragOver,
  onDragLeave,
  onDrop,
  loadingContent,
  activeItem,
  showOutput,
  output,
  isRunning,
  systemPrompt,
  copied,
  onHideOutput,
  onPipeOutput,
  onRun,
  onCopy,
  onSystemPromptChange,
  onSave,
}: {
  mobileTab: MobileTab;
  isDragging: boolean;
  userInput: string;
  onUserInputChange: (value: string) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  loadingContent: boolean;
  activeItem: FabricItem | null;
  showOutput: boolean;
  output: string;
  isRunning: boolean;
  systemPrompt: string;
  copied: boolean;
  onHideOutput: () => void;
  onPipeOutput: () => void;
  onRun: () => void;
  onCopy: () => void;
  onSystemPromptChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <div
      className={`flex-1 flex flex-col h-[calc(100vh-50px)] md:h-screen overflow-hidden ${mobileTab === 'sidebar' ? 'hidden md:flex' : 'flex'}`}
    >
      <div className='md:hidden p-3 border-b border-border bg-card text-[10px] text-center text-muted-foreground'>
        {activeItem ? activeItem.name : 'No pattern selected'}
      </div>

      <div className='flex-1 flex flex-col md:flex-row overflow-hidden'>
        <InputPanel
          mobileTab={mobileTab}
          isDragging={isDragging}
          userInput={userInput}
          onUserInputChange={onUserInputChange}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />

        <div
          className={`flex-1 flex-col bg-background relative ${mobileTab === 'output' ? 'flex' : 'hidden md:flex'}`}
        >
          <OutputToolbar
            loadingContent={loadingContent}
            activeItem={activeItem}
            showOutput={showOutput}
            output={output}
            isRunning={isRunning}
            systemPrompt={systemPrompt}
            userInput={userInput}
            copied={copied}
            onHideOutput={onHideOutput}
            onPipeOutput={onPipeOutput}
            onRun={onRun}
            onCopy={onCopy}
          />

          <div className='flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-muted-foreground'>
            <OutputBody
              loadingContent={loadingContent}
              showOutput={showOutput}
              output={output}
              systemPrompt={systemPrompt}
              userInput={userInput}
              onSystemPromptChange={onSystemPromptChange}
              onSave={onSave}
            />
          </div>

          <div className='p-2 border-t border-border bg-muted/30 flex justify-center'>
            <div className='flex items-center text-[10px] text-muted-foreground'>
              <BookOpen className='w-3 h-3 mr-2' />
              {activeItem?.name || 'Select a pattern'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
