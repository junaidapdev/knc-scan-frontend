import { useCallback, useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import {
  AdminDataTable,
  AdminPageHeader,
  AdminStatusBadge,
} from '@/components/admin';
import { ADMIN_PAGE_SIZE_DEFAULT } from '@/constants/admin';
import type { AdminIssuedRewardRow } from '@/interfaces/admin';
import { listIssuedRewards } from '@/lib/adminApi';
import { logger } from '@/lib/logger';

import AdminIssuedRewardDetailDialog from './components/AdminIssuedRewardDetailDialog';

type StatusFilter = 'all' | 'pending' | 'redeemed' | 'expired' | 'voided';
const STATUS_FILTERS: StatusFilter[] = [
  'all',
  'pending',
  'redeemed',
  'expired',
  'voided',
];

const COLUMNS: ColumnDef<AdminIssuedRewardRow, unknown>[] = [
  { accessorKey: 'unique_code', header: 'Code' },
  {
    accessorKey: 'customer_name',
    header: 'Customer',
    cell: ({ row }) =>
      row.original.customer_name ?? row.original.customer_phone_masked,
  },
  { accessorKey: 'reward_name_snapshot', header: 'Reward' },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <AdminStatusBadge
        kind="issued"
        status={
          row.original.voided_at
            ? 'voided'
            : (row.original.status as 'pending' | 'redeemed' | 'expired')
        }
      />
    ),
  },
  {
    accessorKey: 'issued_at',
    header: 'Issued',
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
  },
  {
    accessorKey: 'expires_at',
    header: 'Expires',
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
  },
];

export default function AdminRewardsIssuedPage(): JSX.Element {
  const [rows, setRows] = useState<AdminIssuedRewardRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [active, setActive] = useState<AdminIssuedRewardRow | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await listIssuedRewards({
        page,
        pageSize: ADMIN_PAGE_SIZE_DEFAULT,
        status:
          statusFilter === 'all' || statusFilter === 'voided'
            ? undefined
            : statusFilter,
        includeVoided: statusFilter !== 'voided',
        voidedOnly: statusFilter === 'voided',
      });
      setRows(res.rows);
      setTotal(res.total);
    } catch (err) {
      logger.error('[admin-issued] list failed', { err });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  return (
    <div>
      <AdminPageHeader
        title="Redemption Log"
        subtitle={`${total.toLocaleString()} issued ${total === 1 ? 'reward' : 'rewards'}`}
      />
      <div className="mb-4 flex gap-1">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              statusFilter === s
                ? 'bg-obsidian text-white'
                : 'border border-obsidian/20 text-obsidian hover:bg-obsidian/5'
            }`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <AdminDataTable<AdminIssuedRewardRow>
        data={rows}
        columns={COLUMNS}
        isLoading={loading}
        emptyTitle="No issued rewards"
        pagination={{
          page,
          pageSize: ADMIN_PAGE_SIZE_DEFAULT,
          total,
          onPageChange: setPage,
        }}
        onRowClick={(row) => setActive(row)}
      />
      <AdminIssuedRewardDetailDialog
        row={active}
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        onVoided={() => {
          void load();
        }}
      />
    </div>
  );
}
