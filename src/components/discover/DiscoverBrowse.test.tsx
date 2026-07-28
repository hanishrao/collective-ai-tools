import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DiscoverBrowse } from './DiscoverBrowse';

const renderBrowse = () =>
  render(<DiscoverBrowse />, { wrapper: MemoryRouter });

vi.mock('./sources', () => ({
  SOURCES: [
    {
      type: 'tool',
      label: 'Tools',
      seeAllHref: '/tools',
      searchItems: async () => [],
      browseItems: async (_signal: AbortSignal, sort: string) => ({
        items: [
          {
            id: 't1',
            type: 'tool',
            title: sort === 'newest' ? 'Tool New' : 'Tool One',
            subtitle: '',
            tags: [],
            href: '#',
            external: true,
          },
        ],
        total: 1,
      }),
    },
    {
      type: 'repo',
      label: 'Repos',
      seeAllHref: '/trending',
      searchItems: async () => [],
      browseItems: async () => ({
        items: [
          {
            id: 'r1',
            type: 'repo',
            title: 'Repo One',
            subtitle: '',
            tags: [],
            href: '#',
            external: true,
          },
        ],
        total: 1,
      }),
    },
  ],
}));

vi.mock('./DiscoverCard', () => ({
  DiscoverCard: ({ item }: any) => <div>card:{item.title}</div>,
}));
vi.mock('@/lib/analytics', () => ({ captureEvent: vi.fn() }));

describe('DiscoverBrowse', () => {
  it('shows all types in the grid by default', async () => {
    renderBrowse();
    expect(await screen.findByText('card:Tool One')).toBeInTheDocument();
    expect(screen.getByText('card:Repo One')).toBeInTheDocument();
  });

  it('filters the grid to a single type when a filter is selected', async () => {
    const user = userEvent.setup();
    renderBrowse();
    await screen.findByText('card:Tool One');

    await user.click(screen.getByRole('button', { name: /^Repos/ }));

    expect(screen.getByText('card:Repo One')).toBeInTheDocument();
    expect(screen.queryByText('card:Tool One')).toBeNull();
  });

  it('re-fetches with the chosen sort when the sort control changes', async () => {
    const user = userEvent.setup();
    renderBrowse();
    await screen.findByText('card:Tool One');

    await user.click(screen.getByRole('button', { name: 'Newest' }));

    expect(await screen.findByText('card:Tool New')).toBeInTheDocument();
    expect(screen.queryByText('card:Tool One')).toBeNull();
  });
});
