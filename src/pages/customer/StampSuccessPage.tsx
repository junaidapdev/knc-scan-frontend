import { useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';

import { BrandedButton, ScreenShell } from '@/components/common';
import { InstallPromptBanner, StampProgressBar } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import { STAMPS_PER_CARD } from '@/constants/ui';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { haptic } from '@/lib/haptics';
import { recordSuccessfulStamp } from '@/lib/pwaInstallPrompt';
import type { ScanResult } from '@/interfaces/visit';
import type { ScanLookupProfile } from '@/interfaces/visit';

interface LocationState {
  scanResult?: ScanResult;
  scanProfile?: ScanLookupProfile | null;
  firstStamp?: {
    current: number;
    name: string;
  };
}

export default function StampSuccessPage(): JSX.Element {
  const { t } = useTranslation('customer');
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useCustomerAuth();
  const reduceMotion = useReducedMotion();
  const stateParams = useMemo<LocationState>(
    () => (location.state ?? {}) as LocationState,
    [location.state],
  );

  const stampsCurrent = useMemo<number>(() => {
    if (stateParams.scanResult) return stateParams.scanResult.current_stamps;
    if (stateParams.firstStamp) return stateParams.firstStamp.current;
    return 0;
  }, [stateParams]);

  const name =
    stateParams.firstStamp?.name ??
    auth.session?.customer.name ??
    stateParams.scanProfile?.name ??
    '';

  const cardFull =
    stampsCurrent >= STAMPS_PER_CARD ||
    Boolean(stateParams.scanResult?.ready_for_reward);

  useEffect(() => {
    if (!stateParams.scanResult && !stateParams.firstStamp) return;
    recordSuccessfulStamp();
    haptic(30);
    const reduceMotionMedia =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotionMedia) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.3 },
        colors: ['#FFD700', '#0D0D0D'],
        ticks: 160,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!stateParams.scanResult && !stateParams.firstStamp) {
    return <Navigate to={ROUTES.CUSTOMER.SCAN} replace />;
  }

  const highlightIndex = stampsCurrent > 0 ? stampsCurrent - 1 : null;

  return (
    <ScreenShell
      eyebrow={t('stampSuccess.eyebrow')}
      description={
        name
          ? t('stampSuccess.description', { name })
          : t('stampSuccess.description', { name: '' }).trim()
      }
    >
      {/* Animated title + checkmark */}
      <div className="flex flex-col items-center">
        <motion.span
          aria-hidden="true"
          initial={reduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 18,
            delay: 0.05,
          }}
          className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-obsidian text-yellow text-[28px] leading-none"
        >
          ✓
        </motion.span>
        <motion.h1
          initial={
            reduceMotion ? { opacity: 0 } : { scale: 0.7, opacity: 0 }
          }
          animate={
            reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }
          }
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 16,
            delay: 0.15,
          }}
          className="font-display text-display-md text-obsidian"
        >
          {t('stampSuccess.title')}
        </motion.h1>
      </div>

      {/* Yellow burst behind card */}
      <div className="relative mt-6">
        {!reduceMotion ? (
          <motion.div
            aria-hidden="true"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow/40 blur-2xl"
          />
        ) : null}
        <div className="relative rounded-xl border-hairline border-obsidian/10 bg-white p-5 shadow-[0_10px_30px_-12px_rgba(13,13,13,0.15)]">
          <p className="eyebrow text-obsidian/60">
            {t('stampSuccess.progressLabel')}
          </p>
          <p className="mt-2 font-mono text-[14px] text-obsidian">
            {t('stampSuccess.countLabel', {
              current: stampsCurrent,
              max: STAMPS_PER_CARD,
            })}
          </p>
          <div className="mt-4">
            <StampProgressBar
              current={stampsCurrent}
              highlightIndex={highlightIndex}
            />
          </div>
          <p className="mt-4 font-sans text-[13px] text-obsidian/60">
            {cardFull
              ? t('stampSuccess.cardFull')
              : t('stampSuccess.nextReward', { max: STAMPS_PER_CARD })}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {auth.session ? (
          <BrandedButton
            fullWidth
            onClick={() => navigate(ROUTES.CUSTOMER.REWARDS)}
          >
            {t('stampSuccess.viewRewards')}
          </BrandedButton>
        ) : (
          <BrandedButton
            fullWidth
            onClick={() => navigate(ROUTES.ROOT)}
          >
            {t('stampSuccess.done')}
          </BrandedButton>
        )}
      </div>
      <InstallPromptBanner />
    </ScreenShell>
  );
}
