import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BrandedButton, OnboardingShell } from '@/components/common';
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

  const errorMsg = errors.bill_amount
    ? t('scanAmount.errors.range', {
        min: SCAN_MIN_BILL_AMOUNT_SAR,
        max: SCAN_MAX_BILL_AMOUNT_SAR,
      })
    : null;

  return (
    <OnboardingShell
      onBack={() => navigate(-1)}
      stepLabel={t('scanAmount.stepLabelReturning')}
      headlinePre={t('scanAmount.headlinePre')}
      headlineMark={t('scanAmount.headlineMark')}
      description={t('scanAmount.description')}
      footer={
        <BrandedButton
          type="submit"
          form="scan-amount-form"
          fullWidth
          loading={submitting}
        >
          {t('scanAmount.cta')}
        </BrandedButton>
      }
    >
      <form
        id="scan-amount-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Controller
          name="bill_amount"
          control={control}
          render={({ field }) => {
            const display =
              typeof field.value === 'number' && Number.isFinite(field.value)
                ? String(field.value)
                : '';
            return (
              <>
                <div
                  className="relative flex items-baseline justify-center gap-2 overflow-hidden rounded-2xl"
                  style={{
                    padding: '28px 24px',
                    background: '#FFFFFF',
                    border: errorMsg ? '2px solid #C73B3B' : '2px solid #0D0D0D',
                    direction: 'ltr',
                  }}
                >
                  <input
                    id="amount-input"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    aria-label={t('scanAmount.inputLabel')}
                    aria-invalid={Boolean(errorMsg)}
                    placeholder="0"
                    value={display}
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
                    className="bg-transparent text-center font-display font-black text-obsidian placeholder:text-obsidian/25 focus:outline-none"
                    style={{
                      fontSize: 64,
                      letterSpacing: '-3px',
                      lineHeight: 1,
                      width: '60%',
                      minWidth: 80,
                    }}
                  />
                  <span
                    className="font-sans font-bold text-obsidian/55"
                    style={{ fontSize: 18, letterSpacing: 1 }}
                  >
                    {t('scanAmount.currency')}
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
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
                      className="flex-1 font-display font-bold text-obsidian transition-colors hover:bg-yellow"
                      style={{
                        height: 44,
                        borderRadius: 999,
                        background: '#FFFFFF',
                        border: '1.5px solid #0D0D0D',
                        fontSize: 14,
                        direction: 'ltr',
                      }}
                    >
                      {n} {t('scanAmount.currency')}
                    </button>
                  ))}
                </div>

                {errorMsg ? (
                  <p
                    className="mt-2 font-sans font-medium text-danger"
                    style={{ fontSize: 13 }}
                  >
                    {errorMsg}
                  </p>
                ) : null}
              </>
            );
          }}
        />
      </form>
    </OnboardingShell>
  );
}
