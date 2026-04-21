import { useState } from 'react';

import { AdminConfirmDialog } from '@/components/admin';

export interface AdminSoftDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string | null;
  onConfirmed: () => void | Promise<void>;
}

const CONFIRM_WORD = 'DELETE';

export default function AdminSoftDeleteDialog({
  open,
  onOpenChange,
  customerName,
  onConfirmed,
}: AdminSoftDeleteDialogProps): JSX.Element {
  const [typed, setTyped] = useState<string>('');
  const [pending, setPending] = useState<boolean>(false);

  const matches = typed.trim() === CONFIRM_WORD;

  const handle = async (): Promise<void> => {
    if (!matches) return;
    setPending(true);
    try {
      await onConfirmed();
      setTyped('');
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped('');
        onOpenChange(next);
      }}
      title="Soft-delete this customer?"
      description={`This will hide ${customerName ?? 'the customer'} from all lists. Data is retained for compliance.`}
      confirmLabel="Delete customer"
      destructive
      pending={pending}
      confirmDisabled={!matches}
      onConfirm={handle}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-obsidian">
          Type <strong>{CONFIRM_WORD}</strong> to confirm
        </span>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="rounded border border-obsidian/20 px-3 py-2 focus:border-yellow focus:outline-none"
        />
      </label>
    </AdminConfirmDialog>
  );
}
