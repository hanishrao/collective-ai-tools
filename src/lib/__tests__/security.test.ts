import { describe, expect, it } from 'vitest';
import {
  escapeHtml,
  getCSPDirectives,
  sanitizeHtml,
  sanitizeUrl,
  validateTool,
} from '../security';

describe('security', () => {
  describe('sanitizeHtml', () => {
    it('preserves allowed formatting and link attributes', () => {
      const html =
        '<p class="intro"><strong>Hello</strong><br><a href="https://example.com/docs" target="_blank" rel="noopener">Docs</a></p>';

      expect(sanitizeHtml(html)).toBe(html);
    });

    it('removes executable elements and disallowed attributes', () => {
      const sanitized = sanitizeHtml(
        '<p class="copy" style="color:red" onclick="alert(1)">Safe <strong>text</strong><script>alert(1)</script><img src="x" onerror="alert(1)"></p>'
      );

      expect(sanitized).toContain('<p class="copy">');
      expect(sanitized).toContain('<strong>text</strong>');
      expect(sanitized).not.toMatch(/script|onclick|onerror|style=|<img/i);
    });

    it('strips dangerous protocols from otherwise allowed links', () => {
      const sanitized = sanitizeHtml(
        '<a href="javascript:alert(1)" target="_blank" rel="noopener">Open</a>'
      );

      expect(sanitized).toContain('>Open</a>');
      expect(sanitized).not.toMatch(/href|javascript:/i);
    });

    it('handles empty content', () => {
      expect(sanitizeHtml('')).toBe('');
    });
  });

  describe('escapeHtml', () => {
    it('escapes markup, ampersands, and both quote types', () => {
      expect(escapeHtml(`<script>alert("x") & 'y'</script>`)).toBe(
        '&lt;script&gt;alert(&quot;x&quot;) &amp; &#39;y&#39;&lt;/script&gt;'
      );
    });

    it('escapes existing entities instead of interpreting them as markup', () => {
      expect(escapeHtml('&lt;b&gt;already escaped&lt;/b&gt;')).toBe(
        '&amp;lt;b&amp;gt;already escaped&amp;lt;/b&amp;gt;'
      );
    });

    it('leaves plain text and empty strings unchanged', () => {
      expect(escapeHtml('Plain text 123')).toBe('Plain text 123');
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it.each([
      [
        'https://example.com/path?q=hello#section',
        'https://example.com/path?q=hello#section',
      ],
      ['http://example.com', 'http://example.com/'],
      ['HTTPS://EXAMPLE.COM/Docs', 'https://example.com/Docs'],
    ])('normalizes an allowed URL: %s', (url, expected) => {
      expect(sanitizeUrl(url)).toBe(expected);
    });

    it.each([
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      'mailto:user@example.com',
      '/relative/path',
      '//example.com/path',
      'not a url',
      '',
    ])('rejects an unsafe or malformed URL: %s', url => {
      expect(sanitizeUrl(url)).toBe('#');
    });

    it('rejects suspicious protocol text embedded in an otherwise valid URL', () => {
      expect(
        sanitizeUrl('https://example.com/redirect?next=JaVaScRiPt:alert(1)')
      ).toBe('#');
    });
  });

  describe('validateTool', () => {
    const validTool = {
      name: 'Example Tool',
      url: 'https://example.com',
      description: 'A useful example.',
      tags: ['developer', 'free'],
    };

    it('accepts a complete tool and permits additional metadata', () => {
      expect(validateTool(validTool)).toBe(true);
      expect(validateTool({ ...validTool, stars: 42 })).toBe(true);
    });

    it.each([null, undefined, 'tool', 42, [], {}])(
      'rejects a non-tool value: %j',
      tool => {
        expect(validateTool(tool)).toBe(false);
      }
    );

    it.each(['name', 'url', 'description', 'tags'] as const)(
      'rejects a tool missing %s',
      field => {
        const tool = { ...validTool };
        delete tool[field];

        expect(validateTool(tool)).toBe(false);
      }
    );

    const invalidTools: Array<[string, unknown]> = [
      ['empty name', { ...validTool, name: '' }],
      ['whitespace-only name', { ...validTool, name: '   ' }],
      ['non-string name', { ...validTool, name: 123 }],
      ['empty URL', { ...validTool, url: '' }],
      ['whitespace-only URL', { ...validTool, url: '   ' }],
      ['non-string URL', { ...validTool, url: 123 }],
      ['empty description', { ...validTool, description: '' }],
      ['whitespace-only description', { ...validTool, description: '   ' }],
      ['non-string description', { ...validTool, description: 123 }],
      ['non-array tags', { ...validTool, tags: 'developer' }],
      ['malformed URL', { ...validTool, url: 'not a url' }],
    ];

    it.each(invalidTools)('rejects a tool with %s', (_description, tool) => {
      expect(validateTool(tool)).toBe(false);
    });
  });

  describe('getCSPDirectives', () => {
    it('returns the complete ordered policy', () => {
      expect(getCSPDirectives().split('; ')).toEqual([
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https:",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'upgrade-insecure-requests',
      ]);
    });
  });
});
