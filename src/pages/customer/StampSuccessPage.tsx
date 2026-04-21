import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  /**
   * Provided by RegisterDetailsPage — the register_customer_and_visit RPC
   * already grants the first stamp, so we can render the success state
   * without refetching.
   */
  firstStamp?: {
    current: number;
    name: string;
  };
}

/**
 * Shown after a successful scan or registration. Reads the freshly-minted
 * stamp data from navigation state — no refetch. Skipped to /scan if opened
 * directly without that state.
 */
export default function StampSuccessPage(): JSX.Element {
  const { t } = useTranslation('customer');
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useCustomerAuth();
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

  // Fire confetti + haptic + increment stamp count once per mount.
  useEffect(() => {
    if (!stateParams.scanResult && !stateParams.firstStamp) return;
    recordSuccessfulStamp();
    haptic(30);
    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.3 },
        colors: ['#FFD700', '#0D0D0D'],
        ticks: 160,
      });
    }
    // Intentionally run once — celebration is per-landing, not per-state-change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-redirect registered users to /rewards after a short celebration.
  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  useEffect(() => {
    if (!auth.session) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [auth.session]);

  useEffect(() => {
    if (auth.session && secondsLeft <= 0) {
      navigate(ROUTES.CUSTOMER.REWARDS);
    }
  }, [auth.session, secondsLeft, navigate]);

  // Open without context → bounce to entry.
  if (!stateParams.scanResult && !stateParams.firstStamp) {
    return <Navigate to={ROUTES.CUSTOMER.SCAN} replace />;
  }

  // Freshly-earned stamp sits at index (current - 1).
  const highlightIndex = stampsCurrent > 0 ? stampsCurrent - 1 : null;

  return (
    <ScreenShell
      eyebrow={t('stampSuccess.eyebrow')}
      title={t('stampSuccess.title')}
      description={
        name
          ? t('stampSuccess.description', { name })
          : t('stampSuccess.description', { name: '' }).trim()
      }
    >
      <div className="rounded-lg border-hairline border-obsidian/10 bg-white p-5">
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

      <div className="mt-6 space-y-2">
        {auth.session ? (
          <BrandedButton
            fullWidth
            onClick={() => navigate(ROUTES.CUSTOMER.REWARDS)}
          >
            {t('stampSuccess.viewRewards')}
          </BrandedButton>
        ) : null}
        <BrandedButton
          variant="secondary"
          fullWidth
          onClick={() => navigate(ROUTES.CUSTOMER.SCAN)}
        >
          {t('stampSuccess.done')}
        </BrandedButton>
      </div>
      <InstallPromptBanner />
    </ScreenShell>
  );
}
