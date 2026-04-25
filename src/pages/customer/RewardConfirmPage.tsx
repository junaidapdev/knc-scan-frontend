import { useEffect, useState } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

import { BrandedButton, PageTransition } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { claimRewardStep2 } from '@/lib/services';
import { ANALYTICS_EVENTS, track } from '@/lib/analytics';
import type { IssuedReward, RedemptionConfirmation } from '@/interfaces/reward';

interface LocationState {
  confirmation?: RedemptionConfirmation;
  branchQrIdentifier?: string;
  reward?: IssuedReward;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

interface DarkCountdownProps {
  expiresAt: string;
  totalMs: number;
  label: string;
}
function DarkCountdown({
  expiresAt,
  totalMs,
  label,
}: DarkCountdownProps): JSX.Element {
  const [now, setNow] = useState<number>(() => Date.now());
  const target = Date.parse(expiresAt);
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  const remaining = Number.isFinite(target) ? Math.max(target - now, 0) : 0;
  const pct = totalMs > 0 ? Math.max(0, Math.min(100, (remaining / totalMs) * 100)) : 0;

  return (
    <>
      <div className="flex items-center justify-between">
        <span
          className="font-sans font-bold uppercase"
          style={{
            fontSize: 11,
            letterSpacing: 1.4,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          {label}
        </span>
        <span
          className="font-mono font-bold"
          style={{
            fontSize: 14,
            color: '#FFD700',
            direction: 'ltr',
          }}
        >
          {formatRemaining(remaining)}
        </span>
      </div>
      <div
        className="mt-2 h-1 overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${pct}%`, background: '#FFD700' }}
        />
      </div>
    </>
  );
}

export default function RewardConfirmPage(): JSX.Element {
  const { t, i18n } = useTranslation('customer');
  const navigate = useNavigate();
  const params = useParams<{ code: string }>();
  const location = useLocation();
  const stateParams = (location.state ?? {}) as LocationState;
  const toastError = useApiErrorToast();
  const reduceMotion = useReducedMotion();
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Capture initial countdown total once for the progress bar.
  const [totalMs] = useState<number>(() => {
    const target = stateParams.confirmation?.summary.expires_at
      ? Date.parse(stateParams.confirmation.summary.expires_at) - Date.now()
      : 0;
    return Math.max(target, 1);
  });

  if (
    !stateParams.confirmation ||
    !stateParams.branchQrIdentifier ||
    !params.code
  ) {
    return <Navigate to={ROUTES.CUSTOMER.REWARDS} replace />;
  }

  const { confirmation, branchQrIdentifier } = stateParams;
  const lang = (i18n.language.split('-')[0] ?? 'en') as 'en' | 'ar';

  const displayName =
    lang === 'ar' && confirmation.summary.reward_name.ar
      ? confirmation.summary.reward_name.ar
      : confirmation.summary.reward_name.en;

  // Split code on first hyphen for the big two-line display.
  const code = confirmation.summary.unique_code;
  const dashIdx = code.indexOf('-');
  const codeTop = dashIdx > 0 ? code.slice(0, dashIdx) : code;
  const codeBottom = dashIdx > 0 ? code.slice(dashIdx + 1) : '';

  const onConfirm = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const redeemed = await claimRewardStep2(
        confirmation.summary.unique_code,
        { branch_qr_identifier: branchQrIdentifier },
        confirmation.redemption_token,
      );
      track(ANALYTICS_EVENTS.REWARD_CLAIMED, {
        uniqueCode: redeemed.unique_code,
      });
      navigate(ROUTES.CUSTOMER.REWARD_DONE(redeemed.unique_code), {
        state: { reward: redeemed },
      });
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = (): void => {
    navigate(ROUTES.CUSTOMER.REWARDS);
  };

  return (
    <div
      className="flex min-h-full flex-col animate-fade-in"
      style={{ background: '#0D0D0D', color: '#fff' }}
    >
      {/* Top bar — staff badge + close */}
      <header
        className="flex items-center justify-between"
        style={{ padding: '14px 20px 10px' }}
      >
        <span
          className="inline-flex items-center gap-2 font-sans font-bold uppercase"
          style={{
            background: '#FFD700',
            color: '#0D0D0D',
            padding: '5px 11px',
            borderRadius: 4,
            fontSize: 10,
            letterSpacing: 1.8,
          }}
        >
          <span
            aria-hidden="true"
            className="inline-block animate-pulse"
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: '#0D0D0D',
            }}
          />
          {t('rewardConfirm.staffBadge')}
        </span>
        <button
          type="button"
          onClick={onCancel}
          aria-label={t('rewardConfirm.cancelCta')}
          className="font-display font-black focus:outline-none focus-visible:opacity-100"
          style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 18,
            border: 'none',
            cursor: 'pointer',
          }}
          disabled={submitting}
        >
          ✕
        </button>
      </header>

      <main
        className="mx-auto flex w-full max-w-md flex-1 flex-col"
        style={{ padding: '8px 20px 20px' }}
      >
        <PageTransition>
          {/* Heading */}
          <h1
            className="font-display font-black"
            style={{
              fontSize: 28,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.8px',
              marginTop: 10,
            }}
          >
            {t('rewardConfirm.title')}
          </h1>
          <p
            className="mt-1.5 font-sans font-medium"
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            {t('rewardConfirm.description')}
          </p>

          {/* Yellow reward card */}
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="overflow-hidden rounded-2xl text-center"
            style={{
              marginTop: 22,
              padding: '24px 18px',
              background: '#FFD700',
              color: '#0D0D0D',
              border: '2px solid #FFD700',
            }}
          >
            <p
              className="font-sans font-bold uppercase opacity-70"
              style={{ fontSize: 10, letterSpacing: 1.8 }}
            >
              {t('rewardConfirm.codeLabel')}
            </p>
            <p
              className="font-mono font-bold"
              style={{
                marginTop: 12,
                fontSize: 36,
                letterSpacing: 4,
                direction: 'ltr',
                lineHeight: 1.05,
                wordBreak: 'break-all',
              }}
            >
              {codeTop}
              {codeBottom ? (
                <>
                  <br />
                  {codeBottom}
                </>
              ) : null}
            </p>
            <p
              className="mt-3 font-display font-black"
              style={{ fontSize: 20, letterSpacing: '-0.4px' }}
            >
              {displayName}
            </p>
            {confirmation.summary.customer_name ? (
              <p
                className="font-sans font-semibold opacity-70"
                style={{ fontSize: 12 }}
              >
                {t('rewardConfirm.customerLabel')}{' '}
                {confirmation.summary.customer_name}
              </p>
            ) : null}
          </motion.div>

          {/* Countdown */}
          <div className="mt-5">
            <DarkCountdown
              expiresAt={confirmation.summary.expires_at}
              totalMs={totalMs}
              label={t('rewardConfirm.timeRemaining')}
            />
          </div>

          <div className="flex-1" />

          {/* Confirm button + cancel */}
          <div className="mt-6">
            <BrandedButton
              fullWidth
              loading={submitting}
              onClick={onConfirm}
            >
              {t('rewardConfirm.cta')}
            </BrandedButton>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="mt-1 w-full font-sans font-bold transition-opacity disabled:opacity-50"
              style={{
                height: 48,
                background: 'transparent',
                color: 'rgba(255,255,255,0.6)',
                border: 'none',
                fontSize: 14,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {t('rewardConfirm.cancelCta')}
            </button>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
