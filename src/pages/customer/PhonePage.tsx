import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { BrandedButton, OnboardingShell } from '@/components/common';
import { PhoneInput } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import { SAUDI_PHONE_PREFIX } from '@/constants/ui';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { requestOtp, scanLookup } from '@/lib/services';
import {
  phoneFormSchema,
  type PhoneFormValues,
} from '@/lib/validation/phoneSchema';

interface LocationState {
  branchId?: string;
  qrIdentifier?: string;
}

export default function PhonePage(): JSX.Element {
  const { t } = useTranslation('customer');
  const navigate = useNavigate();
  const location = useLocation();
  const stateFromScan = (location.state ?? {}) as LocationState;
  const auth = useCustomerAuth();
  const toastError = useApiErrorToast();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phoneTail: '' },
    mode: 'onBlur',
  });

  // If a long-lived session is already in localStorage, the user has nothing
  // to do here — bounce them to Home. Phone entry is for unauthenticated users
  // only. The QR scan flow has its own entry path via ScanLandingPage.
  // (Placed after all hooks so hook order stays consistent across renders.)
  if (auth.session) {
    return <Navigate to={ROUTES.CUSTOMER.HOME} replace />;
  }

  const onSubmit = async (values: PhoneFormValues): Promise<void> => {
    const fullPhone = `${SAUDI_PHONE_PREFIX}${values.phoneTail}`;
    setSubmitting(true);
    try {
      const lookup = await scanLookup({ phone: fullPhone });

      // Counter flow ONLY: the user arrived via a branch QR scan (branchId in
      // state) AND is a recognised returning customer. Record a stamp with the
      // 5-minute scan token — no OTP, keeps the queue moving. Recognition WITHOUT
      // a branch context must NOT shortcut into the app: the lookup no longer
      // issues a session, so account access falls through to OTP below.
      if (
        stateFromScan.branchId &&
        lookup.exists &&
        lookup.scan_token &&
        lookup.profile
      ) {
        auth.setScan(lookup.scan_token, lookup.profile);

        const nextEligibleAt = lookup.profile.next_eligible_at;
        if (nextEligibleAt && Date.parse(nextEligibleAt) > Date.now()) {
          navigate(ROUTES.CUSTOMER.LOCKOUT, {
            state: { nextEligibleAt },
          });
          return;
        }

        navigate(ROUTES.CUSTOMER.SCAN_AMOUNT, {
          state: {
            branchId: stateFromScan.branchId,
            qrIdentifier: stateFromScan.qrIdentifier,
          },
        });
        return;
      }

      // Everyone else goes through OTP:
      //  - new customer  → verify returns a registration token → register
      //  - returning customer seeking account access (rewards/profile, no
      //    branch scan) → verify logs them in with a session token
      const otpRes = await requestOtp({ phone: fullPhone });
      navigate(ROUTES.CUSTOMER.REGISTER_OTP, {
        state: {
          branchId: stateFromScan.branchId,
          qrIdentifier: stateFromScan.qrIdentifier,
          phone: fullPhone,
          devOtp: otpRes.devOtp,
        },
      });
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingShell
      onBack={() => navigate(-1)}
      stepLabel={t('phone.stepLabel')}
      headlinePre={t('phone.headlinePre')}
      headlineMark={t('phone.headlineMark')}
      description={t('phone.description')}
      footer={
        <BrandedButton
          type="submit"
          form="phone-form"
          fullWidth
          loading={submitting}
        >
          {t('phone.cta')}
        </BrandedButton>
      }
    >
      <form
        id="phone-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <PhoneInput
          label={t('phone.inputLabel')}
          placeholder={t('phone.placeholder')}
          prefixLabel={t('phone.prefix')}
          error={errors.phoneTail ? t('phone.errors.format') : undefined}
          {...register('phoneTail')}
        />

        <p
          className="mt-3 font-sans font-medium text-obsidian/55"
          style={{ fontSize: 12, lineHeight: 1.5 }}
        >
          {t('phone.terms')}
        </p>
      </form>
    </OnboardingShell>
  );
}
