import {
  BrainCircuit,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
} from 'lucide-react';
import type { MouseEvent } from 'react';
import { Button } from '../ui/button';
import { customPatternItem, isAnthropicPath } from './helpers';
import { FILTER_SOURCES, type FabricItem, type FabricPattern } from './types';

function SidebarHeader({
  filterSource,
  searchTerm,
  onFilterChange,
  onSearchChange,
  onOpenSettings,
  onCreateNew,
}: {
  filterSource: string;
  searchTerm: string;
  onFilterChange: (source: (typeof FILTER_SOURCES)[number]) => void;
  onSearchChange: (value: string) => void;
  onOpenSettings: () => void;
  onCreateNew: () => void;
}) {
  return (
    <div className='p-6 border-b border-border'>
      <h1 className='text-xl font-bold text-foreground tracking-tight flex items-center justify-between'>
        <span className='hidden md:block'>Prompt Studio</span>
        <span className='md:hidden'>Studio</span>
        <div className='flex gap-1'>
          <Button
            onClick={onOpenSettings}
            size='icon'
            variant='ghost'
            className='h-6 w-6 text-muted-foreground hover:text-foreground'
            title='Settings'
          >
            <Settings className='w-3.5 h-3.5' />
          </Button>
          <Button
            onClick={onCreateNew}
            size='icon'
            variant='ghost'
            className='h-6 w-6 text-muted-foreground hover:text-foreground'
            title='New Pattern'
          >
            <Plus className='w-4 h-4' />
          </Button>
        </div>
      </h1>

      <div className='flex bg-secondary p-1 rounded-lg mt-4 gap-1'>
        {FILTER_SOURCES.map(f => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`flex-1 text-[10px] uppercase tracking-wider font-bold py-1.5 rounded-md transition-colors ${filterSource === f ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className='relative mt-4'>
        <Search className='absolute left-3 top-2.5 w-4 h-4 text-muted-foreground' />
        <input
          className='w-full bg-muted/30 border border-border rounded-md py-2 pl-9 pr-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary transition-all'
          placeholder='Search patterns...'
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function CustomPatternList({
  allCount,
  items,
  activeName,
  onSelect,
  onDelete,
}: {
  allCount: number;
  items: FabricPattern[];
  activeName?: string;
  onSelect: (item: FabricItem) => void;
  onDelete: (e: MouseEvent, id: string) => void;
}) {
  if (allCount === 0) return null;

  return (
    <div className='mb-4'>
      <div className='px-3 py-2 text-[10px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2'>
        <Layers className='w-3 h-3' /> My Patterns ({allCount})
      </div>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(customPatternItem(item.id))}
          className={`
            w-full text-left px-3 py-2 rounded-md mb-0.5 transition-all duration-150 flex items-center justify-between group
            ${activeName === item.id ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-200' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
          `}
        >
          <span className='font-mono text-xs truncate w-full'>
            {item.title}
          </span>
          <div className='flex items-center gap-2'>
            {activeName === item.id && (
              <div className='w-1.5 h-1.5 rounded-full bg-yellow-500' />
            )}
            <Trash2
              onClick={e => onDelete(e, item.id)}
              className='w-6 h-6 p-1.5 shrink-0 cursor-pointer text-gray-600 hover:text-red-500 opacity-60 hover:opacity-100 group-hover:opacity-100 transition-opacity'
            />
          </div>
        </button>
      ))}
    </div>
  );
}

function PatternList({
  items,
  activePath,
  onSelect,
}: {
  items: FabricItem[];
  activePath?: string;
  onSelect: (item: FabricItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className='mb-4'>
      <div className='px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2'>
        <Layers className='w-3 h-3' /> Patterns ({items.length})
      </div>
      {items.map(item => (
        <button
          key={item.path}
          onClick={() => onSelect(item)}
          className={`
            w-full text-left px-3 py-2 rounded-md mb-0.5 transition-all duration-150 flex items-center justify-between group
            ${activePath === item.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
          `}
        >
          <span className='font-mono text-xs truncate w-full flex items-center gap-2'>
            {isAnthropicPath(item.path) ? (
              <span className='text-[9px] px-1 rounded bg-orange-900/40 text-orange-400 border border-orange-900/50'>
                CLA.
              </span>
            ) : (
              <span className='text-[9px] px-1 rounded bg-blue-900/40 text-blue-400 border border-blue-900/50'>
                FAB.
              </span>
            )}
            {item.name}
          </span>
          {activePath === item.path && (
            <div className='w-1.5 h-1.5 rounded-full bg-blue-500' />
          )}
        </button>
      ))}
    </div>
  );
}

function StrategyList({
  items,
  activePath,
  onSelect,
}: {
  items: FabricItem[];
  activePath?: string;
  onSelect: (item: FabricItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className='mb-4'>
      <div className='px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2'>
        <BrainCircuit className='w-3 h-3' /> Strategies ({items.length})
      </div>
      {items.map(item => (
        <button
          key={item.path}
          onClick={() => onSelect(item)}
          className={`
             w-full text-left px-3 py-2 rounded-md mb-0.5 transition-all duration-150 flex items-center justify-between group
             ${activePath === item.path ? 'bg-purple-500/10 text-purple-600 dark:text-purple-200' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
          `}
        >
          <span className='font-mono text-xs truncate w-full'>
            {item.name.replace('.json', '')}
          </span>
          {activePath === item.path && (
            <div className='w-1.5 h-1.5 rounded-full bg-purple-500' />
          )}
        </button>
      ))}
    </div>
  );
}

function LibraryBody({
  isLoading,
  customCount,
  visibleCustomPatterns,
  filteredPatterns,
  filteredStrategies,
  activeItem,
  onSelect,
  onDelete,
}: {
  isLoading: boolean;
  customCount: number;
  visibleCustomPatterns: FabricPattern[];
  filteredPatterns: FabricItem[];
  filteredStrategies: FabricItem[];
  activeItem: FabricItem | null;
  onSelect: (item: FabricItem) => void;
  onDelete: (e: MouseEvent, id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className='p-8 text-center text-muted-foreground text-xs flex flex-col items-center gap-2'>
        <RefreshCw className='w-4 h-4 animate-spin' />
        Loading library...
      </div>
    );
  }

  return (
    <>
      <CustomPatternList
        allCount={customCount}
        items={visibleCustomPatterns}
        activeName={activeItem?.name}
        onSelect={onSelect}
        onDelete={onDelete}
      />
      <PatternList
        items={filteredPatterns}
        activePath={activeItem?.path}
        onSelect={onSelect}
      />
      <StrategyList
        items={filteredStrategies}
        activePath={activeItem?.path}
        onSelect={onSelect}
      />
      {filteredPatterns.length === 0 && filteredStrategies.length === 0 && (
        <div className='p-4 text-center text-xs text-gray-600'>
          No matches found.
        </div>
      )}
    </>
  );
}

export function PatternSidebar({
  mobileTab,
  filterSource,
  searchTerm,
  isLoading,
  isError,
  customPatterns,
  visibleCustomPatterns,
  filteredPatterns,
  filteredStrategies,
  activeItem,
  onFilterChange,
  onSearchChange,
  onOpenSettings,
  onCreateNew,
  onSelect,
  onDelete,
}: {
  mobileTab: string;
  filterSource: (typeof FILTER_SOURCES)[number];
  searchTerm: string;
  isLoading: boolean;
  isError: boolean;
  customPatterns: FabricPattern[];
  visibleCustomPatterns: FabricPattern[];
  filteredPatterns: FabricItem[];
  filteredStrategies: FabricItem[];
  activeItem: FabricItem | null;
  onFilterChange: (source: (typeof FILTER_SOURCES)[number]) => void;
  onSearchChange: (value: string) => void;
  onOpenSettings: () => void;
  onCreateNew: () => void;
  onSelect: (item: FabricItem) => void;
  onDelete: (e: MouseEvent, id: string) => void;
}) {
  return (
    <div
      className={`
          w-full md:w-80 border-r border-border bg-card flex-col h-[calc(100vh-50px)] md:h-screen sticky top-0
          ${mobileTab === 'sidebar' ? 'flex' : 'hidden md:flex'}
      `}
    >
      <SidebarHeader
        filterSource={filterSource}
        searchTerm={searchTerm}
        onFilterChange={onFilterChange}
        onSearchChange={onSearchChange}
        onOpenSettings={onOpenSettings}
        onCreateNew={onCreateNew}
      />

      <div className='flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border'>
        <LibraryBody
          isLoading={isLoading}
          customCount={customPatterns.length}
          visibleCustomPatterns={visibleCustomPatterns}
          filteredPatterns={filteredPatterns}
          filteredStrategies={filteredStrategies}
          activeItem={activeItem}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </div>

      {isError && (
        <div className='px-4 py-2 bg-destructive/10 border-t border-destructive/20 text-[10px] text-destructive text-center'>
          GitHub Rate Limit Reached.
          <br />
          Using offline backup.
        </div>
      )}

      <div className='p-3 border-t border-border text-[10px] text-muted-foreground font-mono text-center'>
        POWERED BY GITHUB/DANIELMIESSLER
      </div>
    </div>
  );
}
