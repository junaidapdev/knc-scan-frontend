import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

export interface AdminConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
  confirmDisabled?: boolean;
  pending?: boolean;
  children?: ReactNode;
}

export default function AdminConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  destructive,
  confirmDisabled,
  pending,
  children,
}: AdminConfirmDialogProps): JSX.Element {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-obsidian">
            {title}
          </Dialog.Title>
          {description ? (
            <Dialog.Description className="mt-2 text-sm text-obsidian/70">
              {description}
            </Dialog.Description>
          ) : null}
          {children ? <div className="mt-4">{children}</div> : null}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="rounded border border-obsidian/20 px-4 py-2 text-sm font-medium text-obsidian hover:bg-obsidian/5"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`rounded px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                destructive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-obsidian hover:bg-obsidian/90'
              }`}
              onClick={() => {
                void onConfirm();
              }}
              disabled={confirmDisabled || pending}
            >
              {pending ? 'Working…' : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
