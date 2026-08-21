import { FileText, Layers, Menu, SquareTerminal } from 'lucide-react';
import type { MobileTab } from './types';

const TABS: { id: MobileTab; icon: typeof Menu; title: string }[] = [
  { id: 'sidebar', icon: Menu, title: 'Patterns' },
  { id: 'input', icon: FileText, title: 'Input' },
  { id: 'output', icon: SquareTerminal, title: 'Output/Run' },
];

export function MobileNav({
  mobileTab,
  onChange,
}: {
  mobileTab: MobileTab;
  onChange: (tab: MobileTab) => void;
}) {
  return (
    <div className='md:hidden flex items-center justify-between p-2 border-b border-border bg-card'>
      <div className='font-bold tracking-tight px-2 flex items-center gap-2'>
        <Layers className='w-4 h-4 text-blue-500' /> Prompt Studio
      </div>
      <div className='flex bg-secondary rounded p-1'>
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`p-1.5 rounded ${mobileTab === tab.id ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'}`}
              title={tab.title}
            >
              <Icon className='w-4 h-4' />
            </button>
          );
        })}
      </div>
    </div>
  );
}
