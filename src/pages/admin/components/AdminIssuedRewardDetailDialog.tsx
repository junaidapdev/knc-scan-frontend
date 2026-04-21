import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

import { AdminStatusBadge } from '@/components/admin';
import type {
  AdminIssuedRewardDetail,
  AdminIssuedRewardRow,
} from '@/interfaces/admin';
import {
  getIssuedRewardDetail,
  voidIssuedReward,
} from '@/lib/adminApi';
import { logger } from '@/lib/logger';

import AdminVoidRewardDialog from './AdminVoidRewardDialog';

export interface AdminIssuedRewardDetailDialogProps {
  row: AdminIssuedRewardRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoided: () => void;
}

export default function AdminIssuedRewardDetailDialog({
  row,
  open,
  onOpenChange,
  onVoided,
}: AdminIssuedRewardDetailDialogProps): JSX.Element {
  const [detail, setDetail] = useState<AdminIssuedRewardDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [voidOpen, setVoidOpen] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);

  useEffect(() => {
    if (!open || !row) return;
    setLoading(true);
    getIssuedRewardDetail(row.id)
      .then(setDetail)
      .catch((err: unknown) => {
        logger.error('[issued-detail] fetch failed', { err });
      })
      .finally(() => setLoading(false));
  }, [open, row]);

  const handleVoid = async (reason: string): Promise<void> => {
    if (!row) return;
    setPending(true);
    try {
      await voidIssuedReward(row.id, reason);
      setVoidOpen(false);
      onVoided();
      onOpenChange(false);
    } catch (err) {
      logger.error('[issued-detail] void failed', { err });
    } finally {
      setPending(false);
    }
  };

  const displayStatus = detail?.voided_at
    ? 'voided'
    : (detail?.status ?? 'pending');

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-obsidian">
              Reward {row?.unique_code ?? ''}
            </Dialog.Title>
            {loading || !detail ? (
              <p className="mt-3 text-sm text-obsidian/60">Loading…</p>
            ) : (
              <div className="mt-4 space-y-3 text-sm">
                <Row label="Status">
                  <AdminStatusBadge kind="issued" status={displayStatus} />
                </Row>
                <Row label="Customer">
                  {detail.customer_name ?? '—'}
                  <span className="ms-2 font-mono text-obsidian/70">
                    {detail.customer_phone_full}
                  </span>
                </Row>
                <Row label="Reward">{detail.reward_name_snapshot}</Row>
                <Row label="Issued">
                  {new Date(detail.issued_at).toLocaleString()}
                </Row>
                <Row label="Expires">
                  {new Date(detail.expires_at).toLocaleString()}
                </Row>
                {detail.redeemed_at ? (
                  <>
                    <Row label="Redeemed">
                      {new Date(detail.redeemed_at).toLocaleString()}
                    </Row>
                    <Row label="Branch">
                      {detail.redeemed_at_branch_name ?? '—'}
                    </Row>
                    <Row label="IP">
                      <span className="font-mono text-xs">
                        {detail.redemption_ip ?? '—'}
                      </span>
                    </Row>
                    <Row label="Device">
                      <span className="break-all font-mono text-xs">
                        {detail.redemption_device_fingerprint ?? '—'}
                      </span>
                    </Row>
                  </>
                ) : null}
                {detail.voided_at ? (
                  <>
                    <Row label="Voided">
                      {new Date(detail.voided_at).toLocaleString()}
                    </Row>
                    <Row label="Void reason">{detail.void_reason ?? '—'}</Row>
                  </>
                ) : null}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              {detail?.status === 'pending' && !detail.voided_at ? (
                <button
                  type="button"
                  className="rounded border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  onClick={() => setVoidOpen(true)}
                >
                  Void
                </button>
              ) : null}
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
      <AdminVoidRewardDialog
        open={voidOpen}
        onOpenChange={setVoidOpen}
        pending={pending}
        onConfirm={handleVoid}
      />
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-obsidian/5 pb-2">
      <span className="text-xs uppercase tracking-wider text-obsidian/60">
        {label}
      </span>
      <span className="text-right text-obsidian">{children}</span>
    </div>
  );
}
