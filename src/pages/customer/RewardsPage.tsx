import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  BrandedButton,
  ErrorFallback,
  LoadingSkeleton,
  ScreenShell,
} from '@/components/common';
import { RewardCard, StampProgressBar } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import { STAMPS_PER_CARD } from '@/constants/ui';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useMyProfile } from '@/hooks/useMyProfile';
import { useMyRewards } from '@/hooks/useMyRewards';
import type { IssuedReward, IssuedRewardStatus } from '@/interfaces/reward';

const STATUS_ORDER: Record<IssuedRewardStatus, number> = {
  pending: 0,
  redeemed: 1,
  expired: 2,
};

function formatDate(iso: string | null | undefined, lang: string): string {
  if (!iso) return '';
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return '';
  try {
    return new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(
      new Date(ms),
    );
  } catch {
    return '';
  }
}

export default function RewardsPage(): JSX.Element {
  const { t, i18n } = useTranslation('customer');
  const navigate = useNavigate();
  const auth = useCustomerAuth();
  const { state: rewardsState, reload: reloadRewards } = useMyRewards();
  const { state: profileState } = useMyProfile();
  const lang = (i18n.language.split('-')[0] ?? 'en') as 'en' | 'ar';

  const { available, history } = useMemo(() => {
    if (rewardsState.status !== 'ready') {
      return {
        available: [] as IssuedReward[],
        history: [] as IssuedReward[],
      };
    }
    const sorted = [...rewardsState.rewards].sort(
      (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
    );
    return {
      available: sorted.filter((r) => r.status === 'pending'),
      history: sorted.filter((r) => r.status !== 'pending'),
    };
  }, [rewardsState]);

  const currentStamps =
    profileState.status === 'ready'
      ? profileState.profile.current_stamps
      : null;

  const openClaim = (reward: IssuedReward): void => {
    navigate(ROUTES.CUSTOMER.REWARD_CLAIM(reward.unique_code), {
      state: { reward },
    });
  };

  if (rewardsState.status === 'loading') {
    return (
      <ScreenShell
        eyebrow={t('rewards.eyebrow')}
        title={t('rewards.title')}
        description={t('rewards.description')}
      >
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="mt-4 h-24 w-full" />
      </ScreenShell>
    );
  }

  if (rewardsState.status === 'error') {
    return (
      <ScreenShell
        eyebrow={t('rewards.eyebrow')}
        title={t('rewards.title')}
      >
        <ErrorFallback onRetry={reloadRewards} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      eyebrow={t('rewards.eyebrow')}
      title={t('rewards.title')}
      description={t('rewards.description')}
    >
      {/* Progress */}
      <section>
        <p className="eyebrow text-obsidian/60">
          {t('rewards.progressSection')}
        </p>
        <div className="mt-2 rounded-lg border-hairline border-obsidian/10 bg-white p-5">
          <p className="font-mono text-[14px] text-obsidian">
            {currentStamps === null
              ? '…'
              : t('stampSuccess.countLabel', {
                  current: currentStamps,
                  max: STAMPS_PER_CARD,
                })}
          </p>
          <div className="mt-3">
            <StampProgressBar current={currentStamps ?? 0} />
          </div>
        </div>
      </section>

      {/* Available */}
      <section className="mt-6">
        <p className="eyebrow text-obsidian/60">
          {t('rewards.availableSection')}
        </p>
        <div className="mt-2 space-y-3">
          {available.length === 0 ? (
            <p className="font-sans text-[13px] text-obsidian/60">
              {t('rewards.emptyAvailable')}
            </p>
          ) : (
            available.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                language={lang}
                statusLabel={t('rewards.statusPending')}
                metaLabel={t('rewards.expiresOn', {
                  date: formatDate(reward.expires_at, i18n.language),
                })}
                claimCtaLabel={t('rewards.claimCta')}
                onClick={openClaim}
              />
            ))
          )}
        </div>
      </section>

      {/* History */}
      <section className="mt-6">
        <p className="eyebrow text-obsidian/60">
          {t('rewards.historySection')}
        </p>
        <div className="mt-2 space-y-3">
          {history.length === 0 ? (
            <p className="font-sans text-[13px] text-obsidian/60">
              {t('rewards.emptyHistory')}
            </p>
          ) : (
            history.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                language={lang}
                statusLabel={
                  reward.status === 'redeemed'
                    ? t('rewards.statusRedeemed')
                    : t('rewards.statusExpired')
                }
                metaLabel={
                  reward.status === 'redeemed' && reward.redeemed_at
                    ? t('rewards.redeemedOn', {
                        date: formatDate(reward.redeemed_at, i18n.language),
                      })
                    : t('rewards.expiresOn', {
                        date: formatDate(reward.expires_at, i18n.language),
                      })
                }
              />
            ))
          )}
        </div>
      </section>

      {auth.session ? (
        <div className="mt-8">
          <BrandedButton
            variant="secondary"
            fullWidth
            onClick={() => navigate(ROUTES.CUSTOMER.SCAN)}
          >
            {t('stampSuccess.done')}
          </BrandedButton>
        </div>
      ) : null}
    </ScreenShell>
  );
}
