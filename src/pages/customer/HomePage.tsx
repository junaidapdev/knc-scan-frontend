import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  BrandedButton,
  ErrorFallback,
  LoadingSkeleton,
  ScreenShell,
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

function greetingKey(): 'home.greetMorning' | 'home.greetAfternoon' | 'home.greetEvening' {
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
    <>
      <ScreenShell
        eyebrow={t(greetingKey())}
        title={t('home.welcome', {
          name: firstName(customerName) || t('home.fallbackName'),
        })}
        description={t('home.description')}
      >
        {loading ? (
          <LoadingSkeleton className="h-40 w-full" />
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
            <p className="mt-3 font-sans text-[14px] text-obsidian">
              {progressLine}
            </p>

            <div className="mt-6">
              {hasPending ? (
                <BrandedButton
                  fullWidth
                  onClick={() => navigate(ROUTES.CUSTOMER.REWARDS)}
                >
                  {t('home.viewRewardsCta')}
                </BrandedButton>
              ) : (
                <div className="rounded-xl border-hairline border-obsidian/10 bg-white p-4">
                  <p className="font-display text-[16px] tracking-[1.5px] text-obsidian">
                    {t('home.scanAtCounterTitle')}
                  </p>
                  <p className="mt-1 font-sans text-[13px] text-obsidian/60">
                    {t('home.scanAtCounterBody')}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="h-24" />
      </ScreenShell>
      <TabBar />
    </>
  );
}
