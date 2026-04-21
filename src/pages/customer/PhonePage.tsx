import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

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

const HERO_EMOJI: ReadonlyArray<{
  char: string;
  className: string;
}> = [
  { char: '🍬', className: 'text-[28px]' },
  { char: '⭐️', className: 'text-[22px]' },
  { char: '🍭', className: 'text-[26px]' },
  { char: '🎁', className: 'text-[24px]' },
  { char: '✨', className: 'text-[20px]' },
];

function HeroCluster(): JSX.Element {
  const reduceMotion = useReducedMotion();
  return (
    <div
      className="mb-6 flex items-center justify-center gap-3"
      aria-hidden="true"
    >
      {HERO_EMOJI.map((e, i) => (
        <motion.span
          key={e.char}
          initial={
            reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.7 }
          }
          animate={
            reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{
            delay: 0.05 + i * 0.07,
            type: 'spring',
            stiffness: 320,
            damping: 18,
          }}
          className={[
            'inline-flex h-12 w-12 items-center justify-center rounded-full',
            'bg-white shadow-[0_4px_14px_rgba(13,13,13,0.08)]',
            'border-hairline border-obsidian/5',
            e.className,
          ].join(' ')}
        >
          {e.char}
        </motion.span>
      ))}
    </div>
  );
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
      description={t('phone.subtitle')}
    >
      <HeroCluster />
      <p className="mb-6 font-sans text-[13px] leading-[1.6] text-obsidian/60">
        {t('phone.description')}
      </p>
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
