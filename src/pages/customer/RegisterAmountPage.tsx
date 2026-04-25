import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BrandedButton, ScreenShell } from '@/components/common';
import { AmountInput } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import {
  SCAN_MAX_BILL_AMOUNT_SAR,
  SCAN_MIN_BILL_AMOUNT_SAR,
} from '@/constants/ui';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import {
  scanAmountSchema,
  type ScanAmountValues,
} from '@/lib/validation/scanAmountSchema';

interface LocationState {
  phone?: string;
  branchId?: string;
  qrIdentifier?: string;
}

const QUICK_PICKS = [50, 100, 200];

/**
 * Bill-amount step for the registration flow. Visually identical to
 * ScanAmountPage but does NOT call the API — it just collects the amount and
 * carries it forward in router state into RegisterDetailsPage. The amount is
 * sent to the backend along with the registration payload, so the new
 * customer's first visit is recorded with a real bill_amount instead of NULL.
 */
export default function RegisterAmountPage(): JSX.Element {
  const { t } = useTranslation('customer');
  const navigate = useNavigate();
  const location = useLocation();
  const stateParams = (location.state ?? {}) as LocationState;
  const auth = useCustomerAuth();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ScanAmountValues>({
    resolver: zodResolver(scanAmountSchema),
    mode: 'onBlur',
    defaultValues: { bill_amount: undefined as unknown as number },
  });

  // Guard — must be in the registration flow (registration JWT in memory)
  // AND have the originating branch context. Without either we restart.
  if (!auth.registrationToken || !stateParams.branchId) {
    return <Navigate to={ROUTES.CUSTOMER.PHONE} replace />;
  }

  const onSubmit = (values: ScanAmountValues): void => {
    navigate(ROUTES.CUSTOMER.REGISTER_DETAILS, {
      state: {
        ...stateParams,
        bill_amount: values.bill_amount,
      },
    });
  };

  return (
    <ScreenShell
      eyebrow={t('scanAmount.eyebrow')}
      title={t('scanAmount.title')}
      description={t('scanAmount.description')}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="bill_amount"
          control={control}
          render={({ field }) => (
            <AmountInput
              label={t('scanAmount.inputLabel')}
              currencyLabel={t('scanAmount.currency')}
              placeholder="0"
              value={field.value ?? ''}
              onChange={(e) => {
                const raw = e.target.value.trim();
                if (raw === '') {
                  field.onChange(undefined);
                  return;
                }
                const parsed = Number(raw.replace(/,/g, '.'));
                field.onChange(Number.isFinite(parsed) ? parsed : raw);
              }}
              onBlur={field.onBlur}
              error={
                errors.bill_amount
                  ? t('scanAmount.errors.range', {
                      min: SCAN_MIN_BILL_AMOUNT_SAR,
                      max: SCAN_MAX_BILL_AMOUNT_SAR,
                    })
                  : undefined
              }
            />
          )}
        />

        <div className="mt-4">
          <p className="eyebrow text-obsidian/60">
            {t('scanAmount.quickPickLabel')}
          </p>
          <div className="mt-2 flex gap-2">
            {QUICK_PICKS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() =>
                  setValue('bill_amount', n, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className="flex-1 h-11 rounded-md border-hairline border-obsidian/20 bg-white font-mono text-[14px] text-obsidian hover:border-obsidian transition-colors"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <BrandedButton type="submit" fullWidth>
            {t('registerAmount.cta')}
          </BrandedButton>
        </div>
      </form>
    </ScreenShell>
  );
}
