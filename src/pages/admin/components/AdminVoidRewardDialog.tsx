import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AdminConfirmDialog } from '@/components/admin';

const schema = z.object({
  reason: z.string().min(3, 'Provide a short reason (3+ chars)').max(500),
});

type VoidFormValues = z.infer<typeof schema>;

export interface AdminVoidRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending?: boolean;
  onConfirm: (reason: string) => void | Promise<void>;
}

export default function AdminVoidRewardDialog({
  open,
  onOpenChange,
  pending,
  onConfirm,
}: AdminVoidRewardDialogProps): JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<VoidFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { reason: '' },
  });

  useEffect(() => {
    if (!open) reset({ reason: '' });
  }, [open, reset]);

  const submit = (values: VoidFormValues): void => {
    void onConfirm(values.reason);
  };

  return (
    <AdminConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Void this reward?"
      description="The reward cannot be redeemed after voiding."
      confirmLabel="Void reward"
      destructive
      pending={pending}
      confirmDisabled={!isValid}
      onConfirm={() => handleSubmit(submit)()}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-obsidian">Reason</span>
        <textarea
          rows={3}
          className="rounded border border-obsidian/20 px-3 py-2"
          {...register('reason')}
        />
        {errors.reason ? (
          <span className="text-xs text-red-600">{errors.reason.message}</span>
        ) : null}
      </label>
    </AdminConfirmDialog>
  );
}
