import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ADMIN_TIMESERIES_DEFAULT_DAYS } from '@/constants/admin';
import type { AdminKpiTimeseriesPoint } from '@/interfaces/admin';
import { fetchKpiTimeseries } from '@/lib/adminApi';
import { logger } from '@/lib/logger';

export interface AdminBranchDrilldownDialogProps {
  branchId: string | null;
  branchName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminBranchDrilldownDialog({
  branchId,
  branchName,
  open,
  onOpenChange,
}: AdminBranchDrilldownDialogProps): JSX.Element {
  const [series, setSeries] = useState<AdminKpiTimeseriesPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open || !branchId) return;
    setLoading(true);
    fetchKpiTimeseries({
      days: ADMIN_TIMESERIES_DEFAULT_DAYS,
      branchId,
    })
      .then(setSeries)
      .catch((err: unknown) => {
        logger.error('[branch-drilldown] fetch failed', { err });
      })
      .finally(() => setLoading(false));
  }, [open, branchId]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-obsidian">
            {branchName}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-obsidian/60">
            Scans, stamps and lockouts over the last 30 days.
          </Dialog.Description>
          <div className="mt-4 h-64 w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-obsidian/60">
                Loading…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    iconType="plainline"
                  />
                  <Line
                    type="monotone"
                    dataKey="scans"
                    name="Scans"
                    stroke="#FFD700"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="stamps_awarded"
                    name="Stamps"
                    stroke="#0D0D0D"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="lockouts"
                    name="Lockouts"
                    stroke="#DC2626"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded border border-obsidian/20 px-4 py-2 text-sm font-medium text-obsidian"
              onClick={() => onOpenChange(false)}
            >
              Close
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
