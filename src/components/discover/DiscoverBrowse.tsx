import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DiscoverCard } from './DiscoverCard';
import { SOURCES, type SortKey } from './sources';
import { TYPE_ACCENT } from './theme';
import type { DiscoverItem, DiscoverType } from './types';

type Filter = 'all' | DiscoverType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tool', label: 'Tools' },
  { key: 'mcp', label: 'MCP' },
  { key: 'prompt', label: 'Prompts' },
  { key: 'skill', label: 'Skills' },
  { key: 'repo', label: 'Repos' },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'Popular' },
  { key: 'newest', label: 'Newest' },
];

const GRID =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
const SECTION_LIMIT = 8;

function Skeletons({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className='h-40 rounded-2xl bg-black/3 dark:bg-white/4 animate-pulse'
        />
      ))}
    </>
  );
}

function CardGrid({
  items,
  loading,
}: {
  items: DiscoverItem[];
  loading?: boolean;
}) {
  return (
    <div className={GRID}>
      {items.map((item, i) => (
        <DiscoverCard
          key={`${item.type}-${item.id}`}
          item={item}
          style={{ animationDelay: `${Math.min(i, SECTION_LIMIT) * 40}ms` }}
        />
      ))}
      {loading && <Skeletons count={4} />}
    </div>
  );
}

export function DiscoverBrowse() {
  const [groups, setGroups] = useState<
    Partial<Record<DiscoverType, DiscoverItem[]>>
  >({});
  const [totals, setTotals] = useState<Partial<Record<DiscoverType, number>>>(
    {}
  );
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<SortKey>('popular');

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    // Fetch each source independently and render its cards the moment they
    // arrive — no barrier on the slowest feed (e.g. trending repos).
    SOURCES.forEach(s => {
      s.browseItems(controller.signal, sort)
        .then(({ items, total }) => {
          if (cancelled) return;
          setGroups(prev => ({ ...prev, [s.type]: items }));
          setTotals(prev => ({ ...prev, [s.type]: total }));
        })
        .catch(() => {
          if (cancelled) return;
          setGroups(prev => ({ ...prev, [s.type]: prev[s.type] ?? [] }));
          setTotals(prev => ({ ...prev, [s.type]: prev[s.type] ?? 0 }));
        });
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [sort]);

  const loadedTypes = Object.keys(groups).length;
  const initialLoading = loadedTypes === 0;
  const stillLoading = loadedTypes < SOURCES.length;

  // Real category totals (from the API), not the previewed page size.
  const total = useMemo(
    () => SOURCES.reduce((n, s) => n + (totals[s.type] ?? 0), 0),
    [totals]
  );

  const items = filter === 'all' ? [] : (groups[filter] ?? []);
  const filterLoading = filter === 'all' ? stillLoading : !(filter in groups);

  return (
    <div>
      <div className='mb-8 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          {FILTERS.map(f => {
            const active = filter === f.key;
            const count = f.key === 'all' ? total : (totals[f.key] ?? 0);
            return (
              <button
                key={f.key}
                type='button'
                onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/6'
                )}
              >
                {f.key !== 'all' && (
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      TYPE_ACCENT[f.key].dot
                    )}
                  />
                )}
                {f.label}
                {(f.key === 'all' ? !initialLoading : f.key in groups) && (
                  <span
                    className={cn(
                      'text-xs tabular-nums',
                      active ? 'opacity-70' : 'text-gray-400 dark:text-gray-500'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          role='group'
          aria-label='Sort'
          className='inline-flex items-center rounded-full border border-black/10 p-0.5 dark:border-white/10'
        >
          {SORTS.map(s => {
            const active = sort === s.key;
            return (
              <button
                key={s.key}
                type='button'
                onClick={() => setSort(s.key)}
                aria-pressed={active}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  active
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {filter === 'all' ? (
        <div className='space-y-14'>
          {SOURCES.map(s => {
            const list = groups[s.type];
            const loading = !(s.type in groups);
            // Hide sections that finished loading with nothing to show.
            if (!loading && (!list || list.length === 0)) return null;
            const accent = TYPE_ACCENT[s.type];
            return (
              <section key={s.type}>
                <div className='mb-5 flex items-center justify-between'>
                  <h2 className='flex items-center gap-2.5 text-lg font-semibold tracking-tight text-gray-900 dark:text-white'>
                    <span className={cn('h-2 w-2 rounded-full', accent.dot)} />
                    {s.label}
                  </h2>
                  <Link
                    to={s.seeAllHref}
                    className={cn(
                      'group inline-flex items-center gap-1 text-sm font-medium transition-colors',
                      accent.text
                    )}
                  >
                    See all
                    <span
                      aria-hidden='true'
                      className='transition-transform duration-200 group-hover:translate-x-0.5'
                    >
                      →
                    </span>
                  </Link>
                </div>
                {loading ? (
                  <div className={GRID}>
                    <Skeletons count={4} />
                  </div>
                ) : (
                  <CardGrid items={(list ?? []).slice(0, SECTION_LIMIT)} />
                )}
              </section>
            );
          })}
        </div>
      ) : items.length === 0 && !filterLoading ? (
        <p className='py-16 text-center text-sm text-gray-500 dark:text-gray-400'>
          Nothing to show right now. Try a search above.
        </p>
      ) : (
        <>
          <CardGrid items={items} loading={filterLoading} />
          {!filterLoading && (totals[filter] ?? 0) > items.length && (
            <div className='mt-8 text-center'>
              <Link
                to={SOURCES.find(s => s.type === filter)?.seeAllHref ?? '/'}
                className='inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400'
              >
                See all {totals[filter]} →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
