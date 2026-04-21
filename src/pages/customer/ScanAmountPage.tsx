import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BrandedButton, ScreenShell } from '@/components/common';
import { AmountInput } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import { ERROR_CODES } from '@/constants/errors';
import {
  SCAN_MAX_BILL_AMOUNT_SAR,
  SCAN_MIN_BILL_AMOUNT_SAR,
} from '@/constants/ui';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { ApiCallError } from '@/lib/api';
import { recordVisit } from '@/lib/services';
import { ANALYTICS_EVENTS, track } from '@/lib/analytics';
import {
  scanAmountSchema,
  type ScanAmountValues,
} from '@/lib/validation/scanAmountSchema';
import type { LockoutResult, ScanResult } from '@/interfaces/visit';

interface LocationState {
  branchId?: string;
  qrIdentifier?: string;
}

const QUICK_PICKS = [50, 100, 200];

export default function ScanAmountPage(): JSX.Element {
  const { t } = useTranslation('customer');
  const navigate = useNavigate();
  const location = useLocation();
  const stateParams = (location.state ?? {}) as LocationState;
  const auth = useCustomerAuth();
  const toastError = useApiErrorToast();
  const [submitting, setSubmitting] = useState<boolean>(false);

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

  // Guard — require both the short-lived scan token AND the QR identifier.
  // Without the QR identifier the backend can't resolve the branch, so we send
  // the user back to the entry point.
  if (!auth.scanToken || !stateParams.qrIdentifier) {
    return <Navigate to={ROUTES.CUSTOMER.SCAN} replace />;
  }

  const onSubmit = async (values: ScanAmountValues): Promise<void> => {
    if (!auth.scanToken || !stateParams.qrIdentifier) return;
    setSubmitting(true);
    try {
      const result: ScanResult = await recordVisit(
        {
          branch_qr_identifier: stateParams.qrIdentifier,
          bill_amount: values.bill_amount,
        },
        auth.scanToken,
      );

      track(ANALYTICS_EVENTS.STAMP_EARNED, {
        visitId: result.visit_id,
        stamps: result.current_stamps,
      });

      // Promote the scan into a session-less stamp success view. We pass the
      // scan result through navigation state — the success page reads it and
      // does not refetch.
      auth.clearScan();
      navigate(ROUTES.CUSTOMER.STAMP_SUCCESS, {
        state: { scanResult: result, scanProfile: auth.scanProfile },
      });
    } catch (err) {
      if (
        err instanceof ApiCallError &&
        err.code === ERROR_CODES.SCAN_LOCKOUT_ACTIVE
      ) {
        const details = (err.details ?? {}) as Partial<LockoutResult>;
        auth.clearScan();
        navigate(ROUTES.CUSTOMER.LOCKOUT, {
          state: { nextEligibleAt: details.next_eligible_at },
        });
        return;
      }
      toastError(err);
    } finally {
      setSubmitting(false);
    }
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
          <BrandedButton type="submit" fullWidth loading={submitting}>
            {t('scanAmount.cta')}
          </BrandedButton>
        </div>
      </form>
    </ScreenShell>
  );
}
