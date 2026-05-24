import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BrandedButton, OnboardingShell } from '@/components/common';
import { TextInput } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import {
  SCAN_MAX_BILL_AMOUNT_SAR,
  SCAN_MIN_BILL_AMOUNT_SAR,
  type SupportedLanguage,
} from '@/constants/ui';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { ANALYTICS_EVENTS, track } from '@/lib/analytics';
import { registerCustomer } from '@/lib/services';
import {
  registerAmountSchema,
  type RegisterAmountValues,
} from '@/lib/validation/registerAmountSchema';

interface LocationState {
  phone?: string;
  branchId?: string;
  qrIdentifier?: string;
}

/**
 * Bill-amount step for the registration flow. As of Chunk 10 this is also the
 * LAST step — the previous "details" page (name, birthday, branch, language,
 * consent checkbox) was removed to cut counter-side friction.
 *
 * Visible inputs:
 *   - name                                : OPTIONAL. If the customer types
 *     2+ characters we use it; otherwise we fall back to a localised
 *     "Guest" placeholder (backend zod requires name.min(2)).
 *   - bill_amount                         : REQUIRED.
 *
 * Hidden fields are auto-filled from context at submit time:
 *   - preferred_branch_id, branch_scan_id : the QR-scan branch the customer
 *     is standing at (already in route state)
 *   - language                            : current i18n locale
 *   - birthday_month / birthday_day       : 1 / 1 sentinel — backend zod
 *     requires non-null ints; treat in analytics as "not collected"
 *   - consent_marketing                   : true, implied by tapping the CTA;
 *     we surface that promise as fine-print under the button
 */
export default function RegisterAmountPage(): JSX.Element {
  const { t, i18n } = useTranslation('customer');
  const navigate = useNavigate();
  const location = useLocation();
  const stateParams = (location.state ?? {}) as LocationState;
  const auth = useCustomerAuth();
  const toastError = useApiErrorToast();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<RegisterAmountValues>({
    resolver: zodResolver(registerAmountSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      bill_amount: undefined as unknown as number,
    },
  });

  if (
    !auth.registrationToken ||
    !auth.registrationPhone ||
    !stateParams.branchId
  ) {
    return <Navigate to={ROUTES.CUSTOMER.PHONE} replace />;
  }

  // Narrow the runtime locale to the supported set; default to 'en' on anything
  // we don't recognise so the backend zod enum doesn't reject the payload.
  const langPart = i18n.language.split('-')[0];
  const language: SupportedLanguage = langPart === 'ar' ? 'ar' : 'en';
  const guestName = language === 'ar' ? 'زبون' : 'Guest';

  const onSubmit = async (values: RegisterAmountValues): Promise<void> => {
    // Optional name: use it when present, otherwise use the localised
    // placeholder so the backend min(2) validator still accepts the payload.
    const trimmedName = values.name.trim();
    const finalName = trimmedName.length >= 2 ? trimmedName : guestName;

    setSubmitting(true);
    try {
      const res = await registerCustomer(
        {
          phone: auth.registrationPhone as string,
          name: finalName,
          birthday_month: 1,
          birthday_day: 1,
          preferred_branch_id: stateParams.branchId as string,
          language,
          consent_marketing: true,
          branch_scan_id: stateParams.branchId as string,
          bill_amount: values.bill_amount,
        },
        auth.registrationToken as string,
      );

      auth.setSession({
        token: res.session.token,
        customer: {
          id: res.customer.id,
          name: res.customer.name,
          phone: res.customer.phone,
        },
      });
      auth.clearRegistration();
      track(ANALYTICS_EVENTS.REGISTRATION_COMPLETED, {
        customerId: res.customer.id,
      });
      navigate(ROUTES.CUSTOMER.STAMP_SUCCESS, {
        state: {
          firstStamp: {
            current: res.stamp.current,
            name: res.customer.name,
          },
        },
      });
    } catch (err) {
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
      stepLabel={t('scanAmount.stepLabelRegister')}
      headlinePre={t('scanAmount.headlinePre')}
      headlineMark={t('scanAmount.headlineMark')}
      description={t('scanAmount.description')}
      footer={
        <>
          <BrandedButton
            type="submit"
            form="amount-form"
            fullWidth
            loading={submitting}
          >
            {t('registerAmount.cta')}
          </BrandedButton>
          <p
            className="mt-3 text-center font-sans font-medium text-obsidian/55"
            style={{ fontSize: 12, lineHeight: 1.5 }}
          >
            {t('registerAmount.consent')}
          </p>
          <p
            className="mt-1 text-center font-sans font-medium text-obsidian/55"
            style={{ fontSize: 12, lineHeight: 1.5 }}
          >
            {t('registerAmount.privacyPrefix')}{' '}
            <Link
              to={ROUTES.PRIVACY}
              className="font-bold text-obsidian underline underline-offset-2"
            >
              {t('registerAmount.privacyLink')}
            </Link>
          </p>
        </>
      }
    >
      <form
        id="amount-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        {/* data-clarity-mask: name is PII — mask it from Clarity recordings
            regardless of the dashboard masking mode. */}
        <div data-clarity-mask="true">
          <TextInput
            label={t('registerAmount.nameLabel')}
            placeholder={t('registerAmount.namePlaceholder')}
            autoComplete="given-name"
            error={errors.name ? t('registerAmount.errors.nameTooShort') : undefined}
            {...register('name')}
          />
        </div>

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
                {/* Big amount display — input itself is the display */}
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
