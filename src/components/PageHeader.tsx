import React from 'react';
import { LucideIcon } from 'lucide-react';

// Shared category-accent palette, matching Discover's TYPE_ACCENT so the
// same content type (tools, MCP, prompts, skills, repos) reads as the same
// color everywhere in the app.
const ACCENTS = {
  blue: 'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  rose: 'text-rose-600 dark:text-rose-400',
  violet: 'text-violet-600 dark:text-violet-400',
  amber: 'text-amber-600 dark:text-amber-400',
} as const;

type Accent = keyof typeof ACCENTS;

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: Accent;
  titleRef?: React.RefObject<HTMLHeadingElement>;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  accent = 'blue',
  titleRef,
}) => {
  const accentClass = ACCENTS[accent];
  return (
    <div className='text-center mb-10 sm:mb-12'>
      <div className='flex items-center justify-center gap-3 mb-4'>
        <Icon className={`h-8 w-8 shrink-0 ${accentClass}`} />
        <h1
          ref={titleRef}
          className={`text-3xl md:text-4xl font-bold text-gray-900 dark:text-white`}
        >
          {title}
        </h1>
      </div>
      <p className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4'>
        {description}
      </p>
    </div>
  );
};

export default PageHeader;
