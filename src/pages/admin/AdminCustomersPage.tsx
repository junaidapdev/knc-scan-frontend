import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';

import { AdminDataTable, AdminPageHeader } from '@/components/admin';
import {
  ADMIN_CUSTOMER_FILTERS,
  ADMIN_PAGE_SIZE_DEFAULT,
  type AdminCustomerFilter,
} from '@/constants/admin';
import { ROUTES } from '@/constants/routes';
import { DEBOUNCE_INPUT_MS } from '@/constants/ui';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { AdminCustomerListItem } from '@/interfaces/admin';
import { exportCustomersCsv, listCustomers } from '@/lib/adminApi';
import { logger } from '@/lib/logger';

const COLUMNS: ColumnDef<AdminCustomerListItem, unknown>[] = [
  { accessorKey: 'name', header: 'Name', cell: ({ getValue }) => (getValue() as string) ?? '—' },
  { accessorKey: 'phone_masked', header: 'Phone' },
  { accessorKey: 'tier', header: 'Tier' },
  { accessorKey: 'current_stamps', header: 'Stamps' },
  { accessorKey: 'total_visits', header: 'Visits' },
  {
    accessorKey: 'total_self_reported_spend_sar',
    header: 'Spend',
    cell: ({ getValue }) => `SAR ${Number(getValue() ?? 0).toFixed(0)}`,
  },
  {
    accessorKey: 'last_scan_at',
    header: 'Last scan',
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      return v ? new Date(v).toLocaleDateString() : '—';
    },
  },
];

const FILTER_LABELS: Record<AdminCustomerFilter, string> = {
  all: 'All',
  active: 'Active',
  inactive: 'Inactive',
  reward_ready: 'Reward Ready',
};

export default function AdminCustomersPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearch = useDebouncedValue(searchInput, DEBOUNCE_INPUT_MS);
  const [filter, setFilter] = useState<AdminCustomerFilter>('all');
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<AdminCustomerListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

  const fetchPage = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await listCustomers({
        page,
        pageSize: ADMIN_PAGE_SIZE_DEFAULT,
        search: debouncedSearch || undefined,
      });
      setRows(res.rows);
      setTotal(res.total);
    } catch (err) {
      logger.error('[admin-customers] list failed', { err });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    void fetchPage();
  }, [fetchPage]);

  // Reset to page 1 when the search term changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const filteredRows = useMemo(() => {
    // Backend doesn't support the pill filter taxonomy yet — apply the
    // pill client-side on the current page. "reward_ready" = at least one
    // completed card not yet issued a reward (cards_completed > rewards_issued).
    if (filter === 'all') return rows;
    if (filter === 'active') {
      return rows.filter((r) => {
        if (!r.last_scan_at) return false;
        const ageDays = (Date.now() - Date.parse(r.last_scan_at)) / 86_400_000;
        return ageDays <= 30;
      });
    }
    if (filter === 'inactive') {
      return rows.filter((r) => {
        if (!r.last_scan_at) return true;
        const ageDays = (Date.now() - Date.parse(r.last_scan_at)) / 86_400_000;
        return ageDays > 30;
      });
    }
    // reward_ready
    return rows.filter(
      (r) => r.cards_completed > r.rewards_issued_count,
    );
  }, [rows, filter]);

  const handleExport = async (): Promise<void> => {
    setExporting(true);
    try {
      const blob = await exportCustomersCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kayan-customers-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      logger.error('[admin-customers] export failed', { err });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        subtitle={`${total.toLocaleString()} total`}
        actions={
          <button
            type="button"
            className="rounded bg-obsidian px-4 py-2 text-sm font-semibold text-white hover:bg-obsidian/90 disabled:opacity-60"
            onClick={() => {
              void handleExport();
            }}
            disabled={exporting}
          >
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          className="w-64 rounded border border-obsidian/20 px-3 py-2 text-sm focus:border-yellow focus:outline-none focus:shadow-focus-yellow"
          placeholder="Search by name or +966… phone"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <div className="flex gap-1">
          {ADMIN_CUSTOMER_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filter === f
                  ? 'bg-obsidian text-white'
                  : 'border border-obsidian/20 text-obsidian hover:bg-obsidian/5'
              }`}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <AdminDataTable<AdminCustomerListItem>
        data={filteredRows}
        columns={COLUMNS}
        isLoading={loading}
        emptyTitle="No customers"
        emptySubtitle="Nothing matches your search or filter."
        pagination={{
          page,
          pageSize: ADMIN_PAGE_SIZE_DEFAULT,
          total,
          onPageChange: setPage,
        }}
        onRowClick={(row) => navigate(ROUTES.ADMIN.CUSTOMER_DETAIL(row.id))}
      />
    </div>
  );
}
