import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type {
  AdminCatalogFormPayload,
  AdminCatalogItem,
} from '@/interfaces/admin';

const CODE_PREFIX_REGEX = /^[A-Z]+(-[A-Z]+)*$/;

export const adminCatalogFormSchema = z.object({
  code_prefix: z
    .string()
    .min(2, 'At least 2 characters')
    .max(40, 'At most 40 characters')
    .regex(CODE_PREFIX_REGEX, 'Uppercase letters and hyphens only (e.g. BOX-FAHADAH)'),
  name_en: z.string().min(1, 'Required').max(120),
  name_ar: z.string().min(1, 'Required').max(120),
  description_en: z.string().max(500).optional(),
  description_ar: z.string().max(500).optional(),
  image_url: z
    .string()
    .max(500)
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  estimated_value_sar: z.coerce.number().nonnegative().max(100000),
  default_expiry_days: z.coerce.number().int().positive().max(3650),
});

export type AdminCatalogFormValues = z.infer<typeof adminCatalogFormSchema>;

export interface AdminCatalogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: AdminCatalogItem | null;
  pending?: boolean;
  onSubmit: (values: AdminCatalogFormPayload) => void | Promise<void>;
}

export default function AdminCatalogFormDialog({
  open,
  onOpenChange,
  initial,
  pending,
  onSubmit,
}: AdminCatalogFormDialogProps): JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminCatalogFormValues>({
    resolver: zodResolver(adminCatalogFormSchema),
    defaultValues: {
      code_prefix: '',
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      image_url: '',
      estimated_value_sar: 0,
      default_expiry_days: 90,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      code_prefix: initial?.code_prefix ?? '',
      name_en: initial?.name_en ?? '',
      name_ar: initial?.name_ar ?? '',
      description_en: initial?.description_en ?? '',
      description_ar: initial?.description_ar ?? '',
      image_url: initial?.image_url ?? '',
      estimated_value_sar: initial?.estimated_value_sar ?? 0,
      default_expiry_days: initial?.default_expiry_days ?? 90,
    });
  }, [open, initial, reset]);

  const submit = (values: AdminCatalogFormValues): void => {
    const payload: AdminCatalogFormPayload = {
      code_prefix: values.code_prefix,
      name_en: values.name_en,
      name_ar: values.name_ar,
      description_en: values.description_en || undefined,
      description_ar: values.description_ar || undefined,
      image_url: values.image_url || undefined,
      estimated_value_sar: values.estimated_value_sar,
      default_expiry_days: values.default_expiry_days,
    };
    void onSubmit(payload);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-obsidian">
            {initial ? 'Edit reward' : 'Add reward'}
          </Dialog.Title>
          <form
            className="mt-4 grid grid-cols-2 gap-4"
            onSubmit={handleSubmit(submit)}
            noValidate
          >
            <Field
              label="Code prefix"
              error={errors.code_prefix?.message}
              className="col-span-2"
            >
              <input
                type="text"
                disabled={Boolean(initial)}
                className="w-full rounded border border-obsidian/20 px-3 py-2 font-mono uppercase disabled:bg-obsidian/5"
                {...register('code_prefix')}
              />
            </Field>
            <Field label="Name (English)" error={errors.name_en?.message}>
              <input
                type="text"
                className="w-full rounded border border-obsidian/20 px-3 py-2"
                {...register('name_en')}
              />
            </Field>
            <Field label="Name (Arabic)" error={errors.name_ar?.message}>
              <input
                type="text"
                className="w-full rounded border border-obsidian/20 px-3 py-2"
                {...register('name_ar')}
              />
            </Field>
            <Field label="Description (EN)" error={errors.description_en?.message} className="col-span-2">
              <textarea
                rows={2}
                className="w-full rounded border border-obsidian/20 px-3 py-2"
                {...register('description_en')}
              />
            </Field>
            <Field label="Description (AR)" error={errors.description_ar?.message} className="col-span-2">
              <textarea
                rows={2}
                className="w-full rounded border border-obsidian/20 px-3 py-2"
                {...register('description_ar')}
              />
            </Field>
            <Field label="Image URL" error={errors.image_url?.message} className="col-span-2">
              <input
                type="url"
                className="w-full rounded border border-obsidian/20 px-3 py-2"
                {...register('image_url')}
              />
            </Field>
            <Field
              label="Estimated value (SAR)"
              error={errors.estimated_value_sar?.message}
            >
              <input
                type="number"
                step="0.01"
                className="w-full rounded border border-obsidian/20 px-3 py-2 font-mono"
                {...register('estimated_value_sar')}
              />
            </Field>
            <Field
              label="Default expiry (days)"
              error={errors.default_expiry_days?.message}
            >
              <input
                type="number"
                className="w-full rounded border border-obsidian/20 px-3 py-2 font-mono"
                {...register('default_expiry_days')}
              />
            </Field>
            <div className="col-span-2 mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded border border-obsidian/20 px-4 py-2 text-sm font-medium"
                disabled={pending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-yellow px-4 py-2 text-sm font-semibold text-obsidian hover:bg-yellow-hover disabled:opacity-60"
                disabled={pending}
              >
                {pending ? 'Saving…' : initial ? 'Save changes' : 'Create reward'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, error, className, children }: FieldProps): JSX.Element {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className ?? ''}`}>
      <span className="font-medium text-obsidian">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
