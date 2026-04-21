import { useCallback, useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ColumnDef } from '@tanstack/react-table';

import {
  AdminDataTable,
  AdminKpiCard,
  AdminPageHeader,
} from '@/components/admin';
import {
  ADMIN_TIMESERIES_DEFAULT_DAYS,
  DASHBOARD_REFRESH_MS,
} from '@/constants/admin';
import { useInterval } from '@/hooks/useInterval';
import type {
  AdminKpiByBranch,
  AdminKpiSummary,
  AdminKpiTimeseriesPoint,
} from '@/interfaces/admin';
import {
  fetchKpiByBranch,
  fetchKpiSummary,
  fetchKpiTimeseries,
} from '@/lib/adminApi';
import { logger } from '@/lib/logger';

const BRANCH_COLUMNS: ColumnDef<AdminKpiByBranch, unknown>[] = [
  {
    accessorKey: 'branch_name',
    header: 'Branch',
  },
  { accessorKey: 'city', header: 'City' },
  { accessorKey: 'scans_30d', header: 'Scans (30d)' },
  { accessorKey: 'stamps_30d', header: 'Stamps (30d)' },
  {
    accessorKey: 'spend_30d',
    header: 'Spend (30d)',
    cell: ({ getValue }) => `SAR ${Number(getValue() ?? 0).toFixed(0)}`,
  },
  {
    accessorKey: 'unique_customers_30d',
    header: 'Unique customers',
  },
];

export default function AdminDashboardPage(): JSX.Element {
  const [summary, setSummary] = useState<AdminKpiSummary | null>(null);
  const [branches, setBranches] = useState<AdminKpiByBranch[]>([]);
  const [series, setSeries] = useState<AdminKpiTimeseriesPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAll = useCallback(async (): Promise<void> => {
    try {
      const [s, b, t] = await Promise.all([
        fetchKpiSummary(),
        fetchKpiByBranch(),
        fetchKpiTimeseries({ days: ADMIN_TIMESERIES_DEFAULT_DAYS }),
      ]);
      setSummary(s);
      setBranches(b);
      setSeries(t);
    } catch (err) {
      logger.error('[admin-dashboard] refresh failed', { err });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Auto-refresh but only when the tab is visible.
  useInterval(() => {
    if (
      typeof document !== 'undefined' &&
      document.visibilityState === 'visible'
    ) {
      void loadAll();
    }
  }, DASHBOARD_REFRESH_MS);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Last 30 days · refreshes every minute"
      />

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AdminKpiCard
          title="Total customers"
          value={summary?.total_customers ?? 0}
          loading={loading}
        />
        <AdminKpiCard
          title="New (30d)"
          value={summary?.new_customers_30d ?? 0}
          loading={loading}
        />
        <AdminKpiCard
          title="Scans (30d)"
          value={summary?.scans_30d ?? 0}
          loading={loading}
        />
        <AdminKpiCard
          title="Rewards issued"
          value={summary?.rewards_issued_30d ?? 0}
          loading={loading}
        />
        <AdminKpiCard
          title="Outstanding"
          value={summary?.rewards_outstanding ?? 0}
          loading={loading}
        />
      </section>

      <section className="mb-8 rounded-lg border border-obsidian/10 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-obsidian/70">
          Scans · last 30 days
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={series}
              margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="scans"
                stroke="#FFD700"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-obsidian/70">
          Branch leaderboard
        </h2>
        <AdminDataTable<AdminKpiByBranch>
          data={branches}
          columns={BRANCH_COLUMNS}
          isLoading={loading}
          emptyTitle="No branch data"
          emptySubtitle="No branches have activity in the last 30 days."
        />
      </section>
    </div>
  );
}
