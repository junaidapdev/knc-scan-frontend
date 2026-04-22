import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

import {
  ErrorFallback,
  LoadingSkeleton,
  ScreenShell,
} from '@/components/common';
import { RewardCard, TabBar } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
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
  const { state: rewardsState, reload: reloadRewards } = useMyRewards();
  const lang = (i18n.language.split('-')[0] ?? 'en') as 'en' | 'ar';
  const reduceMotion = useReducedMotion();

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

  const openClaim = (reward: IssuedReward): void => {
    navigate(ROUTES.CUSTOMER.REWARD_CLAIM(reward.unique_code), {
      state: { reward },
    });
  };

  if (rewardsState.status === 'loading') {
    return (
      <>
        <ScreenShell
          eyebrow={t('rewards.eyebrow')}
          title={t('rewards.title')}
          description={t('rewards.description')}
        >
          <LoadingSkeleton className="h-24 w-full" />
          <LoadingSkeleton className="mt-4 h-24 w-full" />
          <div className="h-24" />
        </ScreenShell>
        <TabBar />
      </>
    );
  }

  if (rewardsState.status === 'error') {
    return (
      <>
        <ScreenShell
          eyebrow={t('rewards.eyebrow')}
          title={t('rewards.title')}
        >
          <ErrorFallback onRetry={reloadRewards} />
          <div className="h-24" />
        </ScreenShell>
        <TabBar />
      </>
    );
  }

  return (
    <>
      <ScreenShell
        eyebrow={t('rewards.eyebrow')}
        title={t('rewards.title')}
        description={t('rewards.description')}
      >
        {/* Rate us card */}
        <section>
          <a
            href="#"
            role="button"
            className="flex items-center gap-4 rounded-xl border-[1.5px] border-yellow bg-yellow-tint p-4 transition-colors hover:bg-yellow focus:outline-none focus-visible:shadow-focus-yellow"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow text-[24px]"
            >
              ⭐️
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[18px] leading-tight tracking-[2px] text-obsidian">
                {t('rewards.rateUs.title')}
              </span>
              <span className="mt-1 block font-sans text-[12px] leading-snug text-obsidian/70">
                {t('rewards.rateUs.subtitle')}
              </span>
            </span>
            <span className="font-display text-[20px] text-obsidian">→</span>
          </a>
        </section>

        {/* Available */}
        <section className="mt-8">
          <p className="eyebrow text-obsidian/60">
            {t('rewards.availableSection')}
          </p>
          <div className="mt-2 space-y-3">
            {available.length === 0 ? (
              <p className="font-sans text-[13px] text-obsidian/60">
                {t('rewards.emptyAvailable')}
              </p>
            ) : (
              available.map((reward, idx) => (
                <motion.div
                  key={reward.id}
                  initial={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                  }
                  animate={
                    reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                  }
                  transition={{ delay: 0.05 + idx * 0.05, duration: 0.25 }}
                >
                  <RewardCard
                    reward={reward}
                    language={lang}
                    statusLabel={t('rewards.statusPending')}
                    metaLabel={t('rewards.expiresOn', {
                      date: formatDate(reward.expires_at, i18n.language),
                    })}
                    claimCtaLabel={t('rewards.claimCta')}
                    onClick={openClaim}
                  />
                </motion.div>
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
              history.map((reward, idx) => (
                <motion.div
                  key={reward.id}
                  initial={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                  }
                  animate={
                    reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                  }
                  transition={{ delay: 0.05 + idx * 0.05, duration: 0.25 }}
                >
                  <RewardCard
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
                </motion.div>
              ))
            )}
          </div>
        </section>

        <div className="h-24" />
      </ScreenShell>
      <TabBar />
    </>
  );
}
