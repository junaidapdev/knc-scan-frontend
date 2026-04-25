import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  BrandedButton,
  ErrorFallback,
  LoadingSkeleton,
  OnboardingShell,
} from '@/components/common';
import {
  BirthdayPicker,
  BranchSelect,
  ConsentCheckbox,
  LanguageRadioGroup,
  TextInput,
} from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import type { SupportedLanguage } from '@/constants/ui';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { useBranches } from '@/hooks/useBranches';
import { registerCustomer } from '@/lib/services';
import { ANALYTICS_EVENTS, track } from '@/lib/analytics';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '@/lib/validation/registerSchema';

interface LocationState {
  phone?: string;
  branchId?: string;
  qrIdentifier?: string;
  bill_amount?: number;
}

export default function RegisterDetailsPage(): JSX.Element {
  const { t, i18n } = useTranslation('customer');
  const navigate = useNavigate();
  const location = useLocation();
  const stateParams = (location.state ?? {}) as LocationState;
  const auth = useCustomerAuth();
  const toastError = useApiErrorToast();
  const { state: branchesState, reload } = useBranches();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const defaultLang = (i18n.language.split('-')[0] ?? 'ar') as SupportedLanguage;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      birthday_month: undefined,
      birthday_day: undefined,
      preferred_branch_id: stateParams.branchId ?? '',
      language: defaultLang,
      consent_marketing: false as unknown as true,
    },
  });

  if (!auth.registrationToken || !auth.registrationPhone) {
    return <Navigate to={ROUTES.CUSTOMER.PHONE} replace />;
  }

  if (typeof stateParams.bill_amount !== 'number') {
    return (
      <Navigate
        to={ROUTES.CUSTOMER.REGISTER_AMOUNT}
        replace
        state={{
          phone: stateParams.phone,
          branchId: stateParams.branchId,
          qrIdentifier: stateParams.qrIdentifier,
        }}
      />
    );
  }

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    if (!stateParams.branchId) {
      toastError(new Error(t('errors.unknown')));
      return;
    }
    setSubmitting(true);
    try {
      const res = await registerCustomer(
        {
          phone: auth.registrationPhone as string,
          name: values.name,
          birthday_month: values.birthday_month,
          birthday_day: values.birthday_day,
          preferred_branch_id: values.preferred_branch_id,
          language: values.language,
          consent_marketing: true,
          branch_scan_id: stateParams.branchId,
          bill_amount: stateParams.bill_amount as number,
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

  if (branchesState.status === 'loading') {
    return (
      <OnboardingShell
        onBack={() => navigate(-1)}
        headlinePre={t('registerDetails.headlinePre')}
        headlineMark={t('registerDetails.headlineMark')}
        headlineBreak={false}
        description={t('registerDetails.description')}
      >
        <LoadingSkeleton className="h-12 w-full rounded-xl" />
        <div className="h-3" />
        <LoadingSkeleton className="h-12 w-full rounded-xl" />
        <div className="h-3" />
        <LoadingSkeleton className="h-12 w-full rounded-xl" />
      </OnboardingShell>
    );
  }

  if (branchesState.status === 'error') {
    return (
      <OnboardingShell
        onBack={() => navigate(-1)}
        headlinePre={t('registerDetails.headlinePre')}
        headlineMark={t('registerDetails.headlineMark')}
        headlineBreak={false}
      >
        <ErrorFallback onRetry={reload} />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      onBack={() => navigate(-1)}
      headlinePre={t('registerDetails.headlinePre')}
      headlineMark={t('registerDetails.headlineMark')}
      headlineBreak={false}
      description={t('registerDetails.description')}
      scrollable
      footer={
        <BrandedButton
          type="submit"
          form="register-form"
          fullWidth
          loading={submitting}
        >
          {t('registerDetails.cta')}
        </BrandedButton>
      }
    >
      <form
        id="register-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        <TextInput
          label={t('registerDetails.nameLabel')}
          placeholder={t('registerDetails.namePlaceholder')}
          error={
            errors.name ? t('registerDetails.errors.nameRequired') : undefined
          }
          {...register('name')}
        />

        <Controller
          name="birthday_month"
          control={control}
          render={({ field: monthField }) => (
            <Controller
              name="birthday_day"
              control={control}
              render={({ field: dayField }) => (
                <BirthdayPicker
                  label={t('registerDetails.birthdayLabel')}
                  month={monthField.value ?? null}
                  day={dayField.value ?? null}
                  onChangeMonth={(m) =>
                    monthField.onChange(m ?? undefined)
                  }
                  onChangeDay={(d) => dayField.onChange(d ?? undefined)}
                  error={
                    errors.birthday_month || errors.birthday_day
                      ? t('registerDetails.errors.nameRequired')
                      : undefined
                  }
                />
              )}
            />
          )}
        />

        <Controller
          name="preferred_branch_id"
          control={control}
          render={({ field }) => (
            <BranchSelect
              label={t('registerDetails.preferredBranchLabel')}
              placeholder={t('registerDetails.preferredBranchLabel')}
              branches={branchesState.branches}
              error={
                errors.preferred_branch_id
                  ? t('registerDetails.errors.branchRequired')
                  : undefined
              }
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              name={field.name}
            />
          )}
        />

        <Controller
          name="language"
          control={control}
          render={({ field }) => (
            <LanguageRadioGroup
              label={t('registerDetails.languageLabel')}
              value={(field.value ?? defaultLang) as SupportedLanguage}
              onChange={field.onChange}
            />
          )}
        />

        {/* Consent — yellow-tint card wrapping the styled checkbox */}
        <div
          className="rounded-xl"
          style={{
            padding: '14px 14px',
            background: '#FFF8D6',
            border: '1.5px solid #0D0D0D',
          }}
        >
          <ConsentCheckbox
            label={t('registerDetails.consentLabel')}
            error={
              errors.consent_marketing
                ? t('registerDetails.errors.consentRequired')
                : undefined
            }
            {...register('consent_marketing')}
          />
        </div>
      </form>
    </OnboardingShell>
  );
}
