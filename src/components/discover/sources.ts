import type { AITool, MCPServer } from '@/lib/api';
import type { DiscoverItem, DiscoverType } from './types';

type McpRaw = MCPServer;
interface PromptRaw {
  _id: string;
  title: string;
  description?: string;
  content: string;
  tags?: string[];
  source?: string;
}
interface SkillRaw {
  id: string;
  name: string;
  description: string;
  repo: string;
  tags?: string[];
  category?: string;
  stars?: number;
  isOfficial?: boolean;
}
interface RepoRaw {
  title: string;
  link: string;
  description: string;
  language?: string;
  stars?: string;
}
interface ListResponse<T> {
  data?: T[];
  pagination?: { total?: number };
}
interface PromptListResponse {
  prompts?: PromptRaw[];
  total?: number;
}

function clean(text?: string): string {
  return (text ?? '').replace(/`/g, '').replace(/\s+/g, ' ').trim();
}

export function adaptTool(t: AITool): DiscoverItem {
  return {
    id: t._id,
    type: 'tool',
    title: t.name,
    subtitle: clean(t.description),
    tags: t.tags ?? [],
    href: t.url,
    external: true,
    meta: t.pricing?.[0]?.name ?? t.category?.name,
  };
}

export function adaptMcp(m: McpRaw): DiscoverItem {
  const slug = m.id ?? m._id;
  return {
    id: slug,
    type: 'mcp',
    title: m.name,
    subtitle: clean(m.description),
    tags: m.tags ?? [],
    href: `/mcp-catalog/${slug}`,
    external: false,
    meta: m.stars ? `★ ${m.stars}` : undefined,
    ...(m.isOfficial ? { verified: true } : {}),
  };
}

export function adaptPrompt(p: PromptRaw): DiscoverItem {
  const curated = p.source === 'anthropic' || p.source === 'fabric';
  return {
    id: p._id,
    type: 'prompt',
    title: p.title,
    subtitle: clean(p.description ?? p.content?.slice(0, 120)),
    tags: p.tags ?? [],
    href: '/prompts',
    external: false,
    meta: p.source,
    ...(curated ? { verified: true } : {}),
  };
}

export function adaptSkill(s: SkillRaw): DiscoverItem {
  return {
    id: s.id,
    type: 'skill',
    title: s.name,
    subtitle: clean(s.description),
    tags: s.tags ?? [],
    href: s.repo,
    external: true,
    meta: s.category,
    ...(s.isOfficial ? { verified: true } : {}),
  };
}

export function adaptRepo(r: RepoRaw): DiscoverItem {
  return {
    id: r.link,
    type: 'repo',
    title: r.title,
    subtitle: clean(r.description),
    tags: r.language && r.language !== 'Unknown' ? [r.language] : [],
    href: r.link,
    external: true,
    meta: r.stars && r.stars !== '0' ? `★ ${r.stars}` : undefined,
  };
}

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

const SEARCH_LIMIT = 5;
const BROWSE_LIMIT = 12;
const enc = encodeURIComponent;

export type SortKey = 'popular' | 'newest';

export interface BrowseResult {
  items: DiscoverItem[];
  /** Total available in this category (not just the previewed page). */
  total: number;
}

export interface Source {
  type: DiscoverType;
  label: string;
  seeAllHref: string;
  searchItems(query: string, signal: AbortSignal): Promise<DiscoverItem[]>;
  browseItems(signal: AbortSignal, sort: SortKey): Promise<BrowseResult>;
}

export const SOURCES: Source[] = [
  {
    type: 'tool',
    label: 'Tools',
    seeAllHref: '/tools',
    async searchItems(q, signal) {
      const j = await getJson<ListResponse<AITool>>(
        `/api/ai-tools?limit=${SEARCH_LIMIT}&search=${enc(q)}`,
        signal
      );
      return (j.data ?? []).map(adaptTool);
    },
    async browseItems(signal, sort) {
      const s = sort === 'newest' ? 'newest' : 'popular';
      const j = await getJson<ListResponse<AITool>>(
        `/api/ai-tools?limit=${BROWSE_LIMIT}&sort=${s}`,
        signal
      );
      const items = (j.data ?? []).map(adaptTool);
      return { items, total: j.pagination?.total ?? items.length };
    },
  },
  {
    type: 'mcp',
    label: 'MCP Servers',
    seeAllHref: '/mcp-catalog',
    async searchItems(q, signal) {
      const j = await getJson<ListResponse<McpRaw>>(
        `/api/mcp?limit=${SEARCH_LIMIT}&search=${enc(q)}`,
        signal
      );
      return (j.data ?? []).map(adaptMcp);
    },
    async browseItems(signal, sort) {
      const s = sort === 'newest' ? 'newest' : 'popular';
      const j = await getJson<ListResponse<McpRaw>>(
        `/api/mcp?limit=${BROWSE_LIMIT}&sort=${s}`,
        signal
      );
      const items = (j.data ?? []).map(adaptMcp);
      return { items, total: j.pagination?.total ?? items.length };
    },
  },
  {
    type: 'prompt',
    label: 'Prompts',
    seeAllHref: '/prompts',
    async searchItems(q, signal) {
      const j = await getJson<PromptListResponse>(
        `/api/prompts?limit=${SEARCH_LIMIT}&search=${enc(q)}`,
        signal
      );
      return (j.prompts ?? []).map(adaptPrompt);
    },
    async browseItems(signal, sort) {
      const s = sort === 'newest' ? 'newest' : 'rating';
      const j = await getJson<PromptListResponse>(
        `/api/prompts?limit=${BROWSE_LIMIT}&sort=${s}`,
        signal
      );
      const items = (j.prompts ?? []).map(adaptPrompt);
      return { items, total: j.total ?? items.length };
    },
  },
  {
    type: 'skill',
    label: 'Skills',
    seeAllHref: '/skills',
    async searchItems(q, signal) {
      const j = await getJson<ListResponse<SkillRaw>>(
        `/api/skills?q=${enc(q)}`,
        signal
      );
      return (j.data ?? []).slice(0, SEARCH_LIMIT).map(adaptSkill);
    },
    async browseItems(signal) {
      const j = await getJson<ListResponse<SkillRaw>>('/api/skills', signal);
      const all = (j.data ?? []).map(adaptSkill);
      return { items: all.slice(0, BROWSE_LIMIT), total: all.length };
    },
  },
  {
    type: 'repo',
    label: 'Trending Repos',
    seeAllHref: '/trending',
    async searchItems(q, signal) {
      const j = await getJson<ListResponse<RepoRaw>>(
        '/api/trending-repos',
        signal
      );
      const ql = q.toLowerCase();
      return (j.data ?? [])
        .map(adaptRepo)
        .filter(
          (i: DiscoverItem) =>
            i.title.toLowerCase().includes(ql) ||
            i.subtitle.toLowerCase().includes(ql)
        )
        .slice(0, SEARCH_LIMIT);
    },
    async browseItems(signal) {
      const j = await getJson<ListResponse<RepoRaw>>(
        '/api/trending-repos',
        signal
      );
      const all = (j.data ?? []).map(adaptRepo);
      return { items: all.slice(0, BROWSE_LIMIT), total: all.length };
    },
  },
];
