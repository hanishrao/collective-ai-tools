import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchFilters, fetchMCPServers, fetchAITools } from '../api';

const fetchMock = vi.mocked(fetch);

function mockResponse(
  body: unknown = null,
  init: { status?: number; headers?: Record<string, string> } = {}
): Response {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(init.headers),
    json: () => Promise.resolve(body),
  } as Response;
}

const filtersBody = { categories: [], languages: [], pricing: [] };
const listBody = {
  data: [],
  pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
};

describe('api', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    warnSpy.mockRestore();
  });

  describe('successful responses', () => {
    it('returns parsed JSON from fetchFilters', async () => {
      fetchMock.mockResolvedValue(mockResponse(filtersBody));

      await expect(fetchFilters()).resolves.toEqual(filtersBody);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith('/api/filters', {});
    });

    it('builds the MCP query string from provided params only', async () => {
      fetchMock.mockResolvedValue(mockResponse(listBody));

      await fetchMCPServers({
        page: 2,
        limit: 10,
        search: 'claude',
        type: 'server',
        category: 'dev-tools',
        language: 'typescript',
        id: 'my-server',
        sort: 'stars',
      });
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/mcp?page=2&limit=10&search=claude&type=server&category=dev-tools&language=typescript&id=my-server&sort=stars',
        {}
      );

      await fetchMCPServers({});
      expect(fetchMock).toHaveBeenLastCalledWith('/api/mcp?', {});
    });

    it('builds the AI tools query string from provided params only', async () => {
      fetchMock.mockResolvedValue(mockResponse(listBody));

      await fetchAITools({
        page: 1,
        limit: 20,
        search: 'agent',
        category: 'chat',
        pricing: 'free',
        sort: 'newest',
      });
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ai-tools?page=1&limit=20&search=agent&category=chat&pricing=free&sort=newest',
        {}
      );

      await fetchAITools({});
      expect(fetchMock).toHaveBeenLastCalledWith('/api/ai-tools?', {});
    });
  });

  describe('retry on 429/5xx', () => {
    it('retries after the backoff delay on 500 and resolves on success', async () => {
      fetchMock
        .mockResolvedValueOnce(mockResponse(null, { status: 500 }))
        .mockResolvedValueOnce(mockResponse(filtersBody));

      const promise = fetchFilters();
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(999);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);

      await expect(promise).resolves.toEqual(filtersBody);
    });

    it('waits for the Retry-After header (seconds) on 429 instead of the backoff', async () => {
      fetchMock
        .mockResolvedValueOnce(
          mockResponse(null, { status: 429, headers: { 'Retry-After': '2' } })
        )
        .mockResolvedValueOnce(mockResponse(filtersBody));

      const promise = fetchFilters();

      // Past the default 1000ms backoff, but before the 2s Retry-After
      await vi.advanceTimersByTimeAsync(1999);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);

      await expect(promise).resolves.toEqual(filtersBody);
    });

    it('doubles the backoff on each retry (1s, 2s, 4s)', async () => {
      fetchMock.mockResolvedValue(mockResponse(null, { status: 500 }));

      const promise = fetchFilters();
      const assertion = expect(promise).rejects.toThrow(
        'Failed to fetch filters'
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1000);
      expect(fetchMock).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(2000);
      expect(fetchMock).toHaveBeenCalledTimes(3);

      await vi.advanceTimersByTimeAsync(4000);
      expect(fetchMock).toHaveBeenCalledTimes(4);

      await assertion;
    });

    it('gives up after retries are exhausted and the caller throws', async () => {
      fetchMock.mockResolvedValue(mockResponse(null, { status: 503 }));

      const promise = fetchMCPServers({});
      const assertion = expect(promise).rejects.toThrow(
        'Failed to fetch MCP data'
      );

      await vi.runAllTimersAsync();
      await assertion;
      expect(fetchMock).toHaveBeenCalledTimes(4);
    });

    it('does not retry non-retryable errors like 404', async () => {
      fetchMock.mockResolvedValue(mockResponse(null, { status: 404 }));

      await expect(fetchAITools({})).rejects.toThrow(
        'Failed to fetch AI tools'
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('network errors', () => {
    it('retries a network error and resolves on success', async () => {
      fetchMock
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(mockResponse(filtersBody));

      const promise = fetchFilters();
      await vi.advanceTimersByTimeAsync(1000);

      await expect(promise).resolves.toEqual(filtersBody);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('rethrows the network error once retries are exhausted', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      const promise = fetchFilters();
      const assertion = expect(promise).rejects.toThrow('Failed to fetch');

      await vi.runAllTimersAsync();
      await assertion;
      expect(fetchMock).toHaveBeenCalledTimes(4);
    });
  });
});
