import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AdminPageHeader } from '@/components/admin';
import { ROUTES } from '@/constants/routes';
import type { AdminCustomerDetail } from '@/interfaces/admin';
import { getCustomerDetail, softDeleteCustomer } from '@/lib/adminApi';
import { logger } from '@/lib/logger';

import AdminSoftDeleteDialog from './components/AdminSoftDeleteDialog';

export default function AdminCustomerDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<AdminCustomerDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const load = useCallback(async (): Promise<void> => {
    if (!id) return;
    setLoading(true);
    try {
      const row = await getCustomerDetail(id);
      setDetail(row);
    } catch (err) {
      logger.error('[admin-customer-detail] fetch failed', { err });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (): Promise<void> => {
    if (!id) return;
    try {
      await softDeleteCustomer(id);
      setDeleteOpen(false);
      navigate(ROUTES.ADMIN.CUSTOMERS);
    } catch (err) {
      logger.error('[admin-customer-detail] delete failed', { err });
    }
  };

  if (loading) {
    return <p className="text-sm text-obsidian/60">Loading customer…</p>;
  }
  if (!detail) {
    return <p className="text-sm text-obsidian/60">Customer not found.</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title={detail.name ?? 'Unnamed customer'}
        subtitle={`${detail.phone_full} · ${detail.tier} · ${detail.total_visits} visits`}
        actions={
          <button
            type="button"
            className="rounded border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            onClick={() => setDeleteOpen(true)}
          >
            Soft Delete
          </button>
        }
      />

      <section className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-obsidian/10 bg-white p-4 sm:grid-cols-4">
        <Stat label="Stamps" value={String(detail.current_stamps)} />
        <Stat label="Cards completed" value={String(detail.cards_completed)} />
        <Stat
          label="Spend (SAR)"
          value={detail.total_self_reported_spend_sar.toFixed(0)}
        />
        <Stat label="Rewards issued" value={String(detail.rewards_issued_count)} />
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-obsidian/70">
          Recent visits
        </h2>
        <div className="overflow-hidden rounded-lg border border-obsidian/10 bg-white">
          {detail.recent_visits.length === 0 ? (
            <p className="px-4 py-6 text-sm text-obsidian/60">No visits yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-obsidian/5 text-left text-xs uppercase tracking-wider text-obsidian/70">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Branch</th>
                  <th className="px-4 py-2">Stamp</th>
                  <th className="px-4 py-2">Bill (SAR)</th>
                </tr>
              </thead>
              <tbody>
                {detail.recent_visits.map((v) => (
                  <tr key={v.id} className="border-t border-obsidian/5">
                    <td className="px-4 py-2">
                      {new Date(v.scanned_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{v.branch_name ?? '—'}</td>
                    <td className="px-4 py-2">
                      {v.stamp_awarded ? '✓' : v.lockout_applied ? 'lockout' : '—'}
                    </td>
                    <td className="px-4 py-2 font-mono">
                      {v.bill_amount === null ? '—' : v.bill_amount.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-obsidian/70">
          Rewards issued
        </h2>
        <div className="overflow-hidden rounded-lg border border-obsidian/10 bg-white">
          {detail.rewards.length === 0 ? (
            <p className="px-4 py-6 text-sm text-obsidian/60">
              No rewards issued yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-obsidian/5 text-left text-xs uppercase tracking-wider text-obsidian/70">
                <tr>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Reward</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Issued</th>
                  <th className="px-4 py-2">Expires</th>
                </tr>
              </thead>
              <tbody>
                {detail.rewards.map((r) => (
                  <tr key={r.id} className="border-t border-obsidian/5">
                    <td className="px-4 py-2 font-mono">{r.unique_code}</td>
                    <td className="px-4 py-2">{r.reward_name_snapshot}</td>
                    <td className="px-4 py-2">{r.status}</td>
                    <td className="px-4 py-2">
                      {new Date(r.issued_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(r.expires_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <AdminSoftDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        customerName={detail.name}
        onConfirmed={handleDelete}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-obsidian/60">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-bold text-obsidian">{value}</p>
    </div>
  );
}
