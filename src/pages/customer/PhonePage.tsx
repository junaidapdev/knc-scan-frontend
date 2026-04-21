import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { BrandedButton, ScreenShell } from '@/components/common';
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

  const onSubmit = async (values: PhoneFormValues): Promise<void> => {
    const fullPhone = `${SAUDI_PHONE_PREFIX}${values.phoneTail}`;
    setSubmitting(true);
    try {
      const lookup = await scanLookup({ phone: fullPhone });

      if (lookup.exists && lookup.scan_token && lookup.profile) {
        // Persist the session JWT too (Chunk 7) so returning customers can
        // reach /rewards without re-doing OTP. The scan flow still uses the
        // short-lived scan token explicitly via the service layer, so this
        // does NOT alter the scan auth path.
        if (lookup.session_token && lookup.customer_id) {
          auth.setSession({
            token: lookup.session_token,
            customer: {
              id: lookup.customer_id,
              name: lookup.profile.name ?? '',
              phone: fullPhone,
            },
          });
        }
        auth.setScan(lookup.scan_token, lookup.profile);
        navigate(ROUTES.CUSTOMER.SCAN_AMOUNT, {
          state: {
            branchId: stateFromScan.branchId,
            qrIdentifier: stateFromScan.qrIdentifier,
          },
        });
        return;
      }

      // Unknown customer → request OTP, route to register flow. The JWT is
      // minted later by /auth/otp/verify on RegisterOtpPage.
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
    <ScreenShell
      eyebrow={t('phone.eyebrow')}
      title={t('phone.title')}
      description={t('phone.description')}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <PhoneInput
          label={t('phone.inputLabel')}
          placeholder={t('phone.placeholder')}
          prefixLabel={t('phone.prefix')}
          error={errors.phoneTail ? t('phone.errors.format') : undefined}
          {...register('phoneTail')}
        />
        <div className="mt-6">
          <BrandedButton type="submit" fullWidth loading={submitting}>
            {t('phone.cta')}
          </BrandedButton>
        </div>
      </form>
    </ScreenShell>
  );
}
