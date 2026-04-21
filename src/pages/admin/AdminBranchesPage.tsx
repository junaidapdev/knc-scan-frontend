import { useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { AdminDataTable, AdminPageHeader } from '@/components/admin';
import type { AdminKpiByBranch } from '@/interfaces/admin';
import { fetchKpiByBranch } from '@/lib/adminApi';
import { logger } from '@/lib/logger';

import AdminBranchDrilldownDialog from './components/AdminBranchDrilldownDialog';

const COLUMNS: ColumnDef<AdminKpiByBranch, unknown>[] = [
  { accessorKey: 'branch_name', header: 'Branch' },
  { accessorKey: 'city', header: 'City' },
  {
    accessorKey: 'active',
    header: 'Status',
    cell: ({ getValue }) => (getValue() ? 'Active' : 'Inactive'),
  },
  { accessorKey: 'scans_30d', header: 'Scans' },
  { accessorKey: 'stamps_30d', header: 'Stamps' },
  {
    accessorKey: 'spend_30d',
    header: 'Spend',
    cell: ({ getValue }) => `SAR ${Number(getValue() ?? 0).toFixed(0)}`,
  },
  { accessorKey: 'unique_customers_30d', header: 'Unique' },
];

export default function AdminBranchesPage(): JSX.Element {
  const [rows, setRows] = useState<AdminKpiByBranch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeBranch, setActiveBranch] = useState<AdminKpiByBranch | null>(
    null,
  );

  useEffect(() => {
    setLoading(true);
    fetchKpiByBranch()
      .then(setRows)
      .catch((err: unknown) => {
        logger.error('[admin-branches] fetch failed', { err });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Branches"
        subtitle="Performance across all branches · last 30 days"
      />
      <AdminDataTable<AdminKpiByBranch>
        data={rows}
        columns={COLUMNS}
        isLoading={loading}
        emptyTitle="No branches"
        emptySubtitle="No branches have been set up yet."
        onRowClick={(row) => setActiveBranch(row)}
      />
      <AdminBranchDrilldownDialog
        branchId={activeBranch?.branch_id ?? null}
        branchName={activeBranch?.branch_name ?? ''}
        open={Boolean(activeBranch)}
        onOpenChange={(open) => {
          if (!open) setActiveBranch(null);
        }}
      />
    </div>
  );
}
