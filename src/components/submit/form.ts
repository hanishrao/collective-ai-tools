export type ActiveTab = 'mcp' | 'tool' | 'skill';
export type McpSubtype = 'server' | 'client';

export interface SubmitFormData {
  name: string;
  description: string;
  url: string;
  categories: string[];
  pricing: string;
  tags: string;
  location: string;
  author: string;
  installCommand: string;
  compatibleAgents: string[];
  skillCategory: string;
}

export interface CategoryOption {
  _id: string;
  name: string;
}

export interface ResourceFlags {
  isMcp: boolean;
  isMcpServer: boolean;
  isMcpClient: boolean;
  isTool: boolean;
  isSkill: boolean;
}

export const AGENTS = [
  'Claude Code',
  'OpenCode',
  'Cursor',
  'Copilot',
  'GPT',
  'Hermes Agent',
  'Windsurf',
  'Kiro',
  'Gemini CLI',
  'Codex',
  'Copilot CLI',
  'Standalone',
] as const;

export const SKILL_CATEGORIES = [
  { value: 'coding', label: 'Coding' },
  { value: 'security', label: 'Security' },
  { value: 'design', label: 'Design' },
  { value: 'automation', label: 'Automation' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'performance', label: 'Performance' },
];

export const LOCATION_OPTIONS = [
  { value: 'Remote', label: 'Remote' },
  { value: 'Local', label: 'Local' },
];

export const PRICING_OPTIONS = [
  { value: '', label: 'Select pricing' },
  { value: 'Free', label: 'Free' },
  { value: 'Freemium', label: 'Freemium' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Trial', label: 'Free Trial' },
];

export const FIELD_INPUT_CLASS =
  'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500';

export const LABEL_CLASS =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

export const INSTALL_INPUT_CLASS =
  'w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500';

export const SELECT_BUTTON_CLASS =
  'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700';

export function createEmptyForm(): SubmitFormData {
  return {
    name: '',
    description: '',
    url: '',
    categories: [],
    pricing: '',
    tags: '',
    location: 'Remote',
    author: '',
    installCommand: '',
    compatibleAgents: [],
    skillCategory: 'coding',
  };
}

export function getResourceFlags(
  activeTab: ActiveTab,
  mcpSubtype: McpSubtype
): ResourceFlags {
  const isMcp = activeTab === 'mcp';
  return {
    isMcp,
    isMcpServer: isMcp && mcpSubtype === 'server',
    isMcpClient: isMcp && mcpSubtype === 'client',
    isTool: activeTab === 'tool',
    isSkill: activeTab === 'skill',
  };
}

export function namePlaceholder(flags: ResourceFlags): string {
  if (flags.isMcpServer) return 'PostgreSQL MCP Server';
  if (flags.isMcpClient) return 'Claude Desktop';
  if (flags.isSkill) return 'Tailwind CSS Patterns';
  return 'ChatGPT';
}

export function urlLabel(flags: ResourceFlags): string {
  if (flags.isMcpServer || flags.isSkill) return 'Repository URL';
  if (flags.isMcpClient) return 'Download/Repo URL';
  return 'Website URL';
}

export function mcpHelpText(subtype: McpSubtype): string {
  if (subtype === 'server') {
    return 'A server that provides context or capabilities to an AI model.';
  }
  return 'An application (like Claude Desktop) that connects to MCP servers.';
}

export function parseTags(tags: string): string[] {
  return tags
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

export function getResourceType(
  activeTab: ActiveTab,
  mcpSubtype: McpSubtype
): string {
  if (activeTab === 'mcp') {
    return mcpSubtype === 'server' ? 'mcp' : 'client';
  }
  return 'tool';
}

export function filterCategories(
  categories: CategoryOption[],
  search: string,
  selectedIds: string[]
): CategoryOption[] {
  const query = search.toLowerCase();
  return categories.filter(
    cat =>
      cat.name.toLowerCase().includes(query) && !selectedIds.includes(cat._id)
  );
}

export class SubmitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubmitValidationError';
  }
}

export function buildSkillPayload(data: SubmitFormData) {
  return {
    name: data.name,
    description: data.description,
    author: data.author,
    repo: data.url,
    installCommand: data.installCommand,
    category: data.skillCategory,
    compatibleAgents: data.compatibleAgents,
    tags: parseTags(data.tags),
  };
}

export function buildResourcePayload(
  data: SubmitFormData,
  activeTab: ActiveTab,
  mcpSubtype: McpSubtype
) {
  return {
    type: getResourceType(activeTab, mcpSubtype),
    data: {
      ...data,
      tags: parseTags(data.tags),
    },
  };
}

async function parseErrorMessage(res: Response): Promise<string> {
  const errData = (await res.json().catch(() => ({}))) as {
    error?: string;
  };
  return errData.error || 'Submission failed';
}

function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function submitResource(
  data: SubmitFormData,
  activeTab: ActiveTab,
  mcpSubtype: McpSubtype
): Promise<void> {
  let res: Response;

  if (activeTab === 'skill') {
    if (data.compatibleAgents.length === 0) {
      throw new SubmitValidationError('Select at least one compatible agent.');
    }
    res = await postJson('/api/skills', buildSkillPayload(data));
  } else {
    res = await postJson(
      '/api/submissions',
      buildResourcePayload(data, activeTab, mcpSubtype)
    );
  }

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
}
