import type { FormEvent } from 'react';
import {
  CompatibleAgentsSection,
  CoreFields,
  DetailsGrid,
  ErrorBanner,
  McpSubtypeSection,
  ResourceTypeTabs,
  SubmitButton,
  TagsField,
} from './formSections';
import {
  getResourceFlags,
  type ActiveTab,
  type CategoryOption,
  type McpSubtype,
  type SubmitFormData,
} from './form';

type SubmitToolFormProps = {
  activeTab: ActiveTab;
  mcpSubtype: McpSubtype;
  data: SubmitFormData;
  loading: boolean;
  error: string;
  availableCategories: CategoryOption[];
  onTabChange: (tab: ActiveTab) => void;
  onMcpSubtypeChange: (subtype: McpSubtype) => void;
  onChange: <K extends keyof SubmitFormData>(
    key: K,
    value: SubmitFormData[K]
  ) => void;
  onToggleAgent: (agent: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export function SubmitToolForm({
  activeTab,
  mcpSubtype,
  data,
  loading,
  error,
  availableCategories,
  onTabChange,
  onMcpSubtypeChange,
  onChange,
  onToggleAgent,
  onSubmit,
}: SubmitToolFormProps) {
  const flags = getResourceFlags(activeTab, mcpSubtype);

  return (
    <div className='max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Submit a Resource
        </h1>
        <p className='mt-2 text-gray-600 dark:text-gray-400'>
          Share a new AI tool, MCP resource, or Agent Skill with the community.
        </p>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden'>
        <ResourceTypeTabs activeTab={activeTab} onChange={onTabChange} />

        <form onSubmit={onSubmit} className='p-6 space-y-6'>
          <ErrorBanner message={error} />
          <McpSubtypeSection
            isMcp={flags.isMcp}
            value={mcpSubtype}
            onChange={onMcpSubtypeChange}
          />
          <CoreFields data={data} flags={flags} onChange={onChange} />
          <DetailsGrid
            data={data}
            flags={flags}
            availableCategories={availableCategories}
            onChange={onChange}
          />
          <CompatibleAgentsSection
            isSkill={flags.isSkill}
            selected={data.compatibleAgents}
            onToggle={onToggleAgent}
          />
          <TagsField
            value={data.tags}
            onChange={tags => onChange('tags', tags)}
          />
          <SubmitButton loading={loading} />
        </form>
      </div>
    </div>
  );
}
