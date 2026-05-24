import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BrandedButton, OnboardingShell } from '@/components/common';
import { BillAmountField, TextInput } from '@/components/customer';
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
 *   - name                                : REQUIRED (min 2 chars).
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

  const onSubmit = async (values: RegisterAmountValues): Promise<void> => {
    // Name is required (schema enforces min 2 chars), so use it directly.
    const finalName = values.name.trim();

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
          render={({ field }) => (
            <>
              <BillAmountField
                value={
                  typeof field.value === 'number' ? field.value : undefined
                }
                onChange={field.onChange}
                onBlur={field.onBlur}
                currencyLabel={t('scanAmount.currency')}
                inputLabel={t('scanAmount.inputLabel')}
                error={Boolean(errorMsg)}
              />

              {errorMsg ? (
                <p
                  className="mt-2 font-sans font-medium text-danger"
                  style={{ fontSize: 13 }}
                >
                  {errorMsg}
                </p>
              ) : null}
            </>
          )}
        />
      </form>
    </OnboardingShell>
  );
}
