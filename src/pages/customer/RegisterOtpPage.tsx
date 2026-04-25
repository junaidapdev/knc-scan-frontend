import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BrandedButton, OnboardingShell } from '@/components/common';
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

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  const last3 = digits.slice(-3);
  const first2 = digits.slice(3, 5); // skip "966" prefix
  return `+966 ${first2 || '5'}•• ••• ${last3}`;
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
      navigate(ROUTES.CUSTOMER.REGISTER_AMOUNT, {
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
    <OnboardingShell
      onBack={() => navigate(-1)}
      stepLabel={t('registerOtp.stepLabel')}
      headlinePre={t('registerOtp.headlinePre')}
      headlineMark={t('registerOtp.headlineMark')}
      description={
        <>
          {t('registerOtp.descriptionPre')}{' '}
          <span
            className="font-mono font-bold text-obsidian"
            style={{ direction: 'ltr', display: 'inline-block' }}
          >
            {maskPhone(phone)}
          </span>
        </>
      }
      footer={
        <BrandedButton
          type="submit"
          form="otp-form"
          fullWidth
          loading={submitting}
          disabled={otp.length !== OTP_LENGTH}
        >
          {t('registerOtp.cta')}
        </BrandedButton>
      }
    >
      <form
        id="otp-form"
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

        {/* DEV-OTP banner */}
        {devOtp ? (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-lg"
            style={{
              padding: '10px 14px',
              background: '#FFF8D6',
              border: '1px solid #0D0D0D',
            }}
          >
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center font-display font-black"
              style={{
                background: '#0D0D0D',
                color: '#FFD700',
                padding: '2px 6px',
                borderRadius: 3,
                fontSize: 9,
                letterSpacing: 0.5,
              }}
            >
              DEV
            </span>
            <span
              className="font-mono font-bold text-obsidian"
              style={{ fontSize: 12, letterSpacing: 0.5 }}
            >
              {t('registerOtp.devCode')}{' '}
              <span style={{ direction: 'ltr', display: 'inline-block' }}>
                {devOtp}
              </span>
            </span>
          </div>
        ) : null}

        {/* Resend row */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <span
            className="font-sans font-medium text-obsidian/55"
            style={{ fontSize: 13 }}
          >
            {t('registerOtp.didntGet')}
          </span>
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={cooldown > 0 || resending}
            className="font-sans font-bold text-obsidian transition-colors disabled:text-obsidian/40 disabled:no-underline"
            style={{
              fontSize: 13,
              borderBottom:
                cooldown > 0 || resending ? 'none' : '1.5px solid #0D0D0D',
              padding: 0,
              background: 'transparent',
            }}
          >
            {cooldown > 0 ? (
              <span
                className="font-mono"
                style={{ direction: 'ltr', display: 'inline-block' }}
              >
                {`0:${String(cooldown).padStart(2, '0')}`}
              </span>
            ) : (
              t('registerOtp.resend')
            )}
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
