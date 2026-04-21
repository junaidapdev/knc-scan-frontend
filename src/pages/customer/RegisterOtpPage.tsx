import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BrandedButton, ScreenShell } from '@/components/common';
import { OtpInput } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import {
  OTP_LENGTH,
  OTP_RESEND_COOLDOWN_SECONDS,
} from '@/constants/ui';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { requestOtp, verifyOtp } from '@/lib/services';

interface LocationState {
  phone?: string;
  branchId?: string;
  qrIdentifier?: string;
  devOtp?: string;
}

export default function RegisterOtpPage(): JSX.Element {
  const { t } = useTranslation('customer');
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, branchId, qrIdentifier, devOtp: initialDevOtp } =
    (location.state ?? {}) as LocationState;
  const auth = useCustomerAuth();
  const toastError = useApiErrorToast();

  const [otp, setOtp] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(
    OTP_RESEND_COOLDOWN_SECONDS,
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | undefined>(initialDevOtp);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  if (!phone) {
    return <Navigate to={ROUTES.CUSTOMER.PHONE} replace />;
  }

  const verify = async (code: string): Promise<void> => {
    setSubmitting(true);
    setLocalError(null);
    try {
      const res = await verifyOtp({ phone, otp: code });
      auth.setRegistration(res.token, phone);
      navigate(ROUTES.CUSTOMER.REGISTER_DETAILS, {
        state: { branchId, qrIdentifier, phone },
      });
    } catch (err) {
      toastError(err);
      setLocalError(t('registerOtp.errors.format'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async (): Promise<void> => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      const res = await requestOtp({ phone });
      setDevOtp(res.devOtp);
      setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      toastError(err);
    } finally {
      setResending(false);
    }
  };

  return (
    <ScreenShell
      eyebrow={t('registerOtp.eyebrow')}
      title={t('registerOtp.title')}
      description={t('registerOtp.description', { phone })}
    >
      {devOtp ? (
        <div
          role="status"
          className="mb-4 rounded-md border border-yellow-400 bg-yellow-50 px-3 py-2 font-sans text-[13px] text-yellow-900"
        >
          <span className="font-semibold">DEV OTP:</span>{' '}
          <span className="font-mono tracking-widest">{devOtp}</span>
          <span className="ml-2 opacity-60">(shown because NODE_ENV=development)</span>
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (otp.length === OTP_LENGTH) void verify(otp);
        }}
        noValidate
      >
        <OtpInput
          label={t('registerOtp.title')}
          value={otp}
          onChange={setOtp}
          onComplete={(v) => void verify(v)}
          error={localError ?? undefined}
        />

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={cooldown > 0 || resending}
            className="font-sans text-[13px] font-semibold text-obsidian underline-offset-2 hover:underline disabled:text-obsidian/40 disabled:no-underline"
          >
            {cooldown > 0
              ? t('registerOtp.resendIn', { seconds: cooldown })
              : t('registerOtp.resend')}
          </button>
        </div>

        <div className="mt-6">
          <BrandedButton
            type="submit"
            fullWidth
            loading={submitting}
            disabled={otp.length !== OTP_LENGTH}
          >
            {t('registerOtp.cta')}
          </BrandedButton>
        </div>
      </form>
    </ScreenShell>
  );
}
