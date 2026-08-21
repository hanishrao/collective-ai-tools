import { describe, expect, it } from 'vitest';
import {
  buildLocalPattern,
  customPatternItem,
  filterCustomPatterns,
  filterPatterns,
  filterStrategies,
  importedFabricItem,
  isReadableDropFile,
  parseImportPattern,
  readDroppedFiles,
  saveSuccessMessage,
  toPatternId,
  untitledPattern,
} from './helpers';
import type { FabricItem, FabricPattern } from './types';

function item(
  name: string,
  path: string,
  type: FabricItem['type'] = 'dir'
): FabricItem {
  return { name, path, type, url: '' };
}

describe('pattern studio helpers', () => {
  describe('filterPatterns', () => {
    const patterns = [
      item('extract_wisdom', 'data/patterns/extract_wisdom'),
      item('Adaptive editor', 'anthropic_adaptive_editor', 'custom'),
    ];

    it('filters by search and source', () => {
      expect(filterPatterns(patterns, 'wisdom', 'all')).toEqual([patterns[0]]);
      expect(filterPatterns(patterns, '', 'fabric')).toEqual([patterns[0]]);
      expect(filterPatterns(patterns, '', 'anthropic')).toEqual([patterns[1]]);
    });
  });

  describe('filterStrategies', () => {
    const strategies = [item('cot.json', 'data/strategies/cot.json', 'file')];

    it('hides strategies on the anthropic filter', () => {
      expect(filterStrategies(strategies, '', 'all')).toEqual(strategies);
      expect(filterStrategies(strategies, '', 'anthropic')).toEqual([]);
      expect(filterStrategies(strategies, 'missing', 'all')).toEqual([]);
    });
  });

  describe('filterCustomPatterns', () => {
    const patterns: FabricPattern[] = [
      buildLocalPattern('My Helper', 'prompt', 'Private user pattern'),
    ];

    it('matches on title', () => {
      expect(filterCustomPatterns(patterns, 'helper')).toEqual(patterns);
      expect(filterCustomPatterns(patterns, 'other')).toEqual([]);
    });
  });

  describe('ids and items', () => {
    it('builds local pattern ids and fabric items', () => {
      expect(toPatternId('My New Pattern')).toBe('my_new_pattern');
      expect(customPatternItem('abc')).toEqual({
        name: 'abc',
        path: 'custom/abc',
        type: 'custom',
        url: '',
      });
      expect(untitledPattern().name).toBe('Untitled Pattern');
      expect(importedFabricItem('From Community').path).toBe('imported');
    });

    it('returns save copy for public vs private', () => {
      expect(saveSuccessMessage(true)).toContain('community feed');
      expect(saveSuccessMessage(false)).toContain('personal library');
    });
  });

  describe('parseImportPattern', () => {
    it('reads importPattern from router state', () => {
      expect(
        parseImportPattern({ importPattern: { title: 'T', content: 'C' } })
      ).toEqual({
        title: 'T',
        content: 'C',
      });
      expect(parseImportPattern(null)).toBeUndefined();
      expect(parseImportPattern({})).toBeUndefined();
    });
  });

  describe('dropped files', () => {
    it('accepts text files and skips binaries', () => {
      const text = new File(['hello'], 'notes.md', { type: 'text/markdown' });
      const binary = new File(['x'], 'photo.png', { type: 'image/png' });
      expect(isReadableDropFile(text)).toBe(true);
      expect(isReadableDropFile(binary)).toBe(false);
    });

    it('prepends existing input and records skipped names', async () => {
      const text = new File(['body'], 'a.ts', { type: '' });
      const binary = new File(['x'], 'b.png', { type: 'image/png' });
      const result = await readDroppedFiles([text, binary], 'existing');

      expect(result.content).toContain('existing');
      expect(result.content).toContain('--- FILE: a.ts ---');
      expect(result.content).toContain('body');
      expect(result.skipped).toEqual(['b.png']);
    });
  });
});
