import { useCallback, useEffect, useState } from 'react';

import {
  AdminConfirmDialog,
  AdminPageHeader,
  AdminStatusBadge,
} from '@/components/admin';
import type {
  AdminCatalogFormPayload,
  AdminCatalogItem,
} from '@/interfaces/admin';
import {
  archiveCatalogItem,
  createCatalogItem,
  listCatalog,
  pauseCatalogItem,
  resumeCatalogItem,
  updateCatalogItem,
} from '@/lib/adminApi';
import { logger } from '@/lib/logger';

import AdminCatalogFormDialog from './components/AdminCatalogFormDialog';

type ConfirmAction = 'pause' | 'resume' | 'archive' | null;

export default function AdminRewardsCatalogPage(): JSX.Element {
  const [rows, setRows] = useState<AdminCatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<AdminCatalogItem | null>(null);
  const [pending, setPending] = useState<boolean>(false);

  const [confirmTarget, setConfirmTarget] = useState<AdminCatalogItem | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await listCatalog();
      setRows(data);
    } catch (err) {
      logger.error('[admin-catalog] list failed', { err });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (
    values: AdminCatalogFormPayload,
  ): Promise<void> => {
    setPending(true);
    try {
      if (editing) {
        await updateCatalogItem(editing.id, values);
      } else {
        await createCatalogItem(values);
      }
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      logger.error('[admin-catalog] save failed', { err });
    } finally {
      setPending(false);
    }
  };

  const runConfirm = async (): Promise<void> => {
    if (!confirmTarget || !confirmAction) return;
    setPending(true);
    try {
      if (confirmAction === 'pause') await pauseCatalogItem(confirmTarget.id);
      if (confirmAction === 'resume') await resumeCatalogItem(confirmTarget.id);
      if (confirmAction === 'archive') await archiveCatalogItem(confirmTarget.id);
      setConfirmTarget(null);
      setConfirmAction(null);
      await load();
    } catch (err) {
      logger.error('[admin-catalog] status change failed', { err });
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Rewards Catalog"
        subtitle={`${rows.length} rewards configured`}
        actions={
          <button
            type="button"
            className="rounded bg-yellow px-4 py-2 text-sm font-semibold text-obsidian hover:bg-yellow-hover"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add Reward
          </button>
        }
      />

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Heads up:</strong> Archiving a reward prevents new issuance but
        keeps outstanding reward codes valid until their expiry.
      </div>

      <div className="overflow-hidden rounded-lg border border-obsidian/10 bg-white">
        {loading ? (
          <p className="px-4 py-6 text-sm text-obsidian/60">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-obsidian/60">
            No catalog items yet. Create one to start issuing rewards.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-obsidian/5 text-left text-xs uppercase tracking-wider text-obsidian/70">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name (EN)</th>
                <th className="px-4 py-3">Name (AR)</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-obsidian/5">
                  <td className="px-4 py-3 font-mono">{r.code_prefix}</td>
                  <td className="px-4 py-3">{r.name_en}</td>
                  <td className="px-4 py-3">{r.name_ar}</td>
                  <td className="px-4 py-3 font-mono">
                    SAR {r.estimated_value_sar.toFixed(0)}
                  </td>
                  <td className="px-4 py-3">{r.default_expiry_days}d</td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge kind="catalog" status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="text-xs font-medium text-obsidian hover:underline"
                        onClick={() => {
                          setEditing(r);
                          setFormOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      {r.status === 'active' ? (
                        <button
                          type="button"
                          className="text-xs font-medium text-amber-700 hover:underline"
                          onClick={() => {
                            setConfirmTarget(r);
                            setConfirmAction('pause');
                          }}
                        >
                          Pause
                        </button>
                      ) : r.status === 'paused' ? (
                        <button
                          type="button"
                          className="text-xs font-medium text-green-700 hover:underline"
                          onClick={() => {
                            setConfirmTarget(r);
                            setConfirmAction('resume');
                          }}
                        >
                          Resume
                        </button>
                      ) : null}
                      {r.status !== 'archived' ? (
                        <button
                          type="button"
                          className="text-xs font-medium text-red-600 hover:underline"
                          onClick={() => {
                            setConfirmTarget(r);
                            setConfirmAction('archive');
                          }}
                        >
                          Archive
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminCatalogFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        initial={editing}
        pending={pending}
        onSubmit={handleSubmit}
      />

      <AdminConfirmDialog
        open={Boolean(confirmTarget && confirmAction)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmTarget(null);
            setConfirmAction(null);
          }
        }}
        title={
          confirmAction === 'pause'
            ? 'Pause this reward?'
            : confirmAction === 'resume'
              ? 'Resume this reward?'
              : 'Archive this reward?'
        }
        description={
          confirmAction === 'archive'
            ? 'Archiving prevents new issuance. Existing rewards stay redeemable until expiry.'
            : undefined
        }
        confirmLabel={
          confirmAction === 'pause'
            ? 'Pause'
            : confirmAction === 'resume'
              ? 'Resume'
              : 'Archive'
        }
        destructive={confirmAction === 'archive'}
        pending={pending}
        onConfirm={runConfirm}
      />
    </div>
  );
}
