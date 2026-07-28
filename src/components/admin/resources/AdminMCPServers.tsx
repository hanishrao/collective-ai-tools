import { useCallback, useEffect, useState } from 'react';
import AdminDataTable from '../AdminDataTable';
import { ExternalLink } from 'lucide-react';
import type {
  AdminListParams,
  AdminListResponse,
  AdminMCPResource,
} from './types';

export default function AdminMCPServers() {
  const [data, setData] = useState<AdminMCPResource[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<AdminListParams>({
    page: 1,
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: params.page.toString(),
        limit: '10',
        search: params.search,
        sortBy: params.sortBy,
        order: params.order,
      });
      const res = await fetch(`/api/admin/mcp-servers?${query}`);
      const result: AdminListResponse<AdminMCPResource> = await res.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'description',
      label: 'Description',
      render: (row: AdminMCPResource) => (
        <span className='line-clamp-1' title={row.description}>
          {row.description}
        </span>
      ),
    },
    {
      key: 'url',
      label: 'Link',
      render: (row: AdminMCPResource) => (
        <a
          href={row.url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 hover:text-blue-500'
        >
          <ExternalLink className='h-4 w-4' />
        </a>
      ),
    },
    {
      key: 'addedDate',
      label: 'Added',
      sortable: true,
      render: (row: AdminMCPResource) =>
        new Date(row.addedDate).toLocaleDateString(),
    },
  ];

  return (
    <AdminDataTable
      title='MCP Servers'
      columns={columns}
      data={data}
      pagination={pagination}
      isLoading={loading}
      onPageChange={p => setParams(prev => ({ ...prev, page: p }))}
      onSearch={q => setParams(prev => ({ ...prev, search: q, page: 1 }))}
      onSort={key =>
        setParams(prev => ({
          ...prev,
          sortBy: key,
          order: prev.order === 'asc' ? 'desc' : 'asc',
        }))
      }
      onAdd={() => alert('Add functionality coming next!')}
    />
  );
}
