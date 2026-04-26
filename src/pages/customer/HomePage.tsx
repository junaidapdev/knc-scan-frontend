import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  BrandedButton,
  ErrorFallback,
  KayanLogo,
  LanguageToggle,
  LoadingSkeleton,
  PageTransition,
} from '@/components/common';
import { LoyaltyCard, TabBar } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import { STAMPS_PER_CARD } from '@/constants/ui';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useMyProfile } from '@/hooks/useMyProfile';
import { useMyRewards } from '@/hooks/useMyRewards';

function firstName(full: string): string {
  const trimmed = full.trim();
  if (!trimmed) return '';
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function last4(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-4).padStart(4, '•');
}

function greetingKey():
  | 'home.greetMorning'
  | 'home.greetAfternoon'
  | 'home.greetEvening' {
  const h = new Date().getHours();
  if (h < 12) return 'home.greetMorning';
  if (h < 18) return 'home.greetAfternoon';
  return 'home.greetEvening';
}

export default function HomePage(): JSX.Element {
  const { t } = useTranslation('customer');
  const navigate = useNavigate();
  const auth = useCustomerAuth();
  const { state: profileState } = useMyProfile();
  const { state: rewardsState } = useMyRewards();

  const customerName =
    (profileState.status === 'ready' ? profileState.profile.name : null) ??
    auth.session?.customer.name ??
    '';
  const customerPhone = auth.session?.customer.phone ?? '';

  const stampsNow =
    profileState.status === 'ready' ? profileState.profile.current_stamps : 0;

  const pendingRewards = useMemo(() => {
    if (rewardsState.status !== 'ready') return 0;
    return rewardsState.rewards.filter((r) => r.status === 'pending').length;
  }, [rewardsState]);

  const remaining = Math.max(STAMPS_PER_CARD - stampsNow, 0);
  const cardFull = stampsNow >= STAMPS_PER_CARD;
  const hasPending = pendingRewards > 0;

  const progressLine = hasPending
    ? t('home.rewardReadyBelow')
    : cardFull
      ? t('home.rewardReady')
      : t('home.moreStampsUntilReward', { count: remaining });

  const loading = profileState.status === 'loading';
  const errored = profileState.status === 'error';

  return (
    <div className="flex min-h-full flex-col bg-canvas-bg animate-fade-in">
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-full focus:bg-yellow focus:px-3 focus:py-2 focus:text-obsidian"
      >
        Skip to content
      </a>

      {/* Header */}
      <header
        className="flex items-center justify-between px-5"
        style={{
          height: 60,
          borderBottom: '1px solid rgba(13,13,13,0.06)',
        }}
      >
        <KayanLogo height={44} />
        <LanguageToggle />
      </header>

      {/* Main */}
      <main
        id="main"
        className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-28 pt-6"
      >
        <PageTransition>
          {/* Greeting */}
          <div className="mb-6">
            <p className="font-sans text-[11px] uppercase tracking-[3px] text-obsidian/50">
              {t(greetingKey())}
            </p>
            <h1
              className="mt-1.5 font-display font-black leading-tight text-obsidian"
              style={{ fontSize: 28 }}
            >
              {t('home.welcome', {
                name: firstName(customerName) || t('home.fallbackName'),
              })}
            </h1>
          </div>

          {/* Card + progress */}
          {loading ? (
            <LoadingSkeleton className="h-52 w-full rounded-2xl" />
          ) : errored ? (
            <ErrorFallback onRetry={() => window.location.reload()} />
          ) : (
            <>
              <LoyaltyCard
                name={customerName.toUpperCase()}
                phoneLast4={last4(customerPhone)}
                current={stampsNow}
                max={STAMPS_PER_CARD}
                eyebrow={t('home.cardTitle')}
                countLabel={t('home.cardCountLabel', {
                  current: stampsNow,
                  max: STAMPS_PER_CARD,
                })}
              />

              {/* Progress line */}
              <div className="mt-4 flex items-center gap-3">
                {/* Thin progress bar */}
                <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-obsidian/10">
                  <div
                    className="h-full rounded-full bg-yellow transition-all duration-700"
                    style={{
                      width: `${Math.min((stampsNow / STAMPS_PER_CARD) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="shrink-0 font-sans text-[13px] font-medium text-obsidian/70">
                  {progressLine}
                </p>
              </div>

              {/* CTA section */}
              <div className="mt-6">
                {hasPending ? (
                  <BrandedButton
                    fullWidth
                    onClick={() => navigate(ROUTES.CUSTOMER.REWARDS)}
                  >
                    {t('home.viewRewardsCta')}
                  </BrandedButton>
                ) : (
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: '#fff',
                      border: '1.5px solid rgba(13,13,13,0.08)',
                    }}
                  >
                    <p className="font-display font-bold text-[15px] text-obsidian">
                      {t('home.scanAtCounterTitle')}
                    </p>
                    <p className="mt-1 font-sans text-[13px] leading-relaxed text-obsidian/55">
                      {t('home.scanAtCounterBody')}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </PageTransition>
      </main>

      <TabBar />
    </div>
  );
}
