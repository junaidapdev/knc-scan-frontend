import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  BrandedButton,
  ErrorFallback,
  LoadingSkeleton,
  ScreenShell,
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
      <ScreenShell
        eyebrow={t('registerDetails.eyebrow')}
        title={t('registerDetails.title')}
      >
        <LoadingSkeleton className="h-12 w-full" />
        <LoadingSkeleton className="mt-4 h-12 w-full" />
        <LoadingSkeleton className="mt-4 h-12 w-full" />
      </ScreenShell>
    );
  }

  if (branchesState.status === 'error') {
    return (
      <ScreenShell
        eyebrow={t('registerDetails.eyebrow')}
        title={t('registerDetails.title')}
      >
        <ErrorFallback onRetry={reload} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      eyebrow={t('registerDetails.eyebrow')}
      title={t('registerDetails.title')}
      description={t('registerDetails.description')}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
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

        <ConsentCheckbox
          label={t('registerDetails.consentLabel')}
          error={
            errors.consent_marketing
              ? t('registerDetails.errors.consentRequired')
              : undefined
          }
          {...register('consent_marketing')}
        />

        <BrandedButton type="submit" fullWidth loading={submitting}>
          {t('registerDetails.cta')}
        </BrandedButton>
      </form>
    </ScreenShell>
  );
}
