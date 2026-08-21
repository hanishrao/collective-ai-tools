import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildResourcePayload,
  buildSkillPayload,
  createEmptyForm,
  filterCategories,
  getResourceFlags,
  getResourceType,
  namePlaceholder,
  parseTags,
  submitResource,
  SubmitValidationError,
  urlLabel,
} from './form';

const fetchMock = vi.mocked(global.fetch);

function form(overrides: Partial<ReturnType<typeof createEmptyForm>> = {}) {
  return { ...createEmptyForm(), ...overrides };
}

describe('submit form helpers', () => {
  describe('parseTags', () => {
    it('splits, trims, and drops empty tags', () => {
      expect(parseTags('free, open source, ,paid')).toEqual([
        'free',
        'open source',
        'paid',
      ]);
    });

    it('returns an empty list for a blank string', () => {
      expect(parseTags('')).toEqual([]);
    });
  });

  describe('getResourceType', () => {
    it('maps tabs and MCP subtypes to API types', () => {
      expect(getResourceType('tool', 'server')).toBe('tool');
      expect(getResourceType('mcp', 'server')).toBe('mcp');
      expect(getResourceType('mcp', 'client')).toBe('client');
    });
  });

  describe('placeholders and labels', () => {
    it('uses the tool defaults', () => {
      const flags = getResourceFlags('tool', 'server');
      expect(namePlaceholder(flags)).toBe('ChatGPT');
      expect(urlLabel(flags)).toBe('Website URL');
    });

    it('uses MCP server copy', () => {
      const flags = getResourceFlags('mcp', 'server');
      expect(namePlaceholder(flags)).toBe('PostgreSQL MCP Server');
      expect(urlLabel(flags)).toBe('Repository URL');
    });

    it('uses MCP client copy', () => {
      const flags = getResourceFlags('mcp', 'client');
      expect(namePlaceholder(flags)).toBe('Claude Desktop');
      expect(urlLabel(flags)).toBe('Download/Repo URL');
    });

    it('uses skill copy', () => {
      const flags = getResourceFlags('skill', 'server');
      expect(namePlaceholder(flags)).toBe('Tailwind CSS Patterns');
      expect(urlLabel(flags)).toBe('Repository URL');
    });
  });

  describe('filterCategories', () => {
    const categories = [
      { _id: 'dev', name: 'Developer Tools' },
      { _id: 'write', name: 'Writing' },
    ];

    it('filters by search and already-selected ids', () => {
      expect(filterCategories(categories, 'dev', [])).toEqual([categories[0]]);
      expect(filterCategories(categories, '', ['dev'])).toEqual([
        categories[1],
      ]);
    });
  });

  describe('payloads', () => {
    it('builds a skill payload with parsed tags and repo URL', () => {
      const data = form({
        name: 'Skill',
        description: 'Does X',
        author: 'Ada',
        url: 'https://github.com/ada/skill',
        installCommand: 'git clone ...',
        skillCategory: 'security',
        compatibleAgents: ['Cursor'],
        tags: 'cli,  agent',
      });

      expect(buildSkillPayload(data)).toEqual({
        name: 'Skill',
        description: 'Does X',
        author: 'Ada',
        repo: 'https://github.com/ada/skill',
        installCommand: 'git clone ...',
        category: 'security',
        compatibleAgents: ['Cursor'],
        tags: ['cli', 'agent'],
      });
    });

    it('builds a resource payload with the original form fields', () => {
      const data = form({ name: 'Tool', tags: 'free' });
      expect(buildResourcePayload(data, 'mcp', 'client')).toEqual({
        type: 'client',
        data: { ...data, tags: ['free'] },
      });
    });
  });

  describe('submitResource', () => {
    beforeEach(() => {
      fetchMock.mockReset();
    });

    it('posts skills when the skill tab is active', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      const data = form({ compatibleAgents: ['Cursor'] });
      await submitResource(data, 'skill', 'server');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/skills',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(buildSkillPayload(data)),
        })
      );
    });

    it('rejects a skill with no compatible agents', async () => {
      await expect(submitResource(form(), 'skill', 'server')).rejects.toThrow(
        SubmitValidationError
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('posts tools and MCP resources to /api/submissions', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      const data = form({ name: 'Tool' });
      await submitResource(data, 'tool', 'server');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/submissions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(buildResourcePayload(data, 'tool', 'server')),
        })
      );
    });

    it('surfaces API error messages', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Duplicate name' }),
      } as Response);

      await expect(submitResource(form(), 'tool', 'server')).rejects.toThrow(
        'Duplicate name'
      );
    });
  });
});
