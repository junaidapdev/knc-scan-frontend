import { useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';

import {
  BrandedButton,
  KSLogoMark,
  LanguageToggle,
  PageTransition,
} from '@/components/common';
import { InstallPromptBanner } from '@/components/customer';
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

function last4(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-4).padStart(4, '•');
}

interface StampGridProps {
  current: number;
  reduceMotion: boolean;
}
/**
 * 5×2 stamp grid — each cell ~16% of card width so the ١٠ glyphs read
 * clearly. Newest filled stamp is yellow, rotated, with a glow halo.
 */
function StampGrid({ current, reduceMotion }: StampGridProps): JSX.Element {
  const cells = Array.from({ length: STAMPS_PER_CARD }, (_, i) => i);
  const newestIdx = current > 0 ? current - 1 : -1;

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: 'repeat(5, 1fr)',
        direction: 'ltr',
      }}
    >
      {cells.map((i) => {
        const filled = i < current;
        const isLatest = i === newestIdx && filled;
        return (
          <motion.div
            key={i}
            initial={
              isLatest && !reduceMotion
                ? { scale: 0.5, opacity: 0.2 }
                : false
            }
            animate={
              isLatest && !reduceMotion
                ? { scale: [1, 1.18, 1], opacity: 1 }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="aspect-square rounded-md flex items-center justify-center"
            style={
              isLatest
                ? {
                    background: '#FFD700',
                    boxShadow: '0 0 16px rgba(255,215,0,0.7)',
                    transform: !reduceMotion ? 'rotate(-4deg)' : undefined,
                  }
                : filled
                  ? {
                      background: 'rgba(255,215,0,0.18)',
                      border: '1.5px solid rgba(255,215,0,0.45)',
                    }
                  : {
                      border: '1.5px dashed rgba(255,215,0,0.22)',
                    }
            }
          >
            {filled ? (
              <span
                style={{
                  fontFamily: '"Noto Naskh Arabic", system-ui, sans-serif',
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: isLatest ? '#0D0D0D' : '#FFD700',
                }}
              >
                ١٠
              </span>
            ) : (
              <span
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: 'rgba(255,215,0,0.3)',
                  fontWeight: 500,
                }}
              >
                {i + 1}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
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

  const cardJustCompleted = Boolean(
    stateParams.scanResult?.issued_reward ||
      stateParams.scanResult?.ready_for_reward,
  );

  const stampsCurrent = useMemo<number>(() => {
    if (cardJustCompleted) return STAMPS_PER_CARD;
    if (stateParams.scanResult) return stateParams.scanResult.current_stamps;
    if (stateParams.firstStamp) return stateParams.firstStamp.current;
    return 0;
  }, [stateParams, cardJustCompleted]);

  const name =
    stateParams.firstStamp?.name ??
    auth.session?.customer.name ??
    stateParams.scanProfile?.name ??
    '';
  const phone = auth.session?.customer.phone ?? '';

  const cardFull = cardJustCompleted || stampsCurrent >= STAMPS_PER_CARD;
  const remaining = Math.max(STAMPS_PER_CARD - stampsCurrent, 0);

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

  const firstName = name.trim().split(/\s+/)[0] ?? '';
  const headline = cardFull
    ? t('stampSuccess.cardCompleteHeadline')
    : firstName
      ? t('stampSuccess.headline', { name: firstName })
      : t('stampSuccess.headlineFallback');
  const subhead = cardFull
    ? t('stampSuccess.cardFull')
    : t('stampSuccess.nextReward', { count: remaining });

  const pillText = cardFull
    ? t('stampSuccess.pillComplete')
    : t('stampSuccess.pillStamp', { n: stampsCurrent });

  return (
    <div className="flex min-h-full flex-col bg-canvas-bg animate-fade-in">
      <header
        className="flex items-center justify-between px-5"
        style={{
          height: 60,
          borderBottom: '1px solid rgba(13,13,13,0.06)',
        }}
      >
        <KSLogoMark size={40} />
        <LanguageToggle />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-2 pb-6">
        <PageTransition className="flex flex-1 flex-col">
          {/* Yellow editorial hero card */}
          <div
            className="relative flex flex-1 flex-col overflow-hidden rounded-3xl"
            style={{
              padding: 28,
              background: '#FFD700',
              color: '#0D0D0D',
              border: '2px solid #0D0D0D',
              minHeight: 360,
            }}
          >
            {/* Status pill */}
            <span
              className="inline-flex items-center gap-2 self-start font-sans font-bold uppercase"
              style={{
                padding: '5px 11px',
                borderRadius: 4,
                background: '#0D0D0D',
                color: '#FFD700',
                fontSize: 10,
                letterSpacing: 1.8,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: '#FFD700',
                }}
              />
              {pillText}
            </span>

            {/* Headline */}
            <motion.h1
              initial={
                reduceMotion ? { opacity: 0 } : { scale: 0.85, opacity: 0 }
              }
              animate={
                reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }
              }
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 18,
                delay: 0.1,
              }}
              className="font-display font-black"
              style={{
                fontSize: 52,
                lineHeight: 0.92,
                letterSpacing: '-2.5px',
                marginTop: 22,
                marginBottom: 10,
                whiteSpace: 'pre-line',
              }}
            >
              {headline}
            </motion.h1>
            <p
              className="font-sans font-medium"
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: 'rgba(13,13,13,0.78)',
                maxWidth: 280,
                marginBottom: 24,
              }}
            >
              {subhead}
            </p>

            {/* Obsidian loyalty-card visual — dominant element on the page */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                marginTop: 'auto',
                padding: 20,
                background: '#0D0D0D',
                color: '#FFD700',
              }}
            >
              {/* ١٠ watermark */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute select-none"
                style={{
                  right: -20,
                  top: -30,
                  fontFamily: '"Noto Naskh Arabic", system-ui, sans-serif',
                  fontSize: 200,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: '#FFD700',
                  opacity: 0.05,
                  letterSpacing: -8,
                }}
              >
                ١٠
              </span>

              {/* Top row */}
              <div className="relative flex items-baseline justify-between">
                <span
                  className="font-sans font-bold uppercase"
                  style={{ fontSize: 10, letterSpacing: 1.8 }}
                >
                  {t('stampSuccess.yourCardLabel')}
                </span>
                <span
                  className="font-mono opacity-70"
                  style={{ fontSize: 12, direction: 'ltr' }}
                >
                  •••• {last4(phone)}
                </span>
              </div>

              {/* Big count */}
              <div
                className="relative mt-2 flex items-baseline gap-2"
                style={{ direction: 'ltr' }}
              >
                <span
                  className="font-display font-black"
                  style={{
                    fontSize: 64,
                    letterSpacing: '-3px',
                    lineHeight: 1,
                  }}
                >
                  {stampsCurrent}
                </span>
                <span
                  className="font-display font-bold opacity-50"
                  style={{ fontSize: 22, letterSpacing: '-0.5px' }}
                >
                  / {STAMPS_PER_CARD}
                </span>
                <div className="ms-auto self-center">
                  <span
                    className="font-sans font-bold uppercase opacity-60"
                    style={{ fontSize: 10, letterSpacing: 1.5 }}
                  >
                    {t('stampSuccess.progressLabel')}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div
                className="relative mt-2 h-1 overflow-hidden rounded-full"
                style={{ background: 'rgba(255,215,0,0.15)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: '#FFD700' }}
                  initial={
                    reduceMotion
                      ? false
                      : { width: `${((stampsCurrent - 1) / STAMPS_PER_CARD) * 100}%` }
                  }
                  animate={{
                    width: `${(stampsCurrent / STAMPS_PER_CARD) * 100}%`,
                  }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
                />
              </div>

              {/* Big 5×2 stamp grid */}
              <div className="relative mt-4">
                <StampGrid
                  current={stampsCurrent}
                  reduceMotion={Boolean(reduceMotion)}
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-3 space-y-2">
            {auth.session ? (
              <BrandedButton
                fullWidth
                onClick={() => navigate(ROUTES.CUSTOMER.REWARDS)}
              >
                {cardFull
                  ? t('stampSuccess.claimRewardCta')
                  : t('stampSuccess.viewRewards')}
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
        </PageTransition>
      </main>
    </div>
  );
}
