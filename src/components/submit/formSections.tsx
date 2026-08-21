import type { ReactNode } from 'react';
import { Code, Loader2, Puzzle, Terminal, Wrench } from 'lucide-react';
import { Select } from '../ui/select';
import { CategoryPicker } from './CategoryPicker';
import {
  AGENTS,
  FIELD_INPUT_CLASS,
  INSTALL_INPUT_CLASS,
  LABEL_CLASS,
  LOCATION_OPTIONS,
  PRICING_OPTIONS,
  SELECT_BUTTON_CLASS,
  SKILL_CATEGORIES,
  mcpHelpText,
  namePlaceholder,
  urlLabel,
  type ActiveTab,
  type CategoryOption,
  type McpSubtype,
  type ResourceFlags,
  type SubmitFormData,
} from './form';

const TABS: {
  id: ActiveTab;
  label: string;
  icon: typeof Wrench;
}[] = [
  { id: 'tool', label: 'AI Tool', icon: Wrench },
  { id: 'mcp', label: 'MCP Resource', icon: Code },
  { id: 'skill', label: 'Agent Skill', icon: Puzzle },
];

function tabClass(isActive: boolean): string {
  const base =
    'flex-1 py-4 text-center font-medium flex items-center justify-center gap-2 transition-colors';
  if (isActive) {
    return `${base} bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600`;
  }
  return `${base} text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200`;
}

function subtypeClass(isActive: boolean): string {
  const base =
    'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all';
  if (isActive) {
    return `${base} bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-gray-200 dark:ring-gray-700`;
  }
  return `${base} text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`;
}

function agentClass(isSelected: boolean): string {
  const base = 'px-3 py-1.5 rounded-full text-xs font-medium transition-colors';
  if (isSelected) {
    return `${base} bg-blue-600 text-white`;
  }
  return `${base} bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600`;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      {children}
    </div>
  );
}

export function ResourceTypeTabs({
  activeTab,
  onChange,
}: {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}) {
  return (
    <div className='flex border-b border-gray-200 dark:border-gray-700'>
      {TABS.map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={tabClass(activeTab === tab.id)}
          >
            <Icon className='h-5 w-5' />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className='p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg'>
      {message}
    </div>
  );
}

export function McpSubtypeSection({
  isMcp,
  value,
  onChange,
}: {
  isMcp: boolean;
  value: McpSubtype;
  onChange: (subtype: McpSubtype) => void;
}) {
  if (!isMcp) return null;

  return (
    <div>
      <label className={LABEL_CLASS}>Resource Type</label>
      <div className='bg-gray-50 dark:bg-gray-900/50 p-1 rounded-lg inline-flex relative w-full border border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={() => onChange('server')}
          className={subtypeClass(value === 'server')}
        >
          <Code className='h-4 w-4' />
          MCP Server
        </button>
        <button
          type='button'
          onClick={() => onChange('client')}
          className={subtypeClass(value === 'client')}
        >
          <Terminal className='h-4 w-4' />
          MCP Client
        </button>
      </div>
      <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
        {mcpHelpText(value)}
      </p>
    </div>
  );
}

type FieldChange = <K extends keyof SubmitFormData>(
  key: K,
  value: SubmitFormData[K]
) => void;

function AuthorField({
  isSkill,
  value,
  onChange,
}: {
  isSkill: boolean;
  value: string;
  onChange: FieldChange;
}) {
  if (!isSkill) return null;

  return (
    <Field label='Author'>
      <input
        type='text'
        required
        value={value}
        onChange={e => onChange('author', e.target.value)}
        className={FIELD_INPUT_CLASS}
        placeholder='Your name or org'
      />
    </Field>
  );
}

function InstallCommandField({
  isSkill,
  value,
  onChange,
}: {
  isSkill: boolean;
  value: string;
  onChange: FieldChange;
}) {
  if (!isSkill) return null;

  return (
    <Field label='Install Command'>
      <input
        type='text'
        required
        value={value}
        onChange={e => onChange('installCommand', e.target.value)}
        placeholder='e.g. git clone https://github.com/user/repo.git ~/.claude/skills/'
        className={INSTALL_INPUT_CLASS}
      />
    </Field>
  );
}

export function CoreFields({
  data,
  flags,
  onChange,
}: {
  data: SubmitFormData;
  flags: ResourceFlags;
  onChange: FieldChange;
}) {
  return (
    <>
      <Field label='Name'>
        <input
          type='text'
          required
          value={data.name}
          onChange={e => onChange('name', e.target.value)}
          className={FIELD_INPUT_CLASS}
          placeholder={`e.g. ${namePlaceholder(flags)}`}
        />
      </Field>

      <Field label='Description'>
        <textarea
          required
          value={data.description}
          onChange={e => onChange('description', e.target.value)}
          rows={4}
          className={FIELD_INPUT_CLASS}
          placeholder='Briefly describe what it does...'
        />
      </Field>

      <AuthorField
        isSkill={flags.isSkill}
        value={data.author}
        onChange={onChange}
      />

      <Field label={urlLabel(flags)}>
        <input
          type='url'
          required
          value={data.url}
          onChange={e => onChange('url', e.target.value)}
          className={FIELD_INPUT_CLASS}
          placeholder='https://...'
        />
      </Field>

      <InstallCommandField
        isSkill={flags.isSkill}
        value={data.installCommand}
        onChange={onChange}
      />
    </>
  );
}

function SkillCategoryField({
  isSkill,
  value,
  onChange,
}: {
  isSkill: boolean;
  value: string;
  onChange: FieldChange;
}) {
  if (!isSkill) return null;

  return (
    <Field label='Category'>
      <Select
        value={value}
        onChange={val => onChange('skillCategory', val)}
        options={SKILL_CATEGORIES.map(c => ({
          value: c.value,
          label: c.label,
        }))}
        buttonClassName={SELECT_BUTTON_CLASS}
      />
    </Field>
  );
}

function LocationField({
  isMcp,
  value,
  onChange,
}: {
  isMcp: boolean;
  value: string;
  onChange: FieldChange;
}) {
  if (!isMcp) return null;

  return (
    <Field label='Location'>
      <Select
        value={value}
        onChange={val => onChange('location', val)}
        options={LOCATION_OPTIONS}
        buttonClassName={SELECT_BUTTON_CLASS}
      />
    </Field>
  );
}

function PricingField({
  isTool,
  value,
  onChange,
}: {
  isTool: boolean;
  value: string;
  onChange: FieldChange;
}) {
  if (!isTool) return null;

  return (
    <Field label='Pricing'>
      <Select
        value={value}
        onChange={val => onChange('pricing', val)}
        options={PRICING_OPTIONS}
        buttonClassName={SELECT_BUTTON_CLASS}
      />
    </Field>
  );
}

function CategoriesField({
  isSkill,
  selectedIds,
  available,
  onChange,
}: {
  isSkill: boolean;
  selectedIds: string[];
  available: CategoryOption[];
  onChange: FieldChange;
}) {
  if (isSkill) return null;

  return (
    <CategoryPicker
      selectedIds={selectedIds}
      available={available}
      onChange={categories => onChange('categories', categories)}
    />
  );
}

export function DetailsGrid({
  data,
  flags,
  availableCategories,
  onChange,
}: {
  data: SubmitFormData;
  flags: ResourceFlags;
  availableCategories: CategoryOption[];
  onChange: FieldChange;
}) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <CategoriesField
        isSkill={flags.isSkill}
        selectedIds={data.categories}
        available={availableCategories}
        onChange={onChange}
      />
      <SkillCategoryField
        isSkill={flags.isSkill}
        value={data.skillCategory}
        onChange={onChange}
      />
      <LocationField
        isMcp={flags.isMcp}
        value={data.location}
        onChange={onChange}
      />
      <PricingField
        isTool={flags.isTool}
        value={data.pricing}
        onChange={onChange}
      />
    </div>
  );
}

export function CompatibleAgentsSection({
  isSkill,
  selected,
  onToggle,
}: {
  isSkill: boolean;
  selected: string[];
  onToggle: (agent: string) => void;
}) {
  if (!isSkill) return null;

  return (
    <div>
      <label className={LABEL_CLASS}>Compatible Agents</label>
      <div className='flex flex-wrap gap-2'>
        {AGENTS.map(agent => (
          <button
            type='button'
            key={agent}
            onClick={() => onToggle(agent)}
            className={agentClass(selected.includes(agent))}
          >
            {agent}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TagsField({
  value,
  onChange,
}: {
  value: string;
  onChange: (tags: string) => void;
}) {
  return (
    <Field label='Tags'>
      <input
        type='text'
        value={value}
        onChange={e => onChange(e.target.value)}
        className={FIELD_INPUT_CLASS}
        placeholder='Comma separated tags (e.g. free, open source)'
      />
    </Field>
  );
}

export function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <div className='pt-4'>
      <button
        type='submit'
        disabled={loading}
        className='w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2'
      >
        {loading ? (
          <Loader2 className='h-5 w-5 animate-spin' />
        ) : (
          'Submit Resource'
        )}
      </button>
    </div>
  );
}
